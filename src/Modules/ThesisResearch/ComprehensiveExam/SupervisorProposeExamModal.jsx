import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Select,
  MultiSelect,
  Button,
  Text,
  Table,
  Stack,
  Group,
  Center,
  Loader,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import {
  facultyListRoute,
  supervisorStudentAcademicInfoRoute,
  supervisorProposeComprehensiveExamRoute,
} from "../../../routes/academicRoutes";
import { authHeaders } from "./comprehensiveExamShared";

export default function SupervisorProposeExamModal({
  thesis,
  onClose,
  refresh,
}) {
  const [facOpts, setFacOpts] = useState([]);
  const [academicInfo, setAcademicInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loading, setLoading] = useState(false);
  // Title and co-supervisor come from the student's existing ThesisTopic record,
  // credits/CPI are fetched from the student's own academic records -- all
  // display-only here, never manually entered.
  const [form, setForm] = useState({
    entry_qualification: "",
    committee: [],
  });

  useEffect(() => {
    const load = async () => {
      setLoadingInfo(true);
      try {
        const [facRes, infoRes] = await Promise.all([
          axios.get(facultyListRoute, { headers: authHeaders() }),
          axios.get(supervisorStudentAcademicInfoRoute(thesis.student_roll), {
            headers: authHeaders(),
          }),
        ]);
        setFacOpts(
          facRes.data.map((f) => ({ value: String(f.id), label: f.name })),
        );
        setAcademicInfo(infoRes.data);
      } catch {
        showNotification({
          title: "Error",
          message: "Failed to load student academic info.",
          color: "red",
        });
      } finally {
        setLoadingInfo(false);
      }
    };
    load();
  }, [thesis.student_roll]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = useCallback(async () => {
    if (!form.entry_qualification) {
      showNotification({
        title: "Missing fields",
        message: "Entry qualification is required.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        supervisorProposeComprehensiveExamRoute,
        {
          ...form,
          roll_no: thesis.student_roll,
          possible_thesis_title: thesis.research_theme || "",
          co_supervisor_id: thesis.co_supervisor
            ? thesis.co_supervisor.id
            : null,
          committee: form.committee,
        },
        { headers: authHeaders() },
      );
      showNotification({
        title: "Proposed",
        message:
          "Comprehensive exam proposal sent for Academic Office verification.",
        color: "green",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Submission failed",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [form, thesis, refresh]);

  return (
    <Modal
      opened
      onClose={onClose}
      title="Propose Comprehensive Examination"
      size="70%"
    >
      {loadingInfo ? (
        <Center style={{ height: 150 }}>
          <Loader />
        </Center>
      ) : (
        <Stack spacing="md">
          <Table striped highlightOnHover>
            <tbody>
              <tr>
                <td>
                  <Text fw={500}>Student</Text>
                </td>
                <td>
                  {thesis.student_name} ({thesis.student_roll})
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Thesis Title</Text>
                </td>
                <td>{thesis.research_theme || "—"}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Co-Supervisor</Text>
                </td>
                <td>
                  {thesis.co_supervisor ? thesis.co_supervisor.name : "—"}
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Credits Completed Through Course Work</Text>
                </td>
                <td>{academicInfo?.credits_completed ?? "—"}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Current CPI</Text>
                </td>
                <td>{academicInfo?.current_cpi ?? "—"}</td>
              </tr>
            </tbody>
          </Table>

          <Select
            label="Entry Qualification"
            data={[
              {
                value: "masters",
                label: "ME/M.Tech/M.Des/M.Phil (16 credits required)",
              },
              {
                value: "bachelors",
                label: "B.Tech/B.E./M.Sc./MA (40 credits required)",
              },
            ]}
            value={form.entry_qualification}
            onChange={set("entry_qualification")}
            required
          />
          <MultiSelect
            label="Examination Committee (up to 5 members)"
            data={facOpts}
            value={form.committee}
            onChange={set("committee")}
            searchable
            maxValues={5}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              Submit Proposal
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

SupervisorProposeExamModal.propTypes = {
  thesis: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    student_name: PropTypes.string,
    student_roll: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    research_theme: PropTypes.string,
    co_supervisor: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};

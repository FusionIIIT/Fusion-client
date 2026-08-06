import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Select,
  TextInput,
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
  supervisorStudentAcademicInfoRoute,
  supervisorProposeComprehensiveExamRoute,
} from "../../../routes/academicRoutes";
import { authHeaders } from "./comprehensiveExamShared";

export default function SupervisorProposeExamModal({
  thesis,
  onClose,
  refresh,
}) {
  const [academicInfo, setAcademicInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loading, setLoading] = useState(false);
  // Title, discipline, supervisor/co-supervisor and committee come from the
  // student's existing ThesisTopic record, credits/CPI are fetched from the
  // student's own academic records -- all display-only here, never manually
  // entered. No committee is proposed -- the student's existing RPC doubles
  // as the examination committee.
  const [entryQualification, setEntryQualification] = useState("");
  const [proposedExamDate, setProposedExamDate] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoadingInfo(true);
      try {
        const infoRes = await axios.get(
          supervisorStudentAcademicInfoRoute(thesis.student_roll),
          { headers: authHeaders() },
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

  const handleSubmit = useCallback(async () => {
    if (!entryQualification) {
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
          roll_no: thesis.student_roll,
          entry_qualification: entryQualification,
          possible_thesis_title: thesis.research_theme || "",
          proposed_exam_date: proposedExamDate || null,
          co_supervisor_id: thesis.co_supervisor
            ? thesis.co_supervisor.id
            : null,
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
  }, [entryQualification, proposedExamDate, thesis, refresh]);

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
        <Stack gap="md">
          <Table striped highlightOnHover>
            <tbody>
              <tr>
                <td>
                  <Text fw={500}>Student Name</Text>
                </td>
                <td>{thesis.student_name}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Roll No</Text>
                </td>
                <td>{thesis.student_roll}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Discipline</Text>
                </td>
                <td>{thesis.student_discipline || "—"}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Thesis Title</Text>
                </td>
                <td>{thesis.research_theme || "—"}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Supervisor</Text>
                </td>
                <td>{thesis.supervisor ? thesis.supervisor.name : "—"}</td>
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

          <Text fw={500}>Examination Committee (RPC)</Text>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Discipline</th>
              </tr>
            </thead>
            <tbody>
              {(!thesis.committee || thesis.committee.length === 0) && (
                <tr>
                  <td colSpan={2}>
                    <Text c="dimmed">Not yet constituted</Text>
                  </td>
                </tr>
              )}
              {(thesis.committee || []).map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.discipline}</td>
                </tr>
              ))}
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
            value={entryQualification}
            onChange={setEntryQualification}
            required
          />
          <TextInput
            label="Proposed Date of Examination"
            type="date"
            value={proposedExamDate}
            onChange={(e) => setProposedExamDate(e.target.value)}
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
    student_discipline: PropTypes.string,
    research_theme: PropTypes.string,
    supervisor: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    }),
    co_supervisor: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    }),
    committee: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        discipline: PropTypes.string,
      }),
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};

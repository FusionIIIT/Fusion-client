import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Text,
  Textarea,
  Button,
  Center,
  Loader,
  Table,
  Group,
  Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import { hodReviewRoute } from "../../routes/academicRoutes";

export default function HODReviewModal({ thesis, onClose, refresh }) {
  const [form, setForm] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");
  const headers = token ? { Authorization: `Token ${token}` } : {};

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(hodReviewRoute(thesis.id), { headers });
      setForm(res.data);
      setRemarks(res.data.hod_remarks || "");
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to load thesis details.",
        color: "red",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }, [thesis.id]);

  useEffect(() => {
    if (!token) {
      notifications.show({
        title: "Authentication Error",
        message: "You are not authenticated.",
        color: "red",
      });
      onClose();
      return;
    }
    load();
  }, [token, load]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!form) return null;

  const handle = async (approve) => {
    setLoading(true);
    try {
      await axios.post(
        hodReviewRoute(thesis.id),
        { approve, remarks },
        { headers },
      );
      notifications.show({
        title: "Success",
        message: approve
          ? "Thesis approved successfully."
          : "Thesis rejected and sent back to Dean.",
        color: approve ? "green" : "yellow",
      });
      refresh();
    } catch (e) {
      notifications.show({
        title: "Error",
        message: e.response?.data?.error || "Action failed",
        color: "red",
      });
      setLoading(false);
    }
  };

  return (
    <Modal opened onClose={onClose} title="HOD Review" size="90%">
      <Stack gap="lg">
        <Table striped highlightOnHover>
          <tbody>
            <tr>
              <td>
                <Text weight={500}>Roll No</Text>
              </td>
              <td>{form.student_roll}</td>
            </tr>
            <tr>
              <td>
                <Text weight={500}>Name</Text>
              </td>
              <td>{form.student_name}</td>
            </tr>
            <tr>
              <td>
                <Text weight={500}>Discipline</Text>
              </td>
              <td>{form.student_discipline}</td>
            </tr>
            <tr>
              <td>
                <Text weight={500}>Category</Text>
              </td>
              <td>{form.category}</td>
            </tr>
            <tr>
              <td>
                <Text weight={500}>Broad Area</Text>
              </td>
              <td>{form.broad_area}</td>
            </tr>
            <tr>
              <td>
                <Text weight={500}>Research Theme</Text>
              </td>
              <td>
                <Textarea
                  aria-label="Research Theme"
                  value={form.research_theme}
                  readOnly
                  minRows={3}
                />
              </td>
            </tr>
            {form.external.ext_name && (
              <>
                <tr>
                  <td>
                    <Text weight={500}>External Supervisor</Text>
                  </td>
                  <td>{form.external.ext_name}</td>
                </tr>
                <tr>
                  <td>
                    <Text weight={500}>Email</Text>
                  </td>
                  <td>{form.external.ext_email}</td>
                </tr>
                <tr>
                  <td>
                    <Text weight={500}>External Discipline</Text>
                  </td>
                  <td>{form.external.ext_discipline}</td>
                </tr>
                <tr>
                  <td>
                    <Text weight={500}>Institution</Text>
                  </td>
                  <td>{form.external.ext_institution}</td>
                </tr>
              </>
            )}
          </tbody>
        </Table>

        <Text weight={500}>Supervisor Load</Text>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th aria-label="Category" />
              <th>Single</th>
              <th>Shared</th>
            </tr>
          </thead>
          <tbody>
            {["PG", "PhD"].map((cat) => (
              <tr key={cat}>
                <td>
                  <Text weight={500}>{cat}</Text>
                </td>
                <td>{form.load[`${cat.toLowerCase()}_single`]}</td>
                <td>{form.load[`${cat.toLowerCase()}_shared`]}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Text weight={500}>RPC Committee Members</Text>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Discipline</th>
            </tr>
          </thead>
          <tbody>
            {form.committee.map((m, idx) => (
              <tr key={idx}>
                <td>{m.name}</td>
                <td>{m.discipline}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {form.dean_remarks && form.status === "dean_rejected" && (
          <Text
            color="blue"
            style={{ backgroundColor: "#e6f0ff", padding: 10, borderRadius: 4 }}
          >
            <Text weight={500} component="span">
              Dean's Remarks:
            </Text>{" "}
            {form.dean_remarks}
          </Text>
        )}

        {form.hod_remarks && (
          <Text
            color="red"
            style={{ backgroundColor: "#ffe6e6", padding: 10, borderRadius: 4 }}
          >
            <Text weight={500} component="span">
              Previous HOD Remarks:
            </Text>{" "}
            {form.hod_remarks}
          </Text>
        )}

        {form.status === "hod_pending" && (
          <Textarea
            label="Remarks (if sending back to supervisor)"
            placeholder="Enter your remarks here"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            minRows={2}
          />
        )}

        {form.status === "hod_pending" && (
          <Group grow>
            <Button fullWidth onClick={() => handle(true)} loading={loading}>
              Approve
            </Button>
            <Button
              fullWidth
              color="red"
              onClick={() => handle(false)}
              loading={loading}
            >
              Send Back to Supervisor
            </Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
}

HODReviewModal.propTypes = {
  thesis: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};

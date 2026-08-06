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
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import {
  deanReviewRoute,
  deanGeneratePdfRoute,
} from "../../routes/academicRoutes";

export default function DeanReviewModal({ thesis, onClose, refresh }) {
  const [form, setForm] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");
  const headers = token ? { Authorization: `Token ${token}` } : {};

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(deanReviewRoute(thesis.id), { headers });
      setForm(res.data);
    } catch {
      showNotification({
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
      showNotification({
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

  const handleApprove = async () => {
    setLoading(true);
    try {
      await axios.post(
        deanReviewRoute(thesis.id),
        { approve: true },
        { headers },
      );
      showNotification({
        title: "Success",
        message: "Thesis approved successfully.",
        color: "green",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Approve failed",
        color: "red",
      });
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await axios.post(
        deanReviewRoute(thesis.id),
        { approve: false, remarks },
        { headers },
      );
      showNotification({
        title: "Success",
        message: "Thesis rejected and sent back to HOD.",
        color: "yellow",
      });
      setRemarks("");
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Reject failed",
        color: "red",
      });
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!token) {
      showNotification({
        title: "Auth Error",
        message: "No auth token found. Please log in.",
        color: "red",
      });
      return;
    }

    try {
      const res = await axios.get(deanGeneratePdfRoute(thesis.id), {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "approved_thesis.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      showNotification({
        title: "Download Error",
        message: e.response?.data?.error || "Could not download PDF",
        color: "red",
      });
    }
  };

  return (
    <Modal opened onClose={onClose} title="Dean Final Review" size="90%">
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
                    <Text weight={500}>Discipline</Text>
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

        {form.dean_remarks && (
          <Text
            color="blue"
            style={{ backgroundColor: "#e6f0ff", padding: 10, borderRadius: 4 }}
          >
            <Text weight={500} component="span">
              Existing Dean's Remarks:
            </Text>{" "}
            {form.dean_remarks}
          </Text>
        )}

        {form.status === "dean_pending" && (
          <Textarea
            label="Remarks (if sending back to HOD)"
            placeholder="Enter your remarks here"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            minRows={3}
          />
        )}

        {(form.status === "dean_pending" || form.status === "hod_approved") && (
          <Group grow>
            <Button fullWidth onClick={handleApprove} loading={loading}>
              Approve Thesis
            </Button>
            <Button
              fullWidth
              color="red"
              onClick={handleReject}
              loading={loading}
            >
              Send Back to HOD
            </Button>
          </Group>
        )}

        {form.status === "dean_approved" && (
          <Group>
            <Button fullWidth variant="outline" onClick={handleDownload}>
              Download Full Approved PDF
            </Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
}

DeanReviewModal.propTypes = {
  thesis: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};

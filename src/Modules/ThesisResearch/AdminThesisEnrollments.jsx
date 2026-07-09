/**
 * AdminThesisEnrollments.jsx
 *
 * Acad-admin view for PhD thesis slot semester-level registrations.
 * Mirrors the existing VerifyStudentRegistration component's UX pattern:
 *   - Filter by semester number and status
 *   - Table with per-row checkboxes
 *   - Bulk "Verify" or "Reject" (with remarks modal)
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Text,
  Select,
  Button,
  Table,
  Checkbox,
  Badge,
  Loader,
  Center,
  Group,
  Modal,
  Textarea,
  Alert,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import {
  adminThesisEnrollmentListRoute,
  adminVerifyEnrollmentsRoute,
  adminRejectEnrollmentsRoute,
} from "../../routes/academicRoutes";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_COLOR = { pending: "yellow", verified: "green", rejected: "red" };
const STATUS_LABEL = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

const TOPIC_STATUS_LABEL = {
  supervisor_pending: "Supervisor Pending",
  hod_pending: "HOD Pending",
  hod_rejected: "HOD Rejected",
  dean_pending: "Dean Pending",
  dean_rejected: "Dean Rejected",
  dean_approved: "Dean Approved",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminThesisEnrollments() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState([]);  // array of registration ids

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const authHeaders = () => ({
    Authorization: `Token ${localStorage.getItem("authToken")}`,
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setSelected([]);
    try {
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      if (statusFilter)   params.status   = statusFilter;

      const res = await axios.get(adminThesisEnrollmentListRoute, {
        headers: authHeaders(),
        params,
      });
      setRegistrations(res.data.registrations || []);
    } catch (e) {
      showNotification({
        title: "Fetch Error",
        message: e.response?.data?.error || "Could not load registrations",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [semesterFilter, statusFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const allIds = registrations.map((r) => r.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.includes(id));

  const toggleAll = () => {
    setSelected(allSelected ? [] : allIds);
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!selected.length) return;
    setActionLoading(true);
    try {
      const res = await axios.post(
        adminVerifyEnrollmentsRoute,
        { ids: selected },
        { headers: authHeaders() }
      );
      showNotification({
        title: "Verified",
        message: `${res.data.verified_count} registration(s) verified.`,
        color: "green",
      });
      fetchRegistrations();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Verification failed",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selected.length) return;
    setActionLoading(true);
    try {
      const res = await axios.post(
        adminRejectEnrollmentsRoute,
        { ids: selected, remarks: rejectRemarks },
        { headers: authHeaders() }
      );
      showNotification({
        title: "Rejected",
        message: `${res.data.rejected_count} registration(s) rejected.`,
        color: "orange",
      });
      setRejectModalOpen(false);
      setRejectRemarks("");
      fetchRegistrations();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Rejection failed",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Reject remarks modal */}
      <Modal
        opened={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Selected Registrations"
      >
        <Textarea
          label="Rejection Remark (optional)"
          placeholder="Reason for rejection…"
          value={rejectRemarks}
          onChange={(e) => setRejectRemarks(e.target.value)}
          mb="md"
        />
        <Group position="right">
          <Button variant="default" onClick={() => setRejectModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" loading={actionLoading} onClick={handleRejectSubmit}>
            Confirm Reject
          </Button>
        </Group>
      </Modal>

      <Card shadow="sm" padding="lg">
        <Title order={3} mb="md">
          PhD Thesis Enrollments
        </Title>
        <Text size="sm" color="dimmed" mb="md">
          Verify or reject PhD students' semester-level thesis slot registrations.
        </Text>

        {/* Filters */}
        <Group mb="md" align="flex-end">
          <Select
            label="Semester"
            placeholder="All semesters"
            clearable
            data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
              value: String(n),
              label: `Semester ${n}`,
            }))}
            value={semesterFilter}
            onChange={(v) => setSemesterFilter(v || "")}
            style={{ width: 160 }}
          />
          <Select
            label="Status"
            data={[
              { value: "pending",  label: "Pending" },
              { value: "verified", label: "Verified" },
              { value: "rejected", label: "Rejected" },
            ]}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v || "")}
            style={{ width: 140 }}
          />
          <Button variant="light" onClick={fetchRegistrations}>
            Refresh
          </Button>
        </Group>

        <Divider mb="md" />

        {/* Bulk action toolbar */}
        {selected.length > 0 && (
          <Group mb="sm">
            <Text size="sm">{selected.length} selected</Text>
            <Button
              size="xs"
              color="green"
              loading={actionLoading}
              onClick={handleVerify}
            >
              Verify Selected
            </Button>
            <Button
              size="xs"
              color="red"
              onClick={() => setRejectModalOpen(true)}
            >
              Reject Selected
            </Button>
          </Group>
        )}

        {/* Table */}
        {loading ? (
          <Center style={{ height: 120 }}>
            <Loader />
          </Center>
        ) : registrations.length === 0 ? (
          <Alert color="gray">No registrations found for the selected filters.</Alert>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={selected.length > 0 && !allSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Semester</th>
                  <th>Thesis Slot</th>
                  <th>Credits</th>
                  <th>Thesis</th>
                  <th>Topic Status</th>
                  <th>Reg. Status</th>
                  <th>Registered On</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => {
                  const thesisNames = reg.thesis_slot?.theses
                    ?.map((t) => `${t.code}`)
                    .join(", ");
                  return (
                    <tr key={reg.id}>
                      <td>
                        <Checkbox
                          checked={selected.includes(reg.id)}
                          onChange={() => toggleOne(reg.id)}
                          disabled={reg.status !== "pending"}
                        />
                      </td>
                      <td>{reg.student?.id}</td>
                      <td>{reg.student?.name}</td>
                      <td>Sem {reg.semester_no}</td>
                      <td>{reg.thesis_slot?.name}</td>
                      <td>{reg.credits ?? '—'}</td>
                      <td>{thesisNames || "—"}</td>
                      <td>
                        <Badge
                          size="xs"
                          color={reg.topic_status === "dean_approved" ? "green" : "yellow"}
                          variant="light"
                        >
                          {TOPIC_STATUS_LABEL[reg.topic_status] || reg.topic_status || "—"}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          size="xs"
                          color={STATUS_COLOR[reg.status]}
                          variant="filled"
                        >
                          {STATUS_LABEL[reg.status] || reg.status}
                        </Badge>
                      </td>
                      <td style={{ fontSize: "0.75rem" }}>
                        {reg.registered_on
                          ? new Date(reg.registered_on).toLocaleDateString()
                          : "—"}
                      </td>
                      <td style={{ maxWidth: 160, fontSize: "0.75rem" }}>
                        {reg.remarks || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </>
  );
}

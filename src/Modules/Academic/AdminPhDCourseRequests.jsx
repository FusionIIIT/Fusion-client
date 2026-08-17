import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Select,
  Group,
  SimpleGrid,
  Button,
  TextInput,
  Table,
  Loader,
  Alert,
  Card,
  Stack,
  Checkbox,
  Badge,
  Tabs,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";

import {
  phdAdminListCourseRequestsRoute,
  phdAdminProcessCourseRequestsRoute,
  adminThesisEnrollmentListRoute,
  adminVerifyEnrollmentsRoute,
  adminRejectEnrollmentsRoute,
  adminProgressSeminarEnrollmentListRoute,
  adminVerifyProgressSeminarEnrollmentsRoute,
  adminRejectProgressSeminarEnrollmentsRoute,
  adminTeachingCreditEnrollmentListRoute,
  adminVerifyTeachingCreditEnrollmentsRoute,
  adminRejectTeachingCreditEnrollmentsRoute,
} from "../../routes/academicRoutes";

const TYPE_LABEL = {
  course: "Course",
  thesis: "Thesis",
  seminar: "Progress Seminar",
  teaching_credit: "Teaching Credit",
};

// Each backend uses its own status vocabulary (course: Pending/Approved/Rejected,
// the three enrollment tables: pending/verified/rejected) -- normalize to one
// set so the merged table can filter/display consistently.
const NORMALIZE_STATUS = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
  pending: "pending",
  verified: "approved",
  rejected: "rejected",
};

function authHeaders() {
  return { Authorization: `Token ${localStorage.getItem("authToken")}` };
}

function toRow(type, r) {
  const base = {
    type,
    rawId: r.id,
    key: `${type}-${r.id}`,
    status: NORMALIZE_STATUS[r.status] || r.status,
    remarks: r.remarks || "",
    semesterNo: r.semester_no,
    student: r.student?.name ?? r.student,
    studentName: r.student?.name ?? r.student_name,
    studentRoll:
      r.student?.roll_no ?? (typeof r.student === "string" ? r.student : ""),
    discipline: r.discipline ?? r.student?.discipline ?? "",
    specialization: r.specialization ?? r.student?.specialization ?? "",
    programmeCategory: r.programme_category || null,
  };
  if (type === "course") {
    return {
      ...base,
      slot: r.slot,
      detail: `${r.course} – ${r.course_name}`,
      credits: r.credit ?? "—",
      requestedAt: r.requested_at,
      processedAt: r.processed_at,
    };
  }
  if (type === "thesis") {
    const t = r.thesis_slot?.resolved_thesis;
    return {
      ...base,
      slot: r.thesis_slot?.name || "—",
      detail: t ? `${t.code} – ${t.name}` : "Thesis",
      credits: r.credits ?? "—",
      requestedAt: r.registered_on,
      processedAt: r.verified_on,
    };
  }
  if (type === "seminar") {
    const s = r.progress_seminar_slot?.resolved_seminar;
    return {
      ...base,
      slot: r.progress_seminar_slot?.name || "—",
      detail: s ? `${s.code} – ${s.name}` : "—",
      credits: s?.credit ?? "—",
      requestedAt: r.registered_on,
      processedAt: null,
    };
  }
  // teaching_credit
  const t = r.teaching_credit_slot?.resolved_teaching_credit;
  return {
    ...base,
    slot: r.teaching_credit_slot?.name || "—",
    detail: t ? `${t.code} – ${t.name}` : "—",
    credits: t?.credit ?? "—",
    requestedAt: r.registered_on,
    processedAt: null,
  };
}

export default function AdminPhDCourseRequests() {
  const [programmeCategory, setProgrammeCategory] = useState("");
  const [semester, setSemester] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [processing, setProcessing] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAll = useCallback(async () => {
    if (!semester) return;
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required");
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedKeys(new Set());
    try {
      const params = { semester };
      const [courseRes, thesisRes, seminarRes, teachingCreditRes] =
        await Promise.all([
          axios.get(phdAdminListCourseRequestsRoute, {
            params,
            headers: authHeaders(),
          }),
          axios.get(adminThesisEnrollmentListRoute, {
            params,
            headers: authHeaders(),
          }),
          axios.get(adminProgressSeminarEnrollmentListRoute, {
            params,
            headers: authHeaders(),
          }),
          axios.get(adminTeachingCreditEnrollmentListRoute, {
            params,
            headers: authHeaders(),
          }),
        ]);
      const merged = [
        ...(courseRes.data.requests || []).map((r) => toRow("course", r)),
        ...(thesisRes.data.registrations || []).map((r) => toRow("thesis", r)),
        ...(seminarRes.data.registrations || []).map((r) =>
          toRow("seminar", r),
        ),
        ...(teachingCreditRes.data.registrations || []).map((r) =>
          toRow("teaching_credit", r),
        ),
      ];
      setRows(merged);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Failed to load requests",
      );
    } finally {
      setLoading(false);
    }
  }, [semester]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const categoryFilteredRows = useMemo(
    () =>
      programmeCategory
        ? rows.filter((r) => r.programmeCategory === programmeCategory)
        : rows,
    [rows, programmeCategory],
  );
  const pendingRows = useMemo(
    () => categoryFilteredRows.filter((r) => r.status === "pending"),
    [categoryFilteredRows],
  );
  const processedRows = useMemo(
    () => categoryFilteredRows.filter((r) => r.status !== "pending"),
    [categoryFilteredRows],
  );
  const filteredProcessedRows = useMemo(
    () =>
      statusFilter
        ? processedRows.filter((r) => r.status === statusFilter)
        : processedRows,
    [processedRows, statusFilter],
  );

  const toggleSelection = useCallback((key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedKeys((prev) =>
      prev.size === pendingRows.length && pendingRows.length > 0
        ? new Set()
        : new Set(pendingRows.map((r) => r.key)),
    );
  }, [pendingRows]);

  const handleAction = useCallback(
    async (action) => {
      if (selectedKeys.size === 0) {
        showNotification({
          title: "No Selection",
          message: `Please select at least one item to ${action}.`,
          color: "yellow",
        });
        return;
      }
      const selectedRows = categoryFilteredRows.filter((r) =>
        selectedKeys.has(r.key),
      );
      const byType = {
        course: selectedRows
          .filter((r) => r.type === "course")
          .map((r) => r.rawId),
        thesis: selectedRows
          .filter((r) => r.type === "thesis")
          .map((r) => r.rawId),
        seminar: selectedRows
          .filter((r) => r.type === "seminar")
          .map((r) => r.rawId),
        teaching_credit: selectedRows
          .filter((r) => r.type === "teaching_credit")
          .map((r) => r.rawId),
      };

      setProcessing(true);
      try {
        const calls = [];
        if (byType.course.length) {
          calls.push(
            axios.post(
              phdAdminProcessCourseRequestsRoute,
              { request_ids: byType.course, action, remarks },
              { headers: authHeaders() },
            ),
          );
        }
        if (byType.thesis.length) {
          const route =
            action === "approve"
              ? adminVerifyEnrollmentsRoute
              : adminRejectEnrollmentsRoute;
          calls.push(
            axios.post(
              route,
              { ids: byType.thesis, remarks },
              { headers: authHeaders() },
            ),
          );
        }
        if (byType.seminar.length) {
          const route =
            action === "approve"
              ? adminVerifyProgressSeminarEnrollmentsRoute
              : adminRejectProgressSeminarEnrollmentsRoute;
          calls.push(
            axios.post(
              route,
              { ids: byType.seminar, remarks },
              { headers: authHeaders() },
            ),
          );
        }
        if (byType.teaching_credit.length) {
          const route =
            action === "approve"
              ? adminVerifyTeachingCreditEnrollmentsRoute
              : adminRejectTeachingCreditEnrollmentsRoute;
          calls.push(
            axios.post(
              route,
              { ids: byType.teaching_credit, remarks },
              { headers: authHeaders() },
            ),
          );
        }
        await Promise.all(calls);
        showNotification({
          title: "Success",
          message: `Processed ${selectedRows.length} item(s).`,
          color: "green",
        });
        setRemarks("");
      } catch (err) {
        showNotification({
          title: `${action === "approve" ? "Approval" : "Rejection"} Error`,
          message: err.response?.data?.error || err.message,
          color: "red",
        });
      } finally {
        setProcessing(false);
        // Deselect + refetch regardless: on partial failure the succeeded rows
        // must drop out of the pending set so a retry can't re-POST them.
        setSelectedKeys(new Set());
        await fetchAll();
      }
    },
    [selectedKeys, categoryFilteredRows, remarks, fetchAll],
  );

  return (
    <>
      <Card>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Select
              label="Programme"
              placeholder="All (PG + PhD)"
              data={[
                { value: "PG", label: "PG" },
                { value: "PHD", label: "PhD" },
              ]}
              value={programmeCategory}
              onChange={(value) => {
                setProgrammeCategory(value || "");
                setSelectedKeys(new Set());
              }}
              clearable
            />
            <Select
              label="Semester"
              placeholder="Select semester"
              data={Array.from({ length: 10 }, (_, i) => ({
                value: String(i + 1),
                label: `Semester ${i + 1}`,
              }))}
              value={semester}
              onChange={setSemester}
            />
            <TextInput
              label="Remarks (optional)"
              placeholder="e.g. Reason for rejection"
              value={remarks}
              onChange={(e) => setRemarks(e.currentTarget.value)}
            />
          </SimpleGrid>
          <Group justify="flex-start" gap="xs">
            <Button
              size="sm"
              onClick={fetchAll}
              loading={loading}
              disabled={!semester}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              color="green"
              onClick={() => handleAction("approve")}
              loading={processing}
              disabled={selectedKeys.size === 0}
            >
              Approve ({selectedKeys.size})
            </Button>
            <Button
              size="sm"
              color="red"
              onClick={() => handleAction("reject")}
              loading={processing}
              disabled={selectedKeys.size === 0}
            >
              Reject ({selectedKeys.size})
            </Button>
          </Group>
        </Stack>
      </Card>

      {loading ? (
        <Card mt="md">
          <Loader size="lg" />
        </Card>
      ) : error ? (
        <Alert title="Error" color="red" mt="md">
          {error}
        </Alert>
      ) : !semester ? (
        <Alert color="gray" mt="md">
          Select a semester to view PG/PhD registration requests (courses,
          thesis, progress seminar and teaching credit).
        </Alert>
      ) : (
        <Tabs defaultValue="pending" mt="md">
          <Tabs.List>
            <Tabs.Tab value="pending">
              Pending Requests ({pendingRows.length})
            </Tabs.Tab>
            <Tabs.Tab value="processed">
              Processed Requests ({processedRows.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="pending" pt="md">
            {pendingRows.length > 0 ? (
              <Card>
                <div
                  style={{
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <Table
                    highlightOnHover
                    withTableBorder
                    style={{ minWidth: 960 }}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: 50 }}>
                          <Checkbox
                            checked={
                              selectedKeys.size === pendingRows.length &&
                              pendingRows.length > 0
                            }
                            onChange={toggleSelectAll}
                            indeterminate={
                              selectedKeys.size > 0 &&
                              selectedKeys.size < pendingRows.length
                            }
                          />
                        </th>
                        <th>Type</th>
                        <th>Student</th>
                        <th>Slot</th>
                        <th>Detail</th>
                        <th>Credits</th>
                        <th>Status</th>
                        <th>Requested At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRows.map((r) => (
                        <tr key={r.key}>
                          <td>
                            <Checkbox
                              checked={selectedKeys.has(r.key)}
                              onChange={() => toggleSelection(r.key)}
                            />
                          </td>
                          <td>
                            <Badge
                              variant="outline"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {TYPE_LABEL[r.type]}
                            </Badge>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>
                              {r.studentName || r.studentRoll}
                            </div>
                            <div style={{ fontSize: 12, color: "#868e96" }}>
                              {[r.studentRoll, r.discipline, r.specialization]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          </td>
                          <td>{r.slot}</td>
                          <td>{r.detail}</td>
                          <td>{r.credits}</td>
                          <td>
                            <Badge color="yellow">Pending</Badge>
                          </td>
                          <td>
                            {r.requestedAt
                              ? new Date(r.requestedAt).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card>
            ) : (
              <Alert color="gray">
                No pending requests found for this semester.
              </Alert>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="processed" pt="md">
            {processedRows.length > 0 ? (
              <Card>
                <div
                  style={{
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <Table
                    highlightOnHover
                    withTableBorder
                    style={{ minWidth: 960 }}
                  >
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Student</th>
                        <th>Slot</th>
                        <th>Detail</th>
                        <th>Credits</th>
                        <th>
                          <Group gap="xs" justify="space-between">
                            <span>Status</span>
                            <Select
                              placeholder="All"
                              value={statusFilter}
                              onChange={setStatusFilter}
                              data={[
                                { value: "", label: "All" },
                                { value: "approved", label: "Approved" },
                                { value: "rejected", label: "Rejected" },
                              ]}
                              size="xs"
                              style={{ width: 100 }}
                              clearable
                            />
                          </Group>
                        </th>
                        <th>Remarks</th>
                        <th>Requested At</th>
                        <th>Processed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProcessedRows.map((r) => (
                        <tr key={r.key}>
                          <td>
                            <Badge
                              variant="outline"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {TYPE_LABEL[r.type]}
                            </Badge>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>
                              {r.studentName || r.studentRoll}
                            </div>
                            <div style={{ fontSize: 12, color: "#868e96" }}>
                              {[r.studentRoll, r.discipline, r.specialization]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          </td>
                          <td>{r.slot}</td>
                          <td>{r.detail}</td>
                          <td>{r.credits}</td>
                          <td>
                            <Badge
                              color={r.status === "approved" ? "green" : "red"}
                            >
                              {r.status === "approved"
                                ? "Approved"
                                : "Rejected"}
                            </Badge>
                          </td>
                          <td>{r.remarks || "—"}</td>
                          <td>
                            {r.requestedAt
                              ? new Date(r.requestedAt).toLocaleString()
                              : "—"}
                          </td>
                          <td>
                            {r.processedAt
                              ? new Date(r.processedAt).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card>
            ) : (
              <Alert color="gray">
                No processed requests found for this semester.
              </Alert>
            )}
          </Tabs.Panel>
        </Tabs>
      )}
    </>
  );
}

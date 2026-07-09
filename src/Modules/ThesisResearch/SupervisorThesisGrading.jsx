/**
 * SupervisorThesisGrading.jsx
 *
 * Faculty supervisor view for submitting S/X grades on student thesis
 * evaluation blocks.  Each verified ThesisRegistration has N blocks where
 * N = credits ÷ 3.  Supervisors submit grades for ALL of a student's blocks
 * together (manually, or via Excel upload) — no partial, block-at-a-time
 * submission. A grade can still be updated until the admin verifies it.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Title,
  Text,
  Select,
  Button,
  Table,
  Badge,
  Loader,
  Center,
  Group,
  Stack,
  Popover,
  ActionIcon,
  Textarea,
  Alert,
  Divider,
  Tooltip,
  FileInput,
  Modal,
  ScrollArea,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconCheck,
  IconChalkboard,
  IconDownload,
  IconUpload,
  IconNote,
} from "@tabler/icons-react";
import axios from "axios";
import {
  supervisorThesisGradesRoute,
  supervisorDownloadAllThesisGradesTemplateRoute,
  supervisorUploadAllThesisGradesRoute,
  supervisorBulkSubmitAllThesisGradesRoute,
} from "../../routes/academicRoutes";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const gradeColor = (g) => (g === "S" ? "green" : g === "X" ? "red" : "gray");
const gradeLabel = (g) => (g === "S" ? "Satisfactory" : g === "X" ? "Unsatisfactory" : "—");

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: one block's grade dropdown (or a locked badge), within a
// registration row.
// ─────────────────────────────────────────────────────────────────────────────
function BlockCell({ ev, draft, onDraftChange }) {
  if (!ev) {
    return (
      <Table.Td ta="center">
        <Text size="xs" c="dimmed">—</Text>
      </Table.Td>
    );
  }

  const locked = ev.verified || ev.announced;

  if (locked) {
    return (
      <Table.Td>
        <Tooltip label={ev.remarks || "No remarks"} disabled={!ev.remarks} withArrow>
          <Badge color={gradeColor(ev.grade)}>{gradeLabel(ev.grade)}</Badge>
        </Tooltip>
      </Table.Td>
    );
  }

  return (
    <Table.Td>
      <Group gap={4} wrap="nowrap">
        <Select
          size="xs"
          placeholder="— Not graded —"
          value={draft?.grade ?? null}
          onChange={(v) => onDraftChange(ev.block_number, { grade: v })}
          data={[
            { value: "S", label: "S — Satisfactory" },
            { value: "X", label: "X — Unsatisfactory" },
          ]}
          clearable
          w={150}
        />
        <Popover width={240} withArrow trapFocus shadow="md">
          <Popover.Target>
            <ActionIcon
              variant="subtle"
              size="sm"
              color={draft?.remarks ? "blue" : "gray"}
              aria-label={`Remarks for block ${ev.block_number}`}
            >
              <IconNote size={14} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Textarea
              size="xs"
              label="Optional remarks"
              placeholder="Add a remark for this block"
              value={draft?.remarks || ""}
              onChange={(e) =>
                onDraftChange(ev.block_number, { remarks: e.currentTarget.value })
              }
              autosize
              minRows={2}
              maxRows={4}
            />
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Table.Td>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: one row per thesis registration, with one column per block.
// Submit is only enabled once every unlocked block has a grade chosen, and
// sends them all together in a single bulk request — no partial submission.
// ─────────────────────────────────────────────────────────────────────────────
function RegistrationGradeRow({ blocksByNumber, maxBlocks, submittedByName, onGraded }) {
  const blocks = Object.values(blocksByNumber);
  const reg = blocks[0].registration;
  const totalBlocks = blocks[0].total_blocks;

  const [drafts, setDrafts] = useState(() => {
    const init = {};
    blocks.forEach((ev) => {
      init[ev.block_number] = { grade: ev.grade || null, remarks: ev.remarks || "" };
    });
    return init;
  });
  const [saving, setSaving] = useState(false);

  const updateDraft = useCallback((blockNum, patch) => {
    setDrafts((prev) => ({ ...prev, [blockNum]: { ...prev[blockNum], ...patch } }));
  }, []);

  const unlockedBlocks = blocks.filter((ev) => !(ev.verified || ev.announced));
  const allGraded =
    unlockedBlocks.length > 0 &&
    unlockedBlocks.every((ev) => !!drafts[ev.block_number]?.grade);

  const handleSubmit = async () => {
    setSaving(true);
    const token = localStorage.getItem("authToken");
    const submissions = unlockedBlocks.map((ev) => ({
      evaluation_id: ev.id,
      grade: drafts[ev.block_number].grade,
      remarks: drafts[ev.block_number].remarks,
    }));

    try {
      const res = await axios.post(
        supervisorBulkSubmitAllThesisGradesRoute,
        { submissions },
        { headers: { Authorization: `Token ${token}` } },
      );

      const failedIds = new Set((res.data.errors || []).map((e) => e.evaluation_id));
      let successCount = 0;

      unlockedBlocks.forEach((ev) => {
        if (failedIds.has(ev.id)) return;
        successCount += 1;
        onGraded({
          ...ev,
          grade: drafts[ev.block_number].grade,
          remarks: drafts[ev.block_number].remarks,
          submitted_by: submittedByName,
          submitted_at: new Date().toISOString(),
        });
      });

      if (successCount > 0) {
        showNotification({
          title: "Grades saved",
          message: `${successCount} block${successCount > 1 ? "s" : ""} submitted for ${reg.student.name}`,
          color: "green",
          icon: <IconCheck size={16} />,
        });
      }
      if (res.data.error_count > 0) {
        showNotification({
          title: "Some blocks failed",
          message: res.data.errors.map((e) => e.error).join("; "),
          color: "red",
          icon: <IconAlertCircle size={16} />,
        });
      }
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to submit grades",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Table.Tr>
      <Table.Td>{reg.student.name}</Table.Td>
      <Table.Td>Sem {reg.semester_no}</Table.Td>
      <Table.Td>{reg.thesis_slot}</Table.Td>
      {Array.from({ length: maxBlocks }, (_, i) => i + 1).map((blockNum) => (
        <BlockCell
          key={blockNum}
          ev={blockNum <= totalBlocks ? blocksByNumber[blockNum] : undefined}
          draft={drafts[blockNum]}
          onDraftChange={updateDraft}
        />
      ))}
      <Table.Td>
        <Tooltip
          label="Grade every block above before submitting"
          disabled={allGraded || unlockedBlocks.length === 0}
          withArrow
        >
          <Button size="xs" loading={saving} disabled={!allGraded} onClick={handleSubmit}>
            {unlockedBlocks.length > 0 ? `Submit All (${unlockedBlocks.length})` : "Submit"}
          </Button>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function SupervisorThesisGrading() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [semFilter, setSemFilter]     = useState("");
  const [gradedFilter, setGradedFilter] = useState("");   // "" | "false" | "true"

  // Excel upload (all blocks at once) state
  const [uploadAllFile, setUploadAllFile]             = useState(null);
  const [uploadingAll, setUploadingAll]               = useState(false);
  const [previewAllData, setPreviewAllData]           = useState(null);
  const [previewAllModalOpen, setPreviewAllModalOpen] = useState(false);
  const [submittingAll, setSubmittingAll]             = useState(false);

  // Upload method selection
  const [uploadMethod, setUploadMethod]               = useState("manual");

  // Get user information
  const getUserName = () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        const user = JSON.parse(userInfo);
        return user.name || user.username || "Supervisor";
      }
    } catch (e) {
      console.error("Error getting user info:", e);
    }
    return "Supervisor";
  };

  const authHeaders = () => ({
    Authorization: `Token ${localStorage.getItem("authToken")}`,
  });

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (semFilter)    params.semester = semFilter;
      if (gradedFilter) params.graded   = gradedFilter;
      const res = await axios.get(supervisorThesisGradesRoute, {
        headers: authHeaders(),
        params,
      });
      setEvaluations(res.data.evaluations || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semFilter, gradedFilter]);

  useEffect(() => { fetchEvaluations(); }, [fetchEvaluations]);

  // Update one evaluation in the list after supervisor submits
  const handleGraded = useCallback((updated) => {
    setEvaluations((prev) =>
      prev.map((ev) => (ev.id === updated.id ? updated : ev)),
    );
  }, []);

  // All Blocks (Excel) Handlers
  const handleDownloadAllTemplate = async () => {
    try {
      const res = await axios.get(supervisorDownloadAllThesisGradesTemplateRoute, {
        headers: authHeaders(),
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Thesis_Grades_All_Blocks_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      const errorMsg = e.response?.data?.error || "Failed to download template";
      console.error('Download all blocks template error:', e);
      showNotification({
        title: "Error",
        message: errorMsg,
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  const handleUploadAllFile = async () => {
    if (!uploadAllFile) {
      showNotification({
        title: "Select a file",
        message: "Please select an Excel file to upload.",
        color: "yellow",
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    setUploadingAll(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadAllFile);

      const res = await axios.post(supervisorUploadAllThesisGradesRoute, formData, {
        headers: {
          ...authHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      setPreviewAllData(res.data);
      setPreviewAllModalOpen(true);
      setUploadAllFile(null);
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to upload file",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setUploadingAll(false);
    }
  };

  const handleBulkSubmitAll = async () => {
    if (!previewAllData || !previewAllData.valid_rows || previewAllData.valid_rows.length === 0) {
      return;
    }

    setSubmittingAll(true);
    try {
      const res = await axios.post(
        supervisorBulkSubmitAllThesisGradesRoute,
        { submissions: previewAllData.valid_rows },
        { headers: authHeaders() },
      );

      showNotification({
        title: "Grades submitted",
        message: `Successfully submitted ${res.data.success_count} grades across all blocks.`,
        color: "green",
        icon: <IconCheck size={16} />,
      });

      // Update evaluations
      const submittedIds = new Set(previewAllData.valid_rows.map(r => r.evaluation_id));
      const submissionMap = new Map(previewAllData.valid_rows.map(r => [r.evaluation_id, r]));

      setEvaluations((prev) =>
        prev.map((ev) => {
          if (!submittedIds.has(ev.id)) return ev;
          const submission = submissionMap.get(ev.id);
          return {
            ...ev,
            grade: submission.grade,
            remarks: submission.remarks,
            submitted_at: new Date().toISOString(),
            submitted_by: getUserName(),
          };
        })
      );

      setPreviewAllModalOpen(false);
      setPreviewAllData(null);
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to submit grades",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setSubmittingAll(false);
    }
  };

  // Group the flat block list into one entry per thesis registration, so the
  // manual-entry table shows one row per student instead of one row per block.
  const groupedRegistrations = useMemo(() => {
    const map = new Map();
    evaluations.forEach((ev) => {
      const key = ev.registration.id;
      if (!map.has(key)) map.set(key, {});
      map.get(key)[ev.block_number] = ev;
    });
    return Array.from(map.entries());
  }, [evaluations]);

  const maxBlocks = useMemo(
    () => evaluations.reduce((max, ev) => Math.max(max, ev.total_blocks || 1), 1),
    [evaluations],
  );

  // Build unique semester options from loaded data
  const semOptions = [
    { value: "", label: "All Semesters" },
    ...Array.from(
      new Set(evaluations.map((ev) => String(ev.registration.semester_no))),
    )
      .sort((a, b) => Number(a) - Number(b))
      .map((s) => ({ value: s, label: `Semester ${s}` })),
  ];

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* Header */}
        <Title order={3} c="blue" fw={700} ta="center">
          Thesis Grade Submission
        </Title>
        <Text size="sm" c="dimmed" ta="center">
          Submit S (Satisfactory) or X (Unsatisfactory) grades for each
          evaluation block of your supervised PhD students. All of a
          student&apos;s blocks must be submitted together — no partial
          submission.
        </Text>

        <Divider />

        {/* Upload Methods Tabs */}
        <Group gap="xs" mb="lg">
          <Button
            onClick={() => setUploadMethod("manual")}
            variant={uploadMethod === "manual" ? "filled" : "light"}
            color="blue"
            size="md"
            radius="md"
            bd={uploadMethod === "manual" ? "1px solid var(--mantine-color-blue-6)" : "1px solid var(--mantine-color-blue-2)"}
          >
            Manual Entry
          </Button>
          <Button
            onClick={() => setUploadMethod("complete")}
            variant={uploadMethod === "complete" ? "filled" : "light"}
            color="blue"
            size="md"
            radius="md"
            bd={uploadMethod === "complete" ? "1px solid var(--mantine-color-blue-6)" : "1px solid var(--mantine-color-blue-2)"}
          >
            Excel Upload
          </Button>
        </Group>

        {/* Manual Entry Content */}
        {uploadMethod === "manual" && (
          <Stack gap="md">
            <div>
              <Text size="sm" fw={600} mb="sm" c="blue">
                Manual Grade Entry
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Grade every block for a student, then submit them all at once
                with the button at the end of the row.
              </Text>
            </div>

            {/* Filters */}
            <Group>
              <Select
                label="Filter by Semester"
                placeholder="All Semesters"
                value={semFilter}
                onChange={(v) => setSemFilter(v || "")}
                data={semOptions}
                clearable
                w={200}
              />
              <Select
                label="Filter by Status"
                placeholder="All"
                value={gradedFilter}
                onChange={(v) => setGradedFilter(v || "")}
                data={[
                  { value: "",      label: "All" },
                  { value: "false", label: "Pending (not yet graded)" },
                  { value: "true",  label: "Graded" },
                ]}
                w={220}
              />
              <Button
                variant="light"
                mt="xl"
                onClick={fetchEvaluations}
                leftSection={<IconChalkboard size={16} />}
              >
                Refresh
              </Button>
            </Group>

            {/* Body */}
            {loading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : error ? (
              <Alert color="red" icon={<IconAlertCircle size={16} />}>
                {error}
              </Alert>
            ) : evaluations.length === 0 ? (
              <Text ta="center" c="dimmed" py="xl">
                No evaluation blocks found for the selected filters.
              </Text>
            ) : (
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Student</Table.Th>
                    <Table.Th>Semester</Table.Th>
                    <Table.Th>Thesis Slot</Table.Th>
                    {Array.from({ length: maxBlocks }, (_, i) => i + 1).map((n) => (
                      <Table.Th key={n}>Block {n}</Table.Th>
                    ))}
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {groupedRegistrations.map(([registrationId, blocksByNumber]) => (
                    <RegistrationGradeRow
                      key={registrationId}
                      blocksByNumber={blocksByNumber}
                      maxBlocks={maxBlocks}
                      submittedByName={getUserName()}
                      onGraded={handleGraded}
                    />
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        )}

        {/* Excel Upload Content */}
        {uploadMethod === "complete" && (
          <Stack gap="md">
            <div>
              <Text size="sm" fw={600} mb="sm" c="green">
                Excel Upload (All Blocks at Once)
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Download a single template with all ungraded blocks and
                students, fill in every block for each student, and submit in
                bulk. A row missing a grade for any of that student&apos;s
                blocks is rejected — there is no partial submission here
                either.
              </Text>
            </div>

            {/* Download Template */}
            <div>
              <Text size="sm" fw={500} mb="xs">Step 1: Download Template</Text>
              <Group>
                <Button
                  variant="default"
                  leftSection={<IconDownload size={16} />}
                  onClick={handleDownloadAllTemplate}
                  disabled={loading}
                >
                  Download Template
                </Button>
              </Group>
            </div>

            {/* Upload File */}
            <div>
              <Text size="sm" fw={500} mb="xs">Step 2: Upload Grades</Text>
              <Group>
                <FileInput
                  label="Select Excel File"
                  placeholder="Choose .xlsx or .xls file"
                  value={uploadAllFile}
                  onChange={setUploadAllFile}
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  w={250}
                />
                <Button
                  leftSection={<IconUpload size={16} />}
                  onClick={handleUploadAllFile}
                  loading={uploadingAll}
                  disabled={!uploadAllFile}
                  color="green"
                  mt="lg"
                >
                  Upload & Preview
                </Button>
              </Group>
            </div>
          </Stack>
        )}
      </Stack>

      {/* Excel Upload Preview Modal */}
      <Modal
        opened={previewAllModalOpen}
        onClose={() => setPreviewAllModalOpen(false)}
        title="Excel Upload Preview"
        size="xl"
      >
        {previewAllData && (
          <Stack gap="md">
            <div>
              <Text fw={700} size="sm" mb="xs">
                Valid Rows ({previewAllData.valid_rows?.length || 0})
              </Text>
              {previewAllData.valid_rows && previewAllData.valid_rows.length > 0 ? (
                <ScrollArea>
                  <Table size="xs" striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Roll Number</Table.Th>
                        <Table.Th>Block</Table.Th>
                        <Table.Th>Grade</Table.Th>
                        <Table.Th>Remarks</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {previewAllData.valid_rows.map((row, idx) => (
                        <Table.Tr key={idx} bg="green.0">
                          <Table.Td>{row.roll_no}</Table.Td>
                          <Table.Td>Block {row.block_number}</Table.Td>
                          <Table.Td>
                            <Badge color={row.grade === "S" ? "green" : "red"}>
                              {row.grade}
                            </Badge>
                          </Table.Td>
                          <Table.Td>{row.remarks || "—"}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              ) : (
                <Text size="sm" c="dimmed">
                  No valid rows
                </Text>
              )}
            </div>

            {previewAllData.invalid_rows && previewAllData.invalid_rows.length > 0 && (
              <div>
                <Text fw={700} size="sm" mb="xs" c="red">
                  Invalid Rows ({previewAllData.invalid_rows.length})
                </Text>
                <ScrollArea>
                  <Table size="xs" striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Row #</Table.Th>
                        <Table.Th>Roll Number</Table.Th>
                        <Table.Th>Errors</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {previewAllData.invalid_rows.map((row, idx) => (
                        <Table.Tr key={idx} bg="red.0">
                          <Table.Td>{row.row_num}</Table.Td>
                          <Table.Td>{row.roll_no}</Table.Td>
                          <Table.Td>
                            <Stack gap={0}>
                              {row.errors.map((err, i) => (
                                <Text key={i} size="xs" c="red">
                                  • {err}
                                </Text>
                              ))}
                            </Stack>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </div>
            )}

            <Group grow>
              <Button
                variant="default"
                onClick={() => setPreviewAllModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color="green"
                onClick={handleBulkSubmitAll}
                loading={submittingAll}
                disabled={(previewAllData.valid_rows?.length || 0) === 0}
              >
                Submit {previewAllData.valid_rows?.length || 0} Valid Grades
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Card>
  );
}

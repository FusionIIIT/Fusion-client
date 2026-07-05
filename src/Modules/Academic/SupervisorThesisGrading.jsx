/**
 * SupervisorThesisGrading.jsx
 *
 * Faculty supervisor view for submitting S/X grades on student thesis
 * evaluation blocks.  Each verified ThesisRegistration has N blocks where
 * N = credits ÷ 3.  Supervisors submit one grade (S or X) per block;
 * the grade can be updated until the admin verifies it.
 */

import React, { useState, useEffect, useCallback } from "react";
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
  SegmentedControl,
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
} from "@tabler/icons-react";
import axios from "axios";
import {
  supervisorThesisGradesRoute,
  supervisorSubmitThesisGradeRoute,
  supervisorDownloadThesisGradesTemplateRoute,
  supervisorGetUngradedBlocksRoute,
  supervisorUploadThesisGradesRoute,
  supervisorBulkSubmitThesisGradesRoute,
  supervisorDownloadAllThesisGradesTemplateRoute,
  supervisorUploadAllThesisGradesRoute,
  supervisorBulkSubmitAllThesisGradesRoute,
} from "../../routes/academicRoutes";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const gradeColor = (g) => (g === "S" ? "green" : g === "X" ? "red" : "gray");
const gradeLabel = (g) => (g === "S" ? "Satisfactory" : g === "X" ? "Unsatisfactory" : "—");

function statusBadge(ev) {
  if (ev.announced) return <Badge color="teal">Announced</Badge>;
  if (ev.verified)  return <Badge color="blue">Verified</Badge>;
  if (ev.grade)     return <Badge color="yellow">Submitted</Badge>;
  return                     <Badge color="gray">Pending</Badge>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: single evaluation row
// ─────────────────────────────────────────────────────────────────────────────
function EvalRow({ ev, onGraded }) {
  const [chosenGrade, setChosenGrade] = useState(ev.grade || "S");
  const [remarks, setRemarks]         = useState(ev.remarks || "");
  const [saving, setSaving]           = useState(false);
  const locked = ev.verified || ev.announced;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        supervisorSubmitThesisGradeRoute,
        { evaluation_id: ev.id, grade: chosenGrade, remarks },
        { headers: { Authorization: `Token ${token}` } },
      );
      showNotification({
        title: "Grade saved",
        message: `Block ${ev.block_number} → ${gradeLabel(chosenGrade)}`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
      onGraded(res.data);
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to save grade",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Table.Tr>
      <Table.Td>{ev.registration.student.name}</Table.Td>
      <Table.Td>Sem {ev.registration.semester_no}</Table.Td>
      <Table.Td>{ev.registration.thesis_slot}</Table.Td>
      <Table.Td>
        Block&nbsp;{ev.block_number}&nbsp;/&nbsp;{ev.total_blocks}
      </Table.Td>
      <Table.Td>
        {locked ? (
          <Badge color={gradeColor(ev.grade)}>{gradeLabel(ev.grade)}</Badge>
        ) : (
          <SegmentedControl
            size="xs"
            value={chosenGrade}
            onChange={setChosenGrade}
            data={[
              { label: "S — Satisfactory",   value: "S" },
              { label: "X — Unsatisfactory", value: "X" },
            ]}
            color={chosenGrade === "S" ? "green" : "red"}
          />
        )}
      </Table.Td>
      <Table.Td>
        {locked ? (
          <Text size="xs" c="dimmed">{ev.remarks || "—"}</Text>
        ) : (
          <Textarea
            size="xs"
            placeholder="Optional remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.currentTarget.value)}
            rows={1}
            autosize
            maxRows={3}
          />
        )}
      </Table.Td>
      <Table.Td>{statusBadge(ev)}</Table.Td>
      <Table.Td>
        {locked ? (
          <Tooltip label="Grade locked by admin" withArrow>
            <Button size="xs" variant="light" disabled>
              Locked
            </Button>
          </Tooltip>
        ) : (
          <Button
            size="xs"
            loading={saving}
            onClick={handleSubmit}
            color={chosenGrade === "S" ? "green" : "red"}
          >
            {ev.grade ? "Update" : "Submit"}
          </Button>
        )}
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

  // Bulk upload state
  const [selectedBlockNum, setSelectedBlockNum]       = useState("");
  const [uploadBlockNum, setUploadBlockNum]           = useState("");  // Separate for upload
  const [ungradedBlocks, setUngradedBlocks]           = useState([]);
  const [loadingBlocks, setLoadingBlocks]             = useState(false);
  const [uploadFile, setUploadFile]                   = useState(null);
  const [uploading, setUploading]                     = useState(false);
  const [previewData, setPreviewData]                 = useState(null);
  const [previewModalOpen, setPreviewModalOpen]       = useState(false);
  const [submitting, setSubmitting]                   = useState(false);

  // All blocks comprehensive upload state
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

  // Fetch ungraded block numbers
  const fetchUngradedBlocks = useCallback(async () => {
    setLoadingBlocks(true);
    try {
      const res = await axios.get(supervisorGetUngradedBlocksRoute, {
        headers: authHeaders(),
      });
      setUngradedBlocks(res.data.blocks || []);
    } catch (e) {
      console.error('Failed to fetch ungraded blocks', e);
    } finally {
      setLoadingBlocks(false);
    }
  }, []);

  useEffect(() => { fetchUngradedBlocks(); }, [fetchUngradedBlocks]);

  // Update one evaluation in the list after supervisor submits
  const handleGraded = useCallback((updated) => {
    setEvaluations((prev) =>
      prev.map((ev) => (ev.id === updated.id ? updated : ev)),
    );
  }, []);

  // Validate that block is selected - reusable helper
  const validateBlockSelected = () => {
    if (!selectedBlockNum) {
      showNotification({
        title: "Select a block",
        message: "Please select a block number.",
        color: "yellow",
        icon: <IconAlertCircle size={16} />,
      });
      return false;
    }
    return true;
  };

  const handleDownloadTemplate = async () => {
    if (!validateBlockSelected()) return;

    try {
      const res = await axios.get(supervisorDownloadThesisGradesTemplateRoute, {
        headers: authHeaders(),
        params: { block_number: selectedBlockNum },
        responseType: "blob",
      });

      // Create blob URL and trigger download
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Thesis_Grades_Block_${selectedBlockNum}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      showNotification({
        title: "Template downloaded",
        message: "Fill in the grades and upload the file.",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (e) {
      const errorMsg = e.response?.data?.error || e.response?.statusText || "Failed to download template";
      console.error('Download template error:', e);
      showNotification({
        title: "Error",
        message: errorMsg,
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  const handleUploadFile = async () => {
    if (!uploadBlockNum) {
      showNotification({
        title: "Select a block",
        message: "Please select a block number to upload grades for.",
        color: "yellow",
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    if (!uploadFile) {
      showNotification({
        title: "Select a file",
        message: "Please select an Excel file to upload.",
        color: "yellow",
        icon: <IconAlertCircle size={16} />,
      });
       return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("block_number", uploadBlockNum);

      const res = await axios.post(supervisorUploadThesisGradesRoute, formData, {
        headers: {
          ...authHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      setPreviewData(res.data);
      setPreviewModalOpen(true);
      setUploadFile(null);
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to upload file",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!previewData || !previewData.valid_rows || previewData.valid_rows.length === 0) {
      return;  // Button is disabled
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        supervisorBulkSubmitThesisGradesRoute,
        { submissions: previewData.valid_rows },
        { headers: authHeaders() },
      );

      showNotification({
        title: "Grades submitted",
        message: `Successfully submitted ${res.data.success_count} grades for Block ${uploadBlockNum}.`,
        color: "green",
        icon: <IconCheck size={16} />,
      });

      // Update evaluations directly
      const submittedIds = new Set(previewData.valid_rows.map(r => r.evaluation_id));
      const submissionMap = new Map(previewData.valid_rows.map(r => [r.evaluation_id, r]));

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

      setPreviewModalOpen(false);
      setPreviewData(null);
      fetchUngradedBlocks();  // Refresh ungraded blocks list
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to submit grades",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // All Blocks Handlers
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
      fetchUngradedBlocks();
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
  const blockNumOptions = [
    { value: "", label: "Select a block number..." },
    ...ungradedBlocks.map((num) => ({
      value: String(num),
      label: `Block ${num}`,
    })),
  ];

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
          evaluation block of your supervised PhD students.
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
            onClick={() => setUploadMethod("block-wise")}
            variant={uploadMethod === "block-wise" ? "filled" : "light"}
            color="blue"
            size="md"
            radius="md"
            bd={uploadMethod === "block-wise" ? "1px solid var(--mantine-color-blue-6)" : "1px solid var(--mantine-color-blue-2)"}
          >
            Block-wise Upload
          </Button>
          <Button
            onClick={() => setUploadMethod("complete")}
            variant={uploadMethod === "complete" ? "filled" : "light"}
            color="blue"
            size="md"
            radius="md"
            bd={uploadMethod === "complete" ? "1px solid var(--mantine-color-blue-6)" : "1px solid var(--mantine-color-blue-2)"}
          >
            Complete Upload
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
                Submit grades one evaluation block at a time using the form below.
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
                    <Table.Th>Block</Table.Th>
                    <Table.Th>Grade</Table.Th>
                    <Table.Th>Remarks</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {evaluations.map((ev) => (
                    <EvalRow key={ev.id} ev={ev} onGraded={handleGraded} />
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        )}

        {/* Block-wise Upload Content */}
        {uploadMethod === "block-wise" && (
          <Stack gap="md">
            <div>
              <Text size="sm" fw={600} mb="sm" c="blue">
                Block-wise Grade Upload
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Select a specific block, download the Excel template with students for that block, fill in grades, and upload to submit in bulk.
              </Text>
            </div>

            {/* Download Template */}
            <div>
              <Text size="sm" fw={500} mb="xs">Step 1: Download Template</Text>
              <Group>
                <Select
                  label="Select Block Number"
                  placeholder="Choose a block..."
                  value={selectedBlockNum}
                  onChange={setSelectedBlockNum}
                  data={blockNumOptions}
                  w={200}
                  disabled={loadingBlocks}
                />
                <Button
                  variant="default"
                  leftSection={<IconDownload size={16} />}
                  onClick={handleDownloadTemplate}
                  disabled={!selectedBlockNum || loading || loadingBlocks}
                  mt="lg"
                >
                  Download Template
                </Button>
              </Group>
            </div>

            {/* Upload File */}
            <div>
              <Text size="sm" fw={500} mb="xs">Step 2: Upload Grades</Text>
              <Group>
                <Select
                  label="Select Block Number"
                  placeholder="Choose a block..."
                  value={uploadBlockNum}
                  onChange={setUploadBlockNum}
                  data={blockNumOptions}
                  w={200}
                  disabled={loadingBlocks}
                />
                <FileInput
                  label="Select Excel File"
                  placeholder="Choose .xlsx or .xls file"
                  value={uploadFile}
                  onChange={setUploadFile}
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  w={250}
                />
                <Button
                  leftSection={<IconUpload size={16} />}
                  onClick={handleUploadFile}
                  loading={uploading}
                  disabled={!uploadFile || !uploadBlockNum || loadingBlocks}
                  color="green"
                  mt="lg"
                >
                  Upload & Preview
                </Button>
              </Group>
            </div>
          </Stack>
        )}

        {/* Complete Upload Content */}
        {uploadMethod === "complete" && (
          <Stack gap="md">
            <div>
              <Text size="sm" fw={600} mb="sm" c="green">
                Complete Upload (All Blocks at Once)
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Download a single template with all ungraded blocks and students, fill in all grades at once, and submit in bulk.
              </Text>
            </div>

            {/* Download All Template */}
            <div>
              <Text size="sm" fw={500} mb="xs">Step 1: Download Complete Template</Text>
              <Group>
                <Button
                  variant="default"
                  leftSection={<IconDownload size={16} />}
                  onClick={handleDownloadAllTemplate}
                  disabled={loading || loadingBlocks}
                >
                  Download Complete Template
                </Button>
              </Group>
            </div>

            {/* Upload All File */}
            <div>
              <Text size="sm" fw={500} mb="xs">Step 2: Upload Grades for All Blocks</Text>
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
                  disabled={!uploadAllFile || loadingBlocks}
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

      {/* Preview Modal */}
      <Modal
        opened={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Excel Upload Preview"
        size="lg"
      >
        {previewData && (
          <Stack gap="md">
            <div>
              <Text fw={700} size="sm" mb="xs">
                Valid Rows ({previewData.valid_rows?.length || 0})
              </Text>
              {previewData.valid_rows && previewData.valid_rows.length > 0 ? (
                <ScrollArea>
                  <Table size="xs" striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Roll Number</Table.Th>
                        <Table.Th>Grade</Table.Th>
                        <Table.Th>Remarks</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {previewData.valid_rows.map((row, idx) => (
                        <Table.Tr key={idx} bg="green.0">
                          <Table.Td>{row.roll_no}</Table.Td>
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

            {previewData.invalid_rows && previewData.invalid_rows.length > 0 && (
              <div>
                <Text fw={700} size="sm" mb="xs" c="red">
                  Invalid Rows ({previewData.invalid_rows.length})
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
                      {previewData.invalid_rows.map((row, idx) => (
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
                onClick={() => setPreviewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color="green"
                onClick={handleBulkSubmit}
                loading={submitting}
                disabled={(previewData.valid_rows?.length || 0) === 0}
              >
                Submit {previewData.valid_rows?.length || 0} Valid Rows
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* All Blocks Preview Modal */}
      <Modal
        opened={previewAllModalOpen}
        onClose={() => setPreviewAllModalOpen(false)}
        title="Complete Upload Preview (All Blocks)"
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

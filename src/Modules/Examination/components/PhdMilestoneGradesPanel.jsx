import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Select,
  Button,
  FileInput,
  Grid,
  Box,
  LoadingOverlay,
  Alert,
  Text,
  Group,
  List,
  Title,
  Table,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { FileArrowDown, Upload } from "@phosphor-icons/react";
import { submit_phd_milestone_grades } from "../routes/examinationRoutes";
import { buildSemesterNumberOptions } from "../constants/semesterOptions";

const CATEGORY_META = {
  thesis: { title: "Submit Thesis Grades" },
  progress_seminar: { title: "Submit Progress Seminar Grades" },
  teaching_credit: { title: "Submit Teaching Credit Grades" },
};

export default function PhdMilestoneGradesPanel({ category }) {
  const meta = CATEGORY_META[category];
  const semesterTypes = [
    { value: "Odd Semester", label: "Odd Semester" },
    { value: "Even Semester", label: "Even Semester" },
  ];

  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [semesterType, setSemesterType] = useState("");
  const [semesterNo, setSemesterNo] = useState("");
  const [students, setStudents] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const semesterNoOptions = buildSemesterNumberOptions(semesterType);
  const ready = Boolean(batchId && semesterType && semesterNo);
  const getToken = () => localStorage.getItem("authToken");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.post(
          submit_phd_milestone_grades,
          { action: "list_batches" },
          { headers: { Authorization: `Token ${getToken()}` } },
        );
        setBatches(
          data.batches.map((b) => ({ value: String(b.id), label: b.label })),
        );
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callAction = async (action, extra = {}) => {
    const { data } = await axios.post(
      submit_phd_milestone_grades,
      {
        action,
        category,
        batch_id: batchId,
        semester_no: semesterNo,
        semester_type: semesterType,
        ...extra,
      },
      { headers: { Authorization: `Token ${getToken()}` } },
    );
    return data;
  };

  const handleViewStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await callAction("list_students");
      setStudents(data.students);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await axios.post(
        submit_phd_milestone_grades,
        {
          action: "download_template",
          category,
          batch_id: batchId,
          semester_no: semesterNo,
          semester_type: semesterType,
        },
        {
          headers: { Authorization: `Token ${getToken()}` },
          responseType: "blob",
        },
      );
      const url = URL.createObjectURL(new Blob([resp.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${category}_grades_sem${semesterNo}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      let msg = err.message;
      if (err.response?.data instanceof Blob) {
        try {
          msg = JSON.parse(await err.response.data.text())?.error || msg;
        } catch {
          // keep generic message
        }
      } else {
        msg = err.response?.data?.error || msg;
      }
      setError(`Error downloading template: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!csvFile) {
      setError("Please select a CSV file to preview.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const form = new FormData();
      form.append("action", "preview_upload");
      form.append("category", category);
      form.append("batch_id", batchId);
      form.append("semester_no", semesterNo);
      form.append("semester_type", semesterType);
      form.append("csv_file", csvFile);
      const { data } = await axios.post(submit_phd_milestone_grades, form, {
        headers: {
          Authorization: `Token ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setPreviewData(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!previewData?.valid_rows?.length) return;
    setLoading(true);
    setError("");
    try {
      const data = await callAction("bulk_submit", {
        submissions: previewData.valid_rows,
      });
      showNotification({
        title: "Submitted",
        message: `${data.success_count} grade(s) submitted, ${data.error_count} failed.`,
        color: data.error_count ? "yellow" : "green",
      });
      setSuccess(`${data.success_count} grade(s) submitted successfully.`);
      setPreviewData(null);
      setCsvFile(null);
      handleViewStudents();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
    setCsvFile(null);
    setError("");
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} />
      <Title order={2} mb="md">
        {meta.title}
      </Title>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          color="green"
          mb="md"
          withCloseButton
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {!previewData ? (
        <>
          <Grid>
            <Grid.Col xs={12} sm={6}>
              <Select
                label="Batch"
                placeholder="Select Batch"
                data={batches}
                value={batchId}
                onChange={(v) => {
                  setBatchId(v);
                  setStudents(null);
                }}
                searchable
                required
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={6}>
              <Select
                label="Semester Type"
                placeholder="Select Semester Type"
                data={semesterTypes}
                value={semesterType}
                onChange={(v) => {
                  setSemesterType(v);
                  setSemesterNo("");
                  setStudents(null);
                }}
                required
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={6}>
              <Select
                label="Semester No."
                placeholder="Select Semester Number"
                data={semesterNoOptions}
                value={semesterNo}
                onChange={(v) => {
                  setSemesterNo(v);
                  setStudents(null);
                }}
                disabled={!semesterType}
                required
              />
            </Grid.Col>
          </Grid>

          <Group mt="md">
            <Button
              variant="outline"
              onClick={handleViewStudents}
              disabled={!ready}
            >
              View Eligible Students
            </Button>
          </Group>

          {students && (
            <Table highlightOnHover mt="md" withBorder>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  {category === "thesis" && <th>Block</th>}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr>
                    <td colSpan={category === "thesis" ? 4 : 3}>
                      <Text color="dimmed" size="sm">
                        No eligible students found for this semester.
                      </Text>
                    </td>
                  </tr>
                )}
                {students.map((s, i) => (
                  <tr key={i}>
                    <td>{s.roll_no}</td>
                    <td>{s.name}</td>
                    {category === "thesis" && <td>{s.block_number}</td>}
                    <td style={{ color: s.already_graded ? "gray" : "green" }}>
                      {s.already_graded
                        ? `Already graded: ${s.current_grade}`
                        : "Not graded"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <Box mt="xl">
            <Text size="sm" mb="xs" weight={500}>
              CSV File Format Requirements:
            </Text>
            <List size="sm" spacing="xs" withPadding>
              {category === "thesis" ? (
                <List.Item>
                  Required: <b>roll_no</b>, <b>Grade 1</b>, <b>Grade 2</b>, ...,{" "}
                  <b>remarks</b>
                </List.Item>
              ) : (
                <List.Item>
                  Required: <b>roll_no</b>, <b>grade</b>, <b>remarks</b>
                </List.Item>
              )}
              <List.Item>Ensure valid roll numbers and grades</List.Item>
            </List>
          </Box>

          <Group mt="xl" position="apart">
            <Button
              leftSection={<FileArrowDown />}
              color="green"
              onClick={handleDownloadTemplate}
              disabled={!ready}
            >
              Download Template
            </Button>
            <Group>
              <FileInput
                placeholder="Click to select CSV"
                value={csvFile}
                onChange={setCsvFile}
                accept=".csv"
                clearable
                disabled={!ready}
              />
              <Button
                leftSection={<Upload />}
                color="blue"
                onClick={handlePreview}
                disabled={!ready || !csvFile}
              >
                Preview
              </Button>
            </Group>
          </Group>
        </>
      ) : (
        <Box mt="md">
          <Title order={4} mb="sm">
            Preview
          </Title>
          <Text fw={600} mb="xs" color="green">
            Valid Rows: {previewData.valid_rows.length}
          </Text>
          <Table highlightOnHover withBorder mb="md">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                {category === "thesis" && <th>Block</th>}
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {previewData.valid_rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.roll_no}</td>
                  <td>{r.name}</td>
                  {category === "thesis" && <td>{r.block_number}</td>}
                  <td>{r.grade}</td>
                  <td>{r.remarks}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Text fw={600} mb="xs" color="red">
            Invalid Rows: {previewData.invalid_rows.length}
          </Text>
          {previewData.invalid_rows.length > 0 && (
            <Table highlightOnHover withBorder mb="md">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {previewData.invalid_rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.roll_no}</td>
                    <td>{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <Group mt="md">
            <Button
              color="blue"
              onClick={handleSubmit}
              disabled={previewData.valid_rows.length === 0}
            >
              Submit {previewData.valid_rows.length} Valid Grade
              {previewData.valid_rows.length === 1 ? "" : "s"}
            </Button>
            <Button variant="outline" onClick={handleCancelPreview}>
              Cancel
            </Button>
          </Group>
        </Box>
      )}
    </Box>
  );
}

PhdMilestoneGradesPanel.propTypes = {
  category: PropTypes.oneOf(["thesis", "progress_seminar", "teaching_credit"])
    .isRequired,
};

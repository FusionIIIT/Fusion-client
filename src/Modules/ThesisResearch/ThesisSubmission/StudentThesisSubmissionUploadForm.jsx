import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "@mantine/form";
import {
  Card,
  Title,
  FileInput,
  Button,
  Progress,
  Text,
  Center,
  Loader,
  Badge,
  Stack,
  Group,
  Anchor,
  Divider,
  Table,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX, IconUpload } from "@tabler/icons-react";
import axios from "axios";
import {
  thesisSubmitRoute,
  thesisSubmissionStatusRoute,
  studentThesisRoute,
} from "../../../routes/academicRoutes";
import { host } from "../../../routes/globalRoutes";

const MAX_SYNOPSIS_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_THESIS_SIZE = 25 * 1024 * 1024; // 25MB

const STATUS_COLOR = {
  submitted: "blue",
  dean_panel_review: "yellow",
  director_review: "yellow",
  dean_invite_pending: "yellow",
  in_review: "blue",
  completed: "teal",
  approved: "green",
  rejected: "red",
};

const fileUrl = (url) =>
  url.startsWith("http")
    ? url
    : `${host}${url.startsWith("/") ? "" : "/"}${url}`;

export default function StudentThesisSubmissionUploadForm() {
  const [loading, setLoading] = useState(true);
  const [thesis, setThesis] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const authHeaders = () => ({
    Authorization: `Token ${localStorage.getItem("authToken")}`,
  });

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [thesisRes, subRes] = await Promise.all([
        axios.get(studentThesisRoute, { headers: authHeaders() }),
        axios.get(thesisSubmissionStatusRoute, { headers: authHeaders() }),
      ]);
      setThesis(thesisRes.data?.id ? thesisRes.data : null);
      setSubmission(subRes.data.submission || null);
    } catch (e) {
      showNotification({
        message: e.response?.data?.error || "Failed to load submission status",
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const thesisDetailRows = thesis && [
    { label: "Student Name", value: thesis.student_name },
    { label: "Roll No", value: thesis.student_roll },
    { label: "Discipline", value: thesis.student_discipline || "—" },
    { label: "Broad Area", value: thesis.broad_area || "—" },
    { label: "Research Theme", value: thesis.research_theme || "—" },
    { label: "Supervisor", value: thesis.supervisor?.name || "—" },
    { label: "Co-Supervisor", value: thesis.co_supervisor?.name || "—" },
  ];

  const form = useForm({
    initialValues: { synopsis: null, thesis_report: null },
    validate: {
      synopsis: (value) => {
        if (!value) return "Synopsis is required";
        if (value.size > MAX_SYNOPSIS_SIZE) return "Synopsis must be ≤ 5MB";
        if (value.type !== "application/pdf") return "Synopsis must be a PDF";
        return null;
      },
      thesis_report: (value) => {
        if (!value) return "Thesis report is required";
        if (value.size > MAX_THESIS_SIZE) return "Thesis report must be ≤ 25MB";
        if (value.type !== "application/pdf")
          return "Thesis report must be a PDF";
        return null;
      },
    },
  });

  const handleSubmit = async (values) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      showNotification({
        message: "Authentication required. Please log in.",
        color: "red",
        icon: <IconX />,
      });
      return;
    }

    const data = new FormData();
    data.append("synopsis", values.synopsis);
    data.append("thesis_report", values.thesis_report);

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout for large files

      await axios.post(thesisSubmitRoute, data, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });

      clearTimeout(timeoutId);
      showNotification({
        message: "Thesis submitted successfully",
        color: "teal",
        icon: <IconCheck />,
      });
      form.reset();
      setUploadProgress(0);
      fetchStatus();
    } catch (e) {
      if (axios.isCancel(e)) {
        showNotification({
          message: "Upload timeout. Please try again.",
          color: "red",
          icon: <IconX />,
        });
      } else {
        showNotification({
          message:
            e.response?.data?.detail ||
            e.response?.data?.error ||
            e.message ||
            "Submission failed",
          color: "red",
          icon: <IconX />,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (submission) {
    return (
      <Card shadow="sm" p="lg" withBorder>
        <Title order={3} mb="md">
          Thesis Submission
        </Title>
        <Stack gap="md">
          {thesisDetailRows && (
            <Table withTableBorder>
              <Table.Tbody>
                {thesisDetailRows.map((row) => (
                  <Table.Tr key={row.label}>
                    <Table.Th style={{ whiteSpace: "nowrap", width: "1%" }}>
                      {row.label}
                    </Table.Th>
                    <Table.Td>{row.value}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Current Status
            </Text>
            <Badge color={STATUS_COLOR[submission.status] || "gray"}>
              {submission.status_label}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            Submitted on {new Date(submission.submitted_at).toLocaleString()}
          </Text>
          <Group gap="lg">
            {submission.synopsis_url && (
              <Anchor
                href={fileUrl(submission.synopsis_url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Synopsis
              </Anchor>
            )}
            {submission.thesis_report_url && (
              <Anchor
                href={fileUrl(submission.thesis_report_url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Thesis Report
              </Anchor>
            )}
          </Group>
          {(submission.dean_panel_remarks || submission.director_remarks) && (
            <>
              <Divider label="Remarks" labelPosition="left" />
              {submission.dean_panel_remarks && (
                <Text size="sm">
                  <b>Dean Panel:</b> {submission.dean_panel_remarks}
                </Text>
              )}
              {submission.director_remarks && (
                <Text size="sm">
                  <b>Director:</b> {submission.director_remarks}
                </Text>
              )}
            </>
          )}
          <Text size="xs" c="dimmed">
            Your thesis has already been submitted and cannot be resubmitted
            from this screen.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card shadow="sm" p="lg" withBorder>
      <Title order={3} mb="md">
        Submit Your Thesis
      </Title>

      {thesisDetailRows && (
        <Table withTableBorder mb="lg">
          <Table.Tbody>
            {thesisDetailRows.map((row) => (
              <Table.Tr key={row.label}>
                <Table.Th style={{ whiteSpace: "nowrap", width: "1%" }}>
                  {row.label}
                </Table.Th>
                <Table.Td>{row.value}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Text size="sm" c="dimmed" mb="md">
        Upload your synopsis and full thesis report below. Both must be PDFs and
        cannot be resubmitted once uploaded, so double-check the files before
        submitting.
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <FileInput
          label="Synopsis (PDF, ≤5MB)"
          accept="application/pdf"
          required
          leftSection={<IconUpload size={14} />}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...form.getInputProps("synopsis")}
          mt="md"
          disabled={submitting}
        />

        <FileInput
          label="Thesis Report (PDF, ≤25MB)"
          accept="application/pdf"
          required
          leftSection={<IconUpload size={14} />}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...form.getInputProps("thesis_report")}
          mt="md"
          disabled={submitting}
        />

        {submitting && uploadProgress > 0 && (
          <Progress
            value={uploadProgress}
            label={`${uploadProgress}%`}
            size="xl"
            mt="md"
            animated
          />
        )}

        <Button
          fullWidth
          mt="lg"
          type="submit"
          loading={submitting}
          disabled={!form.values.synopsis || !form.values.thesis_report}
        >
          Upload Thesis
        </Button>
      </form>
    </Card>
  );
}

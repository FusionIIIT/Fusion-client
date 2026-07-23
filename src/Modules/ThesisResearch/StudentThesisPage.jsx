import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  TextInput,
  Textarea,
  Select,
  Button,
  Center,
  Loader,
  Space,
  Badge,
  Divider,
  Alert,
  Grid,
  Group,
  Modal,
  Stack,
  Table,
} from "@mantine/core";
import { IconDownload, IconAlertCircle } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import {
  studentThesisRoute,
  studentThesisDownloadRoute,
  facultyListRoute,
} from "../../routes/academicRoutes";

const TOPIC_COLOR = {
  supervisor_pending: "yellow",
  supervisor_approved: "blue",
  hod_approved: "teal",
  dean_pending: "orange",
  dean_approved: "green",
  rejected: "red",
};
const TOPIC_LABEL = {
  supervisor_pending: "Submitted — Pending Supervisor",
  supervisor_approved: "Supervisor Approved",
  hod_approved: "HOD Approved",
  dean_pending: "Pending Dean",
  dean_approved: "Dean Approved",
  rejected: "Rejected",
};

export default function StudentThesisPage() {
  const [thesis, setThesis] = useState(null);
  const [form, setForm] = useState({
    category: "Regular",
    broad_area: "",
    research_theme: "",
    supervisor_id: null,
    co_supervisor_id: null,
    external_name: "",
    external_email: "",
    external_discipline: "",
    external_institution: "",
  });
  const [facOpts, setFacOpts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError(new Error("No auth token. Please log in."));
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Token ${token}` };

      try {
        const [tRes, fRes] = await Promise.all([
          axios.get(studentThesisRoute, { headers }),
          axios.get(facultyListRoute, { headers }),
        ]);
        const t = tRes.data;
        if (t.id) {
          setThesis(t);
          setForm({
            category: t.category,
            broad_area: t.broad_area,
            research_theme: t.research_theme,
            supervisor_id: t.supervisor.id,
            co_supervisor_id: t.co_supervisor?.id || null,
            external_name: t.external.ext_name,
            external_email: t.external.ext_email,
            external_discipline: t.external.ext_discipline,
            external_institution: t.external.ext_institution,
          });
        }
        setFacOpts(
          fRes.data.map((f) => ({
            value: f.id,
            label: f.name,
            discipline: f.discipline,
          })),
        );
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" color="blue" />
      </Center>
    );
  if (error)
    return (
      <Alert color="red" icon={<IconAlertCircle size={16} />}>
        Error loading data: {error.message}
      </Alert>
    );

  const status = thesis?.status;
  const canEdit = !thesis;
  const isApproved = status === "dean_approved";

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      showNotification({
        title: "Auth Error",
        message: "No auth token found. Please log in.",
        color: "red",
      });
      return;
    }
    const headers = { Authorization: `Token ${token}` };

    setSubmitting(true);
    try {
      await axios.post(studentThesisRoute, form, { headers });
      const res = await axios.get(studentThesisRoute, { headers });
      setThesis(res.data);
      setPreview(false);
      showNotification({
        title: "Success",
        message: "Thesis topic submitted.",
        color: "green",
      });
    } catch (e) {
      showNotification({
        title: "Submit Error",
        message: e.response?.data?.error || "Submission failed",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      showNotification({
        title: "Auth Error",
        message: "No auth token found. Please log in.",
        color: "red",
      });
      return;
    }

    try {
      const res = await axios.get(studentThesisDownloadRoute, {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "thesis_topic.pdf");
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
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text
        size="lg"
        fw={700}
        mb="md"
        style={{ textAlign: "center", color: "#3B82F6" }}
      >
        Thesis Topic Proposal and Supervisor Registration
      </Text>

      {thesis && (
        <Card
          p="sm"
          radius="sm"
          mb="md"
          withBorder
          style={{ background: "#f0f7ff", borderColor: "#bfdbfe" }}
        >
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Current Status
            </Text>
            <Badge color={TOPIC_COLOR[status] || "gray"} variant="filled">
              {TOPIC_LABEL[status] ||
                (status ? status.replace(/_/g, " ") : "Not Submitted")}
            </Badge>
          </Group>
        </Card>
      )}

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Select
            label="Category"
            data={[
              { value: "Regular", label: "Regular" },
              { value: "Sponsored", label: "Sponsored" },
              { value: "External", label: "External" },
            ]}
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))}
            disabled={!canEdit}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Broad Area"
            placeholder="e.g. Machine Learning"
            value={form.broad_area}
            onChange={(e) =>
              setForm((f) => ({ ...f, broad_area: e.target.value }))
            }
            disabled={!canEdit}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Research Theme"
            placeholder="Describe the research theme..."
            minRows={3}
            value={form.research_theme}
            onChange={(e) =>
              setForm((f) => ({ ...f, research_theme: e.target.value }))
            }
            disabled={!canEdit}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Select
            label="Supervisor"
            data={facOpts.filter((f) => f.value !== form.co_supervisor_id)}
            value={form.supervisor_id}
            onChange={(v) => setForm((f) => ({ ...f, supervisor_id: v }))}
            disabled={!canEdit}
            searchable
            placeholder="Search faculty..."
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Select
            label="Co-Supervisor"
            data={facOpts.filter((f) => f.value !== form.supervisor_id)}
            value={form.co_supervisor_id}
            onChange={(v) => setForm((f) => ({ ...f, co_supervisor_id: v }))}
            disabled={!canEdit}
            clearable
            searchable
            placeholder="Optional"
          />
        </Grid.Col>
      </Grid>

      <Divider
        label="External Co-Supervisor (if any)"
        labelPosition="left"
        my="md"
      />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Name"
            placeholder="Full name"
            value={form.external_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, external_name: e.target.value }))
            }
            disabled={!canEdit}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Email"
            placeholder="email@institution.edu"
            value={form.external_email}
            onChange={(e) =>
              setForm((f) => ({ ...f, external_email: e.target.value }))
            }
            disabled={!canEdit}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Discipline"
            placeholder="e.g. Computer Science"
            value={form.external_discipline}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                external_discipline: e.target.value,
              }))
            }
            disabled={!canEdit}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Institution"
            placeholder="University / Organisation"
            value={form.external_institution}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                external_institution: e.target.value,
              }))
            }
            disabled={!canEdit}
          />
        </Grid.Col>
      </Grid>

      <Space h="lg" />

      {canEdit && (
        <Button fullWidth color="blue" onClick={() => setPreview(true)}>
          Review &amp; Submit
        </Button>
      )}

      {thesis && !isApproved && (
        <Alert color="yellow" icon={<IconAlertCircle size={16} />} mt="sm">
          Your form has been submitted and cannot be edited any further.
        </Alert>
      )}

      <Modal
        opened={preview}
        onClose={() => setPreview(false)}
        title="Review Thesis Topic Proposal"
        size="lg"
      >
        <Stack gap="md">
          <Table withTableBorder>
            <Table.Tbody>
              {[
                { label: "Category", value: form.category },
                { label: "Broad Area", value: form.broad_area || "—" },
                {
                  label: "Research Theme",
                  value: form.research_theme || "—",
                },
                {
                  label: "Supervisor",
                  value:
                    facOpts.find((f) => f.value === form.supervisor_id)
                      ?.label || "—",
                },
                {
                  label: "Co-Supervisor",
                  value:
                    facOpts.find((f) => f.value === form.co_supervisor_id)
                      ?.label || "—",
                },
              ].map((row) => (
                <Table.Tr key={row.label}>
                  <Table.Th style={{ whiteSpace: "nowrap", width: "1%" }}>
                    {row.label}
                  </Table.Th>
                  <Table.Td>{row.value}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {(form.external_name ||
            form.external_email ||
            form.external_discipline ||
            form.external_institution) && (
            <>
              <Divider label="External Co-Supervisor" labelPosition="left" />
              <Table withTableBorder>
                <Table.Tbody>
                  {[
                    { label: "Name", value: form.external_name || "—" },
                    { label: "Email", value: form.external_email || "—" },
                    {
                      label: "Discipline",
                      value: form.external_discipline || "—",
                    },
                    {
                      label: "Institution",
                      value: form.external_institution || "—",
                    },
                  ].map((row) => (
                    <Table.Tr key={row.label}>
                      <Table.Th style={{ whiteSpace: "nowrap", width: "1%" }}>
                        {row.label}
                      </Table.Th>
                      <Table.Td>{row.value}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </>
          )}
        </Stack>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={() => setPreview(false)}>
            Back to Edit
          </Button>
          <Button color="blue" loading={submitting} onClick={handleSubmit}>
            Confirm &amp; Submit
          </Button>
        </Group>
      </Modal>

      {isApproved && (
        <Button
          fullWidth
          variant="outline"
          color="blue"
          mt="sm"
          leftSection={<IconDownload size={16} />}
          onClick={handleDownload}
        >
          Download Approved Form (PDF)
        </Button>
      )}
    </Card>
  );
}

import React, { useState, useEffect, useCallback } from "react";
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
  Tabs,
  Grid,
  Stack,
  Group,
  SegmentedControl,
} from "@mantine/core";
import {
  IconBook,
  IconCalendarCheck,
  IconCheck,
  IconDownload,
  IconAlertCircle,
} from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import {
  studentThesisRoute,
  studentThesisDownloadRoute,
  facultyListRoute,
  studentThesisEnrollmentRoute,
} from "../../routes/academicRoutes";

// ── Status maps ──────────────────────────────────────────────────────────────
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
const REG_COLOR = { pending: "yellow", verified: "green", rejected: "red" };
const REG_LABEL = {
  pending: "Pending Verification",
  verified: "Enrolled & Verified",
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

  // Enrollment (Section B) state
  const [enrollment, setEnrollment] = useState(null); // full payload from API
  const [enrollLoading, setEnrollLoading] = useState(true);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const [chosenCredits, setChosenCredits] = useState("6");

  // Load thesis & faculty options
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

  // Load enrollment data separately so it refreshes independently
  const loadEnrollment = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setEnrollLoading(true);
    setEnrollError(null);
    axios
      .get(studentThesisEnrollmentRoute, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setEnrollment(res.data);
      })
      .catch((e) => {
        const msg =
          e.response?.data?.error ||
          (e.response
            ? `Server error ${e.response.status}: ${JSON.stringify(e.response.data)}`
            : e.message);
        setEnrollError(msg);
      })
      .finally(() => setEnrollLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadEnrollment();
  }, [loadEnrollment]);

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
  const canEdit = !thesis || status === "supervisor_pending";
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

    try {
      await axios.post(studentThesisRoute, form, { headers });
      const res = await axios.get(studentThesisRoute, { headers });
      setThesis(res.data);
      showNotification({
        title: "Success",
        message: "Thesis topic saved.",
        color: "green",
      });
    } catch (e) {
      showNotification({
        title: "Submit Error",
        message: e.response?.data?.error || "Submission failed",
        color: "red",
      });
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

  const handleEnroll = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      showNotification({
        title: "Auth Error",
        message: "No auth token.",
        color: "red",
      });
      return;
    }
    setEnrollSubmitting(true);
    try {
      await axios.post(
        studentThesisEnrollmentRoute,
        { credits: parseInt(chosenCredits, 10) },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      // Refresh enrollment data
      const res = await axios.get(studentThesisEnrollmentRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      setEnrollment(res.data);
      showNotification({
        title: "Enrolled",
        message: "Thesis registration submitted. Awaiting admin verification.",
        color: "green",
      });
    } catch (e) {
      showNotification({
        title: "Enrollment Error",
        message:
          e.response?.data?.error || "Could not register for thesis slot",
        color: "red",
      });
    } finally {
      setEnrollSubmitting(false);
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
        Thesis Registration
      </Text>

      <Tabs defaultValue="topic">
        <Tabs.List mb="lg">
          <Tabs.Tab value="topic" leftSection={<IconBook size={16} />}>
            Thesis Topic
          </Tabs.Tab>
          <Tabs.Tab
            value="enroll"
            leftSection={<IconCalendarCheck size={16} />}
          >
            Semester Enrollment
          </Tabs.Tab>
        </Tabs.List>

        {/* ── Tab 1: Thesis Topic ── */}
        <Tabs.Panel value="topic">
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
                data={facOpts}
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
                data={facOpts}
                value={form.co_supervisor_id}
                onChange={(v) =>
                  setForm((f) => ({ ...f, co_supervisor_id: v }))
                }
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
            <Button fullWidth color="blue" onClick={handleSubmit}>
              {thesis ? "Save Changes" : "Save & Submit"}
            </Button>
          )}

          {thesis && !canEdit && !isApproved && (
            <Alert color="yellow" icon={<IconAlertCircle size={16} />} mt="sm">
              Your form is under review and cannot be edited at this stage.
            </Alert>
          )}

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
        </Tabs.Panel>

        {/* ── Tab 2: Semester Enrollment ── */}
        <Tabs.Panel value="enroll">
          <Text size="sm" c="dimmed" mb="lg">
            Register for the thesis slot in your current semester. Your thesis
            topic must be dean-approved before you can enroll.
          </Text>

          {enrollLoading ? (
            <Center style={{ height: 100 }}>
              <Loader size="sm" color="blue" />
            </Center>
          ) : enrollError ? (
            <Card p="md" shadow="xs" withBorder>
              <Alert color="red" icon={<IconAlertCircle size={16} />} mb="sm">
                <Text size="sm" fw={600} mb={4}>
                  Could not load enrollment data
                </Text>
                <Text size="xs">{enrollError}</Text>
              </Alert>
              <Button
                size="xs"
                variant="outline"
                color="red"
                onClick={loadEnrollment}
              >
                Retry
              </Button>
            </Card>
          ) : (
            (() => {
              const topicStatus = enrollment.thesis_topic?.status;
              const topicApproved = topicStatus === "dean_approved";
              const slot = enrollment.thesis_slot;
              const reg = enrollment.registration;

              return (
                <Stack gap="md">
                  {/* Status summary */}
                  <Card p="md" shadow="xs" withBorder radius="sm">
                    <Text size="sm" fw={700} c="blue" mb="sm">
                      Status Summary
                    </Text>
                    <Grid gutter="sm">
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Text size="xs" c="dimmed" mb={2}>
                          Thesis Topic
                        </Text>
                        <Badge
                          color={TOPIC_COLOR[topicStatus] || "gray"}
                          variant="light"
                          size="md"
                        >
                          {TOPIC_LABEL[topicStatus] ||
                            (topicStatus
                              ? topicStatus.replace(/_/g, " ")
                              : "Not submitted")}
                        </Badge>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Text size="xs" c="dimmed" mb={2}>
                          Enrollment
                        </Text>
                        {reg ? (
                          <Badge
                            color={REG_COLOR[reg.status]}
                            variant="light"
                            size="md"
                          >
                            {REG_LABEL[reg.status] || reg.status}
                          </Badge>
                        ) : (
                          <Badge color="gray" variant="light" size="md">
                            Not Enrolled
                          </Badge>
                        )}
                      </Grid.Col>
                    </Grid>
                  </Card>

                  {!topicApproved && (
                    <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
                      Your thesis topic must be dean-approved before you can
                      enroll for a semester.
                    </Alert>
                  )}

                  {/* Slot info */}
                  {slot ? (
                    <Card p="md" shadow="xs" withBorder radius="sm">
                      <Text size="sm" fw={700} c="blue" mb="sm">
                        Thesis Slot — Semester {enrollment.current_semester_no}
                      </Text>
                      <Grid gutter="xs">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <Text size="sm">
                            <Text component="span" fw={500}>
                              Slot:{" "}
                            </Text>
                            {slot.name}
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <Text size="sm">
                            <Text component="span" fw={500}>
                              Duration:{" "}
                            </Text>
                            {slot.duration} semester(s)
                          </Text>
                        </Grid.Col>
                        {slot.info && (
                          <Grid.Col span={12}>
                            <Text size="sm">
                              <Text component="span" fw={500}>
                                Info:{" "}
                              </Text>
                              {slot.info}
                            </Text>
                          </Grid.Col>
                        )}
                        {slot.theses?.length > 0 && (
                          <Grid.Col span={12}>
                            <Text size="sm" fw={500} mb={6}>
                              Thesis Codes:
                            </Text>
                            <Group gap="xs">
                              {slot.theses.map((t) => (
                                <Badge
                                  key={t.id}
                                  variant="outline"
                                  color="blue"
                                  size="sm"
                                >
                                  {t.code} — {t.name}
                                </Badge>
                              ))}
                            </Group>
                          </Grid.Col>
                        )}
                      </Grid>
                    </Card>
                  ) : (
                    <Alert color="gray">
                      No thesis slot is configured for your current semester.
                    </Alert>
                  )}

                  {/* Enrolled — show details */}
                  {reg ? (
                    <Card p="md" shadow="xs" withBorder radius="sm">
                      <Text size="sm" fw={700} c="blue" mb="sm">
                        Your Registration
                      </Text>
                      <Grid gutter="sm">
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <Text size="xs" c="dimmed">
                            Status
                          </Text>
                          <Badge
                            color={REG_COLOR[reg.status]}
                            variant="filled"
                            mt={2}
                          >
                            {REG_LABEL[reg.status] || reg.status}
                          </Badge>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <Text size="xs" c="dimmed">
                            Credits
                          </Text>
                          <Text size="sm" fw={600}>
                            {reg.credits}
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <Text size="xs" c="dimmed">
                            Registered On
                          </Text>
                          <Text size="sm">
                            {new Date(reg.registered_on).toLocaleDateString()}
                          </Text>
                        </Grid.Col>
                        {reg.academic_session && (
                          <Grid.Col span={{ base: 12, md: 4 }}>
                            <Text size="xs" c="dimmed">
                              Academic Session
                            </Text>
                            <Text size="sm">{reg.academic_session}</Text>
                          </Grid.Col>
                        )}
                      </Grid>
                      {reg.status === "rejected" && reg.remarks && (
                        <Alert
                          color="red"
                          mt="sm"
                          icon={<IconAlertCircle size={16} />}
                        >
                          <strong>Rejection remark:</strong> {reg.remarks}
                        </Alert>
                      )}

                      {/* ── Announced evaluation grades ── */}
                      {enrollment.evaluations?.length > 0 && (
                        <>
                          <Divider mt="sm" mb="xs" label="Thesis Grades" labelPosition="left" />
                          <Group gap="sm" wrap="wrap">
                            {enrollment.evaluations.map((ev) => (
                              <Card
                                key={ev.id}
                                p="xs"
                                radius="sm"
                                withBorder
                                shadow="none"
                                style={{ minWidth: 100 }}
                              >
                                <Text size="xs" c="dimmed" ta="center">
                                  Block {ev.block_number} / {ev.total_blocks}
                                </Text>
                                <Badge
                                  mt={4}
                                  color={ev.grade === "S" ? "green" : "red"}
                                  variant="filled"
                                  fullWidth
                                  ta="center"
                                >
                                  {ev.grade === "S" ? "S — Satisfactory" : "X — Unsatisfactory"}
                                </Badge>
                                {ev.remarks && (
                                  <Text size="xs" c="dimmed" mt={4} ta="center">
                                    {ev.remarks}
                                  </Text>
                                )}
                              </Card>
                            ))}
                          </Group>
                        </>
                      )}
                    </Card>
                  ) : (
                    topicApproved &&
                    slot && (
                      <Card p="md" shadow="xs" withBorder radius="sm">
                        <Text size="sm" fw={700} c="blue" mb="xs">
                          Register for Thesis This Semester
                        </Text>
                        <Text size="sm" c="dimmed" mb="md">
                          Choose how many thesis credits you are registering for
                          this semester.
                        </Text>

                        <Text size="sm" fw={500} mb="xs">
                          Credits
                        </Text>
                        <SegmentedControl
                          value={chosenCredits}
                          onChange={setChosenCredits}
                          data={[
                            { label: "3", value: "3" },
                            { label: "6", value: "6" },
                            { label: "9", value: "9" },
                            { label: "12", value: "12" },
                          ]}
                          color="blue"
                          mb="md"
                        />
                        <Text size="xs" c="dimmed" mb="md">
                          Selected: <strong>{chosenCredits} credits</strong>
                        </Text>

                        <Button
                          color="blue"
                          loading={enrollSubmitting}
                          leftSection={<IconCheck size={16} />}
                          onClick={handleEnroll}
                        >
                          Register for Thesis This Semester
                        </Button>
                      </Card>
                    )
                  )}
                </Stack>
              );
            })()
          )}
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}

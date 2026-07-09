import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Text,
  Button,
  Center,
  Loader,
  Badge,
  Divider,
  Alert,
  Grid,
  Stack,
  Group,
  SegmentedControl,
} from "@mantine/core";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { studentThesisEnrollmentRoute } from "../../routes/academicRoutes";

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

export default function StudentThesisEnrollment() {
  const [enrollment, setEnrollment] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState(true);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const [chosenCredits, setChosenCredits] = useState("6");

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
  }, []);

  useEffect(() => {
    loadEnrollment();
  }, [loadEnrollment]);

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
        Semester Enrollment
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Register for the thesis slot in your current semester. Your thesis topic
        must be dean-approved before you can enroll.
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
                  Your thesis topic must be dean-approved before you can enroll
                  for a semester.
                </Alert>
              )}

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

                  {enrollment.evaluations?.length > 0 && (
                    <>
                      <Divider
                        mt="sm"
                        mb="xs"
                        label="Thesis Grades"
                        labelPosition="left"
                      />
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
                              {ev.grade === "S"
                                ? "S — Satisfactory"
                                : "X — Unsatisfactory"}
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
    </Card>
  );
}

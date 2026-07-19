import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Title,
  Text,
  Table,
  Button,
  Group,
  Tabs,
  Modal,
  Loader,
  Alert,
  Select,
  Badge,
  SegmentedControl,
  Stack,
  Divider,
  Tooltip,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";

import {
  phdCourseSlotsRoute,
  phdCourseSlotCoursesRoute,
  phdSubmitCourseRequestRoute,
  phdMyCourseRequestsRoute,
  studentThesisEnrollmentRoute,
  studentProgressSeminarEnrollmentRoute,
  studentTeachingCreditEnrollmentRoute,
} from "../../routes/academicRoutes";

const REG_BADGE_COLOR = {
  pending: "yellow",
  verified: "green",
  rejected: "red",
};

function authHeaders() {
  return { Authorization: `Token ${localStorage.getItem("authToken")}` };
}

// ─────────────────────────────────────────────────────────────────────────────
// Register tab: one combined form covering courses, thesis, progress
// seminar and teaching credit for the student's current semester.
// ─────────────────────────────────────────────────────────────────────────────
function PhDCourseRegisterForm() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [slots, setSlots] = useState([]);
  const [semesterNo, setSemesterNo] = useState(null);
  const [thesisInfo, setThesisInfo] = useState(null);
  const [seminarInfo, setSeminarInfo] = useState(null);
  const [teachingCreditInfo, setTeachingCreditInfo] = useState(null);

  const [selectedThesis, setSelectedThesis] = useState("");
  const [thesisCredits, setThesisCredits] = useState("6");
  const [selectedSeminar, setSelectedSeminar] = useState("");
  const [selectedTeachingCredit, setSelectedTeachingCredit] = useState("");
  const [hasCourseRequestThisSemester, setHasCourseRequestThisSemester] =
    useState(false);

  // isStale() lets a caller discard this fetch's results if a newer fetch
  // cycle has since started -- guards against React StrictMode's double
  // effect-invocation on mount silently wiping out selections the user
  // already made while the first (superseded) fetch was still in flight.
  const fetchAll = useCallback(async (isStale = () => false) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No auth token found");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [
        slotsRes,
        thesisRes,
        seminarRes,
        teachingCreditRes,
        myRequestsRes,
      ] = await Promise.all([
        axios.get(phdCourseSlotsRoute, { headers: authHeaders() }),
        axios.get(studentThesisEnrollmentRoute, { headers: authHeaders() }),
        axios.get(studentProgressSeminarEnrollmentRoute, {
          headers: authHeaders(),
        }),
        axios.get(studentTeachingCreditEnrollmentRoute, {
          headers: authHeaders(),
        }),
        axios.get(phdMyCourseRequestsRoute, { headers: authHeaders() }),
      ]);

      const slotList = slotsRes.data.slots || [];
      const withCourses = await Promise.all(
        slotList.map(async (slot) => {
          const res = await axios.get(phdCourseSlotCoursesRoute, {
            params: { slot_id: slot.id },
            headers: authHeaders(),
          });
          return {
            ...slot,
            courses: res.data.courses || [],
            selectedCourse: "",
          };
        }),
      );
      if (isStale()) return;
      setSlots(withCourses);
      setSemesterNo(slotsRes.data.semester_no ?? null);
      setThesisInfo(thesisRes.data);
      setSeminarInfo(seminarRes.data);
      setTeachingCreditInfo(teachingCreditRes.data);
      setHasCourseRequestThisSemester(
        (myRequestsRes.data.requests || []).some(
          (r) => r.semester_no === slotsRes.data.semester_no,
        ),
      );
    } catch (err) {
      if (isStale()) return;
      if (err.response?.status !== 403) {
        setError(err.response?.data?.error || err.message);
      }
    } finally {
      if (!isStale()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let stale = false;
    fetchAll(() => stale);
    return () => {
      stale = true;
    };
  }, [fetchAll]);

  const pickCourse = (idx, val) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, selectedCourse: val } : s)),
    );
  };

  // One combined registration per semester: once anything has been
  // submitted -- a course request, or a thesis/seminar/teaching-credit
  // registration -- that semester's registration is closed. No re-opening
  // the form to add more later; status lives entirely in "My Requests".
  const hasSubmittedThisSemester =
    hasCourseRequestThisSemester ||
    !!thesisInfo?.registration ||
    !!seminarInfo?.registration ||
    !!teachingCreditInfo?.registration;

  const coursesToSubmit = slots.filter((s) => s.selectedCourse);
  const thesisTopicApproved =
    !!thesisInfo?.thesis_topic?.status &&
    thesisInfo.thesis_topic.status === "dean_approved";
  const canEnrollThesis =
    thesisTopicApproved && thesisInfo?.thesis_slot && !thesisInfo?.registration;
  const canEnrollSeminar =
    seminarInfo?.thesis_topic_approved &&
    seminarInfo?.progress_seminar_slot &&
    !seminarInfo?.registration;
  const canEnrollTeachingCredit =
    teachingCreditInfo?.comprehensive_exam_passed &&
    teachingCreditInfo?.teaching_credit_slot &&
    !teachingCreditInfo?.registration;

  const willEnrollThesis = canEnrollThesis && !!selectedThesis;
  const willEnrollSeminar = canEnrollSeminar && !!selectedSeminar;
  const willEnrollTeachingCredit =
    canEnrollTeachingCredit && !!selectedTeachingCredit;

  const nothingSelected =
    coursesToSubmit.length === 0 &&
    !willEnrollThesis &&
    !willEnrollSeminar &&
    !willEnrollTeachingCredit;

  const summaryRows = [
    ...coursesToSubmit.map((s) => {
      const course = s.courses.find((c) => String(c.id) === s.selectedCourse);
      return {
        key: `course-${s.id}`,
        type: "Course",
        slot: s.name,
        detail: course ? `${course.code} – ${course.name}` : "Invalid",
        credits: course ? course.credit : "—",
      };
    }),
    ...(willEnrollThesis
      ? [
          (() => {
            const slot = thesisInfo.thesis_slot;
            const t = (slot.theses || []).find(
              (x) => String(x.id) === selectedThesis,
            );
            return {
              key: "thesis",
              type: "Thesis",
              slot: slot.name,
              detail: t ? `${t.code} – ${t.name}` : "Invalid",
              credits: thesisCredits,
            };
          })(),
        ]
      : []),
    ...(willEnrollSeminar
      ? [
          (() => {
            const slot = seminarInfo.progress_seminar_slot;
            const s = (slot.seminars || []).find(
              (x) => String(x.id) === selectedSeminar,
            );
            return {
              key: "seminar",
              type: "Progress Seminar",
              slot: slot.name,
              detail: s ? `${s.code} – ${s.name}` : "Invalid",
              credits: s ? s.credit : "—",
            };
          })(),
        ]
      : []),
    ...(willEnrollTeachingCredit
      ? [
          (() => {
            const slot = teachingCreditInfo.teaching_credit_slot;
            const c = (slot.teaching_credits || []).find(
              (x) => String(x.id) === selectedTeachingCredit,
            );
            return {
              key: "teaching-credit",
              type: "Teaching Credit",
              slot: slot.name,
              detail: c ? `${c.code} – ${c.name}` : "Invalid",
              credits: c ? c.credit : "—",
            };
          })(),
        ]
      : []),
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const calls = coursesToSubmit.map((s) =>
        axios.post(
          phdSubmitCourseRequestRoute,
          { slot_id: s.id, course_id: parseInt(s.selectedCourse, 10) },
          { headers: authHeaders() },
        ),
      );
      if (willEnrollThesis) {
        calls.push(
          axios.post(
            studentThesisEnrollmentRoute,
            { credits: parseInt(thesisCredits, 10) },
            { headers: authHeaders() },
          ),
        );
      }
      if (willEnrollSeminar) {
        calls.push(
          axios.post(
            studentProgressSeminarEnrollmentRoute,
            {},
            { headers: authHeaders() },
          ),
        );
      }
      if (willEnrollTeachingCredit) {
        calls.push(
          axios.post(
            studentTeachingCreditEnrollmentRoute,
            {},
            { headers: authHeaders() },
          ),
        );
      }
      await Promise.all(calls);
      showNotification({
        title: "Success",
        message: "Registration submitted. Awaiting Academic approval.",
        color: "green",
      });
      setPreview(false);
      setSelectedThesis("");
      setSelectedSeminar("");
      setSelectedTeachingCredit("");
      fetchAll();
    } catch (err) {
      showNotification({
        title: "Submit failed",
        message: err.response?.data?.error || err.message,
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  if (hasSubmittedThisSemester) {
    return (
      <Card withBorder p="md">
        <Text size="sm" ta="center">
          Your registration request has already been submitted for
          {semesterNo ? ` Semester ${semesterNo}` : " this semester"}. Check the{" "}
          <b>My Requests</b> tab for status.
        </Text>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {semesterNo && (
        <Text size="sm" fw={600} ta="center" c="dimmed">
          Semester {semesterNo} Registration
        </Text>
      )}

      {/* Courses */}
      <Card withBorder p="md">
        <Title order={5} mb="md">
          Courses
        </Title>
        {slots.length === 0 ? (
          <Text size="sm" c="dimmed">
            No course slots available for your current semester.
          </Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Slot</th>
                <th>Select Course</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s, i) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td style={{ minWidth: 250 }}>
                    <Select
                      placeholder="Select course…"
                      autoComplete="off"
                      data={(s.courses || []).map((c) => ({
                        value: String(c.id),
                        label: `${c.code} - ${c.name}`,
                      }))}
                      value={s.selectedCourse}
                      onChange={(val) => pickCourse(i, val)}
                      clearable
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Thesis */}
      <Card withBorder p="md">
        <Group gap="xs" align="center" mb="md">
          <Title order={5}>Thesis</Title>
          {!thesisInfo?.registration && !thesisTopicApproved && (
            <Tooltip label="Your thesis topic must be dean-approved before you can enroll.">
              <Badge color="red" variant="light">
                Requires Dean-Approved Topic
              </Badge>
            </Tooltip>
          )}
        </Group>
        {thesisInfo?.registration ? (
          <Badge color={REG_BADGE_COLOR[thesisInfo.registration.status]}>
            {thesisInfo.registration.credits} credits —{" "}
            {thesisInfo.registration.status}
          </Badge>
        ) : !thesisInfo?.thesis_slot ? (
          <Text size="sm" c="dimmed">
            No thesis slot configured for your current semester.
          </Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Slot</th>
                <th>Select Thesis</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{thesisInfo.thesis_slot.name}</td>
                <td style={{ minWidth: 250 }}>
                  <Select
                    placeholder="Select thesis…"
                    autoComplete="off"
                    disabled={!thesisTopicApproved}
                    data={(thesisInfo.thesis_slot.theses || []).map((t) => ({
                      value: String(t.id),
                      label: `${t.code} - ${t.name}`,
                    }))}
                    value={selectedThesis}
                    onChange={(val) => setSelectedThesis(val || "")}
                    clearable
                  />
                </td>
                <td style={{ minWidth: 200 }}>
                  <SegmentedControl
                    fullWidth
                    disabled={!thesisTopicApproved || !selectedThesis}
                    value={thesisCredits}
                    onChange={setThesisCredits}
                    data={["3", "6", "9", "12"].map((v) => ({
                      label: v,
                      value: v,
                    }))}
                    color="blue"
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        )}
      </Card>

      {/* Progress Seminar */}
      <Card withBorder p="md">
        <Group gap="xs" align="center" mb="md">
          <Title order={5}>Progress Seminar</Title>
          {!seminarInfo?.registration &&
            !seminarInfo?.thesis_topic_approved && (
              <Tooltip label="Your thesis topic must be dean-approved before you can enroll.">
                <Badge color="red" variant="light">
                  Requires Dean-Approved Topic
                </Badge>
              </Tooltip>
            )}
        </Group>
        {seminarInfo?.registration ? (
          <Badge color={REG_BADGE_COLOR[seminarInfo.registration.status]}>
            {seminarInfo.registration.status}
          </Badge>
        ) : !seminarInfo?.progress_seminar_slot ? (
          <Text size="sm" c="dimmed">
            No progress seminar slot configured for your current semester.
          </Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Slot</th>
                <th>Select Seminar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{seminarInfo.progress_seminar_slot.name}</td>
                <td style={{ minWidth: 250 }}>
                  <Select
                    placeholder="Select seminar…"
                    autoComplete="off"
                    disabled={!seminarInfo?.thesis_topic_approved}
                    data={(
                      seminarInfo.progress_seminar_slot.seminars || []
                    ).map((s) => ({
                      value: String(s.id),
                      label: `${s.code} - ${s.name}`,
                    }))}
                    value={selectedSeminar}
                    onChange={(val) => setSelectedSeminar(val || "")}
                    clearable
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        )}
      </Card>

      {/* Teaching Credit */}
      <Card withBorder p="md">
        <Group gap="xs" align="center" mb="md">
          <Title order={5}>Teaching Credit</Title>
          {!teachingCreditInfo?.registration &&
            !teachingCreditInfo?.comprehensive_exam_passed && (
              <Tooltip label="Comprehensive Examination must be passed before you can enroll.">
                <Badge color="red" variant="light">
                  Requires Comprehensive Exam
                </Badge>
              </Tooltip>
            )}
        </Group>
        {teachingCreditInfo?.registration ? (
          <Badge
            color={REG_BADGE_COLOR[teachingCreditInfo.registration.status]}
          >
            {teachingCreditInfo.registration.status}
          </Badge>
        ) : !teachingCreditInfo?.teaching_credit_slot ? (
          <Text size="sm" c="dimmed">
            No teaching credit slot configured for your current semester.
          </Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Slot</th>
                <th>Select Teaching Credit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{teachingCreditInfo.teaching_credit_slot.name}</td>
                <td style={{ minWidth: 250 }}>
                  <Select
                    placeholder="Select teaching credit…"
                    autoComplete="off"
                    disabled={!teachingCreditInfo?.comprehensive_exam_passed}
                    data={(
                      teachingCreditInfo.teaching_credit_slot
                        .teaching_credits || []
                    ).map((t) => ({
                      value: String(t.id),
                      label: `${t.code} - ${t.name}`,
                    }))}
                    value={selectedTeachingCredit}
                    onChange={(val) => setSelectedTeachingCredit(val || "")}
                    clearable
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        )}
      </Card>

      <Group justify="flex-end">
        <Button disabled={nothingSelected} onClick={() => setPreview(true)}>
          Review &amp; Submit
        </Button>
      </Group>

      <Modal
        opened={preview}
        onClose={() => setPreview(false)}
        title="Confirm Semester Registration"
        size="xl"
      >
        {nothingSelected ? (
          <Text size="sm" c="dimmed">
            Nothing selected.
          </Text>
        ) : (
          <Table highlightOnHover withTableBorder>
            <thead>
              <tr>
                <th>Type</th>
                <th>Slot</th>
                <th>Detail</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((r) => (
                <tr key={r.key}>
                  <td>{r.type}</td>
                  <td>{r.slot}</td>
                  <td>{r.detail}</td>
                  <td>{r.credits}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Divider my="md" />
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setPreview(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={nothingSelected}
          >
            Submit
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// My Requests tab: status across all four registration types.
// ─────────────────────────────────────────────────────────────────────────────
function PhDMyCourseRequests() {
  const [requests, setRequests] = useState([]);
  const [thesisInfo, setThesisInfo] = useState(null);
  const [seminarInfo, setSeminarInfo] = useState(null);
  const [teachingCreditInfo, setTeachingCreditInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesRes, thesisRes, seminarRes, teachingCreditRes] =
        await Promise.all([
          axios.get(phdMyCourseRequestsRoute, { headers: authHeaders() }),
          axios.get(studentThesisEnrollmentRoute, { headers: authHeaders() }),
          axios.get(studentProgressSeminarEnrollmentRoute, {
            headers: authHeaders(),
          }),
          axios.get(studentTeachingCreditEnrollmentRoute, {
            headers: authHeaders(),
          }),
        ]);
      setRequests(coursesRes.data.requests || []);
      setThesisInfo(thesisRes.data);
      setSeminarInfo(seminarRes.data);
      setTeachingCreditInfo(teachingCreditRes.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  const badgeColor = (status) => {
    if (status === "Approved" || status === "verified") return "green";
    if (status === "Rejected" || status === "rejected") return "red";
    return "yellow";
  };

  const rows = [
    ...requests.map((r) => ({
      key: `course-${r.id}`,
      type: "Course",
      slot: r.slot,
      detail: r.course_name ? `${r.course} – ${r.course_name}` : r.course,
      credits: r.credit ?? "—",
      semester: r.semester_no,
      status: r.status,
      remarks: r.remarks,
      requestedAt: r.requested_at,
    })),
    ...(thesisInfo?.registration
      ? [
          {
            key: "thesis",
            type: "Thesis",
            slot: thesisInfo.thesis_slot?.name || "—",
            detail: (() => {
              const t = thesisInfo.thesis_slot?.resolved_thesis;
              return t ? `${t.code} – ${t.name}` : "Thesis";
            })(),
            credits: thesisInfo.registration.credits,
            semester: thesisInfo.registration.semester_no,
            status: thesisInfo.registration.status,
            remarks: thesisInfo.registration.remarks,
            requestedAt: thesisInfo.registration.registered_on,
          },
        ]
      : []),
    ...(seminarInfo?.registration
      ? [
          {
            key: "seminar",
            type: "Progress Seminar",
            slot: seminarInfo.progress_seminar_slot?.name || "—",
            detail: (() => {
              const s = seminarInfo.progress_seminar_slot?.resolved_seminar;
              return s ? `${s.code} – ${s.name}` : "—";
            })(),
            credits:
              seminarInfo.progress_seminar_slot?.resolved_seminar?.credit ??
              "—",
            semester: seminarInfo.registration.semester_no,
            status: seminarInfo.registration.status,
            remarks: seminarInfo.registration.remarks,
            requestedAt: seminarInfo.registration.registered_on,
          },
        ]
      : []),
    ...(teachingCreditInfo?.registration
      ? [
          {
            key: "teaching-credit",
            type: "Teaching Credit",
            slot: teachingCreditInfo.teaching_credit_slot?.name || "—",
            detail: (() => {
              const t =
                teachingCreditInfo.teaching_credit_slot
                  ?.resolved_teaching_credit;
              return t ? `${t.code} – ${t.name}` : "—";
            })(),
            credits:
              teachingCreditInfo.teaching_credit_slot?.resolved_teaching_credit
                ?.credit ?? "—",
            semester: teachingCreditInfo.registration.semester_no,
            status: teachingCreditInfo.registration.status,
            remarks: teachingCreditInfo.registration.remarks,
            requestedAt: teachingCreditInfo.registration.registered_on,
          },
        ]
      : []),
  ];

  const rowsBySemester = new Map();
  rows.forEach((r) => {
    const key = r.semester ?? "—";
    if (!rowsBySemester.has(key)) rowsBySemester.set(key, []);
    rowsBySemester.get(key).push(r);
  });
  const semesterGroups = Array.from(rowsBySemester.entries()).sort(
    (a, b) => (b[0] === "—" ? 0 : b[0]) - (a[0] === "—" ? 0 : a[0]),
  );

  return (
    <Card withBorder p="md">
      <Title order={5} mb="sm">
        My Requests
      </Title>
      {!rows.length ? (
        <Text size="sm" c="dimmed">
          You haven&apos;t submitted any registration requests yet.
        </Text>
      ) : (
        <Table highlightOnHover withTableBorder>
          <thead>
            <tr>
              <th>Type</th>
              <th>Slot</th>
              <th>Detail</th>
              <th>Credits</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Requested At</th>
            </tr>
          </thead>
          <tbody>
            {semesterGroups.map(([semester, groupRows]) => (
              <React.Fragment key={semester}>
                <tr>
                  <td
                    colSpan={7}
                    style={{ background: "#f8f9fa", fontWeight: 600 }}
                  >
                    Semester {semester}
                  </td>
                </tr>
                {groupRows.map((r) => (
                  <tr key={r.key}>
                    <td>{r.type}</td>
                    <td>{r.slot}</td>
                    <td>{r.detail}</td>
                    <td>{r.credits}</td>
                    <td>
                      <Badge color={badgeColor(r.status)}>{r.status}</Badge>
                    </td>
                    <td>{r.remarks || "—"}</td>
                    <td>
                      {r.requestedAt
                        ? new Date(r.requestedAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

export default function PhDCourseRegistration() {
  const [activeTab, setActiveTab] = useState("register");

  return (
    <Card withBorder p="md">
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="default"
        color="blue"
      >
        <Tabs.List grow>
          <Tabs.Tab value="register">Register</Tabs.Tab>
          <Tabs.Tab value="requests">My Requests</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="register" pt="md">
          {activeTab === "register" && <PhDCourseRegisterForm />}
        </Tabs.Panel>

        <Tabs.Panel value="requests" pt="md">
          {activeTab === "requests" && <PhDMyCourseRequests />}
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import {
  attendanceSheetCopyRoute,
  attendanceSheetCoursesRoute,
  attendanceSheetRoute,
  attendanceSheetSaveRoute,
} from "../routes/examinationRoutes";
import {
  academicYearLabel,
  buildSessionOptions,
} from "../../../lib/academicYear";
import {
  buildSheets,
  checkRooms,
  defaultInstructorText,
  fileName,
  nextRoom,
  to12h,
  to24h,
} from "./sheetModel";
import { loadLogo, renderAttendancePdf } from "./drawAttendanceSheet";

const authHeaders = () => ({
  headers: { Authorization: `Token ${localStorage.getItem("authToken")}` },
});

const EXAM_LABELS = { MID: "Mid Sem", END: "End Sem" };
const EXAM_OPTIONS = [
  { value: "MID", label: "Mid Sem" },
  { value: "END", label: "End Sem" },
];
const SEMESTER_OPTIONS = [
  { value: "Odd Semester", label: "Odd" },
  { value: "Even Semester", label: "Even" },
];

const pad = (n) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 12 }, (_, i) => pad(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));
const PERIODS = ["AM", "PM"];
const NO_TIME = { hour: null, minute: null, period: null };

// August to December is the Odd semester of the session that starts that
// year; January to July is the Even semester of the one before.
function currentTerm(now = new Date()) {
  const odd = now.getMonth() >= 7;
  return {
    firstYear: odd ? now.getFullYear() : now.getFullYear() - 1,
    semesterType: odd ? "Odd Semester" : "Even Semester",
  };
}

function savedNote(plans = []) {
  const mid = plans.includes("MID");
  const end = plans.includes("END");
  if (mid && end) return " (Mid and End Sem saved)";
  if (mid) return " (Mid Sem saved)";
  if (end) return " (End Sem saved)";
  return "";
}

const when = (iso) => new Date(iso).toLocaleString("en-IN");

const keyOf = (course, exam, year, semester) =>
  `${course}|${exam}|${year}|${semester}`;

// 3, 4, 5, 9 -> "3-5, 9"
function spans(numbers) {
  const parts = [];
  let start = null;
  let prev = null;
  const close = () =>
    parts.push(start === prev ? `${start}` : `${start}-${prev}`);
  numbers.forEach((n) => {
    if (start === null) {
      start = n;
    } else if (n !== prev + 1) {
      close();
      start = n;
    }
    prev = n;
  });
  if (start !== null) close();
  return parts.join(", ");
}

const toParts = (hhmm) => (hhmm ? to12h(hhmm) : NO_TIME);
const toHhmm = (t) => (t.hour && t.minute && t.period ? to24h(t) : "");

// A room as the editor holds it -> the API / sheetModel shape.
const toPayload = (r) => ({
  from_sno: r.from_sno === "" ? "" : Number(r.from_sno),
  to_sno: r.to_sno === "" ? "" : Number(r.to_sno),
  room: r.room.trim(),
  date: r.date,
  start_time: toHhmm(r.start),
  end_time: toHhmm(r.end),
  instructor_text: r.instructor_text.trim(),
});

function problemFrom(e, fallback) {
  return {
    detail: e.response?.data?.detail || fallback,
    errors: e.response?.data?.errors || [],
  };
}

function TimeSelect({ name, value, onChange }) {
  const minutes =
    value.minute && !MINUTES.includes(value.minute)
      ? [...MINUTES, value.minute].sort()
      : MINUTES;
  const part = (field, data, placeholder, label) => (
    <Select
      aria-label={`${name} ${label}`}
      data={data}
      value={value[field]}
      onChange={(v) => onChange({ ...value, [field]: v })}
      placeholder={placeholder}
      allowDeselect={false}
      w={72}
    />
  );
  return (
    <Group gap={4} wrap="nowrap">
      {part("hour", HOURS, "hh", "hour")}
      {part("minute", minutes, "mm", "minute")}
      {part("period", PERIODS, "--", "period")}
    </Group>
  );
}

TimeSelect.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.shape({
    hour: PropTypes.string,
    minute: PropTypes.string,
    period: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

// Plan which students sit in which room for a course's Mid or End Sem exam,
// keep the plan, and print the attendance sheets for each room.
export default function ExamAttendanceSheet() {
  const term = useMemo(() => currentTerm(), []);
  const sessionOptions = useMemo(
    () => buildSessionOptions(term.firstYear),
    [term],
  );
  const [academicYear, setAcademicYear] = useState(
    academicYearLabel(term.firstYear),
  );
  const [semesterType, setSemesterType] = useState(term.semesterType);
  const [exam, setExam] = useState("MID");
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(null);

  const [sheet, setSheet] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [problem, setProblem] = useState(null);
  const [preview, setPreview] = useState(null);

  // Which course / exam / term the sheet on screen is for.
  const loadedKey = useRef(null);
  const previewUrl = useRef(null);
  const mounted = useRef(true);
  const roomKey = useRef(0);

  const showPreview = (next) => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = next ? next.url : null;
    setPreview(next);
  };

  useEffect(
    () => () => {
      mounted.current = false;
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    [],
  );

  const instructorDefault = (data, from, to) =>
    defaultInstructorText(
      data.students,
      Number(from),
      Number(to),
      data.instructors,
      data.sectioned,
    );

  const editorRoom = (r, instructorEdited) => {
    roomKey.current += 1;
    return {
      key: roomKey.current,
      from_sno: r.from_sno,
      to_sno: r.to_sno,
      room: r.room || "",
      date: r.date || "",
      start: toParts(r.start_time),
      end: toParts(r.end_time),
      instructor_text: r.instructor_text || "",
      instructorEdited,
    };
  };

  const freshRoom = (data, previous) => {
    const base = nextRoom(previous, data.students.length);
    return editorRoom(
      {
        ...base,
        instructor_text: instructorDefault(data, base.from_sno, base.to_sno),
      },
      false,
    );
  };

  const applySheet = (data) => {
    const key = keyOf(
      data.course.id,
      data.exam,
      data.academic_year,
      data.semester_type,
    );
    if (key !== loadedKey.current) showPreview(null);
    loadedKey.current = key;
    setSheet(data);
    setRooms(
      data.plan
        ? data.plan.rooms.map((r) => editorRoom(r, true))
        : [freshRoom(data, null)],
    );
    setProblem(null);
  };

  const markSaved = (id, savedExam) =>
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id && !c.plans.includes(savedExam)
          ? { ...c, plans: [...c.plans, savedExam] }
          : c,
      ),
    );

  useEffect(() => {
    let live = true;
    setCourses([]);
    axios
      .get(attendanceSheetCoursesRoute, {
        params: { academic_year: academicYear, semester_type: semesterType },
        ...authHeaders(),
      })
      .then(({ data }) => {
        if (live) setCourses(data);
      })
      .catch((e) => {
        if (live) setProblem(problemFrom(e, "Could not load the courses."));
      });
    return () => {
      live = false;
    };
  }, [academicYear, semesterType]);

  useEffect(() => {
    const key = courseId
      ? keyOf(courseId, exam, academicYear, semesterType)
      : null;
    if (key === loadedKey.current) return;
    loadedKey.current = null;
    showPreview(null);
    setSheet(null);
    setRooms([]);
    if (!key) return;

    let live = true;
    setLoading(true);
    setProblem(null);
    axios
      .get(attendanceSheetRoute, {
        params: {
          course: courseId,
          academic_year: academicYear,
          semester_type: semesterType,
          exam,
        },
        ...authHeaders(),
      })
      .then(({ data }) => {
        if (!live) return;
        setLoading(false);
        applySheet(data);
      })
      .catch((e) => {
        if (!live) return;
        setLoading(false);
        setProblem(problemFrom(e, "Could not load this course."));
      });
    return () => {
      live = false;
    };
  }, [courseId, exam, academicYear, semesterType]);

  const total = sheet ? sheet.students.length : 0;
  const payload = useMemo(() => rooms.map(toPayload), [rooms]);
  const check = useMemo(() => checkRooms(payload, total), [payload, total]);
  const blocked = check.errors.length > 0;

  const courseOptions = useMemo(
    () =>
      courses.map((c) => ({
        value: String(c.id),
        label: `${c.code} - ${c.name}${savedNote(c.plans)}`,
      })),
    [courses],
  );

  const changeTerm = (setter) => (value) => {
    setter(value);
    setCourseId(null);
  };

  // A range change re-suggests the instructors unless they were typed in.
  const updateRoom = (index, patch) =>
    setRooms((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const next = { ...r, ...patch };
        const ranged = "from_sno" in patch || "to_sno" in patch;
        if (ranged && !next.instructorEdited) {
          next.instructor_text = instructorDefault(
            sheet,
            next.from_sno,
            next.to_sno,
          );
        }
        return next;
      }),
    );

  const addRoom = () =>
    setRooms((prev) => [
      ...prev,
      freshRoom(sheet, prev.length ? toPayload(prev[prev.length - 1]) : null),
    ]);

  const removeRoom = (index) =>
    setRooms((prev) => prev.filter((_, i) => i !== index));

  // Saves and copies answer for the sheet they were sent from; if the user has
  // moved to another course meanwhile, leave the screen alone.
  const save = async () => {
    const key = loadedKey.current;
    setSaving(true);
    setProblem(null);
    try {
      const { data } = await axios.post(
        attendanceSheetSaveRoute,
        {
          course: sheet.course.id,
          academic_year: sheet.academic_year,
          semester_type: sheet.semester_type,
          exam: sheet.exam,
          updated_at: sheet.plan ? sheet.plan.updated_at : null,
          rooms: payload,
        },
        authHeaders(),
      );
      markSaved(data.course.id, data.exam);
      if (loadedKey.current === key) applySheet(data);
    } catch (e) {
      if (loadedKey.current === key) {
        setProblem(problemFrom(e, "Could not save the plan."));
      }
    } finally {
      setSaving(false);
    }
  };

  const target = sheet && sheet.exam === "MID" ? "END" : "MID";

  const copy = async (replace) => {
    const key = loadedKey.current;
    setCopying(true);
    setProblem(null);
    try {
      const { data } = await axios.post(
        attendanceSheetCopyRoute,
        {
          course: sheet.course.id,
          academic_year: sheet.academic_year,
          semester_type: sheet.semester_type,
          from_exam: sheet.exam,
          to_exam: target,
          replace,
        },
        authHeaders(),
      );
      setConfirmReplace(false);
      markSaved(data.course.id, data.exam);
      if (loadedKey.current !== key) return;
      applySheet(data);
      setExam(data.exam);
    } catch (e) {
      if (loadedKey.current !== key) return;
      const exists = e.response?.status === 409 && e.response.data?.exists;
      setConfirmReplace(Boolean(exists && !replace));
      if (!exists || replace) {
        setProblem(problemFrom(e, "Could not copy the plan."));
      }
    } finally {
      setCopying(false);
    }
  };

  const makePreview = async () => {
    const key = loadedKey.current;
    setPreviewing(true);
    setProblem(null);
    try {
      const sheets = buildSheets({
        course: sheet.course,
        exam: sheet.exam,
        semesterType: sheet.semester_type,
        academicYear: sheet.academic_year,
        students: sheet.students,
        rooms: payload,
      });
      const logo = await loadLogo().catch(() => null);
      const doc = await renderAttendancePdf(sheets, {
        sectioned: sheet.sectioned,
        logo,
      });
      const url = URL.createObjectURL(doc.output("blob"));
      // The page moved on to another course (or closed) while drawing.
      if (!mounted.current || loadedKey.current !== key) {
        URL.revokeObjectURL(url);
        return;
      }
      showPreview({
        url,
        name: fileName(sheet.course.code, sheet.exam, sheet.academic_year),
      });
    } catch {
      setProblem({ detail: "Could not make the PDF.", errors: [] });
    } finally {
      if (mounted.current) setPreviewing(false);
    }
  };

  const plan = sheet ? sheet.plan : null;
  const notes = [
    plan &&
      plan.roll_count !== total &&
      `Roll list was ${plan.roll_count} when saved, now ${total}.`,
    check.uncovered.length > 0 && `No room for S.No ${spans(check.uncovered)}.`,
    check.beyond.length > 0 &&
      (check.beyond.length === 1
        ? `Room ${check.beyond[0]} goes past S.No ${total}, the last on the roll list.`
        : `Rooms ${check.beyond.join(", ")} go past S.No ${total}, the last on the roll list.`),
  ].filter(Boolean);

  const problemAlert = problem && (
    <Alert color="red">
      <Text size="sm">{problem.detail}</Text>
      {problem.errors.map((line) => (
        <Text size="sm" key={line}>
          {line}
        </Text>
      ))}
    </Alert>
  );

  return (
    <Stack gap="md">
      <Group align="flex-end">
        <Select
          label="Academic year"
          data={sessionOptions}
          value={academicYear}
          onChange={changeTerm(setAcademicYear)}
          allowDeselect={false}
          w={140}
        />
        <Select
          label="Semester"
          data={SEMESTER_OPTIONS}
          value={semesterType}
          onChange={changeTerm(setSemesterType)}
          allowDeselect={false}
          w={120}
        />
        <Select
          label="Exam"
          data={EXAM_OPTIONS}
          value={exam}
          onChange={setExam}
          allowDeselect={false}
          w={120}
        />
        <Select
          label="Course"
          placeholder="Choose a course"
          data={courseOptions}
          value={courseId}
          onChange={setCourseId}
          searchable
          allowDeselect={false}
          nothingFoundMessage="No courses in this term"
          miw={280}
          style={{ flex: 1 }}
        />
      </Group>

      {!(sheet && total > 0) && problemAlert}
      {loading && <Loader size="sm" />}

      {sheet && (
        <>
          <Group justify="space-between">
            <Title order={4}>
              {`${sheet.course.code} - ${sheet.course.name}, ${EXAM_LABELS[sheet.exam]}`}
            </Title>
            <Text size="sm" c="dimmed">
              {plan
                ? `Saved by ${plan.updated_by}, ${when(plan.updated_at)}`
                : "Not saved yet."}
            </Text>
          </Group>

          <Title order={5}>{`Students (${total})`}</Title>
          {total === 0 ? (
            <Text size="sm" c="dimmed">
              No students are registered in this course for this term.
            </Text>
          ) : (
            <Box mah={360} style={{ overflowY: "auto" }}>
              <Table striped stickyHeader>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>S.No</Table.Th>
                    <Table.Th>Roll No</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Discipline</Table.Th>
                    {sheet.sectioned && <Table.Th>Section</Table.Th>}
                    <Table.Th>Programme</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sheet.students.map((s) => (
                    <Table.Tr key={s.sno}>
                      <Table.Td>{s.sno}</Table.Td>
                      <Table.Td>{s.roll_no}</Table.Td>
                      <Table.Td>{s.name}</Table.Td>
                      <Table.Td>{s.discipline}</Table.Td>
                      {sheet.sectioned && <Table.Td>{s.section}</Table.Td>}
                      <Table.Td>{s.programme}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          )}

          {total > 0 && (
            <>
              <Title order={5}>Rooms</Title>
              <Box style={{ overflowX: "auto" }}>
                <Table verticalSpacing="xs" miw={1180}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>From S.No</Table.Th>
                      <Table.Th>To S.No</Table.Th>
                      <Table.Th>Room</Table.Th>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Start</Table.Th>
                      <Table.Th>End</Table.Th>
                      <Table.Th>Instructor(s)</Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {rooms.map((r, i) => {
                      const name = `Room ${i + 1}`;
                      return (
                        <Table.Tr key={r.key}>
                          <Table.Td>
                            <NumberInput
                              aria-label={`${name} from S.No`}
                              value={r.from_sno}
                              onChange={(v) => updateRoom(i, { from_sno: v })}
                              allowDecimal={false}
                              allowNegative={false}
                              hideControls
                              w={80}
                            />
                          </Table.Td>
                          <Table.Td>
                            <NumberInput
                              aria-label={`${name} to S.No`}
                              value={r.to_sno}
                              onChange={(v) => updateRoom(i, { to_sno: v })}
                              allowDecimal={false}
                              allowNegative={false}
                              hideControls
                              w={80}
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput
                              aria-label={`${name} room`}
                              value={r.room}
                              onChange={(e) =>
                                updateRoom(i, { room: e.currentTarget.value })
                              }
                              w={110}
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput
                              type="date"
                              aria-label={`${name} date`}
                              value={r.date}
                              onChange={(e) =>
                                updateRoom(i, { date: e.currentTarget.value })
                              }
                              w={150}
                            />
                          </Table.Td>
                          <Table.Td>
                            <TimeSelect
                              name={`${name} start`}
                              value={r.start}
                              onChange={(start) => updateRoom(i, { start })}
                            />
                          </Table.Td>
                          <Table.Td>
                            <TimeSelect
                              name={`${name} end`}
                              value={r.end}
                              onChange={(end) => updateRoom(i, { end })}
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput
                              aria-label={`${name} instructors`}
                              value={r.instructor_text}
                              onChange={(e) =>
                                updateRoom(i, {
                                  instructor_text: e.currentTarget.value,
                                  instructorEdited: true,
                                })
                              }
                              miw={200}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Button
                              variant="subtle"
                              color="red"
                              size="xs"
                              aria-label={`Remove room ${i + 1}`}
                              onClick={() => removeRoom(i)}
                            >
                              Remove
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Box>

              {blocked && (
                <Alert color="red" title="Fix these before saving">
                  {check.errors.map((line) => (
                    <Text size="sm" key={line}>
                      {line}
                    </Text>
                  ))}
                </Alert>
              )}
              {notes.length > 0 && (
                <Alert color="yellow">
                  {notes.map((line) => (
                    <Text size="sm" key={line}>
                      {line}
                    </Text>
                  ))}
                </Alert>
              )}
              {problemAlert}

              <Group>
                <Button variant="light" onClick={addRoom}>
                  Add room
                </Button>
                <Button onClick={save} loading={saving} disabled={blocked}>
                  Save
                </Button>
                {plan && (
                  <Button
                    variant="default"
                    onClick={() => copy(false)}
                    loading={copying}
                  >
                    {`Copy to ${EXAM_LABELS[target]}`}
                  </Button>
                )}
                <Button
                  variant="default"
                  onClick={makePreview}
                  loading={previewing}
                  disabled={blocked}
                >
                  Preview
                </Button>
              </Group>
            </>
          )}

          {preview && (
            <Stack gap="xs">
              <Group justify="space-between">
                <Title order={5}>Preview</Title>
                <Button
                  component="a"
                  href={preview.url}
                  download={preview.name}
                >
                  Download PDF
                </Button>
              </Group>
              <iframe
                title="Attendance sheet preview"
                src={preview.url}
                style={{
                  width: "100%",
                  height: "80vh",
                  border: "1px solid var(--mantine-color-gray-3)",
                }}
              />
            </Stack>
          )}
        </>
      )}

      <Modal
        opened={confirmReplace}
        onClose={() => setConfirmReplace(false)}
        title="Replace plan?"
      >
        <Stack>
          <Text size="sm">
            {`${target === "END" ? "An" : "A"} ${EXAM_LABELS[target]} plan already exists. Replace it?`}
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmReplace(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={() => copy(true)} loading={copying}>
              Replace
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

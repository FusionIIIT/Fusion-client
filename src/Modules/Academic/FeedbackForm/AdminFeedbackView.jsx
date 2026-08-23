import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Select,
  Loader,
  Center,
  Card,
  Text,
  TextInput,
  Table,
  Modal,
  Title,
  Button,
  Space,
  Alert,
  Grid,
  Paper,
} from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  adminCoursesRoute,
  adminAllStatsRoute,
} from "../../../routes/academicRoutes";

// Section display labels (order enforced by the API).
const SECTION_META = {
  contents: { label: "Course Contents", order: 0 },
  instructor: { label: "Course Instructor", order: 1 },
  attendance: { label: "Attendance", order: 2 },
  tutorial: { label: "Tutorial", order: 3 },
  lab: { label: "Lab Instructor", order: 4 },
};

const sectionLabel = (key) =>
  SECTION_META[key]?.label ||
  key.replace(/_/g, " ").replace(/^\w/, (ch) => ch.toUpperCase());

export default function AdminFeedbackView() {
  const [session, setSession] = useState("");
  const [semesterType, setSemesterType] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [search, setSearch] = useState("");

  // Term changed -> clear the loaded list/selection; user re-runs "Load Courses".
  useEffect(() => {
    setCourses([]);
    setSelectedCourse(null);
    setSelectedInstructor(null);
    setData(null);
    setSearch("");
  }, [session, semesterType]);

  const filteredCourses = courses.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.code || "").toLowerCase().includes(q) ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.instructor || "").toLowerCase().includes(q) ||
      (c.section || "").toLowerCase().includes(q)
    );
  });

  const fetchCourses = () => {
    setCoursesLoading(true);
    setCourses([]);
    const token = localStorage.getItem("authToken");
    axios
      .get(adminCoursesRoute, {
        params: { session, semester_type: semesterType },
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  };

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    setData(null);
    const token = localStorage.getItem("authToken");
    const params = { session, semester_type: semesterType, course_id: selectedCourse };
    if (selectedInstructor) params.course_instructor = selectedInstructor;
    axios
      .get(adminAllStatsRoute, {
        params,
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setData(res.data))
      .catch(() => setData({ detail: "No responses found till now." }))
      .finally(() => setLoading(false));
  }, [selectedCourse, selectedInstructor, session, semesterType]);

  return (
    <>
      <Card mb="md">
        <Select
          label="Session"
          placeholder="Select academic year / session"
          data={(() => { const e = new Date().getFullYear(); const r = []; for (let y = e; y >= 2020; y--) r.push(`${y}-${String(y+1).slice(-2)}`); return r.map(s => ({ value: s, label: s })); })()}
          value={session}
          onChange={setSession}
          clearable
          mb="md"
        />

        <Select
          label="Semester"
          placeholder="Select semester"
          data={["Odd Semester", "Even Semester", "Summer Semester"].map((s) => ({ value: s, label: s }))}
          value={semesterType}
          onChange={setSemesterType}
          clearable
          mb="md"
        />

        <Button
          mb="md"
          onClick={fetchCourses}
          disabled={coursesLoading || !session || !semesterType}
          size="sm"
        >
          {coursesLoading ? <Loader size="xs" /> : "Load Courses"}
        </Button>

        {courses.length > 0 && (
          <TextInput
            placeholder="Search by code, name, instructor or section..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            mb="md"
          />
        )}

        <Table verticalSpacing="md" highlightOnHover>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Code</th>
              <th>Name</th>
              <th>Instructor</th>
              <th>Section</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((c, idx) => (
              <tr key={`${c.course_id}-${c.course_instructor_id ?? "all"}`}>
                <td>{idx + 1}</td>
                <td>{c.code}</td>
                <td>{c.name}</td>
                <td>{c.instructor || "—"}</td>
                <td>{c.section || "—"}</td>
                <td>
                  <Button
                    size="xs"
                    onClick={() => {
                      setSelectedCourse(c.course_id);
                      setSelectedInstructor(c.course_instructor_id ?? null);
                      setModalOpened(true);
                    }}
                  >
                    View Analysis
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        size="80%"
        title={
          <Title order={3} fw={700}>
            Feedback Analysis
          </Title>
        }
      >
        {loading ? (
          <Center style={{ height: 200 }}>
            <Loader />
          </Center>
        ) : data ? (
          data.detail ? (
            <Alert color="yellow">{data.detail}</Alert>
          ) : (
            data.sections?.map((sec) => (
              <Card key={sec.section} withBorder mb="lg">
                <Title order={4} fw={700} mb="sm">
                  {sectionLabel(sec.section)}
                </Title>
                <Grid gutter="lg">
                  {sec.questions.map((q) => {
                    const chartData = Object.entries(q.counts).map(([name, val]) => ({ name, val }));
                    return (
                      <Grid.Col key={q.question_id} span={6}>
                        <Paper p="md" shadow="xs">
                          <Text fw={500}>{q.text}</Text>
                          {chartData.length > 0 ? (
                            <BarChart
                              width={400}
                              height={350}
                              data={chartData}
                              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="name"
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis allowDecimals={false} />
                              <Tooltip />
                              <Bar dataKey="val" fill="#4C6EF5" />
                            </BarChart>
                          ) : (
                            <Paper p="sm" mt="md" withBorder>
                              {q.comments.length > 0 ? (
                                q.comments.map((cmt, i) => (
                                  <Text key={i} size="sm" mb="xs">– {cmt}</Text>
                                ))
                              ) : (
                                <Text c="dimmed" size="sm">No comments</Text>
                              )}
                            </Paper>
                          )}
                        </Paper>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </Card>
            ))
          )
        ) : (
          <Text c="dimmed">Select a course to view feedback.</Text>
        )}
      </Modal>
    </>
  );
}

/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";
import { Tabs, Container, Group, Select, Text } from "@mantine/core";
import { useSelector } from "react-redux";
import CustomBreadcrumbs from "../../components/Breadcrumbs";

import CourseList from "./CourseList";
import AssignmentFeature from "./AssignmentFeature";
import DocumentsFeature from "./DocumentsFeature";
import ForumFeature from "./ForumFeature";
import QuizFeature from "./QuizFeature";
import AttendanceFeature from "./AttendanceFeature";
import { getCourses } from "./api";

export default function OnlineCmsPage({ initialCourseCode = null }) {
  const role = useSelector((state) => state.user.role);

  const [courses, setCourses] = useState([]);
  const [courseCode, setCourseCode] = useState(null);

  useEffect(() => {
    getCourses().then((data) => {
      const list = Array.isArray(data) ? data : [];
      setCourses(list);

      const initial =
        initialCourseCode &&
        list.find((c) => c.courseCode === initialCourseCode);
      if (initial) {
        setCourseCode(initial.courseCode);
      } else if (!courseCode && list.length > 0) {
        setCourseCode(list[0].courseCode);
      }
    });
  }, [initialCourseCode]);

  const courseOptions = useMemo(
    () =>
      (courses || []).map((c) => ({
        value: c.courseCode,
        label: `${c.courseCode} — ${c.courseName}`,
      })),
    [courses],
  );

  const studentTabs = [
    { value: "courses", label: "My Courses", component: <CourseList /> },
    {
      value: "materials",
      label: "Materials",
      component: <DocumentsFeature courseCode={courseCode} />,
    },
    {
      value: "assignments",
      label: "Assignments",
      component: <AssignmentFeature courseCode={courseCode} />,
    },
    {
      value: "quiz",
      label: "Quiz",
      component: <QuizFeature courseCode={courseCode} />,
    },
    {
      value: "forum",
      label: "Forum",
      component: <ForumFeature courseCode={courseCode} />,
    },
    {
      value: "attendance",
      label: "Attendance",
      component: <AttendanceFeature courseCode={courseCode} />,
    },
  ];

  const facultyTabs = [
    { value: "courses", label: "My Courses", component: <CourseList /> },
    {
      value: "materials",
      label: "Materials",
      component: <DocumentsFeature courseCode={courseCode} />,
    },
    {
      value: "assignments",
      label: "Assignments",
      component: <AssignmentFeature courseCode={courseCode} />,
    },
    {
      value: "quiz",
      label: "Quiz",
      component: <QuizFeature courseCode={courseCode} />,
    },
    {
      value: "forum",
      label: "Forum",
      component: <ForumFeature courseCode={courseCode} />,
    },
    {
      value: "attendance",
      label: "Attendance",
      component: <AttendanceFeature courseCode={courseCode} />,
    },
  ];

  // Backend returns a normalized role via `/api/auth/me/`.
  // Keep a fallback for older data where role might be 'staff'.
  const isFaculty =
    String(role || "") === "faculty" || String(role || "") === "staff";
  const tabs = isFaculty ? facultyTabs : studentTabs;

  return (
    <Container fluid mt={48}>
      <CustomBreadcrumbs />

      <Group align="end" mb="md" mt="md">
        <Select
          label="Course"
          placeholder={courseOptions.length ? "Select a course" : "No courses"}
          data={courseOptions}
          value={courseCode}
          onChange={setCourseCode}
          searchable
          style={{ minWidth: 360 }}
        />
        {!courseCode && <Text c="dimmed">Select a course to manage.</Text>}
      </Group>

      <Tabs defaultValue="courses">
        <Tabs.List>
          {tabs.map((t) => (
            <Tabs.Tab key={t.value} value={t.value}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {tabs.map((t) => (
          <Tabs.Panel key={t.value} value={t.value}>
            {t.component}
          </Tabs.Panel>
        ))}
      </Tabs>
    </Container>
  );
}

import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Select,
  Loader,
  Center,
  Stack,
} from "@mantine/core";
import axios from "axios";
import FusionTable from "../../components/FusionTable";
import { currentCourseRegistrationRoute } from "../../routes/academicRoutes";

function RegisteredCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semester, setSemester] = useState("");
  const [availableSemesters, setAvailableSemesters] = useState([]);

  const fetchCourses = async (semesterParam) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError(new Error("No token found"));
      setLoading(false);
      return;
    }
    try {
      const url = semesterParam
        ? `${currentCourseRegistrationRoute}?semester=${semesterParam}`
        : currentCourseRegistrationRoute;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setCourses(response.data.reg_data);
      setSemester(String(response.data?.sem_no))
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSemesters = async () => {
    setAvailableSemesters(
      Array.from({ length: 8 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `Semester ${i + 1}`,
      }))
    );
  };

  useEffect(() => {
    fetchCourses();
    fetchAvailableSemesters();
  }, []);

  const handleSemesterChange = (value) => {
    setSemester(value);
    setLoading(true);
    fetchCourses(value);
  };

  const columnNames = [
    "Course Code",
    "Course Name",
    "Registration Type",
    "Semester",
    "Credits",
    "Replaced By"
  ];

  const mappedCourses = courses.map((course) => ({
    "Course Code": course.course_id?.code || "N/A",
    "Course Name": course.course_id?.name || "N/A",
    "Registration Type": course.registration_type || "N/A",
    Semester: course.semester_id?.semester_no || "N/A",
    Credits: course.course_id?.credit || 0,
    "Replaced By":
      course.replaced_by && course.replaced_by.length > 0 ? (
        <Stack spacing={2}>
          {course.replaced_by.map((r, idx) => (
            <Text key={idx} size="sm">
              {`${r.code} - ${r.name} (Sem ${r.semester_no})`}
            </Text>
          ))}
        </Stack>
      ) : (
        <Text size="sm">
          -
        </Text>
      ),
  }));

  const totalCredits = courses.reduce(
    (sum, course) => sum + (course.course_id?.credit || 0),
    0
  );

  if (loading) {
    return (
      <Center style={{ height: "200px" }}>
        <Loader size="lg" variant="dots" />
      </Center>
    );
  }

  if (error) {
    return <Text color="red">Error: {error.message}</Text>;
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text
        size="lg"
        weight={700}
        mb="md"
        style={{ textAlign: "center", width: "100%", color: "#3B82F6" }}
      >
        Registered Courses
      </Text>

      <Select
        label="Select Semester"
        placeholder="Select a semester"
        data={availableSemesters}
        value={semester}
        onChange={handleSemesterChange}
        mb="md"
      />

      <div style={{ overflowX: "auto" }}>
        <FusionTable
          columnNames={columnNames}
          elements={mappedCourses}
          width="100%"
        />
      </div>

      <Text
        size="md"
        weight={700}
        mt="md"
        style={{ textAlign: "left", width: "100%" }}
      >
        Total Credits: {totalCredits}
      </Text>
    </Card>
  );
}

export default RegisteredCourses;

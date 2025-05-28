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
import {
  semesterOptionsRoute,
  currentCourseRegistrationRoute,
} from "../../routes/academicRoutes";

export default function RegisteredCourses() {
  const [courses, setCourses] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [semesterValue, setSemesterValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("authToken");
        const optsRes = await axios.get(semesterOptionsRoute, {
          headers: { Authorization: `Token ${token}` },
        });
        const formattedOptions = optsRes.data.semesters.map(
          ({ semester_no, semester_type, label }) => ({
            value: JSON.stringify({ no: Number(semester_no), type: semester_type }),
            label,
          })
        );
        setSemesterOptions(formattedOptions);
        await fetchCourses(undefined, formattedOptions);
      } catch (err) {
        console.error("Initialization error", err);
        setError(err);
        setLoading(false);
      }
    })();
  }, []);

  const fetchCourses = async (semJson, opts = semesterOptions) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      let url = currentCourseRegistrationRoute;
      if (semJson) {
        const { no, type } = JSON.parse(semJson);
        const params = new URLSearchParams({
          semester: no.toString(),
          semester_type: type,
        });
        url += `?${params.toString()}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Token ${token}` },
      });

      setCourses(res.data.reg_data || []);

      const semNoNum = Number(res.data.sem_no);
      const semType = res.data.semester_type;
      const newValue = JSON.stringify({ no: semNoNum, type: semType });

      if (opts.some((opt) => opt.value === newValue)) {
        setSemesterValue(newValue);
      } else {
        setSemesterValue("");
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSemesterChange = (value) => {
    setSemesterValue(value);
    fetchCourses(value);
  };

  const rows = courses.map((course) => ({
    "Course Code": course.course_id?.code || "N/A",
    "Course Name": course.course_id?.name || "N/A",
    "Registration Type": course.registration_type || "N/A",
    Semester: course.semester_id?.semester_no || "N/A",
    Credits: course.course_id?.credit || 0,
    "Replaced By": course.replaced_by?.length > 0 ? (
      <Stack spacing={2}>
        {course.replaced_by.map((r, i) => (
          <Text key={i} size="sm">
            {`${r.code} - ${r.name} (${r.label})`}
          </Text>
        ))}
      </Stack>
    ) : (
      <Text size="sm">-</Text>
    ),
  }));

  const totalCredits = courses.reduce(
    (sum, c) => sum + (c.course_id?.credit || 0),
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
      <Text size="lg" weight={700} align="center" mb="md" color="#3B82F6">
        Registered Courses
      </Text>

      <Select
        label="Select Semester"
        placeholder="Select a semester"
        data={semesterOptions}
        value={semesterValue}
        onChange={handleSemesterChange}
        mb="md"
      />

      <div style={{ overflowX: "auto" }}>
        <FusionTable
          columnNames={[
            "Course Code",
            "Course Name",
            "Registration Type",
            "Semester",
            "Credits",
            "Replaced By",
          ]}
          elements={rows}
          width="100%"
        />
      </div>

      <Text size="md" weight={700} mt="md">
        Total Credits: {totalCredits}
      </Text>
    </Card>
  );
}

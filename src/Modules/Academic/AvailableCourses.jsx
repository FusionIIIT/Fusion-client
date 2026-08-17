import React, { useState, useEffect } from "react";
import { Card, Text, Loader, Group } from "@mantine/core";
import axios from "axios";
import FusionTable from "../../components/FusionTable";
import CourseList from "./components/CourseList";
import { nextSemCoursesRoute } from "../../routes/academicRoutes";

function AvailableCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Get token from local storage
        if (!token) {
          throw new Error("No token found"); // Handle the case where the token is not available
        }
        const response = await axios.get(nextSemCoursesRoute, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setCourses(response.data.courses_list); // Set courses from API response
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]); // Or set a default message in the table
      } finally {
        setTimeout(() => setLoading(false));
      }
    };

    fetchCourses();
  }, []);

  const columnNames = [
    "Slot Name",
    "Slot Type",
    "Semester",
    "Credits",
    "Course",
  ];

  const nextSemester = courses[0]?.semester?.semester_no;

  const mappedCourses = courses.map((course) => ({
    id: course.id,
    "Slot Name": course.name,
    "Slot Type": course.type,
    Semester: course.semester.semester_no,
    Credits: course.courses[0]?.credit,
    Course: <CourseList courses={course.courses} />,
  }));

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      {nextSemester != null && (
        <Text size="sm" fw={600} mb="md">
          Semester {nextSemester}
        </Text>
      )}
      {loading ? (
        <Group justify="center" py="xl">
          <Loader variant="dots" />
        </Group>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <FusionTable
            columnNames={columnNames}
            elements={mappedCourses}
            width="100%"
          />
        </div>
      )}
    </Card>
  );
}

export default AvailableCourses;

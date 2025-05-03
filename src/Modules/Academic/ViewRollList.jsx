import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Text,
  Button,
  Alert,
  Loader,
  Center,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import FusionTable from "../../components/FusionTable";
import {
  generatexlsheet,
  academicProceduresFaculty,
} from "../../routes/academicRoutes";

function ViewRollList() {
  const [courses, setCourses] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingCourseId, setDownloadingCourseId] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setFetchError("No authentication token found.");
        return;
      }

      try {
        const response = await axios.get(academicProceduresFaculty, {
          headers: { Authorization: `Token ${token}` },
        });
        setCourses(response.data.assigned_courses || []);
      } catch (error) {
        setFetchError(
          error.response?.data?.error || "Failed to fetch courses."
        );
      }
    };

    fetchCourses();
  }, []);

  const handleDownloadRollList = async (
    courseId,
    courseCode,
    semesterType,
    academicYear
  ) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setFetchError("No authentication token found.");
      return;
    }

    try {
      setDownloadingCourseId(courseId);
      setLoading(true);

      const response = await axios.post(
        generatexlsheet,
        {
          course: courseId,
          semester_type: semesterType,
          academic_year: academicYear,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${courseCode}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showNotification({
        title: "Success",
        message: "Roll list downloaded successfully",
        color: "green",
      });
    } catch (error) {
      showNotification({
        title: "Download Failed",
        message: error.response?.data?.error || "Failed to download roll list.",
        color: "red",
      });
    } finally {
      setLoading(false);
      setDownloadingCourseId(null);
    }
  };

  const columnNames = [
    "Course Name",
    "Course Code",
    "Version",
    "Academic Year",
    "Semester Type",
    "Action",
  ];

  const elements = courses.map((course) => ({
    "Course Name": course.course_name,
    "Course Code": course.course_code,
    Version: course.version,
    "Academic Year": course.academic_year,
    "Semester Type": course.semester_type,
    Action: (
      <Button
        onClick={() =>
          handleDownloadRollList(
            course.course_id,
            course.course_code,
            course.semester_type,
            course.academic_year
          )
        }
        variant="outline"
        color="blue"
        size="xs"
        disabled={loading && downloadingCourseId === course.course_id}
        rightIcon={
          loading && downloadingCourseId === course.course_id ? (
            <Loader size="xs" color="blue" />
          ) : null
        }
      >
        {loading && downloadingCourseId === course.course_id
          ? "Downloading..."
          : "Download Roll List"}
      </Button>
    ),
  }));

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text
        size="lg"
        weight={700}
        mb="md"
        style={{ textAlign: "center", color: "#3B82F6" }}
      >
        Assigned Courses
      </Text>
      {fetchError && (
        <Alert title="Error" color="red" mb="md">
          {fetchError}
        </Alert>
      )}
      {loading && courses.length === 0 ? (
        <Center>
          <Loader size="lg" />
        </Center>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <FusionTable
            columnNames={columnNames}
            elements={elements}
            width="100%"
          />
        </div>
      )}
    </Card>
  );
}

export default ViewRollList;

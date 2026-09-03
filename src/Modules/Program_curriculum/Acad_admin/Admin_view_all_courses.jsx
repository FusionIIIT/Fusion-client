import {
  Button,
  TextInput,
  Table,
  Flex,
  MantineProvider,
  Container,
  ActionIcon,
  Modal,
  Text,
  FileButton,
  Divider,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconUpload,
  IconDownload,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchAllCourses } from "../api/api";
import { host } from "../../../routes/globalRoutes";

// Columns the bulk upload understands; blanks take the course defaults.
const BULK_REQUIRED_COLUMNS = [
  "Course Code",
  "Course Name",
  "Credits",
  "Max Seats",
  "Disciplines",
];
const BULK_OPTIONAL_COLUMNS = [
  "Version",
  "Lecture Hours",
  "Tutorial Hours",
  "Practical Hours",
  "Discussion Hours",
  "Project Hours",
  "Pre-requisites",
  "Syllabus",
  "Reference Books",
];

function downloadBulkCourseTemplate() {
  const header = [...BULK_REQUIRED_COLUMNS, ...BULK_OPTIONAL_COLUMNS];
  const example = {
    "Course Code": "CS1001",
    "Course Name": "Introduction to Computing",
    Credits: "4",
    "Max Seats": "90",
    Disciplines: "CSE;ME",
    Version: "1.0",
    "Lecture Hours": "3",
    "Tutorial Hours": "0",
    "Practical Hours": "1",
  };
  const row = header.map((column) => example[column] ?? "");
  const csv = `${header.join(",")}\n${row.join(",")}\n`;
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "course_upload_template.csv";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Chrome aborts the download if the blob URL is released in the same tick.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Admin_view_all_courses() {
  const [courses, setCourses] = useState([]);
  const [theses, setTheses] = useState([]);
  const [seminars, setSeminars] = useState([]);
  const [teachingCredits, setTeachingCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkModalOpened, setBulkModalOpened] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [thesisToDelete, setThesisToDelete] = useState(null);
  const [seminarToDelete, setSeminarToDelete] = useState(null);
  const [teachingCreditToDelete, setTeachingCreditToDelete] = useState(null);
  const [activeView, setActiveView] = useState("courses"); // "courses", "theses", "seminars", or "teachingCredits"

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const cachedData = localStorage.getItem("AdminCoursesCache");
        const timestamp = localStorage.getItem("AdminCoursesTimestamp");
        const isCacheValid =
          timestamp && Date.now() - parseInt(timestamp, 10) < 10 * 60 * 1000;
        const cachedDatachange = localStorage.getItem(
          "AdminCoursesCachechange",
        );
        if (cachedData && isCacheValid && cachedDatachange === "false") {
          setCourses(JSON.parse(cachedData));
        } else {
          const data = await fetchAllCourses();
          setCourses(data);
          localStorage.setItem("AdminCoursesCachechange", "false");
          localStorage.setItem("AdminCoursesCache", JSON.stringify(data));
          localStorage.setItem("AdminCoursesTimestamp", Date.now().toString());
        }
      } catch (err) {
        setError("Failed to load courses.");
        notifications.show({
          title: "Load Error",
          message: "Failed to load courses. Please refresh the page.",
          color: "red",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    const loadTheses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${host}/programme_curriculum/api/admin_theses/`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch theses");
        }

        const data = await response.json();
        setTheses(data.theses || []);
      } catch (err) {
        console.error("Failed to load theses:", err);
      }
    };

    loadCourses();
    loadTheses();

    const loadSeminars = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${host}/programme_curriculum/api/admin_seminars/`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch seminars");
        }

        const data = await response.json();
        setSeminars(data.seminars || []);
      } catch (err) {
        console.error("Failed to load seminars:", err);
      }
    };

    loadSeminars();

    const loadTeachingCredits = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${host}/programme_curriculum/api/admin_teaching_credits/`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch teaching credits");
        }

        const data = await response.json();
        setTeachingCredits(data.teaching_credits || []);
      } catch (err) {
        console.error("Failed to load teaching credits:", err);
      }
    };

    loadTeachingCredits();
  }, []);

  if (loading) {
    return (
      <MantineProvider theme={{ colorScheme: "light" }}>
        <Container style={{ padding: "20px", textAlign: "center" }}>
          Loading...
        </Container>
      </MantineProvider>
    );
  }

  if (error) {
    return (
      <MantineProvider theme={{ colorScheme: "light" }}>
        <Container style={{ padding: "20px", textAlign: "center" }}>
          Error: {error}
        </Container>
      </MantineProvider>
    );
  }

  const filteredCourses = courses.filter((course) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      course.code.toLowerCase().includes(searchLower) ||
      course.name.toLowerCase().includes(searchLower) ||
      course.version.toString().includes(searchLower) ||
      course.credits.toString().includes(searchLower)
    );
  });

  const filteredTheses = theses.filter((thesis) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      thesis.code.toLowerCase().includes(searchLower) ||
      thesis.name.toLowerCase().includes(searchLower) ||
      thesis.discipline.toLowerCase().includes(searchLower) ||
      thesis.credits.toString().includes(searchLower)
    );
  });

  const filteredSeminars = seminars.filter((seminar) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      seminar.code.toLowerCase().includes(searchLower) ||
      seminar.name.toLowerCase().includes(searchLower) ||
      seminar.discipline.toLowerCase().includes(searchLower) ||
      seminar.credits.toString().includes(searchLower)
    );
  });

  const filteredTeachingCredits = teachingCredits.filter((tc) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tc.code.toLowerCase().includes(searchLower) ||
      tc.name.toLowerCase().includes(searchLower) ||
      tc.discipline.toLowerCase().includes(searchLower) ||
      tc.credits.toString().includes(searchLower)
    );
  });

  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    setBulkUploading(true);
    const form = new FormData();
    form.append("courses_file", bulkFile);
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `${host}/programme_curriculum/api/admin_add_courses_bulk/`,
        {
          method: "POST",
          headers: token ? { Authorization: `Token ${token}` } : {},
          body: form,
        },
      );
      const data = await response.json();
      const reasons = (data.reasons || []).join(" ");

      if (data.created_count) {
        localStorage.setItem("AdminCoursesCachechange", "true");
        const refreshed = await fetchAllCourses();
        setCourses(refreshed);
        notifications.show({
          title: data.failed_count ? "Added with errors" : "Courses added",
          message: `${data.message} ${reasons}`.trim(),
          color: data.failed_count ? "yellow" : "green",
          autoClose: data.failed_count ? false : 4000,
        });
        setBulkModalOpened(false);
        setBulkFile(null);
      } else {
        notifications.show({
          title: "Nothing was added",
          message: `${data.message || "The upload failed."} ${reasons}`.trim(),
          color: "red",
          autoClose: false,
        });
      }

      if (data.unknown_columns?.length) {
        notifications.show({
          title: "Columns ignored",
          message: `These headings were not recognised: ${data.unknown_columns.join(", ")}`,
          color: "orange",
          autoClose: 6000,
        });
      }
    } catch (uploadError) {
      notifications.show({
        title: "Network Error",
        message: "Could not reach the server. Please try again.",
        color: "red",
        autoClose: 3000,
      });
    } finally {
      setBulkUploading(false);
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpened(true);
  };

  const handleDeleteThesisClick = (thesis) => {
    setThesisToDelete(thesis);
    setDeleteModalOpened(true);
  };

  const handleDeleteSeminarClick = (seminar) => {
    setSeminarToDelete(seminar);
    setDeleteModalOpened(true);
  };

  const handleDeleteTeachingCreditClick = (tc) => {
    setTeachingCreditToDelete(tc);
    setDeleteModalOpened(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        notifications.show({
          title: "Authentication Error",
          message: "Please log in again to continue",
          color: "red",
          autoClose: 3000,
        });
        return;
      }

      // Determine if deleting course, thesis, seminar, or teaching credit
      const isThesis = thesisToDelete !== null;
      const isSeminar = seminarToDelete !== null;
      const isTeachingCredit = teachingCreditToDelete !== null;
      const itemToDelete = isSeminar
        ? seminarToDelete
        : isTeachingCredit
        ? teachingCreditToDelete
        : isThesis
        ? thesisToDelete
        : courseToDelete;
      const kindLabel = isSeminar
        ? "Seminar"
        : isTeachingCredit
        ? "Teaching Credit"
        : isThesis
        ? "Thesis"
        : "Course";
      const kindLabelLower = kindLabel.toLowerCase();
      const kindLabelPluralLower = isSeminar
        ? "seminars"
        : isTeachingCredit
        ? "teaching credits"
        : isThesis
        ? "theses"
        : "courses";
      const deleteUrl = isSeminar
        ? `${host}/programme_curriculum/api/admin_delete_seminar/${itemToDelete.id}/`
        : isTeachingCredit
        ? `${host}/programme_curriculum/api/admin_delete_teaching_credit/${itemToDelete.id}/`
        : isThesis
        ? `${host}/programme_curriculum/api/admin_delete_thesis/${itemToDelete.id}/`
        : `${host}/api/admin_delete_course/${itemToDelete.id}/`;

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (response.ok && data.success !== false) {
        if (isSeminar) {
          setSeminars((prev) =>
            prev.filter((seminar) => seminar.id !== itemToDelete.id)
          );
        } else if (isTeachingCredit) {
          setTeachingCredits((prev) =>
            prev.filter((tc) => tc.id !== itemToDelete.id)
          );
        } else if (isThesis) {
          setTheses((prev) =>
            prev.filter((thesis) => thesis.id !== itemToDelete.id)
          );
        } else {
          setCourses((prev) =>
            prev.filter((course) => course.id !== itemToDelete.id)
          );
          localStorage.setItem("AdminCoursesCachechange", "true");
        }

        notifications.show({
          title: "Successfully Deleted",
          message:
            data.message ||
            `${kindLabel} '${itemToDelete.code} - ${itemToDelete.name}' has been deleted`,
          color: "green",
          autoClose: 3000,
        });
      } else {
        if (response.status === 404) {
          notifications.show({
            title: "Not Found",
            message: `This ${kindLabelLower} may have already been deleted or the delete endpoint is not available`,
            color: "orange",
            autoClose: 4000,
          });
        } else if (response.status === 400 && data.dependencies) {
          const dependencyMessage = data.dependencies
            .map((dep) => `${dep.count} ${dep.type}`)
            .join(", ");

          notifications.show({
            title: "Cannot Delete",
            message: `${data.message || `This ${kindLabelLower} has dependencies`}: ${dependencyMessage}`,
            color: "orange",
            autoClose: 5000,
          });
        } else if (response.status === 403) {
          notifications.show({
            title: "Access Denied",
            message: `You don't have permission to delete ${kindLabelPluralLower}`,
            color: "red",
            autoClose: 3000,
          });
        } else {
          notifications.show({
            title: "Delete Failed",
            message:
              data.error ||
              `Failed to delete ${kindLabelLower}. The backend delete API may not be implemented yet.`,
            color: "red",
            autoClose: 4000,
          });
        }
      }
    } catch (error) {
      notifications.show({
        title: "Network Error",
        message:
          "Failed to connect to server. Please check your connection and try again.",
        color: "red",
        autoClose: 3000,
      });
    } finally {
      setDeleteModalOpened(false);
      setCourseToDelete(null);
      setThesisToDelete(null);
      setSeminarToDelete(null);
      setTeachingCreditToDelete(null);
    }
  };

  return (
    <MantineProvider
      theme={{ colorScheme: "light" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Container style={{ padding: "20px", maxWidth: "100%" }}>
        <Flex justify="space-between" align="center" mb={20}>
          <Flex gap="sm">
            <Button
              variant={activeView === "courses" ? "filled" : "outline"}
              onClick={() => setActiveView("courses")}
            >
              Courses
            </Button>
            <Button
              variant={activeView === "theses" ? "filled" : "outline"}
              onClick={() => setActiveView("theses")}
            >
              Theses
            </Button>
            <Button
              variant={activeView === "seminars" ? "filled" : "outline"}
              onClick={() => setActiveView("seminars")}
            >
              Seminars
            </Button>
            <Button
              variant={activeView === "teachingCredits" ? "filled" : "outline"}
              onClick={() => setActiveView("teachingCredits")}
            >
              Teaching Credits
            </Button>
          </Flex>
          <Flex align="center" gap="md">
            <TextInput
              placeholder={
                activeView === "courses"
                  ? "Search by course code, name, version, or credits..."
                  : activeView === "theses"
                  ? "Search by thesis code, name, discipline, or credits..."
                  : activeView === "seminars"
                  ? "Search by seminar code, name, discipline, or credits..."
                  : "Search by teaching credit code, name, discipline, or credits..."
              }
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              style={{ flex: 1, minWidth: 180, maxWidth: 400 }}
            />
            {activeView === "courses" ? (
              <>
                <Button
                  variant="outline"
                  color="blue"
                  radius="sm"
                  leftSection={<IconUpload size={16} />}
                  onClick={() => setBulkModalOpened(true)}
                  style={{ flexShrink: 0 }}
                >
                  Bulk Add
                </Button>
                <Link
                  to="/programme_curriculum/acad_admin_add_course_proposal_form"
                  style={{ flexShrink: 0 }}
                >
                  <Button variant="filled" color="blue" radius="sm">
                    Add Course
                  </Button>
                </Link>
              </>
            ) : activeView === "theses" ? (
              <Link to="/programme_curriculum/admin_add_thesis">
                <Button variant="filled" color="blue" radius="sm">
                  Add Thesis
                </Button>
              </Link>
            ) : activeView === "seminars" ? (
              <Link to="/programme_curriculum/admin_add_seminar">
                <Button variant="filled" color="blue" radius="sm">
                  Add Seminar
                </Button>
              </Link>
            ) : (
              <Link to="/programme_curriculum/admin_add_teaching_credit">
                <Button variant="filled" color="blue" radius="sm">
                  Add Teaching Credit
                </Button>
              </Link>
            )}
          </Flex>
        </Flex>
        <hr />
        <div
          style={{
            maxHeight: "61vh",
            overflowY: "auto",
            border: "1px solid #d3d3d3",
            borderRadius: "10px",
            scrollbarWidth: "none",
          }}
        >
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          <Table highlightOnHover striped className="courses-table">
            <thead className="courses-table-header">
              <tr>
                {activeView === "courses" ? (
                  <>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Course Code
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Course Name
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Version
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Credits
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </th>
                  </>
                ) : activeView === "theses" ? (
                  <>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Thesis Code
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Thesis Name
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Discipline
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Programme Type
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Credits
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </th>
                  </>
                ) : activeView === "seminars" ? (
                  <>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Seminar Code
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Seminar Name
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Discipline
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Programme Type
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Credits
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </th>
                  </>
                ) : (
                  <>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Teaching Credit Code
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Teaching Credit Name
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Discipline
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Programme Type
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      Credits
                    </th>
                    <th
                      style={{
                        padding: "15px 20px",
                        backgroundColor: "#C5E2F6",
                        color: "#3498db",
                        fontSize: "16px",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeView === "courses" ? (
                filteredCourses.length > 0 ? (
                  filteredCourses.map((course, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor:
                          index % 2 !== 0 ? "#E6F7FF" : "#ffffff",
                      }}
                    >
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "20%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        <Link
                          to={`/programme_curriculum/admin_course/${course.id}`}
                          className="course-link"
                          style={{
                            color: "#3498db",
                            textDecoration: "none",
                            fontSize: "14px",
                          }}
                        >
                          {course.code}
                        </Link>
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "30%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {course.name}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "15%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {course.version}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "15%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {course.credits}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "20%",
                        }}
                      >
                        <Flex gap="xs" justify="center">
                          <Link
                            to={`/programme_curriculum/acad_admin_edit_course_form/${course.id}`}
                          >
                            <ActionIcon variant="light" color="blue" size="sm">
                              <IconEdit size="1rem" />
                            </ActionIcon>
                          </Link>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            onClick={() => handleDeleteClick(course)}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Flex>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No courses found
                    </td>
                  </tr>
                )
              ) : activeView === "theses" ? (
                filteredTheses.length > 0 ? (
                  filteredTheses.map((thesis, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor:
                          index % 2 !== 0 ? "#E6F7FF" : "#ffffff",
                      }}
                    >
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "15%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {thesis.code}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "25%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {thesis.name}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "20%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {thesis.discipline}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "15%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {thesis.programme_type}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "10%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {thesis.credits}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "15%",
                        }}
                      >
                        <Flex gap="xs" justify="center">
                          <Link
                            to={`/programme_curriculum/admin_edit_thesis_form/${thesis.id}`}
                          >
                            <ActionIcon variant="light" color="blue" size="sm">
                              <IconEdit size="1rem" />
                            </ActionIcon>
                          </Link>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            onClick={() => handleDeleteThesisClick(thesis)}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Flex>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No theses found
                    </td>
                  </tr>
                )
              ) : activeView === "seminars" ? (
                filteredSeminars.length > 0 ? (
                  filteredSeminars.map((seminar, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor:
                          index % 2 !== 0 ? "#E6F7FF" : "#ffffff",
                      }}
                    >
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "15%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {seminar.code}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "25%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {seminar.name}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "20%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {seminar.discipline}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "15%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {seminar.programme_type}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "10%",
                          borderRight: "1px solid #d3d3d3",
                        }}
                      >
                        {seminar.credits}
                      </td>
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          color: "black",
                          width: "15%",
                        }}
                      >
                        <Flex gap="xs" justify="center">
                          <Link
                            to={`/programme_curriculum/admin_edit_seminar_form/${seminar.id}`}
                          >
                            <ActionIcon variant="light" color="blue" size="sm">
                              <IconEdit size="1rem" />
                            </ActionIcon>
                          </Link>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            onClick={() => handleDeleteSeminarClick(seminar)}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Flex>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No seminars found
                    </td>
                  </tr>
                )
              ) : filteredTeachingCredits.length > 0 ? (
                filteredTeachingCredits.map((tc, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor:
                        index % 2 !== 0 ? "#E6F7FF" : "#ffffff",
                    }}
                  >
                    <td
                      style={{
                        padding: "15px 20px",
                        textAlign: "center",
                        color: "black",
                        width: "15%",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      {tc.code}
                    </td>
                    <td
                      style={{
                        padding: "15px 20px",
                        textAlign: "center",
                        color: "black",
                        width: "25%",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      {tc.name}
                    </td>
                    <td
                      style={{
                        padding: "15px 20px",
                        textAlign: "center",
                        color: "black",
                        width: "20%",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      {tc.discipline}
                    </td>
                    <td
                      style={{
                        padding: "15px 20px",
                        textAlign: "center",
                        color: "black",
                        width: "15%",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      {tc.programme_type}
                    </td>
                    <td
                      style={{
                        padding: "15px 20px",
                        textAlign: "center",
                        color: "black",
                        width: "10%",
                        borderRight: "1px solid #d3d3d3",
                      }}
                    >
                      {tc.credits}
                    </td>
                    <td
                      style={{
                        padding: "15px 20px",
                        textAlign: "center",
                        color: "black",
                        width: "15%",
                      }}
                    >
                      <Flex gap="xs" justify="center">
                        <Link
                          to={`/programme_curriculum/admin_edit_teaching_credit_form/${tc.id}`}
                        >
                          <ActionIcon variant="light" color="blue" size="sm">
                            <IconEdit size="1rem" />
                          </ActionIcon>
                        </Link>
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => handleDeleteTeachingCreditClick(tc)}
                        >
                          <IconTrash size="1rem" />
                        </ActionIcon>
                      </Flex>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No teaching credits found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <Modal
          opened={bulkModalOpened}
          onClose={() => {
            setBulkModalOpened(false);
            setBulkFile(null);
          }}
          title="Add courses from a file"
          centered
        >
          <Button
            leftSection={<IconDownload />}
            variant="light"
            onClick={downloadBulkCourseTemplate}
            fullWidth
            mb="md"
          >
            Download Template
          </Button>
          <Text size="sm" c="dimmed" mb="sm">
            Required: {BULK_REQUIRED_COLUMNS.join(" | ")}
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            One row per course, .xlsx .xls or .csv. For a course shared across
            disciplines, list them in the one cell separated by semicolons —
            CSE;ME — using either acronyms or full names.
          </Text>
          <Divider mb="lg" />
          <FileButton onChange={setBulkFile} accept=".xlsx,.xls,.csv">
            {({ onClick }) => (
              <Button
                onClick={onClick}
                leftSection={<IconUpload />}
                variant="outline"
                fullWidth
                mb="md"
              >
                {bulkFile ? bulkFile.name : "Choose Excel file"}
              </Button>
            )}
          </FileButton>
          <Button
            fullWidth
            size="md"
            leftSection={<IconUpload />}
            loading={bulkUploading}
            onClick={handleBulkUpload}
            disabled={!bulkFile}
          >
            Upload & Add
          </Button>
        </Modal>

        <Modal
          opened={deleteModalOpened}
          onClose={() => setDeleteModalOpened(false)}
          title={seminarToDelete !== null ? "Confirm Seminar Deletion" : teachingCreditToDelete !== null ? "Confirm Teaching Credit Deletion" : thesisToDelete !== null ? "Confirm Thesis Deletion" : "Confirm Course Deletion"}
          centered
          size="md"
        >
          {seminarToDelete !== null ? (
            <>
              <Text size="sm" mb="md">
                Are you sure you want to delete the seminar <strong>"{seminarToDelete?.code} - {seminarToDelete?.name}"</strong>?
              </Text>

              <Text size="xs" c="orange" mb="sm">
                Warning: This action cannot be undone.
              </Text>

              <Flex justify="flex-end" mt="md" gap="sm">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpened(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="red"
                  onClick={handleConfirmDelete}
                >
                  Delete Seminar
                </Button>
              </Flex>
            </>
          ) : teachingCreditToDelete !== null ? (
            <>
              <Text size="sm" mb="md">
                Are you sure you want to delete the teaching credit <strong>"{teachingCreditToDelete?.code} - {teachingCreditToDelete?.name}"</strong>?
              </Text>

              <Text size="xs" c="orange" mb="sm">
                Warning: This action cannot be undone.
              </Text>

              <Flex justify="flex-end" mt="md" gap="sm">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpened(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="red"
                  onClick={handleConfirmDelete}
                >
                  Delete Teaching Credit
                </Button>
              </Flex>
            </>
          ) : thesisToDelete !== null ? (
            <>
              <Text size="sm" mb="md">
                Are you sure you want to delete the thesis <strong>"{thesisToDelete?.code} - {thesisToDelete?.name}"</strong>?
              </Text>
              
              <Text size="xs" c="orange" mb="sm">
                ⚠️ <strong>Warning:</strong> This action cannot be undone.
              </Text>
              
              <Flex justify="flex-end" mt="md" gap="sm">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteModalOpened(false)}
                >
                  Cancel
                </Button>
                <Button 
                  color="red" 
                  onClick={handleConfirmDelete}
                >
                  Delete Thesis
                </Button>
              </Flex>
            </>
          ) : (
            <>
              <Text size="sm" mb="md">
                Are you sure you want to delete the course <strong>"{courseToDelete?.code} - {courseToDelete?.name}"</strong> 
                (Version: {courseToDelete?.version})?
              </Text>
              
              <Text size="xs" c="orange" mb="sm">
                ⚠️ <strong>Warning:</strong> This action cannot be undone.
              </Text>
              
              <Text size="xs" c="blue" mb="md">
                ℹ️ <strong>Note:</strong> If the backend delete API is not yet implemented, 
                you'll receive a notification about the current status.
              </Text>
              
              <Flex justify="flex-end" mt="md" gap="sm">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteModalOpened(false)}
                >
                  Cancel
                </Button>
                <Button 
                  color="red" 
                  onClick={handleConfirmDelete}
                >
                  Delete Course
                </Button>
              </Flex>
            </>
          )}
        </Modal>
      </Container>
    </MantineProvider>
  );
}

export default Admin_view_all_courses;

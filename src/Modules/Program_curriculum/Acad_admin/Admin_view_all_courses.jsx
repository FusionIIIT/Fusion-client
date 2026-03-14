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
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchAllCourses } from "../api/api";
import { host } from "../../../routes/globalRoutes";

function Admin_view_all_courses() {
  const [courses, setCourses] = useState([]);
  const [theses, setTheses] = useState([]);
  const [progressSeminars, setProgressSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [thesisToDelete, setThesisToDelete] = useState(null);
  const [progressSeminarToDelete, setProgressSeminarToDelete] = useState(null);
  const [activeView, setActiveView] = useState("courses"); // "courses", "theses", or "progressSeminars"

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

    const loadProgressSeminars = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${host}/programme_curriculum/api/admin_progress_seminars/`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch progress seminars");
        }

        const data = await response.json();
        setProgressSeminars(data.progress_seminars || []);
      } catch (err) {
        console.error("Failed to load progress seminars:", err);
      }
    };

    loadProgressSeminars();
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

  const filteredProgressSeminars = progressSeminars.filter((ps) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ps.code.toLowerCase().includes(searchLower) ||
      ps.name.toLowerCase().includes(searchLower) ||
      ps.discipline.toLowerCase().includes(searchLower) ||
      ps.credits.toString().includes(searchLower)
    );
  });

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpened(true);
  };

  const handleDeleteThesisClick = (thesis) => {
    setThesisToDelete(thesis);
    setDeleteModalOpened(true);
  };

  const handleDeleteProgressSeminarClick = (ps) => {
    setProgressSeminarToDelete(ps);
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

      // Determine if deleting course, thesis, or progress seminar
      const isThesis = thesisToDelete !== null;
      const isProgressSeminar = progressSeminarToDelete !== null;
      const itemToDelete = isProgressSeminar ? progressSeminarToDelete : isThesis ? thesisToDelete : courseToDelete;
      const deleteUrl = isProgressSeminar
        ? `${host}/programme_curriculum/api/admin_delete_progress_seminar/${itemToDelete.id}/`
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
        if (isProgressSeminar) {
          setProgressSeminars((prev) =>
            prev.filter((ps) => ps.id !== itemToDelete.id)
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
            `${isProgressSeminar ? "Progress Seminar" : isThesis ? "Thesis" : "Course"} '${itemToDelete.code} - ${itemToDelete.name}' has been deleted`,
          color: "green",
          autoClose: 3000,
        });
      } else {
        if (response.status === 404) {
          notifications.show({
            title: "Not Found",
            message: `This ${isProgressSeminar ? "progress seminar" : isThesis ? "thesis" : "course"} may have already been deleted or the delete endpoint is not available`,
            color: "orange",
            autoClose: 4000,
          });
        } else if (response.status === 400 && data.dependencies) {
          const dependencyMessage = data.dependencies
            .map((dep) => `${dep.count} ${dep.type}`)
            .join(", ");

          notifications.show({
            title: "Cannot Delete",
            message: `${data.message || `This ${isProgressSeminar ? "progress seminar" : isThesis ? "thesis" : "course"} has dependencies`}: ${dependencyMessage}`,
            color: "orange",
            autoClose: 5000,
          });
        } else if (response.status === 403) {
          notifications.show({
            title: "Access Denied",
            message: `You don't have permission to delete ${isProgressSeminar ? "progress seminars" : isThesis ? "theses" : "courses"}`,
            color: "red",
            autoClose: 3000,
          });
        } else {
          notifications.show({
            title: "Delete Failed",
            message:
              data.error ||
              `Failed to delete ${isProgressSeminar ? "progress seminar" : isThesis ? "thesis" : "course"}. The backend delete API may not be implemented yet.`,
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
      setProgressSeminarToDelete(null);
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
              variant={activeView === "progressSeminars" ? "filled" : "outline"}
              onClick={() => setActiveView("progressSeminars")}
            >
              Progress Seminars
            </Button>
          </Flex>
          <Flex align="center" gap="md">
            <TextInput
              placeholder={
                activeView === "courses"
                  ? "Search by course code, name, version, or credits..."
                  : activeView === "theses"
                  ? "Search by thesis code, name, discipline, or credits..."
                  : "Search by seminar code, name, discipline, or credits..."
              }
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              style={{ width: "400px" }}
            />
            {activeView === "courses" ? (
              <Link to="/programme_curriculum/acad_admin_add_course_proposal_form">
                <Button variant="filled" color="blue" radius="sm">
                  Add Course
                </Button>
              </Link>
            ) : activeView === "theses" ? (
              <Link to="/programme_curriculum/admin_add_thesis">
                <Button variant="filled" color="blue" radius="sm">
                  Add Thesis
                </Button>
              </Link>
            ) : (
              <Link to="/programme_curriculum/admin_add_progress_seminar">
                <Button variant="filled" color="blue" radius="sm">
                  Add Progress Seminar
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
              ) : (
                filteredProgressSeminars.length > 0 ? (
                  filteredProgressSeminars.map((ps, index) => (
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
                        {ps.code}
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
                        {ps.name}
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
                        {ps.discipline}
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
                        {ps.programme_type}
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
                        {ps.credits}
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
                            to={`/programme_curriculum/admin_edit_progress_seminar_form/${ps.id}`}
                          >
                            <ActionIcon variant="light" color="blue" size="sm">
                              <IconEdit size="1rem" />
                            </ActionIcon>
                          </Link>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            onClick={() => handleDeleteProgressSeminarClick(ps)}
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
                      No progress seminars found
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        </div>

        <Modal
          opened={deleteModalOpened}
          onClose={() => setDeleteModalOpened(false)}
          title={progressSeminarToDelete !== null ? "Confirm Progress Seminar Deletion" : thesisToDelete !== null ? "Confirm Thesis Deletion" : "Confirm Course Deletion"}
          centered
          size="md"
        >
          {progressSeminarToDelete !== null ? (
            <>
              <Text size="sm" mb="md">
                Are you sure you want to delete the progress seminar <strong>"{progressSeminarToDelete?.code} - {progressSeminarToDelete?.name}"</strong>?
              </Text>
              
              <Text size="xs" color="orange" mb="sm">
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
                  Delete Progress Seminar
                </Button>
              </Flex>
            </>
          ) : thesisToDelete !== null ? (
            <>
              <Text size="sm" mb="md">
                Are you sure you want to delete the thesis <strong>"{thesisToDelete?.code} - {thesisToDelete?.name}"</strong>?
              </Text>
              
              <Text size="xs" color="orange" mb="sm">
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
              
              <Text size="xs" color="orange" mb="sm">
                ⚠️ <strong>Warning:</strong> This action cannot be undone.
              </Text>
              
              <Text size="xs" color="blue" mb="md">
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

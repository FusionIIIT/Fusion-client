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
import { host } from "../../../routes/globalRoutes";

function Admin_view_all_theses() {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [thesisToDelete, setThesisToDelete] = useState(null);

  useEffect(() => {
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
        setError("Failed to load theses.");
        notifications.show({
          title: "Load Error",
          message: "Failed to load theses. Please refresh the page.",
          color: "red",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadTheses();
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

  const filteredTheses = theses.filter((thesis) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      thesis.code.toLowerCase().includes(searchLower) ||
      thesis.name.toLowerCase().includes(searchLower) ||
      thesis.discipline.toLowerCase().includes(searchLower) ||
      thesis.credits.toString().includes(searchLower)
    );
  });

  const handleDeleteClick = (thesis) => {
    setThesisToDelete(thesis);
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

      const response = await fetch(
        `${host}/programme_curriculum/api/admin_delete_thesis/${thesisToDelete.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (response.ok && data.success !== false) {
        setTheses((prev) =>
          prev.filter((thesis) => thesis.id !== thesisToDelete.id)
        );

        notifications.show({
          title: "Successfully Deleted",
          message:
            data.message ||
            `Thesis '${thesisToDelete.code} - ${thesisToDelete.name}' has been deleted`,
          color: "green",
          autoClose: 3000,
        });
      } else {
        if (response.status === 404) {
          notifications.show({
            title: "Not Found",
            message:
              "This thesis may have already been deleted or the delete endpoint is not available",
            color: "orange",
            autoClose: 4000,
          });
        } else {
          notifications.show({
            title: "Delete Failed",
            message:
              data.error ||
              "Failed to delete thesis. The backend delete API may not be implemented yet.",
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
      setThesisToDelete(null);
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
          <Button variant="filled" style={{ marginRight: "10px" }}>
            Theses
          </Button>
          <Flex align="center" gap="md">
            <TextInput
              placeholder="Search by thesis code, name, discipline, or credits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "400px" }}
            />
            <Link to="/programme_curriculum/admin_add_thesis">
              <Button>Add Thesis</Button>
            </Link>
          </Flex>
        </Flex>

        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Thesis Code</th>
              <th style={{ textAlign: "center" }}>Thesis Name</th>
              <th style={{ textAlign: "center" }}>Discipline</th>
              <th style={{ textAlign: "center" }}>Programme Type</th>
              <th style={{ textAlign: "center" }}>Credits</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTheses.length > 0 ? (
              filteredTheses.map((thesis) => (
                <tr key={thesis.id}>
                  <td style={{ textAlign: "center" }}>
                    <Link to={`/programme_curriculum/admin_thesis/${thesis.id}`}>
                      {thesis.code}
                    </Link>
                  </td>
                  <td style={{ textAlign: "center" }}>{thesis.name}</td>
                  <td style={{ textAlign: "center" }}>
                    {thesis.discipline} ({thesis.discipline_acronym})
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {thesis.programme_type_display}
                  </td>
                  <td style={{ textAlign: "center" }}>{thesis.credits}</td>
                  <td style={{ textAlign: "center" }}>
                    <Flex gap="sm" justify="center">
                      <Link
                        to={`/programme_curriculum/admin_edit_thesis/${thesis.id}`}
                      >
                        <ActionIcon color="blue" variant="light">
                          <IconEdit size={18} />
                        </ActionIcon>
                      </Link>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleDeleteClick(thesis)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Flex>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  No theses found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <Modal
          opened={deleteModalOpened}
          onClose={() => setDeleteModalOpened(false)}
          title="Confirm Deletion"
          centered
        >
          <Text>
            Are you sure you want to delete the thesis "
            {thesisToDelete?.code} - {thesisToDelete?.name}"?
          </Text>
          <Flex justify="flex-end" gap="md" mt="md">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpened(false)}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </Flex>
        </Modal>
      </Container>
    </MantineProvider>
  );
}

export default Admin_view_all_theses;

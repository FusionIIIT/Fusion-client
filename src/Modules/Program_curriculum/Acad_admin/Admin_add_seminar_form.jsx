import React, { useState, useEffect } from "react";
import {
  NumberInput,
  Button,
  Group,
  Text,
  Container,
  Stack,
  TextInput,
  Table,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { fetchDisciplinesData } from "../api/api";
import { host } from "../../../routes/globalRoutes";

function Admin_add_seminar_form() {
  const form = useForm({
    initialValues: {
      code: "",
      name: "",
      credit: 0,
      discipline: "",
      programme_type: "",
    },
    validate: {
      code: (value) => (!value ? "Seminar code is required" : null),
      name: (value) => (!value ? "Seminar name is required" : null),
      credit: (value) =>
        value === null || value === undefined || value < 0
          ? "Credits must be 0 or more"
          : null,
      discipline: (value) => (!value ? "Discipline is required" : null),
      programme_type: (value) =>
        !value ? "Programme type is required" : null,
    },
  });

  const navigate = useNavigate();
  const [disciplines, setDisciplines] = useState([]);

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const response = await fetchDisciplinesData();
        const disciplineList = response.map((discipline) => ({
          value: discipline.id.toString(),
          label: `${discipline.name} (${discipline.acronym})`,
        }));
        setDisciplines(disciplineList);
      } catch (fetchError) {
        notifications.show({
          title: "Error",
          message: "Failed to load disciplines. Please refresh the page.",
          color: "red",
          autoClose: 4000,
        });
      }
    };

    fetchDisciplines();
  }, []);

  const programmeTypeOptions = [
    { value: "PG", label: "Postgraduate (M.Tech)" },
    { value: "PHD", label: "Doctor of Philosophy (PhD)" },
  ];

  const handleSubmit = async (values) => {
    const apiUrl = `${host}/programme_curriculum/api/admin_add_seminar/`;
    const token = localStorage.getItem("authToken");

    const payload = {
      code: values.code,
      name: values.name,
      credit: values.credit,
      discipline: values.discipline,
      programme_type: values.programme_type,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        notifications.show({
          title: "Seminar Added Successfully!",
          message: (
            <div>
              <Text size="sm" mb={8}>
                <strong>
                  Seminar "{values.name}" ({values.code}) has been
                  created.
                </strong>
              </Text>
              <Text size="xs" c="gray.7">
                Credits: {values.credit}
              </Text>
            </div>
          ),
          color: "green",
          autoClose: 5000,
          style: {
            backgroundColor: "#d4edda",
            borderColor: "#c3e6cb",
            color: "#155724",
          },
        });

        form.reset();
        setTimeout(() => {
          navigate("/programme_curriculum/admin_courses");
        }, 1500);
      } else {
        const errorData = await response.json();

        notifications.show({
          title: "Failed to Add Seminar",
          message: (
            <div>
              <Text size="sm" mb={8}>
                <strong>
                  {errorData.error ||
                    "Unable to create seminar. Please try again."}
                </strong>
              </Text>
            </div>
          ),
          color: "red",
          autoClose: 7000,
          style: {
            backgroundColor: "#f8d7da",
            borderColor: "#f5c6cb",
            color: "#721c24",
          },
        });
      }
    } catch (error) {
      notifications.show({
        title: "Network Error",
        message: (
          <div>
            <Text size="sm" mb={8}>
              <strong>Connection error occurred while adding seminar.</strong>
            </Text>
            <Text size="xs" c="gray.7">
              Please check your internet connection and try again.
            </Text>
          </div>
        ),
        color: "red",
        autoClose: 7000,
        style: {
          backgroundColor: "#f8d7da",
          borderColor: "#f5c6cb",
          color: "#721c24",
        },
      });
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Container
        fluid
        style={{
          display: "flex",
          justifyContent: "left",
          alignItems: "left",
          width: "100%",
          margin: "0 0 0 -3.2vw",
        }}
      >
        <div
          style={{
            maxWidth: "90vw",
            width: "100%",
            display: "flex",
            gap: "2rem",
            padding: "2rem",
            flex: 4,
          }}
        >
          <div style={{ flex: 4 }}>
            <form
              onSubmit={form.onSubmit(handleSubmit)}
              style={{
                backgroundColor: "#fff",
                padding: "2rem",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
            >
              <Stack gap="lg">
                <Text
                  size="xl"
                  fw={700}
                  ta="center"
                  style={{ padding: "10px", borderRadius: "5px" }}
                >
                  Seminar Form
                </Text>

                <Table
                  striped
                  highlightOnHover
                  style={{ borderCollapse: "collapse", width: "100%" }}
                >
                  <tbody>
                    {/* Seminar Code */}
                    <tr>
                      <td
                        style={{
                          border: "2px solid #1976d2",
                          padding: "10px",
                          fontWeight: "bold",
                          color: "#1976d2",
                        }}
                      >
                        Seminar Code:
                      </td>
                      <td
                        style={{ border: "2px solid #1976d2", padding: "10px" }}
                      >
                        <TextInput
                          placeholder="e.g. CS898, EC898, ME898"
                          value={form.values.code}
                          onChange={(event) =>
                            form.setFieldValue(
                              "code",
                              event.currentTarget.value
                            )
                          }
                          error={form.errors.code}
                          required
                          styles={{
                            input: {
                              borderRadius: "4px",
                              height: "30px",
                              fontSize: "14px",
                              border: "none",
                            },
                          }}
                        />
                      </td>
                    </tr>

                    {/* Seminar Name */}
                    <tr>
                      <td
                        style={{
                          border: "2px solid #1976d2",
                          padding: "10px",
                          fontWeight: "bold",
                          color: "#1976d2",
                        }}
                      >
                        Seminar Name:
                      </td>
                      <td
                        style={{ border: "2px solid #1976d2", padding: "10px" }}
                      >
                        <TextInput
                          placeholder="e.g. PhD Seminar in Computer Science"
                          value={form.values.name}
                          onChange={(event) =>
                            form.setFieldValue(
                              "name",
                              event.currentTarget.value
                            )
                          }
                          error={form.errors.name}
                          required
                          styles={{
                            input: {
                              borderRadius: "4px",
                              height: "30px",
                              fontSize: "14px",
                              border: "none",
                            },
                          }}
                        />
                      </td>
                    </tr>

                    {/* Credits */}
                    <tr>
                      <td
                        style={{
                          border: "2px solid #1976d2",
                          padding: "10px",
                          fontWeight: "bold",
                          color: "#1976d2",
                        }}
                      >
                        Credits:
                      </td>
                      <td
                        style={{ border: "2px solid #1976d2", padding: "10px" }}
                      >
                        <NumberInput
                          placeholder="0"
                          value={form.values.credit}
                          onChange={(value) =>
                            form.setFieldValue("credit", value)
                          }
                          error={form.errors.credit}
                          min={0}
                          required
                          styles={{
                            input: {
                              borderRadius: "4px",
                              height: "30px",
                              fontSize: "14px",
                              border: "none",
                            },
                          }}
                        />
                      </td>
                    </tr>

                    {/* Discipline */}
                    <tr>
                      <td
                        style={{
                          border: "2px solid #1976d2",
                          padding: "10px",
                          fontWeight: "bold",
                          color: "#1976d2",
                        }}
                      >
                        Discipline:
                      </td>
                      <td
                        style={{ border: "2px solid #1976d2", padding: "10px" }}
                      >
                        <Select
                          placeholder="Select Discipline"
                          data={disciplines}
                          value={form.values.discipline}
                          onChange={(value) =>
                            form.setFieldValue("discipline", value)
                          }
                          error={form.errors.discipline}
                          searchable
                          required
                          styles={{
                            input: {
                              borderRadius: "4px",
                              height: "30px",
                              fontSize: "14px",
                              border: "none",
                            },
                          }}
                        />
                      </td>
                    </tr>

                    {/* Programme Type */}
                    <tr>
                      <td
                        style={{
                          border: "2px solid #1976d2",
                          padding: "10px",
                          fontWeight: "bold",
                          color: "#1976d2",
                        }}
                      >
                        Programme Type:
                      </td>
                      <td
                        style={{ border: "2px solid #1976d2", padding: "10px" }}
                      >
                        <Select
                          placeholder="Select Programme Type"
                          data={programmeTypeOptions}
                          value={form.values.programme_type}
                          onChange={(value) =>
                            form.setFieldValue("programme_type", value)
                          }
                          error={form.errors.programme_type}
                          required
                          styles={{
                            input: {
                              borderRadius: "4px",
                              height: "30px",
                              fontSize: "14px",
                              border: "none",
                            },
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>

                {/* Submit Buttons */}
                <Group justify="center" mt="xl">
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate("/programme_curriculum/admin_courses")
                    }
                    style={{ minWidth: "120px" }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" style={{ minWidth: "120px" }}>
                    Add Seminar
                  </Button>
                </Group>
              </Stack>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Admin_add_seminar_form;

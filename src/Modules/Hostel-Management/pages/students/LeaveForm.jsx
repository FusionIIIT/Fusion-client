import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import axios from "axios";
import { requestLeave } from "../../../../routes/hostelManagementRoutes"; // Import your endpoint

export default function LeaveForm() {
  const [formData, setFormData] = useState({
    studentName: "",
    rollNumber: "",
    phoneNumber: "",
    reason: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Retrieve the token from local storage or a secure store
    const token = localStorage.getItem("authToken"); // adjust as per your token storage location

    const data = {
      student_name: formData.studentName,
      roll_num: formData.rollNumber,
      phone_number: formData.phoneNumber,
      reason: formData.reason,
      start_date: formData.startDate,
      end_date: formData.endDate,
    };
    console.log(data);
    try {
      const response = await axios.post(requestLeave, data, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Form submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Paper
      shadow="md"
      p="md"
      withBorder
      sx={(theme) => ({
        position: "fixed",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.white,
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
      })}
    >
      <Stack spacing="lg">
        <Text
          align="left"
          mb="xl"
          size="24px"
          style={{ color: "#757575", fontWeight: "bold" }}
        >
          Leave Form
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Box>
              <Text component="label" size="lg" fw={500}>
                Student Name:
              </Text>
              <TextInput
                placeholder="Enter your full name"
                value={formData.studentName}
                onChange={(event) =>
                  handleChange("studentName", event.currentTarget.value)
                }
                required
                styles={{ root: { marginTop: 5 } }}
              />
            </Box>

            <Box>
              <Text component="label" size="lg" fw={500}>
                Roll Number:
              </Text>
              <TextInput
                placeholder="Enter your roll number"
                value={formData.rollNumber}
                onChange={(event) =>
                  handleChange("rollNumber", event.currentTarget.value)
                }
                required
                styles={{ root: { marginTop: 5 } }}
              />
            </Box>

            <Box>
              <Text component="label" size="lg" fw={500}>
                Phone Number:
              </Text>
              <TextInput
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={(event) =>
                  handleChange("phoneNumber", event.currentTarget.value)
                }
                required
                styles={{ root: { marginTop: 5 } }}
              />
            </Box>

            <Box>
              <Text component="label" size="lg" fw={500}>
                Reason:
              </Text>
              <Textarea
                placeholder="Please provide a detailed reason for your leave"
                value={formData.reason}
                onChange={(event) =>
                  handleChange("reason", event.currentTarget.value)
                }
                minRows={5}
                required
                styles={{ root: { marginTop: 5 } }}
              />
            </Box>

            <Grid>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Start Date:
                </Text>
                <TextInput
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleChange("startDate", e.currentTarget.value)
                  }
                  required
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  End Date:
                </Text>
                <TextInput
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    handleChange("endDate", e.currentTarget.value)
                  }
                  required
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
            </Grid>

            <Group position="right" spacing="sm" mt="xl">
              <Button type="submit" variant="filled">
                Submit
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}

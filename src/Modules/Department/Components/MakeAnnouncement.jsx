import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Container,
  Grid,
  Title,
  Text,
  Paper,
  Select,
  Textarea,
  Group,
  Box,
} from "@mantine/core";
import { host } from "../../../routes/globalRoutes";

function MakeAnnouncement() {
  const [programme, setProgramme] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [key, setKey] = useState(0); // State to force re-render

  const resetFormFields = () => {
    setProgramme("");
    setBatch("");
    setDepartment("");
    setAnnouncement("");
    setIsSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setIsSuccess(false);

    // Validate fields
    if (!programme || !batch || !department || !announcement) {
      setErrorMessage("All fields are required.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    const url = `${host}/dep/api/announcements/`;

    const formData = new FormData();
    formData.append("programme", programme);
    formData.append("batch", batch);
    formData.append("department", department);
    formData.append("message", announcement);

    try {
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setIsSuccess(true);
      console.log("Announcement registered:", response.data);

      setTimeout(() => {
        resetFormFields();
        setKey((prevKey) => prevKey + 1); // Change the key to force re-render
      }, 2000);
    } catch (error) {
      const errorResponse = error.response?.data || error.message;
      setErrorMessage(
        errorResponse.detail ||
          "Error creating Announcement. Please try again.",
      );
      console.error("Error creating Announcement:", errorResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      size="xl"
      style={{
        height: "auto",
        marginTop: "2rem",
        display: "block",
        paddingLeft: 0,
      }}
    >
      <Box style={{ width: "60vw" }}>
        <Title order={2} align="left" mb="xl">
          Create Announcement
        </Title>

        {errorMessage && (
          <Text color="red" mb="md" align="left">
            {errorMessage}
          </Text>
        )}

        <Paper
          key={key}
          radius="md"
          px="lg"
          pt="sm"
          pb="xl"
          style={{
            borderLeft: "0.6rem solid #15ABFF",
            backgroundColor: "white",
            minHeight: "45vh",
            maxHeight: "70vh",
          }}
          withBorder
        >
          <form onSubmit={handleSubmit}>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Programme"
                  placeholder="Select Programme Type"
                  value={programme}
                  onChange={setProgramme}
                  data={["M.tech", "B.Tech", "Phd", "other"]}
                  required
                  mb="md"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Batch"
                  placeholder="Select Batch"
                  value={batch}
                  onChange={setBatch}
                  data={["All", "Year-1", "Year-2", "Year-3", "Year-4"]}
                  required
                  mb="md"
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Department"
                  placeholder="Select Department Type"
                  value={department}
                  onChange={setDepartment}
                  data={[
                    "ALL",
                    "CSE",
                    "ECE",
                    "ME",
                    "SM",
                    "Natural Science",
                    "Design",
                  ]}
                  required
                  mb="md"
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Announcement Details"
              placeholder="What is the Announcement?"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              required
              mb="md"
            />

            <Group position="right" mt="xs">
              <Button
                type="submit"
                style={{
                  width: "150px",
                  backgroundColor: isSuccess ? "#2BB673" : undefined,
                  color: isSuccess ? "black" : "white",
                }}
                variant="filled"
                color="blue"
                loading={loading}
              >
                {loading ? "Loading..." : isSuccess ? "Submitted" : "Submit"}
              </Button>
            </Group>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default MakeAnnouncement;

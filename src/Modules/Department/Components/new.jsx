import React, { useState } from "react";
import axios from "axios";
import {
  Paper,
  Textarea,
  FileInput,
  Select,
  Button,
  Grid,
  Title,
  Text,
  Group,
} from "@mantine/core";

function MakeAnnouncement() {
  const [programme, setProgramme] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [key, setKey] = useState(0); // State to force re-render

  const resetFormFields = () => {
    setProgramme("");
    setBatch("");
    setDepartment("");
    setAnnouncement("");
    setFile(null);
    setIsSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setIsSuccess(false);

    const token = localStorage.getItem("authToken");

    const url = "http://127.0.0.1:8000/dep/api/announcements/";

    const formData = new FormData();
    formData.append("programme", programme);
    formData.append("batch", batch);
    formData.append("department", department);
    formData.append("message", announcement);
    if (file) {
      formData.append("upload_announcement", file);
    }

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
    <Grid mt="xl" style={{ paddingLeft: "49px" }}>
      <Paper
        key={key}
        radius="md"
        px="lg"
        pt="sm"
        pb="xl"
        style={{
          borderLeft: "0.6rem solid #15ABFF",
          width: "60vw",
          backgroundColor: "white",
          minHeight: "45vh",
          maxHeight: "70vh",
        }}
        withBorder
        maw="1240px"
      >
        <Title order={3} mb="md">
          Create Announcement
        </Title>

        {errorMessage && (
          <Text color="red" mb="md">
            {errorMessage}
          </Text>
        )}

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
                label="batch"
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
                label="deaprtment"
                placeholder="Select Deaprtment Type"
                value={department}
                onChange={setDepartment}
                data={["ALL", "CSE", "ECE", "ME", "SM"]}
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
          <FileInput
            label="Attach Files (PDF, JPEG, PNG, JPG)"
            placeholder="Choose File"
            accept=".pdf,.jpeg,.png,.jpg"
            onChange={setFile}
            mb="md"
          />
          <Group position="right" mt="lg">
            <Text size="sm" color="dimmed" align="right">
              Complaint will be registered with your User ID.
            </Text>
          </Group>
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
    </Grid>
  );
}

export default MakeAnnouncement;

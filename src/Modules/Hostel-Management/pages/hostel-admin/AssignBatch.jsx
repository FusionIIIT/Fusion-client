import React, { useState, useEffect } from "react";
import {
  Box,
  Select,
  Text,
  Button,
  Paper,
  Stack,
  Notification,
  TextInput,
  Group,
  FileButton,
  Container,
} from "@mantine/core";
import { Upload } from "@phosphor-icons/react";
import { adminService } from "../../services";

export default function AssignBatch() {
  const [allHall, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [batchInput, setBatchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [academicSession, setAcademicSession] = useState(
    "August 2024 - July 2025",
  );
  const [notification, setNotification] = useState({
    opened: false,
    message: "",
    color: "",
  });

  const generateAcademicSessions = () => {
    const sessions = [];
    for (let i = 0; i < 10; i += 1) {
      const startYear = 2024 + i;
      sessions.push(`August ${startYear} - July ${startYear + 1}`);
    }
    return sessions;
  };

  const academicSessions = generateAcademicSessions();

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const response = await adminService.getBatches();
        const { halls } = response.data;
        setHalls(halls.map((h) => ({ value: h.hall_id, label: h.hall_name })));
      } catch (error) {
        setNotification({
          opened: true,
          message: "Failed to fetch data. Please try again.",
          color: "red",
        });
      }
    };

    loadBatches();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedHall || !batchInput || !file || !academicSession) {
      setNotification({
        opened: true,
        message: "Please fill in all fields and select a file to upload.",
        color: "red",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("academicSession", academicSession);
    formData.append("selectedHall", selectedHall);
    formData.append("selectedBatch", batchInput);
    formData.append("file", file);

    try {
      await adminService.assignBatch(formData);

      setFile(null);
      setNotification({
        opened: true,
        message: "File uploaded successfully!",
        color: "green",
      });
    } catch (error) {
      setNotification({
        opened: true,
        message: "Failed to upload file. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper withBorder shadow="md" p="lg" radius="md">
        <Stack spacing="md">
          <Select
            label="Hall"
            placeholder="Select Hall"
            data={allHall}
            value={selectedHall}
            onChange={setSelectedHall}
            required
          />

          <TextInput
            label="Assigned Batch"
            placeholder="Enter Batch"
            value={batchInput}
            onChange={(e) => setBatchInput(e.currentTarget.value)}
            required
          />

          <Select
            label="Academic Session"
            placeholder="Select Academic Session"
            data={academicSessions}
            value={academicSession}
            onChange={setAcademicSession}
            required
          />

          <Box>
            <Text fw={500} size="sm" mb={5}>
              Upload Document
            </Text>
            <Group spacing="sm">
              <FileButton onChange={setFile} accept=".xls,.xlsx,.csv">
                {(props) => (
                  /* eslint-disable react/jsx-props-no-spreading */
                  <Button
                    leftIcon={<Upload size={20} />}
                    variant="light"
                    {...props}
                  >
                    {file ? file.name : "Choose File"}
                  </Button>
                )}
              </FileButton>
              {file && (
                <Button
                  variant="subtle"
                  color="red"
                  onClick={() => setFile(null)}
                >
                  Clear
                </Button>
              )}
            </Group>
          </Box>

          <Group position="right" mt="md">
            <Button
              color="green"
              loading={loading}
              onClick={handleUpload}
              disabled={!file}
            >
              Upload Document
            </Button>
          </Group>

          {notification.opened && (
            <Notification
              title="Notification"
              color={notification.color}
              onClose={() =>
                setNotification({ ...notification, opened: false })
              }
              mt="md"
            >
              {notification.message}
            </Notification>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}

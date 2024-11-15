import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Select,
  Text,
  Button,
  Paper,
  Stack,
  Notification,
  TextInput,
} from "@mantine/core";

import {
  getBatches,
  assignBatch,
} from "../../../../routes/hostelManagementRoutes"; // API routes for fetching halls and batches, and assigning batches

axios.defaults.withXSRFToken = true;

export default function AssignBatch() {
  const [allHall, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [batchInput, setBatchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    opened: false,
    message: "",
    color: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setNotification({
        opened: true,
        message: "Authentication token not found. Please login again.",
        color: "red",
      });
      return;
    }

    axios
      .get(getBatches, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        const { halls } = response.data;
        setHalls(
          halls.map((hallData) => ({
            value: hallData.hall_id,
            label: hallData.hall_name,
          })),
        );
      })
      .catch((error) => {
        console.error("Error fetching data", error);
        setNotification({
          opened: true,
          message: "Failed to fetch data. Please try again.",
          color: "red",
        });
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    if (!token) {
      setNotification({
        opened: true,
        message: "Authentication token not found. Please login again.",
        color: "red",
      });
      return;
    }

    if (!selectedHall || !batchInput) {
      setNotification({
        opened: true,
        message: "Please select a hall and enter a batch.",
        color: "red",
      });
      return;
    }

    setLoading(true);

    axios
      .post(
        assignBatch,
        {
          hall_id: selectedHall,
          batch: batchInput,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      )
      .then((response) => {
        console.log(response);
        setNotification({
          opened: true,
          message: "Batch assigned successfully!",
          color: "green",
        });
      })
      .catch((error) => {
        console.error("Error assigning batch", error);
        setNotification({
          opened: true,
          message: "Failed to assign batch. Please try again.",
          color: "red",
        });
      })
      .finally(() => {
        setLoading(false);
      });
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
          Assign Batch
        </Text>

        <Box>
          <Text component="label" size="lg" fw={500}>
            Hall Id:
          </Text>
          <Select
            placeholder="Select Hall"
            data={allHall}
            value={selectedHall}
            onChange={setSelectedHall}
            w="100%"
            styles={{ root: { marginTop: 5 } }}
          />
        </Box>

        <Box>
          <Text component="label" size="lg" fw={500}>
            Assigned Batch:
          </Text>
          <TextInput
            placeholder="Enter Batch"
            value={batchInput}
            onChange={(event) => setBatchInput(event.currentTarget.value)}
            w="100%"
            styles={{ root: { marginTop: 5 } }}
          />
        </Box>

        <Button variant="filled" onClick={handleSubmit} loading={loading}>
          Assign
        </Button>
        {notification.opened && (
          <Notification
            title="Notification"
            color={notification.color}
            onClose={() => setNotification({ ...notification, opened: false })}
            style={{ marginTop: "10px" }}
          >
            {notification.message}
          </Notification>
        )}
      </Stack>
    </Paper>
  );
}

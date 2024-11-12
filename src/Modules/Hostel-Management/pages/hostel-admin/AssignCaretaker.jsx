import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Select,
  Text,
  Button,
  Paper,
  Group,
  Stack,
  Notification,
} from "@mantine/core";

import { getCaretakers } from "../../../../routes/hostelManagementRoutes"; // API route for fetching halls and caretakers

axios.defaults.withXSRFToken = true;

export default function AssignCaretaker() {
  const [document, setDocument] = useState(null);
  const [halls, setHalls] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    opened: false,
    message: "",
    color: "",
  });
  const fileInputRef = useRef(null);
  console.log(document);
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
      .get(getCaretakers, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((response) => {
        const { hallsData, caretaker_usernames } = response.data;
        setHalls(
          hallsData.map((hallData) => ({
            value: hallData.hall_id,
            label: hallData.hall_name,
          })),
        );
        setCaretakers(
          caretaker_usernames.map((user) => ({
            value: user.id_id,
            label: user.id_id,
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
    }
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

    setLoading(true);
    // Handle form submission logic
    // Add your API call logic here with the attached document and selected values

    setLoading(false);
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
          Assign Caretaker
        </Text>

        <Box>
          <Text component="label" size="lg" fw={500}>
            Hall Id:
          </Text>
          <Select
            placeholder="Select Hall"
            data={halls}
            w="100%"
            styles={{ root: { marginTop: 5 } }}
          />
        </Box>

        <Box>
          <Text component="label" size="lg" fw={500}>
            Caretaker Username:
          </Text>
          <Select
            placeholder="Select Caretaker"
            data={caretakers}
            w="100%"
            styles={{ root: { marginTop: 5 } }}
          />
        </Box>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <Group position="right" spacing="sm">
          <Button variant="filled" onClick={handleAttachClick}>
            Attach Document
          </Button>
          <Button variant="filled" onClick={handleSubmit} loading={loading}>
            Assign
          </Button>
        </Group>

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

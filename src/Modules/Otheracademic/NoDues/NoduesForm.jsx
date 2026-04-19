import React, { useState } from "react";
import {
  Container,
  Button,
  Alert,
  Text,
  Group,
  Paper,
  Stack,
} from "@mantine/core";
import { Warning, CheckCircle } from "@phosphor-icons/react";
import axios from "axios";
import { NoDues_Initiate } from "../../../routes/otheracademicRoutes";

function NoduesForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [initiated, setInitiated] = useState(false);

  const authToken = localStorage.getItem("authToken");

  const initiateNoDues = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        NoDues_Initiate,
        {},
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );

      setMessage(response.data.message);
      setInitiated(true);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to initiate No-Dues clearance",
      );
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper p="lg" radius="lg" withBorder shadow="sm">
        <Stack spacing="lg">
          <div>
            <Text fw={700} size="lg">
              No-Dues Clearance Initiation
            </Text>
            <Text c="dimmed" size="sm">
              Start your no-dues clearance process by clicking the button below.
              This will initialize your clearance form across all departments.
            </Text>
          </div>

          {error && (
            <Alert icon={<Warning size={16} />} color="red" title="Error">
              {error}
            </Alert>
          )}

          {message && !error && (
            <Alert
              icon={<CheckCircle size={16} />}
              color="green"
              title="Success"
            >
              {message}
            </Alert>
          )}

          {initiated && (
            <Paper p="md" radius="md" withBorder bg="#f0f9ff">
              <Stack spacing="sm">
                <Text fw={600}>Next Steps:</Text>
                <Text size="sm">
                  1. Visit each department to get clearance verification
                </Text>
                <Text size="sm">2. Departments will mark you as cleared</Text>
                <Text size="sm">
                  3. Once all departments clear you, download your certificate
                </Text>
              </Stack>
            </Paper>
          )}

          <Group position="right">
            <Button
              onClick={initiateNoDues}
              loading={loading}
              disabled={initiated}
              size="md"
            >
              {initiated ? "Initiated" : "Initiate No-Dues Clearance"}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}

export default NoduesForm;

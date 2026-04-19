import React, { useState, useEffect } from "react";
import {
  Table,
  Text,
  Paper,
  ScrollArea,
  Container,
  Progress,
  Stack,
  Alert,
  Badge,
  Group,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import axios from "axios";
import { Warning } from "@phosphor-icons/react";
import { NoDues_Track } from "../../../routes/otheracademicRoutes";

function NoDuesStatus() {
  const [trackData, setTrackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAboveMd = useMediaQuery("(min-width: 992px)");
  const authToken = localStorage.getItem("authToken");

  const fetchTrackingData = async () => {
    try {
      const response = await axios.get(NoDues_Track, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });
      setTrackData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch no-dues status");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();

    // Auto-refresh every 5 seconds to reflect authority approvals
    const interval = setInterval(() => {
      fetchTrackingData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Text>Loading no-dues status...</Text>
      </Container>
    );
  }

  if (!trackData) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<Warning size={16} />} color="red">
          No tracking data available
        </Alert>
      </Container>
    );
  }

  const departments = Object.entries(trackData.departments || {});

  return (
    <Container size="md" py="xl">
      <Stack spacing="lg">
        {error && (
          <Alert icon={<Warning size={16} />} color="red" title="Error">
            {error}
          </Alert>
        )}

        <Paper p="lg" radius="lg" withBorder shadow="sm">
          <Stack spacing="md">
            <div>
              <Text fw={700} size="lg" mb="sm">
                No-Dues Clearance Progress
              </Text>
              <Text c="dimmed">
                Roll No: {trackData.roll_no} | Name: {trackData.name}
              </Text>
            </div>

            <div>
              <Group position="apart" mb="sm">
                <Text fw={600}>Overall Progress</Text>
                <Badge
                  color={trackData.all_clear ? "green" : "yellow"}
                  variant="filled"
                >
                  {trackData.all_clear ? "All Clear" : "In Progress"}
                </Badge>
              </Group>
              <Progress
                value={trackData.progress_percentage}
                color={trackData.progress_percentage === 100 ? "green" : "blue"}
                size="lg"
                label={`${Math.round(trackData.progress_percentage)}%`}
              />
            </div>

            <div>
              <Group position="apart">
                <div>
                  <Text size="sm" c="dimmed">
                    Cleared
                  </Text>
                  <Text fw={700} color="green" size="lg">
                    {trackData.cleared}
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">
                    Not Cleared
                  </Text>
                  <Text fw={700} color="red" size="lg">
                    {trackData.not_cleared}
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">
                    Pending
                  </Text>
                  <Text fw={700} color="yellow" size="lg">
                    {trackData.pending}
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">
                    Total
                  </Text>
                  <Text fw={700} size="lg">
                    {trackData.total}
                  </Text>
                </div>
              </Group>
            </div>
          </Stack>
        </Paper>

        <div>
          <Text fw={700} size="lg" mb="md">
            Department-wise Status
          </Text>
          <ScrollArea style={{ width: isAboveMd ? "100%" : "" }}>
            <Table highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th style={{ textAlign: "center", padding: "10px" }}>
                    Department
                  </th>
                  <th style={{ textAlign: "center", padding: "10px" }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {departments.map(([dept, status]) => (
                  <tr key={dept}>
                    <td style={{ textAlign: "center", padding: "10px" }}>
                      <Text fw={500} tt="capitalize">
                        {dept.replace(/_/g, " ")}
                      </Text>
                    </td>
                    <td style={{ textAlign: "center", padding: "10px" }}>
                      <Badge
                        color={
                          status === "clear"
                            ? "green"
                            : status === "not_clear"
                              ? "red"
                              : "yellow"
                        }
                        variant="filled"
                      >
                        {status === "clear"
                          ? "Clear"
                          : status === "not_clear"
                            ? "Not Clear"
                            : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </div>
      </Stack>
    </Container>
  );
}

export default NoDuesStatus;

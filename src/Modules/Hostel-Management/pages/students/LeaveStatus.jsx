import React, { useEffect, useRef, useState } from "react";
import {
  Paper,
  Group,
  Text,
  Stack,
  Select,
  ScrollArea,
  Loader,
  Container,
  Card,
  Box,
  Tabs,
  Badge,
} from "@mantine/core";
import LeaveApplicationCard from "../../components/cards/LeaveApplicationCard";
import { studentService } from "../../services";
import { getApiErrorMessage } from "../../utils";

export default function LeaveStatus() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [viewingDocumentLeaveId, setViewingDocumentLeaveId] = useState(null);
  const requestRef = useRef(0);

  const handleViewDocument = async (leaveId) => {
    if (!leaveId) return;
    try {
      setViewingDocumentLeaveId(leaveId);
      const response = await studentService.getLeaveDocument(leaveId);
      const contentType =
        response.headers?.["content-type"] || "application/octet-stream";
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        // Popup blocked: open inline in the same tab (no forced download)
        window.location.assign(url);
      }
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      // Keep UX minimal: log and show a page-level error.
      // (If you want, we can change this to an in-card error only.)
      // eslint-disable-next-line no-console
      console.error(err);
      setError(
        getApiErrorMessage(err, "Failed to open the supporting document."),
      );
    } finally {
      setViewingDocumentLeaveId(null);
    }
  };

  const fetchLeaves = async () => {
    try {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;
      setLoading(true);
      const response = await studentService.getMyLeaves();
      if (requestId !== requestRef.current) return;

      setLeaves(
        Array.isArray(response.data?.leaves) ? response.data.leaves : [],
      );
      setError(null);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Failed to fetch leaves. Please try again later.",
        ),
      );
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const activeLeaves = leaves.filter(
    (leave) => leave.status.toLowerCase() === "pending",
  );
  const pastLeaves = leaves.filter(
    (leave) => leave.status.toLowerCase() !== "pending",
  );

  const renderLeavesList = (leavesList) => {
    if (leavesList.length === 0) {
      return (
        <Text align="center" color="dimmed" py="xl">
          No leave requests found in this category.
        </Text>
      );
    }

    return (
      <Stack spacing="lg">
        {leavesList.map((leave) => (
          <Paper
            key={
              leave.id ??
              `${leave.roll_num}-${leave.start_date}-${leave.end_date}`
            }
            withBorder
            radius="md"
            p={0}
            shadow="xs"
            mb="md"
          >
            <LeaveApplicationCard
              id={leave.id}
              student_name={leave.student_name}
              roll_num={leave.roll_num}
              reason={leave.reason}
              phone_number={leave.phone_number}
              start_date={leave.start_date}
              end_date={leave.end_date}
              status={leave.status}
              remark={leave.remark}
              file_upload={leave.file_upload}
              onViewDocument={handleViewDocument}
              documentLoading={viewingDocumentLeaveId === leave.id}
            />
          </Paper>
        ))}
      </Stack>
    );
  };

  return (
    <Container size="md" px="md">
      <Card shadow="sm" radius="md" withBorder>
        <Box p="lg" sx={{ height: "70vh" }}>
          <Group position="apart" mb="md">
            <Group spacing="xs">
              <Text size="sm" color="dimmed">
                Sort By:
              </Text>
              <Select
                placeholder="Date"
                data={[{ value: "date", label: "Date" }]}
                style={{ width: "100px" }}
                variant="filled"
                size="sm"
              />
            </Group>
          </Group>

          <Tabs value={activeTab} onChange={setActiveTab} radius="md" mb="md">
            <Tabs.List grow>
              <Tabs.Tab
                value="active"
                rightSection={
                  <Badge
                    size="sm"
                    variant="filled"
                    radius="xl"
                    sx={(theme) => ({
                      backgroundColor:
                        activeTab === "active"
                          ? theme.white
                          : theme.colors.blue[5],
                      color:
                        activeTab === "active"
                          ? theme.colors.blue[7]
                          : theme.white,
                    })}
                  >
                    {activeLeaves.length}
                  </Badge>
                }
              >
                Active Requests
              </Tabs.Tab>
              <Tabs.Tab
                value="past"
                rightSection={
                  <Badge
                    size="sm"
                    variant="filled"
                    radius="xl"
                    sx={(theme) => ({
                      backgroundColor:
                        activeTab === "past"
                          ? theme.white
                          : theme.colors.blue[5],
                      color:
                        activeTab === "past"
                          ? theme.colors.blue[7]
                          : theme.white,
                    })}
                  >
                    {pastLeaves.length}
                  </Badge>
                }
              >
                Past Requests
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <Loader size="lg" />
            </Box>
          ) : error ? (
            <Text align="center" color="red" size="lg" py="xl">
              {error}
            </Text>
          ) : (
            <ScrollArea style={{ height: "calc(70vh - 140px)" }}>
              <Box p="xs">
                {activeTab === "active"
                  ? renderLeavesList(activeLeaves)
                  : renderLeavesList(pastLeaves)}
              </Box>
            </ScrollArea>
          )}
        </Box>
      </Card>
    </Container>
  );
}

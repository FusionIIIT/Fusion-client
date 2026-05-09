import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  Group,
  Avatar,
  Button,
  Stack,
  Flex,
  ScrollArea,
  Badge,
  Box,
  Container,
  Loader,
  Card,
  Tabs,
  Modal,
} from "@mantine/core";
import { CalendarBlank } from "@phosphor-icons/react";
import { caretakerService } from "../../services";
import { getApiErrorMessage } from "../../utils";

export default function ManageLeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [documentLoadingId, setDocumentLoadingId] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [documentContentType, setDocumentContentType] = useState("");
  const requestRef = useRef(0);

  const handleViewDocument = async (leaveId) => {
    if (!leaveId) return;
    try {
      setDocumentLoadingId(leaveId);
      const response = await caretakerService.getLeaveDocument(leaveId);
      const contentType =
        response.headers?.["content-type"] || "application/octet-stream";
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      if (documentUrl) {
        window.URL.revokeObjectURL(documentUrl);
      }
      setDocumentContentType(contentType);
      setDocumentUrl(url);
    } catch (e) {
      setError(
        getApiErrorMessage(e, "Failed to open the supporting document."),
      );
    } finally {
      setDocumentLoadingId(null);
    }
  };

  const handleCloseDocument = () => {
    if (documentUrl) {
      window.URL.revokeObjectURL(documentUrl);
    }
    setDocumentUrl(null);
    setDocumentContentType("");
  };

  const fetchLeaveRequests = async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    try {
      const response = await caretakerService.getLeaveRequests();
      if (requestId !== requestRef.current) return;

      const leaves = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.leaves)
          ? response.data.leaves
          : Array.isArray(response.data)
            ? response.data
            : [];
      setLeaveRequests(leaves);
      setError(null);
    } catch (e) {
      if (requestId !== requestRef.current) return;
      setError(
        getApiErrorMessage(
          e,
          "Failed to fetch leave requests. Please try again later.",
        ),
      );
      setLeaveRequests([]);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleStatusUpdate = async (id, status, remark = "") => {
    const confirmationText =
      status === "approved"
        ? "Are you sure you want to approve this leave request?"
        : "Are you sure you want to reject this leave request?";

    if (!window.confirm(confirmationText)) {
      return;
    }

    let nextRemark = remark;
    if (status === "rejected" && !nextRemark) {
      nextRemark = window.prompt("Please add a remark for rejection:") || "";
      if (!nextRemark.trim()) {
        setError("Remark is required to reject a leave request.");
        return;
      }
    }

    const previousRequests = leaveRequests;
    setActionLoadingId(id);
    setError(null);

    // Optimistic UI update for instant feedback.
    setLeaveRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? { ...request, status, remark: nextRemark }
          : request,
      ),
    );

    try {
      await caretakerService.updateLeaveStatus({
        leave_id: id,
        status,
        remark: nextRemark,
      });

      if (status === "approved" || status === "rejected") {
        setActiveTab("past");
      }
    } catch (e) {
      setLeaveRequests(previousRequests);
      setError(
        getApiErrorMessage(
          e,
          "Failed to update leave status. Please try again later.",
        ),
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeRequests = leaveRequests.filter(
    (request) => String(request.status).toLowerCase() === "pending",
  );

  const pastRequests = leaveRequests.filter((request) => {
    const currentStatus = String(request.status).toLowerCase();
    return currentStatus === "approved" || currentStatus === "rejected";
  });

  const renderLeaveRequests = (requests) => {
    if (loading) {
      return (
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
      );
    }

    if (error) {
      return (
        <Text align="center" color="red" size="lg" py="xl">
          {error}
        </Text>
      );
    }

    if (requests.length === 0) {
      return (
        <Text align="center" color="dimmed" py="xl">
          No leave requests found in this category.
        </Text>
      );
    }

    return (
      <Stack spacing="md">
        {requests.map((request) => (
          <Card key={request.id} p="md" withBorder radius="sm" shadow="xs">
            <Flex
              gap="md"
              align="flex-start"
              justify="space-between"
              wrap="wrap"
            >
              <Group spacing="md" noWrap style={{ flex: "0 0 220px" }}>
                <Avatar
                  color="blue"
                  radius="xl"
                  size="md"
                  sx={(theme) => ({
                    backgroundColor: theme.fn.rgba(theme.colors.blue[5], 0.2),
                    color: theme.colors.blue[7],
                  })}
                >
                  {request.student_name?.[0] || "S"}
                </Avatar>
                <Box>
                  <Text weight={600} size="sm" lineClamp={1}>
                    {request.student_name}
                  </Text>
                  <Badge size="sm" variant="outline" color="blue" mt={4}>
                    {request.roll_num}
                  </Badge>
                </Box>
              </Group>

              <Box sx={{ flex: 1, minWidth: "200px" }}>
                <Text size="sm" lineClamp={2}>
                  {request.reason}
                </Text>
              </Box>

              <Box sx={{ width: "180px" }}>
                <Group spacing="xs" mb={6}>
                  <CalendarBlank size={14} weight="bold" color="#5C7CFA" />
                  <Text size="xs" color="dimmed">
                    From:{" "}
                    <Text component="span" weight={500} color="dark" size="xs">
                      {request.start_date}
                    </Text>
                  </Text>
                </Group>
                <Group spacing="xs" mb={8}>
                  <CalendarBlank size={14} weight="bold" color="#5C7CFA" />
                  <Text size="xs" color="dimmed">
                    To:{" "}
                    <Text component="span" weight={500} color="dark" size="xs">
                      {request.end_date}
                    </Text>
                  </Text>
                </Group>

                <Group spacing="xs" align="center">
                  {request.file_upload ? (
                    <Button
                      color="blue"
                      size="xs"
                      variant="light"
                      loading={documentLoadingId === request.id}
                      disabled={documentLoadingId === request.id}
                      onClick={() => handleViewDocument(request.id)}
                    >
                      View Document
                    </Button>
                  ) : null}

                  {String(request.status).toLowerCase() === "pending" ? (
                    <>
                      <Button
                        color="green"
                        size="xs"
                        variant="light"
                        loading={actionLoadingId === request.id}
                        disabled={actionLoadingId === request.id}
                        onClick={() =>
                          handleStatusUpdate(request.id, "approved")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        color="red"
                        size="xs"
                        variant="light"
                        loading={actionLoadingId === request.id}
                        disabled={actionLoadingId === request.id}
                        onClick={() =>
                          handleStatusUpdate(request.id, "rejected")
                        }
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Badge
                      color={
                        String(request.status).toLowerCase() === "approved"
                          ? "green"
                          : "red"
                      }
                      variant="filled"
                    >
                      {String(request.status).charAt(0).toUpperCase() +
                        String(request.status).slice(1).toLowerCase()}
                    </Badge>
                  )}
                </Group>
              </Box>
            </Flex>
          </Card>
        ))}
      </Stack>
    );
  };

  return (
    <Container size="md" px="md">
      <Card shadow="sm" radius="md" withBorder>
        <Box p="lg" sx={{ height: "70vh" }}>
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
                    {activeRequests.length}
                  </Badge>
                }
              >
                Pending Requests
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
                    {pastRequests.length}
                  </Badge>
                }
              >
                Past Requests
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="active" pt="xs">
              <ScrollArea style={{ height: "calc(70vh - 120px)" }}>
                <Box p="xs">{renderLeaveRequests(activeRequests)}</Box>
              </ScrollArea>
            </Tabs.Panel>

            <Tabs.Panel value="past" pt="xs">
              <ScrollArea style={{ height: "calc(70vh - 120px)" }}>
                <Box p="xs">{renderLeaveRequests(pastRequests)}</Box>
              </ScrollArea>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Card>

      <Modal
        opened={Boolean(documentUrl)}
        onClose={handleCloseDocument}
        title="Supporting Document"
        size="xl"
        centered
      >
        {documentUrl ? (
          documentContentType.startsWith("image/") ? (
            <Box
              component="img"
              src={documentUrl}
              alt="Supporting document"
              sx={{ maxWidth: "10px", maxHeight: "10px", display: "block" }}
            />
          ) : (
            <Box
              component="iframe"
              title="Supporting document"
              src={documentUrl}
              sx={{ width: "10px", height: "10px", border: "none" }}
            />
          )
        ) : null}
      </Modal>
    </Container>
  );
}

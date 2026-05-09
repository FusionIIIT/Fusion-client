import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import { CalendarBlank } from "@phosphor-icons/react";
import { caretakerService } from "../../services";
import { getApiErrorMessage } from "../../utils";

export default function ManageRoomChangeRequest({ allowAction = true }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const requestRef = useRef(0);

  const fetchRequests = async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    try {
      const response = await caretakerService.getRoomChangeRequests();
      if (requestId !== requestRef.current) return;

      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];
      setRequests(data);
      setError(null);
    } catch (e) {
      if (requestId !== requestRef.current) return;
      setError(
        getApiErrorMessage(
          e,
          "Failed to fetch room change requests. Please try again later.",
        ),
      );
      setRequests([]);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId, status) => {
    if (!allowAction) {
      return;
    }
    const confirmationText =
      status === "approved"
        ? "Approve this room change request?"
        : "Reject this room change request?";

    if (!window.confirm(confirmationText)) {
      return;
    }

    const previousRequests = requests;
    setActionLoadingId(requestId);
    setError(null);

    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status } : req)),
    );

    try {
      await caretakerService.updateRoomChangeStatus(requestId, status);
      if (status === "approved" || status === "rejected") {
        setActiveTab("past");
      }
    } catch (e) {
      setRequests(previousRequests);
      setError(
        getApiErrorMessage(
          e,
          "Failed to update request status. Please try again.",
        ),
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingRequests = requests.filter(
    (req) => String(req.status).toLowerCase() === "pending",
  );

  const pastRequests = requests.filter((req) => {
    const status = String(req.status).toLowerCase();
    return status === "approved" || status === "rejected";
  });

  const renderRequests = (items) => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "45vh",
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

    if (items.length === 0) {
      return (
        <Text align="center" color="dimmed" py="xl">
          No room change requests found.
        </Text>
      );
    }

    return (
      <Stack spacing="md">
        {items.map((req) => (
          <Card key={req.id} p="md" withBorder radius="sm" shadow="xs">
            <Flex
              gap="md"
              align="flex-start"
              justify="space-between"
              wrap="wrap"
            >
              <Box>
                <Text weight={600} size="sm" lineClamp={1}>
                  {req.student_name}
                </Text>
                <Badge size="sm" variant="outline" color="blue" mt={4}>
                  {req.roll_num}
                </Badge>
              </Box>

              <Box sx={{ flex: 1, minWidth: "200px" }}>
                <Text size="sm" lineClamp={2}>
                  {req.reason}
                </Text>
                <Group spacing="xs" mt={6}>
                  <CalendarBlank size={14} weight="bold" color="#5C7CFA" />
                  <Text size="xs" color="dimmed">
                    From:{" "}
                    <Text component="span" weight={500}>
                      {req.current_room}
                    </Text>
                  </Text>
                </Group>
                <Group spacing="xs" mt={4}>
                  <CalendarBlank size={14} weight="bold" color="#5C7CFA" />
                  <Text size="xs" color="dimmed">
                    To:{" "}
                    <Text component="span" weight={500}>
                      {req.preferred_room}
                    </Text>
                  </Text>
                </Group>
              </Box>

              <Box>
                {String(req.status).toLowerCase() === "pending" ? (
                  allowAction ? (
                    <Group spacing="xs">
                      <Button
                        color="green"
                        size="xs"
                        variant="light"
                        loading={actionLoadingId === req.id}
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleStatusUpdate(req.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        color="red"
                        size="xs"
                        variant="light"
                        loading={actionLoadingId === req.id}
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleStatusUpdate(req.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </Group>
                  ) : (
                    <Badge color="yellow" variant="filled">
                      Pending
                    </Badge>
                  )
                ) : (
                  <Badge
                    color={
                      String(req.status).toLowerCase() === "approved"
                        ? "green"
                        : "red"
                    }
                    variant="filled"
                  >
                    {String(req.status).charAt(0).toUpperCase() +
                      String(req.status).slice(1).toLowerCase()}
                  </Badge>
                )}
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
                value="pending"
                rightSection={
                  <Badge size="sm" variant="filled" radius="xl">
                    {pendingRequests.length}
                  </Badge>
                }
              >
                Pending Requests
              </Tabs.Tab>
              <Tabs.Tab
                value="past"
                rightSection={
                  <Badge size="sm" variant="filled" radius="xl">
                    {pastRequests.length}
                  </Badge>
                }
              >
                Past Requests
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="pending" pt="xs">
              <Box>{renderRequests(pendingRequests)}</Box>
            </Tabs.Panel>
            <Tabs.Panel value="past" pt="xs">
              <Box>{renderRequests(pastRequests)}</Box>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Card>
    </Container>
  );
}

ManageRoomChangeRequest.propTypes = {
  allowAction: PropTypes.bool,
};

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Badge,
  Button,
  Center,
  Divider,
  Flex,
  Grid,
  Loader,
  Paper,
  Select,
  Textarea,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  getSupervisorDashboard,
  extractApiErrorMessage,
  getReopenRequests,
  reviewReopenRequest,
  closeComplaint,
  getCaretakers,
  supervisorReassign,
} from "../routes/api";
import ComplaintDetails from "./ComplaintDetails";

const FILTERS = [
  { key: "assigned", label: "Assigned To Me" },
  { key: "escalated", label: "Escalated" },
  { key: "reopen_requested", label: "Reopen Requested" },
];

function SupervisorDashboard() {
  const [activeFilter, setActiveFilter] = useState("assigned");
  const [queues, setQueues] = useState({
    assigned: [],
    escalated: [],
    reopen_requested: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeView, setActiveView] = useState("list");
  const [verifyCloseMode, setVerifyCloseMode] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [selectedReopenRequest, setSelectedReopenRequest] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [caretakers, setCaretakers] = useState([]);
  const [selectedCaretakerId, setSelectedCaretakerId] = useState("");
  const [isReassignLoading, setIsReassignLoading] = useState(false);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const result = await getSupervisorDashboard(token);
      if (result.success) {
        setQueues({
          assigned: result.data?.assigned || [],
          escalated: result.data?.escalated || [],
          reopen_requested: result.data?.reopen_requested || [],
        });
      } else {
        notifications.show({
          title: "Error",
          message: extractApiErrorMessage(result.error, "Failed to load supervisor queue."),
          color: "red",
        });
      }
      setIsLoading(false);
    };

    fetchData();
  }, [token, refreshTick]);

  const items = useMemo(() => queues[activeFilter] || [], [queues, activeFilter]);

  const formatDateTime = (datetimeStr) => {
    const date = new Date(datetimeStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };

  const statusLabel = (status) => {
    const labels = {
      0: "Pending",
      1: "In Progress",
      2: "Resolved",
      3: "Declined",
      4: "Escalated",
      5: "Closed",
      6: "Reopened",
    };
    return labels[status] || "Unknown";
  };

  const openReopenReview = async (complaint) => {
    const response = await getReopenRequests(complaint.id, token);
    if (!response.success) {
      notifications.show({
        title: "Error",
        message: extractApiErrorMessage(response.error, "Failed to load reopen requests."),
        color: "red",
      });
      return;
    }
    const requests = response.data?.reopen_requests || [];
    const pending = requests.find((req) => req.status === "PENDING");
    if (!pending) {
      notifications.show({
        title: "No Pending Request",
        message: "No pending reopen request found for this complaint.",
        color: "yellow",
      });
      return;
    }
    setSelectedComplaint(complaint);
    setSelectedComplaintId(complaint.id);
    setSelectedReopenRequest(pending);
    setReviewNote("");
    setActiveView("reviewReopen");
  };

  const handleReviewRequest = async (approved) => {
    if (!selectedComplaint || !selectedReopenRequest) return;
    setIsReviewLoading(true);
    const response = await reviewReopenRequest(
      selectedComplaint.id,
      selectedReopenRequest.id,
      approved,
      reviewNote,
      token,
    );
    setIsReviewLoading(false);
    if (response.success) {
      notifications.show({
        title: "Reviewed",
        message: approved ? "Reopen request approved." : "Reopen request declined.",
        color: "blue",
      });
      setSelectedComplaint(null);
      setSelectedComplaintId(null);
      setSelectedReopenRequest(null);
      setReviewNote("");
      setActiveView("list");
      setRefreshTick((prev) => prev + 1);
      return;
    }
    notifications.show({
      title: "Error",
      message: extractApiErrorMessage(response.error, "Failed to review reopen request."),
      color: "red",
    });
  };

  const handleCloseComplaint = async (complaintId) => {
    const response = await closeComplaint(complaintId, true, token);
    if (response.success) {
      notifications.show({
        title: "Closed",
        message: "Complaint has been verified and closed.",
        color: "blue",
      });
      setRefreshTick((prev) => prev + 1);
      return;
    }
    notifications.show({
      title: "Error",
      message: extractApiErrorMessage(response.error, "Failed to close complaint."),
      color: "red",
    });
  };

  if (activeView === "details" && selectedComplaintId) {
    return (
      <Grid mt="xl" style={{ width: "100%", paddingInline: "49px" }}>
        <Paper radius="md" px="lg" pt="sm" pb="xl" style={{ borderLeft: "0.6rem solid #15ABFF", width: "70vw" }} withBorder>
          <ComplaintDetails
            complaintId={selectedComplaintId}
            onVerifyClose={verifyCloseMode ? () => handleCloseComplaint(selectedComplaintId) : null}
            onBack={() => {
              setSelectedComplaintId(null);
              setSelectedComplaint(null);
              setVerifyCloseMode(false);
              setActiveView("list");
              setRefreshTick((prev) => prev + 1);
            }}
          />
        </Paper>
      </Grid>
    );
  }

  const openReassignView = async (complaint) => {
    const response = await getCaretakers(token);
    if (!response.success) {
      notifications.show({
        title: "Error",
        message: extractApiErrorMessage(response.error, "Failed to load caretakers."),
        color: "red",
      });
      return;
    }

    const allCaretakers = response.data?.caretakers || [];
    const locationValue = String(complaint.location || "").trim().toLowerCase();

    const sortedCaretakers = [...allCaretakers].sort((a, b) => {
      const aArea = String(a.area || "").trim().toLowerCase();
      const bArea = String(b.area || "").trim().toLowerCase();
      const aMatch = aArea === locationValue ? 0 : 1;
      const bMatch = bArea === locationValue ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return Number(a.id) - Number(b.id);
    });

    const options = sortedCaretakers.map((c) => ({
      value: String(c.id),
      label: `Caretaker #${c.id} - ${c.area || "Unspecified area"}`,
    }));

    setCaretakers(options);
    setSelectedCaretakerId(options[0]?.value || "");
    setSelectedComplaint(complaint);
    setSelectedComplaintId(complaint.id);
    setReviewNote("");
    setActiveView("reassign");
  };

  const handleSupervisorReassign = async () => {
    if (!selectedComplaintId || !selectedCaretakerId) {
      notifications.show({
        title: "Required",
        message: "Select a caretaker to continue.",
        color: "yellow",
      });
      return;
    }

    setIsReassignLoading(true);
    const response = await supervisorReassign(
      selectedComplaintId,
      Number(selectedCaretakerId),
      reviewNote,
      token,
    );
    setIsReassignLoading(false);

    if (response.success) {
      notifications.show({
        title: "Reassigned",
        message: "Complaint reassigned to caretaker.",
        color: "blue",
      });
      setSelectedComplaint(null);
      setSelectedComplaintId(null);
      setSelectedCaretakerId("");
      setCaretakers([]);
      setReviewNote("");
      setActiveView("list");
      setRefreshTick((prev) => prev + 1);
      return;
    }

    notifications.show({
      title: "Error",
      message: extractApiErrorMessage(response.error, "Failed to reassign complaint."),
      color: "red",
    });
  };

  const severityLabel = (priority) => {
    const value = String(priority || "").toUpperCase();
    if (value === "EMERGENCY") return "Critical";
    if (value === "URGENT") return "High";
    if (value === "LOW") return "Low";
    return "Medium";
  };

  const severityColor = (priority) => {
    const value = String(priority || "").toUpperCase();
    if (value === "EMERGENCY") return "grape";
    if (value === "URGENT") return "red";
    if (value === "LOW") return "green";
    return "yellow";
  };

  if (activeView === "reassign" && selectedComplaint) {
    return (
      <Grid mt="xl" style={{ width: "100%", paddingInline: "49px" }}>
        <Paper radius="md" px="lg" pt="sm" pb="xl" style={{ borderLeft: "0.6rem solid #15ABFF", width: "70vw" }} withBorder>
          <Flex direction="column" gap="md">
            <Text size="24px" style={{ fontWeight: 700 }}>Reassign Escalated Complaint</Text>
            <Text size="14px"><strong>Complaint Id:</strong> {selectedComplaint.id}</Text>
            <Text size="14px"><strong>Status:</strong> {statusLabel(selectedComplaint.status)}</Text>
            <Text size="14px"><strong>Location:</strong> {selectedComplaint.specific_location}, {selectedComplaint.location}</Text>
            <Text size="14px"><strong>Issue:</strong> {selectedComplaint.details}</Text>

            <Select
              label="Select Caretaker"
              data={caretakers}
              value={selectedCaretakerId}
              onChange={(value) => setSelectedCaretakerId(value || "")}
              searchable
              nothingFoundMessage="No caretakers found"
            />

            <Textarea
              label="Reassign Note (Optional)"
              placeholder="Add context for the reassigned caretaker"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              minRows={2}
            />

            <Flex justify="flex-end" gap="xs">
              <Button
                variant="outline"
                color="dark"
                onClick={() => {
                  setSelectedComplaint(null);
                  setSelectedComplaintId(null);
                  setSelectedCaretakerId("");
                  setCaretakers([]);
                  setReviewNote("");
                  setActiveView("list");
                }}
              >
                Back
              </Button>
              <Button
                color="blue"
                loading={isReassignLoading}
                onClick={handleSupervisorReassign}
              >
                Reassign
              </Button>
            </Flex>
          </Flex>
        </Paper>
      </Grid>
    );
  }

  if (activeView === "reviewReopen" && selectedComplaint && selectedReopenRequest) {
    return (
      <Grid mt="xl" style={{ width: "100%", paddingInline: "49px" }}>
        <Paper radius="md" px="lg" pt="sm" pb="xl" style={{ borderLeft: "0.6rem solid #15ABFF", width: "70vw" }} withBorder>
          <Flex direction="column" gap="md">
            <Text size="24px" style={{ fontWeight: 700 }}>Review Reopen Request</Text>
            <Text size="14px"><strong>Complaint Id:</strong> {selectedComplaint.id}</Text>
            <Text size="14px"><strong>Status:</strong> {statusLabel(selectedComplaint.status)}</Text>
            <Text size="14px"><strong>Location:</strong> {selectedComplaint.specific_location}, {selectedComplaint.location}</Text>
            <Text size="14px"><strong>Issue:</strong> {selectedComplaint.details}</Text>
            <Text size="14px"><strong>Justification:</strong> {selectedReopenRequest.justification}</Text>
            <Textarea
              placeholder="Optional review note"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              minRows={2}
            />
            <Flex justify="flex-end" gap="xs">
              <Button
                variant="outline"
                color="dark"
                onClick={() => {
                  setSelectedComplaint(null);
                  setSelectedComplaintId(null);
                  setSelectedReopenRequest(null);
                  setReviewNote("");
                  setActiveView("list");
                }}
              >
                Back
              </Button>
              <Button
                variant="outline"
                color="dark"
                loading={isReviewLoading}
                onClick={() => handleReviewRequest(false)}
              >
                Decline Request
              </Button>
              <Button color="blue" loading={isReviewLoading} onClick={() => handleReviewRequest(true)}>
                Accept Request
              </Button>
            </Flex>
          </Flex>
        </Paper>
      </Grid>
    );
  }

  return (
    <Grid mt="xl" style={{ width: "100%", paddingInline: "49px" }}>
      <Paper
        radius="md"
        px="lg"
        pt="sm"
        pb="xl"
        style={{
          borderLeft: "0.6rem solid #15ABFF",
          width: "100%",
          minHeight: "45vh",
          maxHeight: "70vh",
          overflow: "auto",
        }}
        withBorder
      >
        <Flex direction="column" gap="md">
          <Text size="24px" style={{ fontWeight: 700 }}>
            Dashboard
          </Text>

          <Flex gap="sm" wrap="wrap">
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                size="xs"
                variant={activeFilter === f.key ? "filled" : "outline"}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label} ({(queues[f.key] || []).length})
              </Button>
            ))}
          </Flex>

          {isLoading ? (
            <Center style={{ minHeight: "35vh" }}>
              <Loader size="xl" variant="bars" />
            </Center>
          ) : items.length === 0 ? (
            <Center style={{ minHeight: "35vh" }}>
              <Text>No complaints found for this filter.</Text>
            </Center>
          ) : (
            items.map((complaint) => (
              <Paper key={complaint.id} radius="md" px="lg" pt="sm" pb="xl" withBorder>
                <Flex direction="column" gap="xs">
                  {(() => {
                    const hasFeedback = !!complaint.has_feedback || (complaint.feedback || "").trim().length > 0;
                    const isOverdue = complaint.sla_deadline
                      && new Date(complaint.sla_deadline) < new Date()
                      && ![2, 3, 5].includes(complaint.status);
                    return (
                  <Flex justify="space-between" align="center">
                    <Flex gap="xs" align="center">
                      <Text size="14px" style={{ fontWeight: 700 }}>
                        Complaint Id: {complaint.id}
                      </Text>
                      <Badge size="sm" color="blue">{complaint.complaint_type}</Badge>
                      <Badge size="sm" variant="outline">{statusLabel(complaint.status)}</Badge>
                      {isOverdue && (
                        <Badge size="sm" color="red" variant="filled">OVERDUE</Badge>
                      )}
                      {hasFeedback && (
                        <Badge size="sm" color="teal" variant="outline">Feedback Available</Badge>
                      )}
                    </Flex>
                  </Flex>
                    );
                  })()}

                  <Text size="14px"><strong>Date:</strong> {formatDateTime(complaint.complaint_date)}</Text>
                  <Text size="14px"><strong>Location:</strong> {complaint.specific_location}, {complaint.location}</Text>
                  <Flex gap="xs" align="center" wrap="wrap">
                    <Text size="14px"><strong>SLA Deadline:</strong> {complaint.sla_deadline ? formatDateTime(complaint.sla_deadline) : "N/A"}</Text>
                    <Badge size="sm" color={severityColor(complaint.priority)} variant="light">
                      {severityLabel(complaint.priority)}
                    </Badge>
                  </Flex>

                  <Divider my="sm" />

                  <Flex justify="space-between" align="center">
                    <Text size="14px"><strong>Description:</strong> {complaint.details}</Text>
                    <Flex gap="xs">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setSelectedComplaintId(complaint.id);
                          setVerifyCloseMode(false);
                          setActiveView("details");
                        }}
                      >
                        Details
                      </Button>
                      {activeFilter === "escalated" && (
                        <Button
                          variant="filled"
                          size="xs"
                          onClick={() => {
                            openReassignView(complaint);
                          }}
                        >
                          Reassign
                        </Button>
                      )}
                      {complaint.status === 2 && (
                        <Button
                          variant="outline"
                          size="xs"
                          color="blue"
                          onClick={() => {
                            setSelectedComplaintId(complaint.id);
                            setVerifyCloseMode(true);
                            setActiveView("details");
                          }}
                        >
                          Verify and Close
                        </Button>
                      )}
                      {activeFilter === "reopen_requested" && (
                        <Button
                          variant="filled"
                          size="xs"
                          color="blue"
                          onClick={() => openReopenReview(complaint)}
                        >
                          Review Reopen
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              </Paper>
            ))
          )}
        </Flex>
      </Paper>
    </Grid>
  );
}

SupervisorDashboard.propTypes = {
  roleOverride: PropTypes.string,
};

SupervisorDashboard.defaultProps = {
  roleOverride: "",
};

export default SupervisorDashboard;

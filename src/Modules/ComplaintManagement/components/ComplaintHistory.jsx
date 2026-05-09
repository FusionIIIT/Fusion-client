import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Paper, Group, Badge, Title, Text, Button, Grid,
  Center, Loader, Flex, Divider,
} from "@mantine/core";
import {
  CheckCircle, ClockClockwise, XCircle,
  ArrowUp, ArrowCounterClockwise, LockSimple,
} from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import ComplaintDetails from "./ComplaintDetails";
import CloseVerifyForm from "./CloseVerifyForm";
import ReopenForm from "./ReopenForm";
import { getComplaintsByRole, extractApiErrorMessage } from "../routes/api";

const TABS = [
  { key: "pending", label: "Pending", statuses: [0, 1] },
  { key: "escalated", label: "Escalated", statuses: [4] },
  { key: "resolved", label: "Resolved", statuses: [2] },
  { key: "closed", label: "Closed", statuses: [5] },
  { key: "reopened", label: "Reopened", statuses: [6] },
  { key: "declined", label: "Declined", statuses: [3] },
];

const STATUS_ICON = {
  pending: { Icon: ClockClockwise, color: "#15ABFF" },
  escalated: { Icon: ArrowUp, color: "#FF9800" },
  resolved: { Icon: CheckCircle, color: "#2BB673" },
  closed: { Icon: LockSimple, color: "#607D8B" },
  reopened: { Icon: ArrowCounterClockwise, color: "#FFC107" },
  declined: { Icon: XCircle, color: "#FF6B6B" },
};

const REOPEN_REQUEST_STATUS_MAP = {
  PENDING: { label: "Reopen Requested", color: "yellow" },
  APPROVED: { label: "Reopen Approved", color: "green" },
  DENIED: { label: "Reopen Denied", color: "red" },
};

function ComplaintHistory({ roleOverride }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Failed to fetch complaints. Please try again.");
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [activeView, setActiveView] = useState("list"); // list | details | close | reopen
  const [refreshTick, setRefreshTick] = useState(0);

  const storeRole = useSelector((state) => state.user.role);
  const role = roleOverride || storeRole;

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage("Failed to fetch complaints. Please try again.");
      const token = localStorage.getItem("authToken");
      const response = await getComplaintsByRole(role, token);

      if (response.success) {
        setComplaints(response.data || []);
      } else {
        setIsError(true);
        const msg = extractApiErrorMessage(response.error, "Failed to fetch complaints. Please try again.");
        setErrorMessage(msg);
        notifications.show({
          title: "Error",
          message: msg,
          color: "red",
        });
      }
      setIsLoading(false);
    };
    fetchComplaints();
  }, [role, refreshTick]);

  const currentTab = TABS.find((t) => t.key === activeTab) || TABS[0];
  const filteredComplaints = complaints.filter((c) =>
    currentTab.statuses.includes(c.status),
  );
  const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId);

  const formatDateTime = (datetimeStr) => {
    const date = new Date(datetimeStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };

  const handleBack = () => {
    setActiveView("list");
    setSelectedComplaintId(null);
    setRefreshTick((prev) => prev + 1);
  };

  const renderContent = () => {
    if (activeView === "details" && selectedComplaintId) {
      return <ComplaintDetails complaintId={selectedComplaintId} onBack={handleBack} />;
    }
    if (activeView === "close" && selectedComplaint) {
      return <CloseVerifyForm complaint={selectedComplaint} onBack={handleBack} />;
    }
    if (activeView === "reopen" && selectedComplaint) {
      return <ReopenForm complaint={selectedComplaint} onBack={handleBack} />;
    }

    return (
      <>
        <Title order={3} mb="md" size="24px">
          Complaint History
        </Title>
        <Group spacing="sm" mb="md">
          {TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "filled" : "outline"}
              onClick={() => setActiveTab(tab.key)}
              style={{
                backgroundColor: activeTab === tab.key ? "#15ABFF" : "white",
                color: activeTab === tab.key ? "white" : "black",
                padding: "8px 10px",
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
              size="xs"
            >
              {tab.label} ({complaints.filter((c) => tab.statuses.includes(c.status)).length})
            </Button>
          ))}
        </Group>

        <div style={{ maxHeight: "50vh", overflowY: "auto", width: "100%" }}>
          {isLoading ? (
            <Center style={{ minHeight: "45vh" }}>
              <Loader size="xl" variant="bars" />
            </Center>
          ) : isError ? (
            <Center style={{ minHeight: "45vh" }}>
              <Text color="red" size="14px">
                {errorMessage}
              </Text>
            </Center>
          ) : filteredComplaints.length === 0 ? (
            <Center style={{ minHeight: "45vh" }}>
              <Text size="14px">No {activeTab} complaints available.</Text>
            </Center>
          ) : (
            filteredComplaints.map((complaint) => {
              const iconInfo = STATUS_ICON[activeTab] || STATUS_ICON.pending;
              const IconComp = iconInfo.Icon;
              const isOverdue = complaint.sla_deadline && new Date(complaint.sla_deadline) < new Date()
                && ![2, 3, 5].includes(complaint.status);
              const latestReopenStatus = complaint.latest_reopen_request_status;
              const reopenStatusInfo = REOPEN_REQUEST_STATUS_MAP[latestReopenStatus] || null;
              const hasPendingReopen = !!complaint.has_pending_reopen_request;

              return (
                <Paper
                  key={complaint.id}
                  radius="md" px="lg" pt="sm" pb="xl"
                  style={{ width: "100%", margin: "10px 0" }}
                  withBorder
                >
                  <Flex direction="column" style={{ width: "100%" }}>
                    <Flex direction="row" justify="space-between">
                      <Flex direction="row" gap="xs" align="center">
                        <Text size="14px" style={{ fontWeight: "Bold" }}>
                          Complaint Id: {complaint.id}
                        </Text>
                        <Badge size="lg" color={iconInfo.color === "#2BB673" ? "green" : "blue"}>
                          {complaint.complaint_type}
                        </Badge>
                        {complaint.priority && (
                          <Badge
                            size="sm"
                            color={complaint.priority === "URGENT" ? "red" : complaint.priority === "LOW" ? "gray" : "blue"}
                            variant="outline"
                          >
                            {complaint.priority}
                          </Badge>
                        )}
                        {isOverdue && (
                          <Badge size="sm" color="red" variant="filled">OVERDUE</Badge>
                        )}
                        {reopenStatusInfo && (complaint.status === 5 || complaint.status === 3) && (
                          <Badge size="sm" color={reopenStatusInfo.color} variant="outline">
                            {reopenStatusInfo.label}
                          </Badge>
                        )}
                      </Flex>
                      <IconComp
                        size={35} weight="fill"
                        color={iconInfo.color}
                      />
                    </Flex>
                    <Flex direction="column" gap="xs">
                      <Text size="14px">
                        <b>Date:</b> {formatDateTime(complaint.complaint_date)}
                      </Text>
                      <Text size="14px">
                        <b>Location:</b> {complaint.specific_location}, {complaint.location}
                      </Text>
                      {complaint.sla_deadline && (
                        <Text size="14px">
                          <b>SLA Deadline:</b> {formatDateTime(complaint.sla_deadline)}
                        </Text>
                      )}
                    </Flex>
                    <Divider my="md" size="sm" />
                    <Flex direction="row" justify="space-between" align="center">
                      <Text size="14px">
                        <b>Description:</b> {complaint.details}
                      </Text>
                      <Flex gap="xs">
                        <Button
                          variant="outline" size="xs"
                          onClick={() => {
                            setSelectedComplaintId(complaint.id);
                            setActiveView("details");
                          }}
                        >
                          Details
                        </Button>
                        {/* Show Close/Verify for Resolved complaints */}
                        {complaint.status === 2 && (
                          <Button
                            variant="outline" size="xs" color="green"
                            onClick={() => {
                              setSelectedComplaintId(complaint.id);
                              setActiveView("close");
                            }}
                          >
                            Close / Verify
                          </Button>
                        )}
                        {/* Show Reopen for Closed/Declined complaints */}
                        {(complaint.status === 5 || complaint.status === 3) && (
                          <Button
                            variant="outline" size="xs" color="yellow"
                            disabled={hasPendingReopen}
                            onClick={() => {
                              setSelectedComplaintId(complaint.id);
                              setActiveView("reopen");
                            }}
                          >
                            {hasPendingReopen ? "Reopen Requested" : "Reopen"}
                          </Button>
                        )}
                      </Flex>
                    </Flex>
                  </Flex>
                </Paper>
              );
            })
          )}
        </div>
      </>
    );
  };

  return (
    <Grid mt="xl" style={{ width: "100%", paddingInline: "49px" }}>
      <Paper
        radius="md" px="lg" pt="sm" pb="xl"
        style={{
          borderLeft: "0.6rem solid #15ABFF",
          width: activeView !== "list" ? "70vw" : "100%",
          backgroundColor: "white",
          overflow: "hidden",
          maxHeight: "65vh",
        }}
        withBorder
      >
        {renderContent()}
      </Paper>
    </Grid>
  );
}

ComplaintHistory.defaultProps = {
  roleOverride: "",
};

ComplaintHistory.propTypes = {
  roleOverride: PropTypes.string,
};

export default ComplaintHistory;

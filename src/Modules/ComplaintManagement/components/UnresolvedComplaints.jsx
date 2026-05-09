import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Text, // For displaying text
  Button, // For interactive buttons
  Flex, // For flexible layout
  Grid, // For grid-based layout
  Divider, // For visual separation of content
  Badge, // For status or metadata tags
  Paper, // For card-like components
  Loader, // For showing loading state
  Center, // For centering content
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

// Import useSelector to access the Redux store and retrieve the role of the user
import { useSelector } from "react-redux"; // Import useSelector to get role from Redux

// Import custom components for the application
import ComplaintDetails from "./ComplaintDetails.jsx";
import UnresCompChangeStatus from "./UnresComp_ChangeStatus.jsx";

// API utility for fetching complaints
import { getComplaintsByRole, extractApiErrorMessage } from "../routes/api"; // Import axios function

function CaretakerQueue({ roleOverride }) {
  const [activeComponent, setActiveComponent] = useState("list");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all_assigned");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Failed to fetch complaints. Please try again.");
  const storeRole = useSelector((state) => state.user.role); // Get user role from Redux store
  const role = roleOverride || storeRole;

  const token = localStorage.getItem("authToken"); // Get token from localStorage

  const statusBadgeConfig = {
    0: { label: "Pending", color: "red" },
    1: { label: "In Progress", color: "blue" },
    2: { label: "Resolved", color: "green" },
    3: { label: "Declined", color: "gray" },
    4: { label: "Escalated", color: "orange" },
    5: { label: "Closed", color: "teal" },
    6: { label: "Reopened", color: "yellow" },
  };

  const statusFilters = [
    { key: "all_assigned", label: "All Assigned", statuses: [0, 1, 2, 3, 4, 5, 6] },
    { key: "active", label: "Active", statuses: [0, 1, 6] },
    { key: "escalated", label: "Escalated", statuses: [4] },
    { key: "declined", label: "Declined", statuses: [3] },
    { key: "resolved", label: "Resolved", statuses: [2] },
    { key: "closed", label: "Closed", statuses: [5] },
  ];

  const selectedFilter = statusFilters.find((filter) => filter.key === activeStatusFilter) || statusFilters[0];
  const visibleComplaints = complaints.filter((complaint) => selectedFilter.statuses.includes(complaint.status));

  const getFilterCount = (statuses) => complaints.filter((complaint) => statuses.includes(complaint.status)).length;

  // Fetch assigned complaints from the API based on role
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage("Failed to fetch complaints. Please try again.");
      const { success, data, error } = await getComplaintsByRole(role, token);

      if (success) {
        setComplaints(data || []);
      } else {
        setIsError(true);
        const msg = extractApiErrorMessage(error, "Failed to fetch complaints. Please try again.");
        setErrorMessage(msg);
        notifications.show({
          title: "Error",
          message: msg,
          color: "red",
        });
        console.error("Error fetching complaints:", error);
      }
      setIsLoading(false);
    };

    fetchComplaints();
  }, [role, token]);

  const handleButtonClick = (component, complaint) => {
    setSelectedComplaint(complaint);
    setActiveComponent(component);
  };

  const handleBack = () => {
    setSelectedComplaint(null);
    setActiveComponent("list");
  };

  const formatDateTime = (datetimeStr) => {
    const date = new Date(datetimeStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year}, ${hours}:${minutes}`; // Format: DD-MM-YYYY HH:MM
  };

  const severityLabel = (priority) => {
    const value = String(priority || "").toUpperCase();
    if (value === "EMERGENCY") return "Critical";
    if (value === "URGENT") return "High";
    if (value === "LOW") return "Low";
    return "Medium";
  };

  const severityColorByPriority = (priority) => {
    const value = String(priority || "").toUpperCase();
    if (value === "EMERGENCY") return "grape";
    if (value === "URGENT") return "red";
    if (value === "LOW") return "green";
    return "yellow";
  };

  return (
    <Grid mt="xl" style={{ paddingInline: "49px", width: "100%" }}>
      <Paper
        radius="md"
        px="lg"
        pt="sm"
        pb="xl"
        style={{
          borderLeft: "0.6rem solid #15ABFF",
          backgroundColor: "white",
          minHeight: "45vh",
          maxHeight: "70vh",
          width:
            activeComponent === "details" ||
            activeComponent === "changeStatus"
              ? "70vw"
              : "100%",
          overflow: "auto",
        }}
        withBorder
      >
        <Flex direction="column">
          {isLoading ? (
            <Center style={{ flexGrow: 1 }}>
              <Loader size="xl" variant="bars" />
            </Center>
          ) : isError ? (
            <Center style={{ flexGrow: 1 }}>
              <Text color="red">
                {errorMessage}
              </Text>
            </Center>
          ) : complaints.length === 0 ? (
            <Center style={{ flexGrow: 1 }}>
              <Text>No assigned complaints available.</Text>
            </Center>
          ) : activeComponent === "details" ? (
            <ComplaintDetails
              complaintId={selectedComplaint.id}
              onBack={handleBack}
            />
          ) : activeComponent === "changeStatus" ? (
            <UnresCompChangeStatus
              complaint={selectedComplaint}
              onBack={handleBack}
            />
          ) : (
            <>
              <Flex gap="xs" mb="md" wrap="wrap">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.key}
                    size="xs"
                    variant={activeStatusFilter === filter.key ? "filled" : "outline"}
                    onClick={() => setActiveStatusFilter(filter.key)}
                  >
                    {filter.label} ({getFilterCount(filter.statuses)})
                  </Button>
                ))}
              </Flex>

              {visibleComplaints.length === 0 ? (
                <Center style={{ flexGrow: 1 }}>
                  <Text>No complaints found in this status group.</Text>
                </Center>
              ) : visibleComplaints.map((complaint) => {
                const canChangeStatus = [0, 1, 6].includes(complaint.status);
                const hasFeedback = !!complaint.has_feedback || (complaint.feedback || "").trim().length > 0;
                const isOverdue = complaint.sla_deadline
                  && new Date(complaint.sla_deadline) < new Date()
                  && ![2, 3, 5].includes(complaint.status);
                return (
              <Paper
                key={complaint.id}
                radius="md"
                px="lg"
                pt="sm"
                pb="xl"
                style={{
                  border: "1px solid #e8e8e8",
                  margin: "10px 0",
                }}
                withBorder
              >
                <Flex direction="column" style={{ width: "100%" }}>
                  <Flex direction="row" justify="space-between" align="center">
                    <Flex direction="row" gap="xs" align="center">
                      <Text size="14px" style={{ fontWeight: "bold" }}>
                        Complaint Id: {complaint.id}
                      </Text>
                      <Text
                        size="14px"
                        style={{
                          borderRadius: "50px",
                          padding: "10px 20px",
                          backgroundColor: "#14ABFF",
                          color: "white",
                        }}
                      >
                        {complaint.complaint_type.toUpperCase()}
                      </Text>
                      {isOverdue && (
                        <Badge size="sm" color="red" variant="filled">
                          OVERDUE
                        </Badge>
                      )}
                    </Flex>
                    <Badge
                      color={(statusBadgeConfig[complaint.status] || {}).color || "gray"}
                      variant="filled"
                      size="lg"
                    >
                      {(statusBadgeConfig[complaint.status] || {}).label || "Unknown"}
                    </Badge>
                  </Flex>

                  <Flex direction="column" gap="xs" mt="md">
                    <Text size="14px">
                      <strong>Date:</strong>{" "}
                      {formatDateTime(complaint.complaint_date)}
                    </Text>
                    <Text size="14px">
                      <strong>Location:</strong> {complaint.specific_location},{" "}
                      {complaint.location}
                    </Text>
                    <Flex gap="xs" align="center" wrap="wrap">
                      <Text size="14px">
                        <strong>SLA Deadline:</strong>{" "}
                        {complaint.sla_deadline
                          ? formatDateTime(complaint.sla_deadline)
                          : "N/A"}
                      </Text>
                      <Badge
                        size="sm"
                        color={severityColorByPriority(complaint.priority)}
                        variant="light"
                      >
                        {severityLabel(complaint.priority)}
                      </Badge>
                    </Flex>
                  </Flex>
                  <Divider my="sm" />

                  <Flex direction="row" justify="space-between">
                    <Text size="14px">
                      <strong>Description:</strong> {complaint.details}
                    </Text>
                    <Flex gap="sm" ml="auto">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleButtonClick("details", complaint)}
                      >
                        Details
                      </Button>
                      {canChangeStatus && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() =>
                            handleButtonClick("changeStatus", complaint)
                          }
                        >
                          Change Status / Escalate
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              </Paper>
                );
              })}
            </>
          )}
        </Flex>
      </Paper>
    </Grid>
  );
}

CaretakerQueue.defaultProps = {
  roleOverride: "",
};

CaretakerQueue.propTypes = {
  roleOverride: PropTypes.string,
};

export default CaretakerQueue;

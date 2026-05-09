import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Text, Button, Flex, Grid, Loader, Badge, Divider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getComplaintDetailNew, extractApiErrorMessage } from "../routes/api";
import { host } from "../../../routes/globalRoutes/index";
import ActivityTimeline from "./ActivityTimeline";

const STATUS_MAP = {
  0: { label: "Pending", color: "blue" },
  1: { label: "In Progress", color: "cyan" },
  2: { label: "Resolved", color: "green" },
  3: { label: "Declined", color: "red" },
  4: { label: "Escalated", color: "orange" },
  5: { label: "Closed", color: "teal" },
  6: { label: "Reopened", color: "yellow" },
};

function formatDateTime(datetimeStr) {
  if (!datetimeStr) return "N/A";
  const date = new Date(datetimeStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year}, ${hours}:${minutes}`;
}

function ComplaintDetails({ complaintId, onBack, onVerifyClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem("authToken");
      const response = await getComplaintDetailNew(complaintId, token);
      if (response.success) {
        setData(response.data);
        setError(null);
      } else {
        setError(extractApiErrorMessage(response.error, "Failed to fetch complaint details"));
      }
      setLoading(false);
    };
    fetchDetails();
  }, [complaintId]);

  const handleViewAttachment = () => {
    const uploadPath = data?.complaint_details?.upload_complaint;
    if (!uploadPath) {
      notifications.show({
        title: "No Attachment",
        message: "No attachment found for this complaint.",
        color: "red",
      });
      return;
    }
    window.open(`${host}${uploadPath}`, "_blank");
  };

  const handleViewResolvedAttachment = () => {
    const uploadPath = data?.complaint_details?.upload_resolved;
    if (!uploadPath) {
      notifications.show({
        title: "No Attachment",
        message: "No resolved attachment found.",
        color: "yellow",
      });
      return;
    }
    window.open(`${host}${uploadPath}`, "_blank");
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ height: "100%" }}>
        <Loader size="lg" />
        <Text ml="md" size="14px">Loading complaint details...</Text>
      </Flex>
    );
  }

  if (error || !data) {
    return (
      <Flex justify="center" align="center" direction="column" style={{ height: "100%" }}>
        <Text color="red" size="14px">{error || "Could not load details."}</Text>
        <Button variant="outline" mt="md" onClick={onBack}>Back</Button>
      </Flex>
    );
  }

  const complaint = data.complaint_details || {};
  const complainer = data.complainer || {};
  const caretaker = data.assigned_caretaker;
  const supervisor = data.assigned_supervisor;
  const feedbackEntry = data.feedback_entry || null;
  const activityLogs = data.activity_logs || [];
  const statusInfo = STATUS_MAP[complaint.status] || { label: "Unknown", color: "gray" };
  const isOverdue = complaint.sla_deadline && new Date(complaint.sla_deadline) < new Date()
    && ![2, 3, 5].includes(complaint.status);
  const feedbackComments = (feedbackEntry?.comments || complaint.feedback || "").trim();
  const hasFeedback = !!feedbackEntry || feedbackComments.length > 0 || !!complaint.has_feedback;

  return (
    <Flex direction="column" gap="lg" p="lg" style={{ textAlign: "left", width: "100%", overflowY: "auto", maxHeight: "60vh" }}>
      {/* Header */}
      <Flex direction="column" gap="xs">
        <Text size="24px" style={{ fontWeight: "bold" }}>Complaint Details</Text>
        <Flex gap="xs" align="center">
          <Text size="14px" style={{ fontWeight: "bold" }}>
            Complaint ID: {complaint.id}
          </Text>
          <Badge size="lg" color={statusInfo.color}>{statusInfo.label}</Badge>
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
        </Flex>
      </Flex>

      {/* Basic Info */}
      <Grid columns={2} style={{ width: "100%" }}>
        <Grid.Col span={1}>
          <Flex direction="column" gap="xs">
            <Text size="14px" style={{ fontWeight: "bold" }}>Complainer:</Text>
            <Text weight="300" size="14px">
              {complainer.first_name} {complainer.last_name} ({complainer.username})
            </Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={1}>
          <Flex direction="column" gap="xs">
            <Text size="14px" style={{ fontWeight: "bold" }}>Register Date:</Text>
            <Text weight="300" size="14px">{formatDateTime(complaint.complaint_date)}</Text>
          </Flex>
        </Grid.Col>
      </Grid>

      <Grid columns={2} style={{ width: "100%" }}>
        <Grid.Col span={1}>
          <Flex direction="column" gap="xs">
            <Text size="14px" style={{ fontWeight: "bold" }}>Location:</Text>
            <Text weight="300" size="14px">{complaint.location}</Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={1}>
          <Flex direction="column" gap="xs">
            <Text size="14px" style={{ fontWeight: "bold" }}>Specific Location:</Text>
            <Text weight="300" size="14px">{complaint.specific_location || "N/A"}</Text>
          </Flex>
        </Grid.Col>
      </Grid>

      <Grid columns={2} style={{ width: "100%" }}>
        <Grid.Col span={1}>
          <Flex direction="column" gap="xs">
            <Text size="14px" style={{ fontWeight: "bold" }}>Issue:</Text>
            <Text weight="300" size="14px">{complaint.details}</Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={1}>
          <Flex direction="column" gap="xs">
            <Text size="14px" style={{ fontWeight: "bold" }}>
              SLA Deadline:
            </Text>
            <Text weight="300" size="14px">
              {complaint.sla_deadline ? formatDateTime(complaint.sla_deadline) : "Not set"}
              {isOverdue && " (OVERDUE)"}
            </Text>
          </Flex>
        </Grid.Col>
      </Grid>

      {/* Assigned Personnel */}
      {(caretaker || supervisor) && (
        <>
          <Divider label="Assigned Personnel" labelPosition="center" my="xs" />
          <Grid columns={2} style={{ width: "100%" }}>
            {caretaker && (
              <Grid.Col span={1}>
                <Text size="14px" style={{ fontWeight: "bold" }}>Assigned Caretaker:</Text>
                <Text size="14px">ID: {caretaker.id} — Area: {caretaker.area}</Text>
              </Grid.Col>
            )}
            {supervisor && (
              <Grid.Col span={1}>
                <Text size="14px" style={{ fontWeight: "bold" }}>Assigned Supervisor:</Text>
                <Text size="14px">ID: {supervisor.id} — Area: {supervisor.area}</Text>
              </Grid.Col>
            )}
          </Grid>
        </>
      )}

      {/* Attachments */}
      <Flex direction="row" gap="md" align="center">
        <Flex direction="row" gap="xs" align="center">
          <Text size="14px" style={{ fontWeight: "bold" }}>Attachment:</Text>
          <Button onClick={handleViewAttachment} px={10} py={0} size="xs">View</Button>
        </Flex>
        {complaint.upload_resolved && (
          <Flex direction="row" gap="xs" align="center">
            <Text size="14px" style={{ fontWeight: "bold" }}>Resolved Attachment:</Text>
            <Button onClick={handleViewResolvedAttachment} px={10} py={0} size="xs" color="green">
              View
            </Button>
          </Flex>
        )}
      </Flex>

      {/* Activity Timeline */}
      <Divider label="Activity Timeline" labelPosition="center" my="xs" />
      <ActivityTimeline activityLogs={activityLogs} />

      {hasFeedback && (
        <>
          <Divider label="Feedback" labelPosition="center" my="xs" />
          {feedbackEntry?.rating ? (
            <Text size="14px"><strong>Rating:</strong> {feedbackEntry.rating}/5</Text>
          ) : null}
          <Text size="14px">
            <strong>Comments:</strong> {feedbackComments || "Submitted"}
          </Text>
          {feedbackEntry?.submitted_at ? (
            <Text size="14px"><strong>Submitted At:</strong> {formatDateTime(feedbackEntry.submitted_at)}</Text>
          ) : null}
        </>
      )}

      {onVerifyClose && complaint.status === 2 && (
        <>
          <Divider my="xs" />
          <Text size="13px" color="dimmed">
            Review the resolution notes in the activity timeline and the resolved attachment (if provided) before closing this complaint.
          </Text>
          <Flex direction="row-reverse">
            <Button size="sm" color="blue" onClick={onVerifyClose}>
              Confirm Verify and Close
            </Button>
          </Flex>
        </>
      )}

      {/* Back Button */}
      <Flex direction="row-reverse" gap="xs">
        <Button size="sm" variant="filled" color="black" onClick={onBack}>
          Back
        </Button>
      </Flex>
    </Flex>
  );
}

ComplaintDetails.propTypes = {
  complaintId: PropTypes.number.isRequired,
  onBack: PropTypes.func.isRequired,
  onVerifyClose: PropTypes.func,
};

ComplaintDetails.defaultProps = {
  onVerifyClose: null,
};

export default ComplaintDetails;

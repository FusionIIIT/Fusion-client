import React, { useState } from "react";
import { Text, Button, Flex, Textarea, Loader, Badge } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import PropTypes from "prop-types";
import { createReopenRequest, extractApiErrorMessage } from "../routes/api";

function ReopenForm({ complaint, onBack }) {
  const [justification, setJustification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const token = localStorage.getItem("authToken");
  const pendingAlready = !!complaint.has_pending_reopen_request;

  // Calculate remaining window. Some complaints (e.g., declined) may not have closed_at,
  // so fallback to complaint_finish/complaint_date to avoid unlimited reopen window.
  const reopenAnchorRaw = complaint.closed_at || complaint.complaint_finish || complaint.complaint_date;
  const closedAt = reopenAnchorRaw ? new Date(reopenAnchorRaw) : null;
  const now = new Date();
  const daysElapsed = closedAt
    ? Math.floor((now - closedAt) / (1000 * 60 * 60 * 24))
    : 0;
  const remainingDays = Math.max(0, 30 - daysElapsed);
  const windowExpired = remainingDays <= 0 && closedAt;

  const handleSubmit = async () => {
    if (!justification || justification.length < 10) {
      notifications.show({
        title: "Validation Error",
        message: "Justification must be at least 10 characters.",
        color: "red",
      });
      return;
    }

    setIsLoading(true);
    const response = await createReopenRequest(complaint.id, justification, token);
    setIsLoading(false);

    if (response.success) {
      setSubmitted(true);
      notifications.show({
        title: "Request Submitted",
        message: "Your reopen request has been sent to the supervisor for approval.",
        color: "green",
      });
    } else {
      const msg = extractApiErrorMessage(response.error, "Failed to submit reopen request.");
      notifications.show({
        title: "Error",
        message: msg || "Failed to submit reopen request.",
        color: "red",
      });
    }
  };

  return (
    <Flex direction="column" gap="lg" p="lg" style={{ textAlign: "left", width: "100%" }}>
      <Text size="24px" style={{ fontWeight: "bold" }}>
        Request Complaint Reopening
      </Text>
      <Text size="14px">
        <strong>Complaint ID:</strong> {complaint.id}
      </Text>
      <Text size="14px">
        <strong>Type:</strong> {complaint.complaint_type}
      </Text>
      <Text size="14px">
        <strong>Issue:</strong> {complaint.details}
      </Text>

      {closedAt && (
        <Flex gap="xs" align="center">
          <Text size="14px">
            <strong>Reopen Window:</strong>
          </Text>
          <Badge color={remainingDays > 7 ? "green" : remainingDays > 0 ? "orange" : "red"}>
            {windowExpired ? "Expired" : `${remainingDays} days remaining`}
          </Badge>
        </Flex>
      )}

      {windowExpired ? (
        <Text size="14px" color="red" weight={600}>
          The 30-day reopen window has expired. This complaint cannot be reopened.
        </Text>
      ) : pendingAlready ? (
        <Text size="14px" color="yellow" weight={600}>
          A reopen request is already pending review for this complaint.
        </Text>
      ) : submitted ? (
        <Text size="14px" color="green" weight={600}>
          Your reopen request has been submitted. You will be notified once a supervisor reviews it.
        </Text>
      ) : (
        <>
          <Flex direction="column" gap="xs">
            <Text size="14px" style={{ fontWeight: "bold" }}>
              Justification *
            </Text>
            <Textarea
              placeholder="Explain why this complaint needs to be reopened (min 10 characters)..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              minRows={3}
              maxRows={6}
              required
            />
            <Text size="xs" color="dimmed">
              {justification.length}/10 minimum characters
            </Text>
          </Flex>
        </>
      )}

      <Flex direction="row-reverse" gap="xs">
        {!submitted && !windowExpired && !pendingAlready && (
          <Button onClick={handleSubmit} disabled={isLoading} color="yellow">
            {isLoading ? <Loader size="xs" /> : "Submit Request"}
          </Button>
        )}
        <Button variant="outline" onClick={onBack} color="dark">
          Back
        </Button>
      </Flex>
    </Flex>
  );
}

ReopenForm.propTypes = {
  complaint: PropTypes.shape({
    id: PropTypes.number.isRequired,
    complaint_type: PropTypes.string,
    details: PropTypes.string,
    closed_at: PropTypes.string,
    complaint_finish: PropTypes.string,
    complaint_date: PropTypes.string,
    has_pending_reopen_request: PropTypes.bool,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ReopenForm;

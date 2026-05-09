import React, { useState } from "react";
import { Text, Button, Flex, Textarea, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import PropTypes from "prop-types";
import { closeComplaint, createReopenRequest, extractApiErrorMessage } from "../routes/api";

function CloseVerifyForm({ complaint, onBack }) {
  const [action, setAction] = useState(null); // "accept" or "reject"
  const [rejectReason, setRejectReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("authToken");

  const handleAccept = async () => {
    setIsLoading(true);
    const response = await closeComplaint(complaint.id, true, token);
    setIsLoading(false);

    if (response.success) {
      notifications.show({
        title: "Closed",
        message: "Complaint has been verified and closed. Please leave feedback.",
        color: "green",
      });
      onBack();
    } else {
      const msg = extractApiErrorMessage(response.error, "Failed to close complaint.");
      notifications.show({
        title: "Error",
        message: msg || "Failed to close complaint.",
        color: "red",
      });
    }
  };

  const handleReject = async () => {
    if (!rejectReason || rejectReason.length < 10) {
      notifications.show({
        title: "Validation Error",
        message: "Please provide a reason (min 10 characters).",
        color: "red",
      });
      return;
    }
    setIsLoading(true);
    const response = await createReopenRequest(complaint.id, rejectReason, token);
    setIsLoading(false);

    if (response.success) {
      notifications.show({
        title: "Request Submitted",
        message:
          "Resolution rejection submitted. Reopen request sent to supervisor for approval.",
        color: "yellow",
      });
      onBack();
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
        Verify Resolution
      </Text>
      <Text size="14px">
        <strong>Complaint ID:</strong> {complaint.id}
      </Text>
      <Text size="14px">
        <strong>Type:</strong> {complaint.complaint_type}
      </Text>
      <Text size="14px">
        <strong>Location:</strong> {complaint.specific_location}, {complaint.location}
      </Text>
      <Text size="14px">
        <strong>Issue:</strong> {complaint.details}
      </Text>
      <Text size="14px" color="green" weight={600}>
        This complaint has been marked as resolved. Do you accept the resolution?
      </Text>

      {action === "reject" && (
        <Flex direction="column" gap="xs">
          <Text size="14px" style={{ fontWeight: "bold" }}>
            Reason for Rejection *
          </Text>
          <Textarea
            placeholder="Explain why the resolution is not acceptable (min 10 characters)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            minRows={3}
            required
          />
        </Flex>
      )}

      <Flex direction="row-reverse" gap="xs">
        {action === null && (
          <>
            <Button onClick={handleAccept} disabled={isLoading} color="green">
              {isLoading ? <Loader size="xs" /> : "Accept Resolution"}
            </Button>
            <Button
              variant="outline"
              color="red"
              onClick={() => setAction("reject")}
              disabled={isLoading}
            >
              Reject Resolution
            </Button>
          </>
        )}
        {action === "reject" && (
          <>
            <Button onClick={handleReject} disabled={isLoading} color="red">
              {isLoading ? <Loader size="xs" /> : "Submit Reopen Request"}
            </Button>
            <Button variant="outline" onClick={() => setAction(null)} disabled={isLoading}>
              Cancel
            </Button>
          </>
        )}
        <Button variant="outline" onClick={onBack} color="dark">
          Back
        </Button>
      </Flex>
    </Flex>
  );
}

CloseVerifyForm.propTypes = {
  complaint: PropTypes.shape({
    id: PropTypes.number.isRequired,
    complaint_type: PropTypes.string,
    location: PropTypes.string,
    specific_location: PropTypes.string,
    details: PropTypes.string,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
};

export default CloseVerifyForm;

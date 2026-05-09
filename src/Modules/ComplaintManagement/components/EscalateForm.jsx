import React, { useState } from "react";
import { Text, Button, Flex, Textarea, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import PropTypes from "prop-types";
import { escalateComplaint, extractApiErrorMessage } from "../routes/api";

function EscalateForm({ complaint, onBack }) {
  const [justification, setJustification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("authToken");

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
    const response = await escalateComplaint(complaint.id, justification, token);
    setIsLoading(false);

    if (response.success) {
      notifications.show({
        title: "Escalated",
        message: "Complaint has been escalated to supervisor.",
        color: "green",
      });
      onBack();
    } else {
      const msg = extractApiErrorMessage(response.error, "Failed to escalate complaint.");
      notifications.show({
        title: "Error",
        message: msg || "Failed to escalate complaint.",
        color: "red",
      });
    }
  };

  return (
    <Flex direction="column" gap="lg" p="lg" style={{ textAlign: "left", width: "100%" }}>
      <Text size="24px" style={{ fontWeight: "bold" }}>
        Escalate Complaint
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

      <Flex direction="column" gap="xs">
        <Text size="14px" style={{ fontWeight: "bold" }}>
          Justification for Escalation *
        </Text>
        <Textarea
          placeholder="Explain why this complaint needs to be escalated (min 10 characters)..."
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

      <Flex direction="row-reverse" gap="xs">
        <Button onClick={handleSubmit} disabled={isLoading} color="orange">
          {isLoading ? <Loader size="xs" /> : "Escalate"}
        </Button>
        <Button variant="outline" onClick={onBack} color="dark">
          Back
        </Button>
      </Flex>
    </Flex>
  );
}

EscalateForm.propTypes = {
  complaint: PropTypes.shape({
    id: PropTypes.number.isRequired,
    complaint_type: PropTypes.string,
    location: PropTypes.string,
    specific_location: PropTypes.string,
    details: PropTypes.string,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
};

export default EscalateForm;

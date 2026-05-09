import React, { useState } from "react";
import {
  Button, Flex, Grid, Text, Textarea, Select, Loader, CheckIcon, Badge,
} from "@mantine/core";
import PropTypes from "prop-types";
import { notifications } from "@mantine/notifications";
import { submitComplaintFeedback } from "../routes/api";

function formatDateTime(str) {
  if (!str) return "N/A";
  const date = new Date(str);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year}, ${hours}:${minutes}`;
}

function FeedbackForm({ complaint, setSelectedComplaint }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(null);
  const token = localStorage.getItem("authToken");
  const existingFeedback = (complaint.feedback || "").trim();
  const hasExistingFeedback = existingFeedback.length > 0;

  // Feedback is only available for Closed (5) or Resolved (2) complaints
  const canSubmitFeedback = (complaint.status === 5 || complaint.status === 2) && !hasExistingFeedback;

  const handleSubmit = async () => {
    if (!feedback || !rating) {
      notifications.show({
        title: "Incomplete Feedback",
        message: "Please provide feedback and a rating.",
        color: "red",
      });
      return;
    }
    setIsLoading(true);
    setIsSuccess(false);
    try {
      const response = await submitComplaintFeedback(
        complaint.id,
        parseInt(rating, 10),
        feedback,
        token,
      );
      if (response.success) {
        setIsSuccess(true);
        notifications.show({
          title: "Feedback Submitted",
          message: "Your feedback has been submitted successfully.",
          color: "green",
        });
      } else {
        const msg = typeof response.error === "object"
          ? JSON.stringify(response.error)
          : response.error;
        notifications.show({
          title: "Submission Failed",
          message: msg || "Failed to submit feedback. The complaint may need to be closed first.",
          color: "red",
        });
      }
    } catch (err) {
      notifications.show({
        title: "Submission Failed",
        message: "Failed to submit feedback. Please try again.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex direction="column" gap="lg" style={{ textAlign: "left", width: "100%" }}>
      <Flex direction="column" gap="xs">
        <Text size="24px" style={{ fontWeight: "bold" }}>
          Submit Feedback
        </Text>
        <Flex gap="xs" align="center">
          <Text size="14px" style={{ fontWeight: "bold" }}>
            Complaint ID: {complaint.id}
          </Text>
          <Badge
            color={complaint.status === 5 ? "teal" : complaint.status === 2 ? "green" : "gray"}
            size="sm"
          >
            {complaint.status === 5 ? "Closed" : complaint.status === 2 ? "Resolved" : `Status: ${complaint.status}`}
          </Badge>
        </Flex>
      </Flex>

      <Grid columns="2" style={{ width: "100%" }}>
        <Grid.Col span={1}>
          <Flex direction="column" gap="xs">
            <Text size="14px" style={{ fontWeight: "bold" }}>Register Date:</Text>
            <Text weight="300" size="14px">{formatDateTime(complaint.complaint_date)}</Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={1}>
          <Flex direction="column" gap="xs">
            <Text size="14px" style={{ fontWeight: "bold" }}>Finished Date:</Text>
            <Text weight="300" size="14px">{formatDateTime(complaint.complaint_finish)}</Text>
          </Flex>
        </Grid.Col>
      </Grid>

      {hasExistingFeedback ? (
        <Flex direction="column" gap="xs">
          <Text size="14px" color="green" weight={600}>
            Feedback already submitted for this complaint.
          </Text>
          <Text size="14px">
            <b>Your Feedback:</b> {existingFeedback}
          </Text>
        </Flex>
      ) : !canSubmitFeedback ? (
        <Text size="14px" color="orange" weight={600}>
          Feedback can only be submitted for closed or resolved complaints.
        </Text>
      ) : (
        <>
          <Flex direction="column" gap="xs">
            <Text size="14px" style={{ fontWeight: "bold" }}>Feedback *</Text>
            <Textarea
              placeholder="Write your feedback about the resolution..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              required
              disabled={isSuccess}
            />
          </Flex>

          <Flex direction="row" gap="xs" align="center">
            <Text size="14px" style={{ fontWeight: "bold" }}>Rating:</Text>
            <Select
              placeholder="Select a rating"
              value={rating}
              onChange={setRating}
              disabled={isSuccess}
              data={[
                { value: "1", label: "1 — Poor" },
                { value: "2", label: "2 — Below Average" },
                { value: "3", label: "3 — Average" },
                { value: "4", label: "4 — Good" },
                { value: "5", label: "5 — Excellent" },
              ]}
            />
          </Flex>
        </>
      )}

      <Flex direction="row-reverse" gap="xs">
        <Button
          onClick={() => setSelectedComplaint(null)}
          variant="outline"
          color="dark"
        >
          Back
        </Button>
        {canSubmitFeedback && (
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isSuccess}
            style={{
              backgroundColor: isSuccess ? "#2BB673" : undefined,
              color: isSuccess ? "white" : undefined,
            }}
          >
            {isLoading ? (
              <Loader size="xs" />
            ) : isSuccess ? (
              <CheckIcon size="16px" />
            ) : (
              "Submit"
            )}
          </Button>
        )}
      </Flex>
    </Flex>
  );
}

FeedbackForm.propTypes = {
  complaint: PropTypes.shape({
    id: PropTypes.number.isRequired,
    complaint_date: PropTypes.string.isRequired,
    complaint_finish: PropTypes.string,
    status: PropTypes.number,
    feedback: PropTypes.string,
  }).isRequired,
  setSelectedComplaint: PropTypes.func.isRequired,
};

export default FeedbackForm;

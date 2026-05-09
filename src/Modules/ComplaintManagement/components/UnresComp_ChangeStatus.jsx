import {
  Textarea, Text, Button, Flex, Grid, Select, FileInput,
} from "@mantine/core";
import { useState } from "react";
import PropTypes from "prop-types";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { updateProgressNew, escalateComplaint, extractApiErrorMessage } from "../routes/api";

function UnresCompChangeStatus({ complaint, onBack, allowEscalation }) {
  const [status, setStatus] = useState("");
  const [comments, setComments] = useState("");
  const [image, setImage] = useState(null);
  const [escalateMode, setEscalateMode] = useState(false);
  const [justification, setJustification] = useState("");
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  if (!complaint) return null;

  const token = localStorage.getItem("authToken");

  const handleSubmit = async () => {
    if (escalateMode) {
      if (!justification || justification.length < 10) {
        notifications.show({
          title: "Validation Error",
          message: "Justification must be at least 10 characters.",
          color: "red",
        });
        return;
      }
      const response = await escalateComplaint(complaint.id, justification, token);
      if (response.success) {
        notifications.show({
          title: "Escalated",
          message: "Complaint has been escalated to supervisor.",
          color: "green",
        });
        onBack();
      } else {
        notifications.show({
          title: "Error",
          message: extractApiErrorMessage(response.error, "Failed to escalate."),
          color: "red",
        });
      }
      return;
    }

    if (!status) {
      notifications.show({
        title: "Incomplete Action",
        message: "Please select a status before submitting.",
        color: "red",
      });
      return;
    }

    // Map to new API status values
    const statusMap = { Resolved: 2, Declined: 3, "In Progress": 1 };
    const statusValue = statusMap[status];
    if (statusValue === undefined) {
      notifications.show({ title: "Error", message: "Invalid status selected.", color: "red" });
      return;
    }

    const formData = new FormData();
    formData.append("status", statusValue);
    formData.append("note", comments);
    if (image) {
      formData.append("upload_resolved", image);
    }

    try {
      const response = await updateProgressNew(complaint.id, formData, token);
      if (response.success) {
        notifications.show({
          title: "Success",
          message: "Complaint status updated successfully.",
          color: "green",
        });
        onBack();
      } else {
        const msg = extractApiErrorMessage(response.error, "Failed to update status.");
        notifications.show({
          title: "Error",
          message: msg || "Failed to update status.",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Unexpected Error",
        message: "An unexpected error occurred.",
        color: "red",
      });
    }
  };

  return (
    <Grid.Col
      style={{
        padding: isSmallScreen ? "1rem" : "2rem",
        fontSize: isSmallScreen ? "14px" : "16px",
      }}
    >
      <Text size={isSmallScreen ? "md" : "lg"} weight="bold">
        {escalateMode ? "Escalate Complaint" : "Change Status"}
      </Text>
      <Text size={isSmallScreen ? "xs" : "sm"} mt="1rem">
        <strong>Complainer ID:</strong> {complaint.complainer}
      </Text>
      <Text size={isSmallScreen ? "xs" : "sm"}>
        <strong>Location:</strong> {complaint.specific_location}, {complaint.location}
      </Text>
      <Text size={isSmallScreen ? "xs" : "sm"}>
        <strong>Issue:</strong> {complaint.details}
      </Text>

      {escalateMode ? (
        <>
          <Text mt="1rem" weight={600}>Justification for Escalation *</Text>
          <Textarea
            placeholder="Why does this complaint need escalation? (min 10 characters)"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            minRows={3}
            mt="0.5rem"
          />
          <Text size="xs" color="dimmed" mt={4}>
            {justification.length}/10 minimum characters
          </Text>
        </>
      ) : (
        <>
          <Text mt="1rem">Update complaint status:</Text>
          <Select
            placeholder="Choose status"
            data={[
              { value: "In Progress", label: "In Progress" },
              { value: "Resolved", label: "Resolved" },
              { value: "Declined", label: "Declined" },
            ]}
            value={status}
            onChange={setStatus}
            mt="1rem"
          />

          <Text mt="1rem">Notes / Comments</Text>
          <Textarea
            placeholder="Add resolution notes or comments"
            autosize
            minRows={2}
            maxRows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            mt="0.5rem"
          />

          <Text mt="1rem">Attach Evidence (optional)</Text>
          <FileInput
            placeholder="Upload an image"
            onChange={setImage}
            mt="0.5rem"
            accept="image/*,.pdf"
          />
        </>
      )}

      <Flex
        justify={isSmallScreen ? "center" : "flex-end"}
        direction={isSmallScreen ? "column" : "row"}
        mt="md"
        gap="xs"
      >
        <Button variant="outline" onClick={onBack} style={{ width: isSmallScreen ? "100%" : "auto" }}>
          BACK
        </Button>
        {!escalateMode && allowEscalation && (
          <Button
            variant="outline" color="orange"
            onClick={() => setEscalateMode(true)}
            style={{ width: isSmallScreen ? "100%" : "auto" }}
          >
            Escalate Instead
          </Button>
        )}
        {escalateMode && allowEscalation && (
          <Button
            variant="outline"
            onClick={() => setEscalateMode(false)}
            style={{ width: isSmallScreen ? "100%" : "auto" }}
          >
            Back to Status
          </Button>
        )}
        <Button
          variant="filled"
          color={escalateMode ? "orange" : "blue"}
          onClick={handleSubmit}
          style={{ width: isSmallScreen ? "100%" : "auto" }}
        >
          {escalateMode ? "Escalate" : "Submit"}
        </Button>
      </Flex>
    </Grid.Col>
  );
}

UnresCompChangeStatus.propTypes = {
  complaint: PropTypes.shape({
    id: PropTypes.number.isRequired,
    complainer: PropTypes.string,
    location: PropTypes.string.isRequired,
    specific_location: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
  }),
  onBack: PropTypes.func.isRequired,
  allowEscalation: PropTypes.bool,
};

UnresCompChangeStatus.defaultProps = {
  allowEscalation: true,
};

export default UnresCompChangeStatus;

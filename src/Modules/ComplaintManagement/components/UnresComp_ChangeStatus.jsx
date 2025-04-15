import { Textarea, Text, Button, Flex, Grid, Select } from "@mantine/core";
import { useState } from "react";
import PropTypes from "prop-types";
import { notifications } from "@mantine/notifications";
import { updateComplaintStatus } from "../routes/api"; // Import API function

function UnresComp_ChangeStatus({ complaint, onBack }) {
  const [status, setStatus] = useState("");
  const [comments, setComments] = useState("");

  if (!complaint) return null;

  const token = localStorage.getItem("authToken");

  const handleStatusChange = (value) => {
    setStatus(value);
  };

  const handleCommentsChange = (event) => {
    setComments(event.currentTarget.value);
  };

  const handleSubmit = async () => {
    if (!status) {
      notifications.show({
        title: "Incomplete Action",
        message: "Please select an option before submitting.",
        color: "red",
      });
      return;
    }

    try {
      const response = await updateComplaintStatus(
        complaint.id,
        { yesorno: status, comment: comments },
        token,
      );

      if (response.success) {
        notifications.show({
          title: "Success",
          message: "Thank you for resolving the complaint.",
          color: "green",
        });
        onBack();
      } else {
        notifications.show({
          title: "Error",
          message:
            "There was an issue submitting your response. Please try again.",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Unexpected Error",
        message: "An unexpected error occurred. Please try again.",
        color: "red",
      });
    }
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

  return (
    <Grid.Col>
      <Text size="lg" weight="bold">
        Change Status
      </Text>

      <Text size="sm" mt="1rem">
        <strong>Complainer ID:</strong> {complaint.complainer}
      </Text>
      <Text size="sm">
        <strong>Date:</strong> {formatDateTime(complaint.complaint_date)}
      </Text>
      <Text size="sm">
        <strong>Location:</strong> {complaint.specific_location},{" "}
        {complaint.location}
      </Text>
      <Text size="sm">
        <strong>Issue:</strong> {complaint.details}
      </Text>

      <Text mt="1rem">
        Has the issue been resolved? (If you say no, the status of the complaint
        will automatically be set to "Declined".)
      </Text>

      <Select
        placeholder="Choose an option"
        data={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={status}
        onChange={handleStatusChange}
        mt="1rem"
      />

      <Text mt="1rem">Any Comments</Text>
      <Textarea
        placeholder="Write your comments here"
        label="Comments"
        autosize
        minRows={2}
        maxRows={4}
        value={comments}
        onChange={handleCommentsChange}
        mt="1rem"
      />

      <Flex justify="flex-end" mt="md" gap="xs">
        <Button variant="outline" onClick={onBack}>
          BACK
        </Button>
        <Button variant="outline" onClick={handleSubmit}>
          Submit
        </Button>
      </Flex>
    </Grid.Col>
  );
}

UnresComp_ChangeStatus.propTypes = {
  complaint: PropTypes.shape({
    id: PropTypes.number.isRequired,
    complaint_type: PropTypes.string.isRequired,
    complaint_date: PropTypes.string.isRequired,
    complaint_finish: PropTypes.string,
    location: PropTypes.string.isRequired,
    specific_location: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired,
    feedback: PropTypes.string,
    comment: PropTypes.string,
    complainer: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
};

export default UnresComp_ChangeStatus;

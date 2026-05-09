import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import {
  Flex,
  Paper,
  TextInput,
  Textarea,
  FileInput,
  Select,
  Button,
  Grid,
  Title,
  Text,
  Modal,
  Badge,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { createComplaint } from "../routes/api";

const PRIORITIES = [
  { value: "URGENT", label: "Urgent (24h SLA)" },
  { value: "STANDARD", label: "Standard (3 day SLA)" },
  { value: "LOW", label: "Low (7 day SLA)" },
];

const MAX_FILE_SIZE_MB = 5;

const COMPLAINT_TYPES = [
  "Electricity",
  "carpenter",
  "plumber",
  "garbage",
  "dustbin",
  "internet",
  "other",
];

const LOCATIONS = [
  "hall-1",
  "hall-3",
  "hall-4",
  "library",
  "computer center",
  "core_lab",
  "LHTC",
  "NR2",
  "NR3",
  "Admin building",
  "Rewa_Residency",
  "Maa Saraswati Hostel",
  "Nagarjun Hostel",
  "Panini Hostel",
];

function ComplaintForm({ roleOverride, onSubmit }) {
  const storeRole = useSelector((state) => state.user.role);
  const role = roleOverride || storeRole;
  const [complaintType, setComplaintType] = useState("");
  const [location, setLocation] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");
  const [complaintDetails, setComplaintDetails] = useState("");
  const [priority, setPriority] = useState("STANDARD");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [key, setKey] = useState(0);

  const resetFormFields = () => {
    setComplaintType("");
    setLocation("");
    setSpecificLocation("");
    setComplaintDetails("");
    setPriority("STANDARD");
    setFile(null);
    setIsSuccess(false);
  };

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showNotification({
        title: "File Too Large",
        message: `Attachment must be under ${MAX_FILE_SIZE_MB}MB.`,
        color: "red",
      });
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintType || complaintType === "") {
      setErrorMessage("Please select a complaint type.");
      showNotification({
        title: "Error",
        message: "Please select a complaint type.",
        color: "red",
      });
      return;
    }

    if (!location || location === "") {
      setErrorMessage("Please select a location.");
      showNotification({
        title: "Error",
        message: "Please select a location.",
        color: "red",
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setErrorMessage("");
    setIsSuccess(false);

    if (!complaintType || complaintType === "") {
      setErrorMessage("Please select a complaint type.");
      setLoading(false);
      showNotification({
        title: "Error",
        message: "Please select a complaint type.",
        color: "red",
      });
      return;
    }

    if (!location || location === "") {
      setErrorMessage("Please select a location.");
      setLoading(false);
      showNotification({
        title: "Error",
        message: "Please select a location.",
        color: "red",
      });
      return;
    }

    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("complaint_type", complaintType);
    formData.append("location", location);
    formData.append("specific_location", specificLocation);
    formData.append("details", complaintDetails);
    formData.append("priority", priority);
    if (file) {
      formData.append("upload_complaint", file);
    }

    const response = await createComplaint(formData, token);

    if (response.success) {
      setIsSuccess(true);
      console.log("Complaint registered:", response.data);

      if (onSubmit) {
        // Normalize backend snake_case response for UI acknowledgment page.
        onSubmit({
          complaintType: response.data?.complaint_type || complaintType,
          location: response.data?.location || location,
          specificLocation:
            response.data?.specific_location || specificLocation,
          complaintDetails: response.data?.details || complaintDetails,
          complaintId: response.data?.id,
          priority: response.data?.priority || priority,
        });
      }

      // Show success notification
      showNotification({
        title: "Success",
        message: "Complaint lodged successfully!",
        color: "green",
      });

      setTimeout(() => {
        resetFormFields();
        setKey((prevKey) => prevKey + 1);
      }, 2000);
    } else {
      setErrorMessage(
        response.error.detail ||
          "Error registering complaint. Please try again.",
      );
      console.error("Error registering complaint:", response.error);

      // Show error notification
      showNotification({
        title: "Error",
        message: "Failed to lodge the complaint. Please try again.",
        color: "red",
      });
    }

    setLoading(false);
  };

  return (
    <Grid
      mt="xl"
      style={{ paddingInline: "49px", width: "100%" }}
      sx={(theme) => ({
        [theme.fn.smallerThan("sm")]: {
          paddingInline: theme.spacing.md,
        },
      })}
    >
      <Paper
        key={key}
        radius="md"
        px="lg"
        pt="sm"
        pb="xl"
        style={{
          borderLeft: "0.6rem solid #15ABFF",
          backgroundColor: "white",
          minHeight: "45vh",
          maxHeight: "70vh",
          width: "70vw",
        }}
        withBorder
        sx={(theme) => ({
          [theme.fn.smallerThan("sm")]: {
            width: "90vw",
            padding: theme.spacing.sm,
          },
        })}
      >
        <Title
          order={3}
          mb="md"
          sx={(theme) => ({
            fontSize: 24,
            [theme.fn.smallerThan("sm")]: {
              fontSize: theme.fontSizes.md,
            },
          })}
        >
          Add a new Complaint
        </Title>
        {errorMessage && (
          <Text color="red" mb="md" fz="md">
            {errorMessage}
          </Text>
        )}
        <form onSubmit={handleSubmit}>
          <Grid>
            <Grid.Col xs={12} md={6} sm={12}>
              <Select
                label="Complaint Type"
                placeholder="Select Complaint Type"
                value={complaintType}
                onChange={setComplaintType}
                data={COMPLAINT_TYPES}
                required
                mb="md"
                labelProps={{ fz: "md" }}
                styles={(theme) => ({
                  input: {
                    fontSize: theme.fontSizes.md,
                  },
                })}
              />
            </Grid.Col>
            <Grid.Col xs={12} md={6} sm={12}>
              <Select
                label="Location"
                placeholder="Select Location"
                value={location}
                onChange={setLocation}
                data={LOCATIONS}
                required
                mb="md"
                labelProps={{ fz: "md" }}
                styles={(theme) => ({
                  input: {
                    fontSize: theme.fontSizes.md,
                  },
                })}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col xs={12} md={6} sm={12}>
              <TextInput
                label="Specific Location"
                placeholder="Room number, Floor, Block, etc."
                value={specificLocation}
                onChange={(e) => setSpecificLocation(e.target.value)}
                required
                mb="md"
                labelProps={{ fz: "md" }}
                styles={(theme) => ({
                  input: { fontSize: theme.fontSizes.md },
                })}
              />
            </Grid.Col>
            <Grid.Col xs={12} md={6} sm={12}>
              <Select
                label="Priority"
                placeholder="Select Priority"
                value={priority}
                onChange={setPriority}
                data={PRIORITIES}
                required
                mb="md"
                labelProps={{ fz: "md" }}
                styles={(theme) => ({
                  input: { fontSize: theme.fontSizes.md },
                })}
              />
              {priority && (
                <Badge
                  size="sm"
                  color={priority === "URGENT" ? "red" : priority === "LOW" ? "gray" : "blue"}
                  variant="light"
                  mb="md"
                >
                  SLA: {priority === "URGENT" ? "24 hours" : priority === "LOW" ? "7 days" : "3 days"}
                </Badge>
              )}
            </Grid.Col>
          </Grid>
          <Textarea
            label="Complaint Details"
            placeholder="What is your complaint? (min 5 characters)"
            value={complaintDetails}
            onChange={(e) => setComplaintDetails(e.target.value)}
            required
            mb="md"
            labelProps={{ fz: "md" }}
            styles={(theme) => ({
              input: { fontSize: theme.fontSizes.md },
            })}
          />
          <FileInput
            label="Attach Files (PDF, JPEG, PNG, JPG, DOCX — max 5MB)"
            placeholder="Choose File"
            accept=".pdf,.jpeg,.png,.jpg,.docx"
            onChange={handleFileChange}
            mb="md"
            labelProps={{ fz: "md" }}
            styles={(theme) => ({
              input: { fontSize: theme.fontSizes.md },
            })}
          />
          <Flex
            direction="row"
            justify="space-between"
            align="center"
            sx={(theme) => ({
              [theme.fn.smallerThan("sm")]: {
                flexDirection: "column",
                alignItems: "stretch",
              },
            })}
          >
            <Text size="sm" color="dimmed" fz="md">
              Complaint will be registered with your User ID.
            </Text>
            <Button
              type="submit"
              variant="filled"
              color="blue"
              loading={loading}
              sx={(theme) => ({
                width: 150,
                fontSize: theme.fontSizes.md,
                backgroundColor: isSuccess ? "#2BB673" : theme.colors.blue[6],
                color: isSuccess ? "black" : "white",
                [theme.fn.smallerThan("sm")]: {
                  width: "100%",
                  marginTop: theme.spacing.sm,
                },
              })}
            >
              {loading ? "Loading..." : isSuccess ? "Submitted" : "Submit"}
            </Button>
          </Flex>
        </form>

        <Modal
          opened={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Complaint Submission"
          size="sm"
        >
          <Text size="sm" mb="md">
            Are you sure you want to submit this complaint?
          </Text>
          <Flex justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} loading={loading}>
              Submit
            </Button>
          </Flex>
        </Modal>
      </Paper>
    </Grid>
  );
}

ComplaintForm.defaultProps = {
  roleOverride: "",
  onSubmit: null,
};

ComplaintForm.propTypes = {
  roleOverride: PropTypes.string,
  onSubmit: PropTypes.func,
};

export default ComplaintForm;

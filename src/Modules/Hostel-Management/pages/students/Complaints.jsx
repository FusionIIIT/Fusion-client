import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Group,
  Text,
  Stack,
  ScrollArea,
  Loader,
  Paper,
  TextInput,
  Textarea,
  Alert,
  Divider,
  Box,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import ComplaintCard from "../../components/cards/ComplaintCard";
import { studentService } from "../../services";
import { getApiErrorMessage } from "../../utils";

export default function Complaints() {
  const [activeComplaints, setActiveComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const username = useSelector((state) => state.user.username);
  const rollNumber = useSelector((state) => state.user.roll_no);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    hall_name: "",
    roll_number: rollNumber || "",
    contact_number: "",
    description: "",
  });

  const requestRef = useRef(0);

  // Fetch complaints for the logged-in user
  const fetchActiveComplaints = async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    try {
      setLoading(true);
      const response = await studentService.getComplaints();
      if (requestId !== requestRef.current) return;

      const complaints = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.complaints)
          ? response.data.complaints
          : [];
      setActiveComplaints(complaints);
      setError(null);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      setError(
        getApiErrorMessage(
          err,
          "Failed to fetch complaints. Please try again later.",
        ),
      );
      setActiveComplaints([]);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchActiveComplaints(); // Fetch complaints on component mount
  }, []); // Empty dependency array ensures this effect runs only once

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      roll_number: rollNumber || prev.roll_number,
    }));
  }, [rollNumber]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setFormError("");

    const payload = {
      hall_name: String(formData.hall_name || "").trim(),
      student_name: String(username || "").trim() || "Anonymous",
      roll_number: String(formData.roll_number || "").trim(),
      contact_number: String(formData.contact_number || "").trim(),
      description: String(formData.description || "").trim(),
    };

    if (
      !payload.hall_name ||
      !payload.roll_number ||
      !payload.contact_number ||
      !payload.description
    ) {
      setFormError("Please fill all fields before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      await studentService.submitComplaint(payload);
      setSuccessMessage("Complaint submitted successfully.");
      setFormData((prev) => ({
        ...prev,
        hall_name: "",
        contact_number: "",
        description: "",
      }));
      await fetchActiveComplaints();
    } catch (submitError) {
      setFormError(
        getApiErrorMessage(
          submitError,
          "Failed to submit complaint. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper shadow="md" p="lg" withBorder radius="md">
      <Stack spacing="lg">
        <Text size="24px" style={{ color: "#757575", fontWeight: "bold" }}>
          Complaints
        </Text>

        {successMessage && (
          <Alert icon={<IconCheck size={16} />} color="teal" title="Success">
            {successMessage}
          </Alert>
        )}

        {(formError || error) && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            {formError || error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Group grow align="flex-start">
              <TextInput
                label="Hall Name"
                placeholder="e.g., Hall 2"
                value={formData.hall_name}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    hall_name: event.currentTarget.value,
                  }))
                }
                required
              />
              <TextInput
                label="Roll Number"
                placeholder="e.g., B21CS000"
                value={formData.roll_number}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    roll_number: event.currentTarget.value,
                  }))
                }
                required
              />
            </Group>

            <TextInput
              label="Contact Number"
              placeholder="e.g., 9999999999"
              value={formData.contact_number}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  contact_number: event.currentTarget.value,
                }))
              }
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe the issue"
              minRows={4}
              value={formData.description}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  description: event.currentTarget.value,
                }))
              }
              required
            />

            <Group justify="flex-end">
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Submit Complaint
              </Button>
            </Group>
          </Stack>
        </form>

        <Divider />

        <Group justify="space-between">
          <Text weight={600} size="lg" color="dimmed">
            Complaint List
          </Text>
          <Button
            variant="light"
            onClick={fetchActiveComplaints}
            disabled={loading}
          >
            Refresh
          </Button>
        </Group>

        <ScrollArea h={420}>
          {loading ? (
            <Box py="md">
              <Loader size="md" />
            </Box>
          ) : (
            <Box style={{ minWidth: 1100 }}>
              <Paper withBorder radius="md" p="sm" mb="sm">
                <Box>
                  <Group grow align="flex-start" gap="md" wrap="nowrap">
                    <Text size="xs" fw={700} c="dimmed">
                      ID
                    </Text>
                    <Text size="xs" fw={700} c="dimmed">
                      Hall
                    </Text>
                    <Text size="xs" fw={700} c="dimmed">
                      Roll Number
                    </Text>
                    <Text size="xs" fw={700} c="dimmed">
                      Category
                    </Text>
                    <Text size="xs" fw={700} c="dimmed">
                      Description
                    </Text>
                    <Text size="xs" fw={700} c="dimmed">
                      Contact
                    </Text>
                    <Text size="xs" fw={700} c="dimmed">
                      Status / Time
                    </Text>
                  </Group>
                </Box>
              </Paper>

              <Stack spacing="sm">
                {activeComplaints.length > 0 ? (
                  activeComplaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint_id={complaint.id}
                      hall_name={complaint.hall_name}
                      roll_number={complaint.roll_number}
                      category={complaint.category}
                      description={complaint.description}
                      contact_number={complaint.contact_number}
                      image_upload={complaint.image_upload}
                      status={complaint.status}
                      created_at={complaint.created_at}
                      updated_at={complaint.updated_at}
                    />
                  ))
                ) : (
                  <Text color="dimmed" align="center">
                    No complaints found.
                  </Text>
                )}
              </Stack>
            </Box>
          )}
        </ScrollArea>
      </Stack>
    </Paper>
  );
}

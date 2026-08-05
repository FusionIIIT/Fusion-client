import { useState } from "react";
import {
  Card,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Title,
  Text,
  Paper,
  Badge,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { createAnnouncementRoute } from "../../routes/dashboardRoutes";
import AudienceSelector, {
  AUDIENCE_TYPES,
  defaultAudienceValue,
} from "../../components/AudienceSelector.jsx";

function CreateAnnouncementForm() {
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [reviewing, setReviewing] = useState(false);
  const [audience, setAudience] = useState(defaultAudienceValue());

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setAudience(defaultAudienceValue());
  };

  const handleReview = (e) => {
    e.preventDefault();
    const errors = {};
    if (!title.trim()) errors.title = "Title is required";
    if (!message.trim()) errors.message = "Message is required";
    if (audience.audienceType === "role" && !audience.targetRole)
      errors.targetRole = "Please select a role";
    if (audience.audienceType === "department" && !audience.targetDepartment)
      errors.targetDepartment = "Please select a department";
    if (audience.audienceType === "batch" && !audience.targetBatch)
      errors.targetBatch = "Please select a batch";
    if (
      audience.audienceType === "individual" &&
      audience.targetUsers.length === 0
    )
      errors.targetUsers = "Please select at least one user";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setReviewing(true);
  };

  const handleConfirmSend = async () => {
    setSubmitting(true);
    const token = localStorage.getItem("authToken");
    try {
      await axios.post(
        createAnnouncementRoute,
        {
          title,
          message,
          audience_type: audience.audienceType,
          target_role:
            audience.audienceType === "role" ? audience.targetRole : null,
          target_department:
            audience.audienceType === "department"
              ? audience.targetDepartment
              : null,
          target_batch:
            audience.audienceType === "batch" ? audience.targetBatch : null,
          target_users:
            audience.audienceType === "individual" ? audience.targetUsers : [],
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      showNotification({
        title: "Announcement Sent",
        message: "Your announcement has been sent to the selected audience.",
        color: "green",
      });
      resetForm();
      setReviewing(false);
    } catch (err) {
      const statusCode = err?.response?.status;
      let errMessage = "Something went wrong. Please try again.";
      if (statusCode === 400)
        errMessage = "Invalid announcement details. Please check your input.";
      else if (statusCode === 403)
        errMessage = "You do not have permission to create announcements.";
      showNotification({
        title: "Could Not Send Announcement",
        message: errMessage,
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (reviewing) {
    const activeAudience = AUDIENCE_TYPES.find(
      (a) => a.value === audience.audienceType,
    );
    const AudienceIcon = activeAudience?.icon ?? AUDIENCE_TYPES[0].icon;

    return (
      <Card p="lg" radius="md" withBorder>
        <Title order={2} mb="md">
          Review Announcement
        </Title>
        <Paper
          radius="md"
          p="lg"
          withBorder
          style={{ borderLeft: "0.6rem solid #15ABFF" }}
          mb="md"
        >
          <Group gap={6} mb="md">
            <AudienceIcon size={18} color="#15ABFF" />
            <Text fw={500}>To:</Text>
            <Text>{audience.summaryLabel}</Text>
          </Group>
          <Divider mb="md" />
          <Group gap="md" mb="xs">
            <Text fw={600} size="1.2rem">
              {title}
            </Text>
            <Badge color="#15ABFF">Announcement</Badge>
          </Group>
          <Text>{message}</Text>
        </Paper>
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={() => setReviewing(false)}
            disabled={submitting}
          >
            Back
          </Button>
          <Button
            onClick={handleConfirmSend}
            loading={submitting}
            disabled={submitting}
          >
            Confirm & Send
          </Button>
        </Group>
      </Card>
    );
  }

  return (
    <Card p="lg" radius="md" withBorder>
      <Title order={2} mb="md">
        Create Announcement
      </Title>
      <form onSubmit={handleReview}>
        <Stack gap="md">
          <AudienceSelector
            value={audience}
            onChange={setAudience}
            errors={fieldErrors}
            onClearError={(field) =>
              setFieldErrors((prev) => ({ ...prev, [field]: null }))
            }
          />

          <TextInput
            label="Title"
            placeholder="Announcement title"
            value={title}
            onChange={(e) => {
              setTitle(e.currentTarget.value);
              setFieldErrors((prev) => ({ ...prev, title: null }));
            }}
            error={fieldErrors.title}
            required
          />
          <Textarea
            label="Message"
            placeholder="Announcement message"
            value={message}
            onChange={(e) => {
              setMessage(e.currentTarget.value);
              setFieldErrors((prev) => ({ ...prev, message: null }));
            }}
            error={fieldErrors.message}
            minRows={3}
            required
          />

          <Group justify="flex-end">
            <Button type="submit">Review Announcement</Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}

export default CreateAnnouncementForm;

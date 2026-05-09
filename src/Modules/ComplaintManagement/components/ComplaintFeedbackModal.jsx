import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";

const ratingOptions = [1, 2, 3, 4, 5].map((value) => ({
  value: String(value),
  label: `${value} / 5`,
}));

export default function ComplaintFeedbackModal({
  opened,
  onClose,
  complaint,
  onSubmit,
  loading = false,
}) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("5");
  const [error, setError] = useState("");

  useEffect(() => {
    if (opened) {
      setFeedback("");
      setRating("5");
      setError("");
    }
  }, [opened]);

  const handleSubmit = async () => {
    const trimmed = feedback.trim();
    if (!trimmed) {
      setError("Feedback is required.");
      return;
    }

    setError("");
    await onSubmit({
      feedback: trimmed,
      rating: Number(rating),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Submit Feedback"
      centered
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Share how your complaint was handled. This helps improve service
          quality.
        </Text>

        {complaint?.id && (
          <Text size="sm" c="dimmed">
            Complaint #{complaint.id}
          </Text>
        )}

        <Select
          label="Rating"
          value={rating}
          onChange={(value) => setRating(value || "5")}
          data={ratingOptions}
          disabled={loading}
        />

        <Textarea
          label="Feedback"
          value={feedback}
          onChange={(event) => setFeedback(event.currentTarget.value)}
          minRows={4}
          maxLength={500}
          placeholder="Describe your experience..."
          error={error}
          disabled={loading}
        />

        <Text size="xs" c="dimmed">
          {feedback.trim().length}/500 characters
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Submit Feedback
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

ComplaintFeedbackModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  complaint: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

ComplaintFeedbackModal.defaultProps = {
  complaint: null,
  loading: false,
};

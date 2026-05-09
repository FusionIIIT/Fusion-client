import React, { useState } from "react";
import {
  Textarea,
  Button,
  Container,
  Title,
  Select,
  Group,
  Card,
  Text,
  Grid,
} from "@mantine/core";
import {
  ChatCircleText,
  List,
  PaperPlaneRight,
  CheckCircle,
  WarningCircle,
  Buildings,
} from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { feedbackRoute } from "../routes";

function StudentFeedback() {
  const [messOption, setMessOption] = useState("mess1");
  const [feedbackType, setFeedbackType] = useState("cleanliness");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!feedbackType) {
      notifications.show({
        title: "Validation Error",
        message: "Please choose a feedback category.",
        color: "red",
        icon: <WarningCircle size={20} />,
      });
      return;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription === "") {
      notifications.show({
        title: "Validation Error",
        message: "Feedback description cannot be empty!",
        color: "red",
        icon: <WarningCircle size={20} />,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        feedbackRoute,
        {
          mess: messOption,
          feedback_type: feedbackType,
          description: trimmedDescription,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        notifications.show({
          title: "Feedback Submitted",
          message: "Thank you! Your feedback has been received successfully.",
          color: "green",
          icon: <CheckCircle size={20} />,
        });
        setDescription(""); // Clear the textarea after submission
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      notifications.show({
        title: "Submission Failed",
        message:
          error.response?.data?.message ||
          "An error occurred while submitting your feedback. Please try again.",
        color: "red",
        icon: <WarningCircle size={20} />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="md" px={0} mt="lg">
      <Card
        shadow="sm"
        radius="lg"
        p="xl"
        withBorder
        style={{ backgroundColor: "#ffffff" }}
      >
        <Group mb="xl" align="flex-start">
          <ChatCircleText size={36} color="#1A2980" weight="duotone" />
          <div style={{ flex: 1 }}>
            <Title order={3} fw={800} style={{ color: "#1A2980" }}>
              Give Feedback
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              Help us improve! Share your thoughts on food quality, hygiene, or
              maintenance in the mess.
            </Text>
          </div>
        </Group>

        <form onSubmit={handleSubmit}>
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Select Mess"
                placeholder="Choose Mess"
                value={messOption}
                onChange={setMessOption}
                data={[
                  { value: "mess1", label: "Central Mess 1" },
                  { value: "mess2", label: "Central Mess 2" },
                ]}
                radius="md"
                size="md"
                required
                leftSection={<Buildings size={18} />}
                comboboxProps={{ shadow: "md" }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Feedback Category"
                placeholder="Select an area"
                value={feedbackType}
                onChange={setFeedbackType}
                data={[
                  { value: "cleanliness", label: "Cleanliness" },
                  { value: "food", label: "Food" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "others", label: "Others" },
                ]}
                radius="md"
                size="md"
                required
                leftSection={<List size={18} />}
                comboboxProps={{ shadow: "md" }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Detailed Description"
                placeholder="Explain the issue or provide suggestions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                radius="md"
                size="md"
                required
                minRows={5}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="xl">
            <Button
              type="submit"
              size="lg"
              radius="md"
              loading={isSubmitting}
              leftSection={<PaperPlaneRight size={20} />}
              style={{
                paddingLeft: "40px",
                paddingRight: "40px",
                backgroundColor: "#1A2980",
              }}
            >
              Send Feedback
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
}

export default StudentFeedback;

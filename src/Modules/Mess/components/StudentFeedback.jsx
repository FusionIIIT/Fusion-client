import React, { useState } from "react";
import {
  Textarea,
  Button,
  Container,
  Title,
  Paper,
  Select,
  Group,
} from "@mantine/core"; // Mantine UI components
import { PencilSimple, FunnelSimple } from "@phosphor-icons/react"; // Phosphor Icons

function StudentFeedback() {
  const [messOption, setMessOption] = useState("Mess 1");
  const [feedbackType, setFeedbackType] = useState("Cleanliness");
  const [description, setDescription] = useState("");

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      messOption,
      feedbackType,
      description,
    });
    // Clear form fields after submission
    setDescription("");
  };

  return (
    <Container
      size="lg"
      style={{
        miw: "1100px",
        width: "1100px",
        marginTop: "25px",
      }}
    >
      <Paper
        shadow="md"
        radius="md"
        p="xl"
        withBorder
        style={{ padding: "30px" }}
      >
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Submit Feedback
        </Title>

        <form onSubmit={handleSubmit}>
          {/* Dropdown for mess option */}
          <Group grow mb="lg">
            <Select
              label="Select Mess"
              placeholder="Choose Mess"
              value={messOption}
              onChange={setMessOption}
              data={["Mess 1", "Mess 2"]}
              radius="md"
              size="md"
              icon={<FunnelSimple size={18} />} // Phosphor icon
            />
          </Group>

          {/* Dropdown for feedback type */}
          <Group grow mb="lg">
            <Select
              label="Feedback Type"
              placeholder="Select Feedback Type"
              value={feedbackType}
              onChange={setFeedbackType}
              data={["Cleanliness", "Food", "Maintenance", "Others"]}
              radius="md"
              size="md"
              icon={<FunnelSimple size={18} />} // Phosphor icon
            />
          </Group>

          {/* Textarea for feedback description */}
          <Textarea
            label="Description"
            placeholder="Enter your feedback"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            radius="md"
            size="md"
            mb="lg"
            required
            minRows={4}
            icon={<PencilSimple size={18} />} // Phosphor icon
          />

          {/* Submit Button */}
          <Button
            fullWidth
            size="md"
            radius="md"
            color="blue"
            type="submit"
            leftIcon={<PencilSimple size={18} />} // Phosphor icon
          >
            Submit Feedback
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default StudentFeedback;

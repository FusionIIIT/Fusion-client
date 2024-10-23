import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Container,
  Title,
  Paper,
  Space,
  Textarea,
} from "@mantine/core"; // Import Mantine components
import { User } from "@phosphor-icons/react"; // Import Phosphor Icons

function Deregistration() {
  const [name, setName] = useState(""); // State for name
  const [rollNo, setRollNo] = useState(""); // State for roll number
  const [batch, setBatch] = useState(""); // State for batch
  const [semester, setSemester] = useState(null); // State for semester
  const [reason, setReason] = useState(""); // State for reason

  return (
    <Container
      size="lg"
      style={{
        maxWidth: "800px",
        width: "570px",
        marginTop: "25px",
      }}
    >
      <Paper
        shadow="md"
        radius="md"
        p="xl"
        withBorder
        style={{ width: "100%", padding: "30px" }}
      >
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Deregistration Form
        </Title>

        <form method="post" action="/path/to/your/deregistration/endpoint">
          {/* Name input */}
          <TextInput
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            required
            radius="md"
            size="md"
            icon={<User size={20} />}
            labelProps={{ style: { marginBottom: "10px" } }}
            mt="xl"
            mb="md"
          />

          {/* Roll Number input */}
          <TextInput
            label="Roll No."
            placeholder="Enter your roll number"
            value={rollNo}
            onChange={(event) => setRollNo(event.currentTarget.value)}
            required
            radius="md"
            size="md"
            labelProps={{ style: { marginBottom: "10px" } }}
            mb="md"
          />

          {/* Batch input */}
          <TextInput
            label="Batch"
            placeholder="Enter your batch"
            value={batch}
            onChange={(event) => setBatch(event.currentTarget.value)}
            required
            radius="md"
            size="md"
            labelProps={{ style: { marginBottom: "10px" } }}
            mb="md"
          />

          {/* Semester input */}
          <NumberInput
            label="Semester"
            placeholder="Enter your semester"
            value={semester}
            onChange={setSemester}
            required
            radius="md"
            size="md"
            labelProps={{ style: { marginBottom: "10px" } }}
            min={1}
            max={10} // Adjust max value as necessary
            mb="lg"
          />

          {/* Reason for Deregistration input */}
          <Textarea
            label="Reason for Deregistration"
            placeholder="Provide your reason"
            value={reason}
            onChange={(event) => setReason(event.currentTarget.value)}
            required
            radius="md"
            size="md"
            labelProps={{ style: { marginBottom: "10px" } }}
            mb="lg"
          />

          <Space h="xl" />

          {/* Submit button */}
          <Button fullWidth size="md" radius="md" color="blue">
            Submit
          </Button>
        </form>
      </Paper>
      <Space h="xl" />
    </Container>
  );
}

export default Deregistration;

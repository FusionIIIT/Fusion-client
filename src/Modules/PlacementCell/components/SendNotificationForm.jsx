import React, { useState } from "react";
import {
  Button,
  Select,
  TextInput,
  Textarea,
  Group,
  Title,
  Container
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";

function SendNotificationForm() {
  const [formData, setFormData] = useState({
    sendTo: "Student",
    studentName: "",
    date: new Date(),
    time: "",
    title: "",
    description: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Implement notification sending logic here
    console.log("Notification details:", formData);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Container fluid style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} my={16} >
        <Title>Send Notification</Title>
      </Container>

      <Group mt="md">
        <Select
          label="Send to"
          placeholder="Select recipient"
          value={formData.sendTo}
          onChange={(value) => handleChange("sendTo", value)}
          data={["Student", "Faculty", "All"]}
        />
        <TextInput
          label="Student Name"
          placeholder="Enter student name (optional)"
          value={formData.studentName}
          onChange={(event) =>
            handleChange("studentName", event.currentTarget.value)
          }
        />
      </Group>

      <Group mt="md">
        <DatePickerInput
          label="Date"
          placeholder="Select date"
          value={formData.date}
          onChange={(date) => handleChange("date", date)}
        />
        <TimeInput
          label="Time"
          value={formData.time}
          onChange={(time) => handleChange("time", time)}
        />
      </Group>

      <TextInput
        mt="md"
        label="Title"
        placeholder="Enter notification title"
        value={formData.title}
        onChange={(event) => handleChange("title", event.currentTarget.value)}
      />

      <Textarea
        mt="md"
        label="Description"
        placeholder="Enter notification description"
        value={formData.description}
        onChange={(event) =>
          handleChange("description", event.currentTarget.value)
        }
        minRows={4}
      />

      <Button mt="md" onClick={handleSubmit}>
        Send Notification
      </Button>
    </div>
  );
}

export default SendNotificationForm;

import React, { useState } from "react";
import { Modal, Button, TextInput, Select, Textarea, Card, Container } from "@mantine/core";

function CreateNextRoundForm() {
  const [modalOpened, setModalOpened] = useState(false);
  const [roundName, setRoundName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [roundType, setRoundType] = useState("");

  const handleSubmit = () => {
    const nextRoundDetails = {
      roundName,
      date,
      time,
      location,
      description,
      roundType,
    };

    console.log("Next Round Details:", nextRoundDetails);
    setModalOpened(false);
    // Reset form fields
    setRoundName("");
    setDate("");
    setTime("");
    setLocation("");
    setDescription("");
    setRoundType("");
  };

  return (
    <Container>
      <Button onClick={() => setModalOpened(true)}>Create Next Round</Button>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Add Next Round Details"
      >
        <Card shadow="sm" padding="md" radius="md">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <TextInput
              label="Round Name"
              placeholder="Enter round name"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              required
            />
            <TextInput
              label="Date"
              placeholder="YYYY-MM-DD"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <TextInput
              label="Time"
              placeholder="HH:MM (24-hour format)"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <TextInput
              label="Location"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Textarea
              label="Description"
              placeholder="Enter a brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Select
              label="Round Type"
              placeholder="Select round type"
              data={[
                { value: 'technical', label: 'Technical' },
                { value: 'hr', label: 'HR' },
                { value: 'group_discussion', label: 'Group Discussion' },
                { value: 'coding', label: 'Coding' },
              ]}
              value={roundType}
              onChange={setRoundType}
              required
            />
            <Button type="submit" style={{ marginTop: '12px' }} fullWidth>
              Save Round Details
            </Button>
          </form>
        </Card>
      </Modal>
    </Container>
  );
}

export default CreateNextRoundForm;

import React, { useState } from "react";
import { TextInput, Button, Select, Group, Card, Title } from "@mantine/core";

function AddPlacementRecordForm() {
  const [company, setCompany] = useState("");
  const [student, setStudent] = useState("");
  const [ctc, setCtc] = useState("");
  const [placementType, setPlacementType] = useState("");
  const [rollNo, setRollNo] = useState("");

  const handleSubmit = () => {
    // Add logic to handle form submission
    console.log({ company, student, ctc, placementType, rollNo });
  };

  return (
    <Card shadow="sm" padding="lg" radius="lg" style={{ marginTop: "20px" }}>
      <Group position="apart" style={{ marginBottom: "20px" , display:'flex', justifyContent:'space-between'}}>
        <Title order={3} size="h2">
          Add Placement Record
        </Title>
        <Button onClick={handleSubmit} size="sm" variant="outline">
          Add Record
        </Button>
      </Group>

      <Group grow spacing="md" direction="column" breakpoints={{ sm: { direction: 'row' } }}>
        <TextInput
          label="Company Name"
          placeholder="Enter company name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />
        <TextInput
          label="Student Name"
          placeholder="Enter student name"
          value={student}
          onChange={(e) => setStudent(e.target.value)}
          required
        />
      </Group>

      <Group grow spacing="md" direction="column" breakpoints={{ sm: { direction: 'row' } }} style={{ marginTop: "20px" }}>
        <TextInput
          label="CTC in LPA"
          placeholder="Enter CTC"
          value={ctc}
          onChange={(e) => setCtc(e.target.value)}
          required
        />
        <TextInput
          label="Roll No."
          placeholder="Enter roll number"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          required
        />
      </Group>

      <Select
        label="Placement Type"
        placeholder="Select placement type"
        data={["Full-Time", "Internship"]}
        value={placementType}
        onChange={setPlacementType}
        style={{ marginTop: "20px" }}
        required
      />
    </Card>
  );
}

export default AddPlacementRecordForm;

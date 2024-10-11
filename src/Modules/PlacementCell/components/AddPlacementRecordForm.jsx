import React, { useState } from "react";
import { TextInput, Button, Select, Group, Card, Text } from "@mantine/core";

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
    <Card shadow="sm" padding="lg" radius="md" style={{ marginTop: "20px", position: 'relative' }}>
      <Text weight={500} size="lg" style={{ marginBottom: "15px" }}>
        Add Placement Record
      </Text>

      {/* Place the button in the top right corner */}
      <Button 
        onClick={handleSubmit} 
        style={{ position: 'absolute', top: '15px', right: '15px' }} 
        size="xs" // Reduce the size of the button
      >
        Add Record
      </Button>

      <Group grow>
        <TextInput
          label="Company Name"
          placeholder="Enter company name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <TextInput
          label="Student Name"
          placeholder="Enter student name"
          value={student}
          onChange={(e) => setStudent(e.target.value)}
        />
      </Group>

      <Group grow>
        <TextInput
          label="CTC in LPA"
          placeholder="Enter CTC"
          value={ctc}
          onChange={(e) => setCtc(e.target.value)}
        />
        
        <TextInput
            label="Roll No."
            placeholder="Enter roll number"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
        />
      </Group>

      <Select
          label="Placement Type"
          placeholder="Select placement type"
          data={["FullTime", "Internship"]}
          value={placementType}
          onChange={setPlacementType}
        />
      
    </Card>
  );
}

export default AddPlacementRecordForm;

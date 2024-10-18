
import React, { useState } from "react";
import {
  TextInput,
  Button,
  Select,
  Group,
  
  Container,
  Textarea,
  FileInput,
  Modal,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

function AddPlacementRecordForm({ opened, onClose }) {
  const [company, setCompany] = useState("");
  const [student, setStudent] = useState("");
  const [ctc, setCtc] = useState("");
  const [placementType, setPlacementType] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("company", company);
    formData.append("student", student);
    formData.append("ctc", ctc);
    formData.append("placementType", placementType);
    formData.append("rollNo", rollNo);
    formData.append("location", location);
    formData.append("role", role);
    formData.append("description", description);
    if (resumeFile) {
      formData.append("resumeFile", resumeFile);
    }

    console.log("Form Submitted", formData);
    // Make API call or further processing
    onClose(); // Close the modal after form submission
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Add Placement Record"
        size="lg"
        centered
      >
        <Group grow spacing="md" direction="column" breakpoints={{ sm: { direction: "row" } }}>
          
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

        <Group grow spacing="md" direction="column" breakpoints={{ sm: { direction: "row" } }} style={{ marginTop: "20px" }}>
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

        <Group grow spacing="md" direction="column" breakpoints={{ sm: { direction: "row" } }} style={{ marginTop: "20px" }}>
          <TextInput
            label="Location"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <TextInput
            label="Role Offered"
            placeholder="Enter the role offered"
            value={role}
            onChange={(e) => setRole(e.target.value)}
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

        <Textarea
          label="Description"
          placeholder="Enter a description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
          style={{ marginTop: "20px" }}
        />

        <FileInput
          label="Resume File"
          placeholder="Upload resume"
          value={resumeFile}
          onChange={setResumeFile}
          style={{ marginTop: "20px" }}
        />

        <Group position="right" style={{ marginTop: "20px" }}>
          <Button onClick={handleSubmit}>Add Record</Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default AddPlacementRecordForm;

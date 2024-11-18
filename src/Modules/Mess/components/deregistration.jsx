import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Container,
  Title,
  Paper,
  Space,
} from "@mantine/core"; // Import Mantine components
import { User } from "@phosphor-icons/react"; // Import Phosphor Icons
import axios from "axios"; // Import axios

function Deregistration() {
  const [name, setName] = useState(""); // State for name
  const [rollNo, setRollNo] = useState(""); // State for roll number
  const [batch, setBatch] = useState(""); // State for batch
  const [semester, setSemester] = useState(null); // State for semester
  const [txnNo, setTxnNo] = useState(""); // State for transaction number
  const [deregistrationRemark, setDeregistrationRemark] = useState(""); // State for deregistration remark

  // Generate a random transaction number (Txn_no)
  const generateTxnNo = () => {
    const randomTxn = Math.floor(Math.random() * 1000000000); // Generate a random 9-digit number
    setTxnNo(randomTxn);
  };

  // Call this function when form is submitted
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Make sure we have required fields
    if (!rollNo || !deregistrationRemark) {
      alert("Please fill out all required fields.");
      return;
    }

    // Prepare data to send to backend
    const data = {
      txn_no: txnNo || generateTxnNo(), // Ensure txnNo is generated
      student_id: rollNo, // rollNo as student_id
      batch,
      semester,
      deregistration_remark: deregistrationRemark, // Include the remark
    };

    try {
      // Send POST request to backend API
      const response = await axios.post(
        "http://127.0.0.1:8000/mess/api/deRegistrationRequestApi",
        data,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`, // Include auth token
          },
        },
      );

      if (response.status === 200) {
        alert("Deregistration request submitted successfully!");
      }
    } catch (error) {
      alert("Error submitting deregistration request");
    }
  };

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

        <form onSubmit={handleSubmit}>
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

          {/* Deregistration Remark input */}
          <TextInput
            label="Deregistration Remark"
            placeholder="Enter a remark for deregistration"
            value={deregistrationRemark}
            onChange={(event) =>
              setDeregistrationRemark(event.currentTarget.value)
            }
            required
            radius="md"
            size="md"
            labelProps={{ style: { marginBottom: "10px" } }}
            mb="lg"
          />

          <Space h="xl" />

          {/* Submit button */}
          <Button fullWidth size="md" radius="md" color="blue" type="submit">
            Submit
          </Button>
        </form>
      </Paper>
      <Space h="xl" />
    </Container>
  );
}

export default Deregistration;

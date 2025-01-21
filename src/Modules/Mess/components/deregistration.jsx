import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Container,
  Paper,
  Space,
  Grid,
  Title,
} from "@mantine/core"; // Import Mantine components
import { User } from "@phosphor-icons/react"; // Import Phosphor Icons
import axios from "axios"; // Import axios
import { deregistrationRequestRoute } from "../routes";

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
      const response = await axios.post(deregistrationRequestRoute, data, {
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`, // Include auth token
        },
      });

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
        display: "flex",
        justifyContent: "center",
        marginTop: "50px",
        minWidth: "75rem",
        width: "100%",
        padding: "30px",
        margin: "auto",
      }}
      radius="md"
      p="xl"
      withBorder
    >
      <Paper
        radius="md"
        p="xl"
        withBorder
        style={{
          minWidth: "75rem",
          width: "100%",
          padding: "30px",
          margin: "auto",
        }}
      >
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Dregistration Form
        </Title>

        <form onSubmit={handleSubmit}>
          <Grid grow>
            <Grid.Col span={12}>
              {/* Name Input */}
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
            </Grid.Col>

            {/* Roll Number Input */}
            <Grid.Col span={6}>
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
            </Grid.Col>

            {/* Batch Input */}
            <Grid.Col span={6}>
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
            </Grid.Col>

            {/* Semester Input */}
            <Grid.Col span={6}>
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
            </Grid.Col>

            {/* Deregistration Remark Input */}
            <Grid.Col span={6}>
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
            </Grid.Col>
          </Grid>

          <Space h="xl" />

          {/* Submit Button */}
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

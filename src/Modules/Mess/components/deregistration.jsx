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
import { DatePicker } from "@mantine/dates"; // Import DatePicker for end date
import axios from "axios"; // Import axios
import { useSelector } from "react-redux";
import { deregistrationRequestRoute } from "../routes";

function Deregistration() {
  const [batch, setBatch] = useState(""); // State for batch
  const [semester, setSemester] = useState(null); // State for semester
  const [txnNo, setTxnNo] = useState(""); // State for transaction number
  const [deregistrationRemark, setDeregistrationRemark] = useState(""); // State for deregistration remark
  const [endDate, setEndDate] = useState(null); // State for end date

  const rollNo = useSelector((state) => state.user.roll_no); // Get roll number from state
  const name = useSelector((state) => state.user.username); // Get name from state

  // Generate a random transaction number (Txn_no)
  const generateTxnNo = () => {
    const randomTxn = Math.floor(Math.random() * 1000000000); // Generate a random 9-digit number
    setTxnNo(randomTxn);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!rollNo || !deregistrationRemark || !endDate) {
      alert("Please fill out all required fields.");
      return;
    }

    const data = {
      txn_no: txnNo || generateTxnNo(),
      student_id: rollNo,
      batch,
      semester,
      deregistration_remark: deregistrationRemark, // Include the remark
      end_date: endDate.toISOString().split("T")[0], // Format end date as YYYY-MM-DD
    };

    try {
      const response = await axios.post(deregistrationRequestRoute, data, {
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
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
          Deregistration Form
        </Title>

        <form onSubmit={handleSubmit}>
          <Grid grow>
            {/* Display Name */}
            <Grid.Col span={12}>
              <TextInput
                label="Name"
                value={name || ""}
                readOnly
                size="md"
                mb="md"
                radius="md"
              />
            </Grid.Col>

            {/* Roll Number Display */}
            <Grid.Col span={6}>
              <TextInput
                label="Roll No."
                value={rollNo || ""}
                readOnly
                size="md"
                mb="md"
                radius="md"
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
                max={8} // Adjust max value as necessary
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

            {/* End Date Picker */}
            <Grid.Col span={6}>
              <DatePicker
                label="Select End Date"
                placeholder="Pick a date"
                value={endDate}
                onChange={setEndDate}
                required
                radius="md"
                size="md"
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

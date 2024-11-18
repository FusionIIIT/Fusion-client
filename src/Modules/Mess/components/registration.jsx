import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Container,
  Title,
  Paper,
  FileInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import axios from "axios";

function Registration() {
  const [txnNo, setTxnNo] = useState("");
  const [amount, setAmount] = useState(0);
  const [file, setFile] = useState(null);
  const [paymentDate, setPaymentDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    // Format the dates to YYYY-MM-DD format for submission
    const formattedPaymentDate = paymentDate
      ? paymentDate.toISOString().split("T")[0]
      : "";
    const formattedStartDate = startDate
      ? startDate.toISOString().split("T")[0]
      : "";

    const formData = new FormData();
    formData.append("Txn_no", txnNo);
    formData.append("amount", amount);
    formData.append("img", file);
    formData.append("payment_date", formattedPaymentDate);
    formData.append("start_date", formattedStartDate);
    formData.append("student_id", studentId);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/mess/api/registrationRequestApi",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`,
          },
        },
      );

      if (response.status === 200) {
        console.log("Form submitted successfully", response.data);
      }
    } catch (errors) {
      setError("Error submitting the form. Please try again.");
      console.error("Error:", errors.response?.data || errors.message);
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
          Registration Form
        </Title>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Transaction No."
            placeholder="Transaction No."
            value={txnNo}
            onChange={(e) => setTxnNo(e.target.value)}
            required
            radius="md"
            size="md"
            mt="xl"
            mb="md"
          />

          <NumberInput
            label="Amount"
            placeholder="Balance Amount"
            value={amount}
            onChange={setAmount}
            required
            radius="md"
            size="md"
            min={0}
            step={100}
            mb="lg"
          />

          <FileInput
            label="Image"
            placeholder="Choose file"
            value={file}
            onChange={setFile}
            accept="image/*"
            required
            size="md"
            mb="lg"
          />

          <DateInput
            label="Payment Date"
            placeholder="Select date"
            value={paymentDate}
            onChange={setPaymentDate}
            required
            radius="md"
            size="md"
            mb="lg"
            valueFormat="MMMM D, YYYY" // Display format
          />

          <DateInput
            label="Start Date"
            placeholder="Select date"
            value={startDate}
            onChange={setStartDate}
            required
            radius="md"
            size="md"
            mb="lg"
            valueFormat="MMMM D, YYYY" // Display format
          />

          <TextInput
            label="Student ID"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            radius="md"
            size="md"
            mb="lg"
          />

          <Button fullWidth size="md" radius="md" color="blue" type="submit">
            Submit
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Registration;

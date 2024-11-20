import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Container,
  Title,
  Paper,
  Space,
  FileInput,
} from "@mantine/core"; // Import Mantine components
import { DateInput } from "@mantine/dates";
import { User } from "@phosphor-icons/react"; // Import Phosphor Icons
import "@mantine/dates/styles.css"; // Import Mantine DateInput styles
import dayjs from "dayjs";
import axios from "axios";
import { updateBalanceRequestRoute } from "../routes";

function UpdateBalanceRequest() {
  const [image, setImage] = useState(null);
  const [paymentDate, setPaymentDate] = useState(null);
  const [transactionNo, setTransactionNo] = useState("");
  const [amount, setAmount] = useState(null);
  const [rollNumber, setRollNumber] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("authToken");

    const formData = new FormData();
    formData.append("Txn_no", transactionNo);
    formData.append("amount", amount);
    formData.append("payment_date", dayjs(paymentDate).format("YYYY-MM-DD"));
    formData.append("img", image);
    formData.append("student_id", rollNumber);

    try {
      const response = await axios.post(updateBalanceRequestRoute, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response:", response.data);

      setTransactionNo("");
      setAmount(null);
      setPaymentDate(null);
      setImage(null);
      setImage(null);
      setRollNumber(null);
    } catch (error) {
      console.error("Error posting data:", error);
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
          Update Balance Request
        </Title>

        <form onSubmit={handleSubmit}>
          {/* Transaction Number input */}
          <TextInput
            label="Transaction No."
            placeholder="Transaction No."
            id="TxnNo"
            required
            radius="md"
            size="md"
            icon={<User size={20} />}
            labelProps={{ style: { marginBottom: "10px" } }}
            mt="xl"
            mb="md"
            value={transactionNo}
            onChange={(event) => setTransactionNo(event.currentTarget.value)}
          />

          {/* Amount input */}
          <NumberInput
            label="Amount"
            placeholder="Balance Amount"
            id="amount"
            required
            radius="md"
            size="md"
            labelProps={{ style: { marginBottom: "10px" } }}
            min={0}
            step={100}
            mb="lg"
            value={amount}
            onChange={(value) => setAmount(value)}
          />

          {/* Image input */}
          <FileInput
            label="Image"
            placeholder="Choose file"
            value={image}
            onChange={setImage}
            accept="image/*"
            required
            size="md"
            labelProps={{ style: { marginBottom: "10px" } }}
            mb="lg"
          />

          {/* Payment Date select */}
          <DateInput
            label="Payment Date"
            placeholder="MM/DD/YYYY"
            value={paymentDate}
            onChange={setPaymentDate}
            required
            radius="md"
            size="md"
            mb="lg"
            labelProps={{ style: { marginBottom: "10px" } }}
            styles={(theme) => ({
              dropdown: {
                backgroundColor: theme.colors.gray[0],
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              },
              day: {
                "&[data-selected]": {
                  backgroundColor: theme.colors.blue[6],
                },
                "&[data-today]": {
                  backgroundColor: theme.colors.gray[2],
                  fontWeight: "bold",
                },
              },
            })}
          />

          <TextInput
            label="Roll No."
            placeholder="Roll Number"
            id="RollNo"
            required
            radius="md"
            size="md"
            icon={<User size={20} />}
            labelProps={{ style: { marginBottom: "10px" } }}
            mt="xl"
            mb="md"
            value={rollNumber}
            onChange={(event) => setRollNumber(event.currentTarget.value)}
          />

          <Space h="xl" />

          {/* Submit button */}
          <Button type="submit" fullWidth size="md" radius="md" color="blue">
            Update
          </Button>
        </form>
      </Paper>
      <Space h="xl" />
    </Container>
  );
}

export default UpdateBalanceRequest;

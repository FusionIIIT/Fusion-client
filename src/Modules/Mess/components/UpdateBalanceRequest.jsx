import React, { useState } from "react";
import {
  FileInput,
  NumberInput,
  Button,
  Container,
  Title,
  Paper,
  Group,
  TextInput,
  Textarea,
  Alert,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { Receipt, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { updateBalanceRequestRoute } from "../routes";

function UpdateBalanceRequest() {
  const [txnNo, setTxnNo] = useState("");
  const [amount, setAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(null);
  const [remark, setRemark] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!paymentDate) {
      setError("Please select the payment date.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("Txn_no", txnNo);
      formData.append("amount", amount || 0);
      formData.append("payment_date", paymentDate.toISOString().split("T")[0]);
      formData.append("update_remark", remark);
      if (file) {
        formData.append("img", file);
      }

      const response = await axios.post(updateBalanceRequestRoute, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      notifications.show({
        title: "Request Submitted",
        message:
          response.data.message ||
          "Payment update request submitted successfully.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
      setTxnNo("");
      setAmount(0);
      setPaymentDate(null);
      setRemark("");
      setFile(null);
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to submit the request.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="md" px={0} mt="lg">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={3} mb="lg" c="#1c7ed6">
          Submit Balance Update Request
        </Title>

        {error && (
          <Alert color="red" icon={<WarningCircle size={18} />} mb="lg">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Group grow mb="md">
            <TextInput
              label="Transaction Number"
              value={txnNo}
              onChange={(event) => setTxnNo(event.currentTarget.value)}
              required
              leftSection={<Receipt size={16} />}
            />
            <NumberInput
              label="Amount"
              value={amount}
              onChange={setAmount}
              min={0}
              required
            />
          </Group>

          <Group grow mb="md" align="flex-start">
            <DateInput
              label="Payment Date"
              value={paymentDate}
              onChange={setPaymentDate}
              required
              maxDate={new Date()}
            />
            <FileInput
              label="Receipt / Proof"
              value={file}
              onChange={setFile}
              accept="image/*,.pdf"
            />
          </Group>

          <Textarea
            label="Remark"
            placeholder="Explain what should be updated in your payment history"
            value={remark}
            onChange={(event) => setRemark(event.currentTarget.value)}
            minRows={3}
            mb="xl"
          />

          <Button type="submit" loading={isSubmitting}>
            Submit Request
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default UpdateBalanceRequest;

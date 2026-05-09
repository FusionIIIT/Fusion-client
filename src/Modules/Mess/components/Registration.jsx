import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Container,
  Title,
  FileInput,
  Textarea,
  Select,
  Group,
  Text,
  Alert,
  Card,
  Grid,
} from "@mantine/core";
import { useSelector } from "react-redux";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import {
  FunnelSimple,
  WarningCircle,
  CheckCircle,
  Receipt,
  IdentificationCard,
} from "@phosphor-icons/react";
import { registrationRequestRoute } from "../routes";

function Registration() {
  const roll_no = useSelector((state) => state.user.roll_no);
  const [txnNo, setTxnNo] = useState("");
  const [amount, setAmount] = useState(0);
  const [file, setFile] = useState(null);
  const [paymentDate, setPaymentDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [error, setError] = useState(null);
  const [messOption, setMessOption] = useState("");
  const [remark, setRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      const msg = "Authentication token not found.";
      setError(msg);
      notifications.show({ title: "Error", message: msg, color: "red" });
      setIsSubmitting(false);
      return;
    }

    const formattedPaymentDate = paymentDate
      ? paymentDate.toISOString().split("T")[0]
      : "";
    const formattedStartDate = startDate
      ? startDate.toISOString().split("T")[0]
      : "";

    const formData = new FormData();
    formData.append("Txn_no", txnNo);
    formData.append("amount", amount);
    if (file) formData.append("img", file);
    formData.append("payment_date", formattedPaymentDate);
    formData.append("start_date", formattedStartDate);
    formData.append("mess_option", messOption);
    formData.append("student_id", roll_no);
    formData.append("registration_remark", remark);

    try {
      const response = await axios.post(registrationRequestRoute, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setError(null);
        notifications.show({
          title: "Registration Success",
          message:
            "Your mess registration has been submitted and is awaiting approval.",
          color: "green",
          icon: <CheckCircle size={20} />,
        });

        setTxnNo("");
        setAmount(0);
        setFile(null);
        setPaymentDate(null);
        setStartDate(null);
        setMessOption("");
        setRemark("");
      }
    } catch (errors) {
      const errorMessage =
        errors.response?.data?.message ||
        "Error submitting the form. Please try again.";
      setError(errorMessage);
      notifications.show({
        title: "Registration Failed",
        message: errorMessage,
        color: "red",
        icon: <WarningCircle size={20} />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="md" px={0} mt="lg">
      <Card
        shadow="sm"
        radius="lg"
        p="xl"
        withBorder
        style={{ backgroundColor: "#ffffff" }}
      >
        <Group mb="xl" align="flex-start">
          <IdentificationCard size={36} color="#1A2980" weight="duotone" />
          <div style={{ flex: 1 }}>
            <Title order={3} fw={800} style={{ color: "#1A2980" }}>
              Enroll in Mess
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              Submit your receipt details and register for the upcoming mess
              cycle.
            </Text>
          </div>
        </Group>

        {error && (
          <Alert
            icon={<WarningCircle size={20} />}
            color="red"
            title="Error"
            mb="xl"
            radius="md"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Preferred Mess"
                placeholder="Select an option"
                value={messOption}
                onChange={setMessOption}
                data={[
                  { value: "mess1", label: "Central Mess 1" },
                  { value: "mess2", label: "Central Mess 2" },
                ]}
                radius="md"
                size="md"
                required
                leftSection={<FunnelSimple size={18} />}
                comboboxProps={{ shadow: "md" }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label="Start Date"
                placeholder="When will you start dining?"
                value={startDate}
                minDate={today}
                onChange={setStartDate}
                required
                radius="md"
                size="md"
                valueFormat="MMMM D, YYYY"
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Title order={5} mt="sm" mb="sm" style={{ color: "#495057" }}>
                Payment Details
              </Title>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Transaction No."
                placeholder="e.g. TXN123456789"
                value={txnNo}
                onChange={(e) => setTxnNo(e.target.value)}
                required
                radius="md"
                size="md"
                leftSection={<Receipt size={18} />}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Amount Paid"
                placeholder="₹ 0"
                value={amount}
                onChange={setAmount}
                required
                radius="md"
                size="md"
                min={0}
                step={100}
                prefix="₹ "
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label="Date of Payment"
                placeholder="When did you pay?"
                value={paymentDate}
                onChange={setPaymentDate}
                maxDate={today}
                required
                radius="md"
                size="md"
                valueFormat="MMMM D, YYYY"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <FileInput
                label="Payment Receipt/Screenshot"
                placeholder="Upload receipt..."
                value={file}
                onChange={setFile}
                accept="image/*,.pdf"
                required
                radius="md"
                size="md"
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Additional Remarks"
                placeholder="Any dietary preferences or notes for the warden..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                radius="md"
                size="md"
                minRows={3}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="xl">
            <Button
              type="submit"
              size="lg"
              radius="md"
              loading={isSubmitting}
              style={{
                paddingLeft: "40px",
                paddingRight: "40px",
                backgroundColor: "#1c7ed6",
              }}
            >
              Submit Registration
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
}

export default Registration;

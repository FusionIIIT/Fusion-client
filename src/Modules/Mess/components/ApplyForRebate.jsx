import React, { useState } from "react";
import {
  TextInput,
  Button,
  Container,
  Title,
  Paper,
  Space,
  Textarea,
} from "@mantine/core"; // Import Mantine components
import { DateInput } from "@mantine/dates";
import { Calendar } from "@phosphor-icons/react"; // Import Phosphor Icons
import "@mantine/dates/styles.css"; // Import Mantine DateInput styles
import "dayjs/locale/en"; // Day.js for locale support

function RebateApplication() {
  const [rebateFromDate, setRebateFromDate] = useState(null); // State for rebate from date
  const [rebateToDate, setRebateToDate] = useState(null); // State for rebate to date

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
          Rebate Application Form
        </Title>

        <form method="post" action="/path/to/your/rebate/endpoint">
          {/* Mess input */}
          <TextInput
            label="Mess"
            placeholder="Enter your mess"
            id="mess"
            required
            radius="md"
            size="md"
            labelProps={{ style: { marginBottom: "10px" } }}
            mt="xl"
            mb="md"
          />

          {/* Rebate From Date input */}
          <DateInput
            label="Rebate From"
            placeholder="MM/DD/YYYY"
            value={rebateFromDate}
            onChange={setRebateFromDate}
            required
            radius="md"
            size="md"
            icon={<Calendar size={20} />}
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
            mb="lg"
          />

          {/* Rebate To Date input */}
          <DateInput
            label="Rebate To"
            placeholder="MM/DD/YYYY"
            value={rebateToDate}
            onChange={setRebateToDate}
            required
            radius="md"
            size="md"
            icon={<Calendar size={20} />}
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
            mb="lg"
          />

          {/* Purpose textarea */}
          <Textarea
            label="Purpose"
            placeholder="Enter the purpose of the rebate"
            id="purpose"
            required
            radius="md"
            size="md"
            labelProps={{ style: { marginBottom: "10px" } }}
            mb="lg"
          />

          <Space h="xl" />

          {/* Submit button */}
          <Button fullWidth size="md" radius="md" color="blue">
            Submit
          </Button>
        </form>
      </Paper>
      <Space h="xl" />
    </Container>
  );
}

export default RebateApplication;

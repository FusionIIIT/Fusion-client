import React, { useState } from "react";
import {
  Button,
  Container,
  Title,
  Paper,
  Space,
  Textarea,
  Group,
  Select,
  Grid,
} from "@mantine/core"; // Import Mantine components
import { DateInput } from "@mantine/dates";
import { Calendar, FunnelSimple } from "@phosphor-icons/react"; // Import Phosphor Icons
import "@mantine/dates/styles.css"; // Import Mantine DateInput styles
import "dayjs/locale/en"; // Day.js for locale support

function RebateApplication() {
  const [rebateFromDate, setRebateFromDate] = useState(null); // State for rebate from date
  const [rebateToDate, setRebateToDate] = useState(null); // State for rebate to date
  const [messOption, setMessOption] = useState(""); // State for mess option

  return (
    <Container
      size="lg"
      style={{
        display: "flex",
        justifyContent: "center", // Centers the form horizontally
        marginTop: "20px",
      }}
    >
      <Paper
        shadow="md"
        radius="md"
        p="xl"
        withBorder
        style={{
          width: "100%",
          minWidth: "70rem", // Set the min-width to 75rem
          padding: "2rem", // Add padding for better spacing
        }}
      >
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Rebate Application Form
        </Title>

        <form method="post" action="/path/to/your/rebate/endpoint">
          {/* Dropdown for mess option */}
          <Group grow mb="lg">
            <Select
              label="Select Mess"
              placeholder="Choose Mess"
              value={messOption}
              onChange={setMessOption}
              data={["Mess 1", "Mess 2"]}
              radius="md"
              size="md"
              icon={<FunnelSimple size={18} />} // Phosphor icon
            />
          </Group>

          <Grid grow>
            {/* New Amount input (left side of the grid) */}
            <Grid.Col span={6}>
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
            </Grid.Col>

            {/* Month select input (right side of the grid) */}
            <Grid.Col span={6}>
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
            </Grid.Col>
          </Grid>

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

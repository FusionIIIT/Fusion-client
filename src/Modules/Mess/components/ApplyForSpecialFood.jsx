import React, { useState } from "react";
import {
  Button,
  Select,
  Container,
  Paper,
  Title,
  Group,
  Flex,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import "dayjs/locale/en";
import { Calendar, FunnelSimple } from "@phosphor-icons/react";

function ApplyForSpecialFood() {
  const [messOption, setMessOption] = useState("");
  const [food, setFood] = useState("");
  const [timing, setTiming] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [purpose, setPurpose] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here
  };

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
        <Title
          order={2}
          align="center"
          mb="lg"
          style={{ color: "#1c7ed6", fontWeight: 600 }}
        >
          Apply for Special Food
        </Title>

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="md">
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
            <Select
              label="Select Food"
              placeholder="Choose food"
              data={["Dal Chawal", "Paneer Butter Masala", "Chicken Curry"]}
              value={food}
              onChange={setFood}
              required
            />
            <Select
              label="Select Food Timing"
              placeholder="Choose timing"
              data={["Breakfast", "Lunch", "Dinner"]}
              value={timing}
              onChange={setTiming}
              required
            />
            <DateInput
              label="From"
              placeholder="Select start date"
              value={fromDate}
              onChange={setFromDate}
              icon={<Calendar />}
              required
            />
            <DateInput
              label="To"
              placeholder="Select end date"
              value={toDate}
              onChange={setToDate}
              icon={<Calendar />}
              required
            />
            <Textarea
              label="Purpose"
              placeholder="Enter purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.currentTarget.value)}
              required
            />
          </Flex>

          <Group position="right" mt="lg">
            <Button type="submit" color="blue" size="md">
              Submit
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

export default ApplyForSpecialFood;

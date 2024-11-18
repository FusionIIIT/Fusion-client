import React, { useState } from "react";
import {
  Button,
  TextInput,
  Select,
  Textarea,
  Container,
  Paper,
  Title,
  Group,
  Flex,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import "dayjs/locale/en";
import { Calendar } from "@phosphor-icons/react";

function ApplyForSpecialFood() {
  const [mess, setMess] = useState("");
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
      size="sm"
      style={{ maxWidth: "800px", width: "570px", marginTop: "25px" }}
    >
      <Paper shadow="md" radius="md" p="lg" withBorder>
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
            <TextInput
              label="Mess"
              placeholder="Enter mess"
              value={mess}
              onChange={(event) => setMess(event.currentTarget.value)}
              required
            />
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

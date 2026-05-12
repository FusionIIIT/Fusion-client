import React, { useState } from "react";
import {
  MantineProvider,
  Button,
  Box,
  Text,
  TextInput,
  Grid,
  Select,
  Paper,
} from "@mantine/core";
import RoomAvailabilityDetails from "./RoomAvailabilityDetails";

const ROOM_CATEGORIES = [
  { value: "A", label: "Category A" },
  { value: "B", label: "Category B" },
  { value: "C", label: "Category C" },
  { value: "D", label: "Category D" },
];

function RoomAvailabilityContainer() {
  const [showForm, setShowForm] = useState(false);
  const [bookingFrom, setBookingFrom] = useState("");
  const [bookingTo, setBookingTo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleButtonClick = () => {
    setShowForm(true);
  };

  return (
    <Box p="md" style={{ margin: 10 }}>
      <Box
        mb="md"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          style={{ display: "flex", justifyContent: "center", width: "90%" }}
        >
          <Text
            style={{
              paddingBottom: 10,
              fontWeight: "bold",
              fontSize: "24px",
              color: "#228be6",
            }}
          >
            Rooms Availability
          </Text>
        </Box>

        <Button
          variant="outline"
          color="green"
          onClick={handleButtonClick}
          sx={{ paddingLeft: "10px" }}
          disabled={!bookingFrom || !bookingTo || !selectedCategory}
        >
          Submit
        </Button>
      </Box>

      <Paper
        mt="md"
        p="md"
        withBorder
        radius="md"
        style={{ borderColor: "#E0E0E0" }}
      >
        <Grid gutter="md" align="end">
          <Grid.Col span={4}>
            <TextInput
              label="Booking From"
              placeholder="From"
              type="date"
              required
              value={bookingFrom}
              onChange={(event) => setBookingFrom(event.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="Booking To"
              placeholder="To"
              type="date"
              required
              value={bookingTo}
              onChange={(event) => setBookingTo(event.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Category"
              placeholder="Select category"
              data={ROOM_CATEGORIES}
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value || "")}
              clearable
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {showForm && (
        <RoomAvailabilityDetails
          bookingFrom={bookingFrom}
          bookingTo={bookingTo}
          selectedCategory={selectedCategory}
          onClose={() => setShowForm(false)}
        />
      )}
    </Box>
  );
}

function RoomAvailabilityPage() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Box
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <RoomAvailabilityContainer />
      </Box>
    </MantineProvider>
  );
}

export default RoomAvailabilityPage;

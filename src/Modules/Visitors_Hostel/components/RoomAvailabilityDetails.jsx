import React, { useState, useEffect } from "react";
import {
  MantineProvider,
  Grid,
  Button,
  Box,
  Text,
  Card,
  Group,
  Badge,
} from "@mantine/core";
import PropTypes from "prop-types";
import { roomsAPI } from "../services/visitorHostelApi";

function RoomAvailabilityDetails({ bookingFrom, bookingTo, selectedCategory }) {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [partialBookingData, setPartialBookingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const roomData = {
    A: ["A01", "A02", "A03", "A04", "A05", "A06"],
    B: ["B01", "B02", "B03", "B04", "B05", "B06"],
    C: ["C01", "C02", "C03", "C04", "C05", "C06"],
    D: ["D01", "D02", "D03", "D04"],
  };

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (!selectedCategory) {
        setAvailableRooms([]);
        setError("Please select a category to check availability.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use service layer for room availability
        const rooms = await roomsAPI.getAvailableRooms(bookingFrom, bookingTo, selectedCategory);
        setAvailableRooms(rooms || []);
      } catch (err) {
        const errorMsg = err?.message || "Error fetching available rooms";
        console.error("Error fetching available rooms:", err);
        setError(errorMsg);
        setAvailableRooms([]);
      } finally {
        setLoading(false);
      }
    };

    // Note: Partial booking data endpoint not yet available in REST API
    // TODO: Implement this endpoint or remove feature if not needed
    const fetchPartialBookingData = async () => {
      try {
        // Placeholder - will be implemented when API endpoint is available
        setPartialBookingData([]);
      } catch (err) {
        console.error("Error fetching partial booking data:", err);
        setPartialBookingData([]);
      }
    };

    if (bookingFrom && bookingTo) {
      fetchAvailableRooms();
      fetchPartialBookingData();
    }
  }, [bookingFrom, bookingTo, selectedCategory]);

  const filteredPartialBookingData = partialBookingData.filter(
    (data) => data.available_ranges && data.available_ranges.length > 0,
  );

  const getButtonColor = (room) => {
    if (availableRooms.includes(room)) {
      return "green";
    }
    const partialRoom = filteredPartialBookingData.find(
      (data) => data.room_number === room,
    );
    if (partialRoom) {
      return "yellow";
    }
    return "red";
  };

  return (
    <MantineProvider theme={{ fontFamily: "Arial, sans-serif" }}>
      <Box>
        {Object.keys(roomData)
          .filter((section) => !selectedCategory || selectedCategory === section)
          .map((section) => (
            <Grid
              key={section}
              justify="center"
              gutter="xs"
              style={{ marginBottom: "10px", marginTop: "10px" }}
            >
              {roomData[section].map((room) => (
                <Grid.Col
                  span={1}
                  key={room}
                  style={{ textAlign: "center", padding: "5px" }}
                >
                  <Button
                    variant="filled"
                    color={getButtonColor(room)}
                    style={{ width: "64px", height: "40px" }}
                  >
                    {room}
                  </Button>
                </Grid.Col>
              ))}
            </Grid>
          ))}
      </Box>

      <Box mt="xl">
        <Text size="xl" weight={700} mb="md" style={{ fontWeight: "bold" }}>
          Partial Booking Availability
        </Text>
        {filteredPartialBookingData.length > 0 ? (
          <Grid>
            {filteredPartialBookingData.map((data) => (
              <Grid.Col key={data.room_id} span={6}>
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  <Group position="apart" mb="xs">
                    <Text weight={600} style={{ fontWeight: "bold" }}>
                      Room {data.room_number}
                    </Text>
                    <Badge color="yellow" variant="light">
                      Partial
                    </Badge>
                  </Group>
                  <Text size="sm" color="dimmed" mb="xs">
                    Partial availability:
                  </Text>
                  <Box
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {data.available_ranges.map((range, index) => (
                      <Button
                        key={index}
                        variant="light"
                        color="blue"
                        style={{
                          backgroundColor: "#E6F3FF",
                          fontSize: "12px",
                          flex: "1 1 45%",
                          marginTop: "5px",
                        }}
                      >
                        From {new Date(range.from).toLocaleDateString()} to{" "}
                        {new Date(range.to).toLocaleDateString()}
                      </Button>
                    ))}
                  </Box>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <Text align="center" color="dimmed">
              No partial bookings available.
            </Text>
          </Card>
        )}
      </Box>
    </MantineProvider>
  );
}

RoomAvailabilityDetails.propTypes = {
  bookingFrom: PropTypes.string.isRequired,
  bookingTo: PropTypes.string.isRequired,
  selectedCategory: PropTypes.string,
};

export default RoomAvailabilityDetails;

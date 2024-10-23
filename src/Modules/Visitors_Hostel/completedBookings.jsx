import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { MantineProvider, Table, Text, Box } from "@mantine/core";
import axios from "axios";
import { host } from "../../routes/globalRoutes"; // Adjust the import as needed

function BookingTable({ bookings }) {
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
        <Text size="xl" style={{ paddingBottom: 15, fontWeight: "bold" }}>
          Completed Bookings
        </Text>
      </Box>
      <Table
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #E0E0E0",
        }}
      >
        <thead>
          <tr>
            <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>
              Intender
            </th>
            <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>
              Booking Date
            </th>
            <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>
              Check In
            </th>
            <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>
              Check Out
            </th>
            <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>
              Category
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #E0E0E0",
                  textAlign: "center",
                }}
              >
                <Text weight={500}>{booking.intender}</Text>
                <Text size="sm" color="dimmed">
                  {booking.email}
                </Text>
              </td>
              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #E0E0E0",
                  textAlign: "center",
                }}
              >
                {booking.bookingFrom}
              </td>
              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #E0E0E0",
                  textAlign: "center",
                }}
              >
                {booking.checkIn}
              </td>
              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #E0E0E0",
                  textAlign: "center",
                }}
              >
                {booking.checkOut}
              </td>
              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #E0E0E0",
                  textAlign: "center",
                }}
              >
                {booking.category}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}

// Define prop types for BookingTable
BookingTable.propTypes = {
  bookings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      intender: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      bookingFrom: PropTypes.string.isRequired,
      checkIn: PropTypes.string.isRequired,
      checkOut: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

function CompletedBookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchCompletedBookings = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return console.error("No authentication token found!");
      }

      try {
        const { data } = await axios.get(
          `${host}/visitorhostel/get-completed-bookings/`,
          {
            headers: { Authorization: `Token ${token}` },
          },
        );
        setBookings(data.completed_bookings);
      } catch (error) {
        console.error("Error fetching completed bookings:", error);
      }
    };

    fetchCompletedBookings();
  }, []);

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
        <BookingTable bookings={bookings} />
      </Box>
    </MantineProvider>
  );
}

export default CompletedBookingsPage;
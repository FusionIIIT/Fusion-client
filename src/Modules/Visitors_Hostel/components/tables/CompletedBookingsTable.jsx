/**
 * CompletedBookingsTable
 * Displays all completed bookings (checked out) with duration and bill status
 */

import React, { useState, useEffect } from "react";
import {
  Table,
  Group,
  Badge,
  Box,
  Text,
  TextInput,
  Alert,
  LoadingOverlay,
  Pagination,
  ActionIcon,
  Select,
  Button,
} from "@mantine/core";
import { IconSearch, IconRefresh } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { bookingsAPI } from "../../services/visitorHostelApi";

const BILL_STATUS_COLORS = {
  paid: "green",
  pending: "yellow",
  cancelled: "red",
};

const BOOKING_STATUS_COLORS = {
  Complete: "green",
  Canceled: "red",
};

const BILL_SETTLEMENT_OPTIONS = [
  { value: "Intender", label: "Intender" },
  { value: "Visitor", label: "Visitor" },
  { value: "ProjectNo", label: "Project No" },
  { value: "Institute", label: "Institute" },
];

function CompletedBookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [settlingBookingId, setSettlingBookingId] = useState(null);

  const role = useSelector((state) => state.user?.role);
  const isIncharge = role === "VhIncharge";

  useEffect(() => {
    fetchCompletedBookings();
  }, [page]);

  const fetchCompletedBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingsAPI.getCompletedBookings({
        page,
        page_size: pageSize,
      });

      if (response.success) {
        setBookings(response.data || []);
        setTotalPages(response.total_pages || 1);
      } else {
        setError(response.message || "Failed to fetch completed bookings");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const query = searchQuery.toLowerCase();
    return (
      booking.intender_name?.toLowerCase().includes(query) ||
      booking.visitor_email?.toLowerCase().includes(query) ||
      booking.id?.toString().includes(query)
    );
  });

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "N/A";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? "s" : ""}`;
  };

  const handleSettlementChange = (bookingId, billToBeSettledBy) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? { ...booking, bill_to_be_settled_by: billToBeSettledBy || "Intender" }
          : booking
      )
    );
  };

  const handleSettleBill = async (booking) => {
    try {
      setSettlingBookingId(booking.id);
      await bookingsAPI.settleBill(
        booking.id,
        booking.bill_to_be_settled_by || "Intender",
        true,
        Number(booking.meal_bill || 0),
        Number(booking.room_bill || 0),
        Number(booking.extra_charges || 0)
      );
      fetchCompletedBookings();
    } catch (err) {
      setError(err.detail || err.error || "Failed to settle bill");
    } finally {
      setSettlingBookingId(null);
    }
  };

  if (loading && page === 1) {
    return (
      <Box p="md">
        <LoadingOverlay visible={true} />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert type="error" mb="md">
          {error}
        </Alert>
      )}

      {/* Search and Controls */}
      <Group mb="md" justify="space-between">
        <TextInput
          placeholder="Search by name, email, or ID..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: "400px" }}
        />
        <ActionIcon onClick={fetchCompletedBookings} loading={loading} variant="default">
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>

      {/* Table */}
      <Box style={{ position: "relative", overflow: "auto" }}>
        <LoadingOverlay visible={loading && page !== 1} />
        {filteredBookings.length === 0 ? (
          <Alert type="info">No completed bookings found</Alert>
        ) : (
          <>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Guest Name</th>
                  <th>Booking Status</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Duration</th>
                  <th>Source</th>
                  <th>Meal Bill</th>
                  <th>Room Bill</th>
                  <th>Extra Charges</th>
                  <th>Cancellation Charges</th>
                  <th>Total Bill</th>
                  <th>Payment Mode</th>
                  <th>Transaction ID</th>
                  <th>Offline Bill ID</th>
                  <th>Proof</th>
                  <th>Settled By</th>
                  <th>Bill Status</th>
                  {isIncharge && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.intender_name}</td>
                    <td>
                      <Badge color={BOOKING_STATUS_COLORS[booking.status] || "gray"}>
                        {(booking.status || "N/A").toUpperCase()}
                      </Badge>
                    </td>
                    <td>{booking.booking_from}</td>
                    <td>{booking.booking_to}</td>
                    <td>
                      <Text size="sm">
                        {calculateDuration(booking.booking_from, booking.booking_to)}
                      </Text>
                    </td>
                    <td>
                      {/* UC-VH-006: Show booking source */}
                      <Badge
                        size="sm"
                        color={booking.is_offline ? "blue" : "gray"}
                        variant={booking.is_offline ? "filled" : "light"}
                      >
                        {booking.booking_source || "online"}
                      </Badge>
                    </td>
                    <td>Rs. {Number(booking.meal_bill || 0)}</td>
                    <td>Rs. {Number(booking.room_bill || 0)}</td>
                    <td>Rs. {Number(booking.extra_charges || 0)}</td>
                    <td>Rs. {Number(booking.cancellation_charges || 0)}</td>
                    <td>Rs. {Number(booking.total_bill || 0)}</td>
                    <td>{booking.payment_mode || "-"}</td>
                    <td>{booking.transaction_id || "-"}</td>
                    <td>{booking.offline_bill_id || "-"}</td>
                    <td>
                      {booking.payment_mode === "online" && booking.payment_screenshot ? (
                        <a href={booking.payment_screenshot} target="_blank" rel="noreferrer">Screenshot</a>
                      ) : booking.payment_mode === "offline" && booking.offline_bill_photo ? (
                        <a href={booking.offline_bill_photo} target="_blank" rel="noreferrer">Bill Photo</a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {isIncharge && booking.bill_status !== "paid" ? (
                        <Select
                          data={BILL_SETTLEMENT_OPTIONS}
                          value={booking.bill_to_be_settled_by || "Intender"}
                          onChange={(value) => handleSettlementChange(booking.id, value)}
                          size="xs"
                          w={140}
                        />
                      ) : (
                        <Text size="sm">{booking.bill_to_be_settled_by || "Intender"}</Text>
                      )}
                    </td>
                    <td>
                      <Badge color={BILL_STATUS_COLORS[booking.bill_status] || "gray"}>
                        {booking.bill_status?.toUpperCase() || "PENDING"}
                      </Badge>
                    </td>
                    {isIncharge && (
                      <td>
                        {booking.bill_status !== "paid" ? (
                          <Button
                            size="xs"
                            onClick={() => handleSettleBill(booking)}
                            loading={settlingBookingId === booking.id}
                          >
                            Mark Settled
                          </Button>
                        ) : (
                          <Text size="sm" c="green">Settled</Text>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            <Group justify="center" mt="md">
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                boundaries={1}
                siblings={1}
              />
            </Group>
          </>
        )}
      </Box>
    </Box>
  );
}

export default CompletedBookingsTable;

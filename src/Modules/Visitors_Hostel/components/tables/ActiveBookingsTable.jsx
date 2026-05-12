/**
 * ActiveBookingsTable
 * Displays all active bookings (confirmed and checked-in)
 * VHMS TRACEABILITY:
 * - UC-VH-007: Room allotment, active stay, check-in/check-out visibility
 * - UC-VH-010, BR-VH-011: Meal booking actions and deadline-aligned flow
 * Caretaker-led check-in flow with room allocation visibility
 */

import React, { useState, useEffect } from "react";
import {
  Table,
  Group,
  Badge,
  Box,
  ActionIcon,
  Tooltip,
  TextInput,
  Alert,
  LoadingOverlay,
  Pagination,
} from "@mantine/core";
import { IconEye, IconSearch, IconRefresh, IconToolsKitchen2 } from "@tabler/icons-react";
import MealBookingForm from "../forms/MealBookingForm";
import { mealsAPI } from "../../services/visitorHostelApi";
import { useSelector } from "react-redux";
import { bookingsAPI } from "../../services/visitorHostelApi";
import ViewActiveBookingModal from "../common/ViewActiveBookingModal";

const STATUS_COLORS = {
  Confirmed: "blue",
  CheckedIn: "green",
  Complete: "gray",
  Canceled: "red",
  Forward: "indigo",
};

function ActiveBookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [mealBookingOpen, setMealBookingOpen] = useState(false);
  const [selectedBookingForMeals, setSelectedBookingForMeals] = useState(null);

  const role = useSelector((state) => state.user?.role);

  useEffect(() => {
    fetchBookings();
  }, [page]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchBookings();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [page]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingsAPI.getActiveBookings({
        page,
        page_size: pageSize,
      });

      if (response.success) {
        setBookings(response.data || []);
        setTotalPages(response.total_pages || 1);
      } else {
        setError(response.message || "Failed to fetch active bookings");
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

  const handleViewDetails = async (booking) => {
    try {
      setLoadingDetails(true);
      const response = await bookingsAPI.getBookingDetail(booking.id);
      if (response.success && response.data) {
        setViewingBooking(response.data);
      } else {
        setError("Failed to load booking details");
      }
    } catch (err) {
      setError("Error loading booking details: " + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleMealBooking = async (booking) => {
    try {
      setLoadingDetails(true);
      const response = await bookingsAPI.getBookingDetail(booking.id);
      if (response.success && response.data) {
        setSelectedBookingForMeals(response.data);
        setMealBookingOpen(true);
      } else {
        setError("Failed to load booking details");
      }
    } catch (err) {
      setError("Error loading booking details: " + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleMealBookingSubmit = async (mealData) => {
    try {
      const result = await mealsAPI.bookMeals(mealData);
      if (result.success) {
        setMealBookingOpen(false);
        setSelectedBookingForMeals(null);
        fetchBookings(); // Refresh the table
      }
    } catch (error) {
      console.error("Error booking meals:", error);
      throw error;
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
        <ActionIcon onClick={fetchBookings} loading={loading} variant="default">
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>

      {/* Table */}
      <Box style={{ position: "relative", overflow: "auto" }}>
        <LoadingOverlay visible={loading && page !== 1} />
        {filteredBookings.length === 0 ? (
          <Alert type="info">No active bookings found</Alert>
        ) : (
          <>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Guest Name</th>
                  <th>Email</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Requested Rooms</th>
                  <th>Allocated Rooms</th>
                  <th>Status</th>
                  <th>Meals</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.intender_name}</td>
                    <td>{booking.visitor_email}</td>
                    <td>{booking.booking_from}</td>
                    <td>{booking.booking_to}</td>
                    <td>{booking.number_of_rooms || "N/A"}</td>
                    <td>
                      {Array.isArray(booking.allocated_rooms) && booking.allocated_rooms.length > 0
                        ? booking.allocated_rooms.join(", ")
                        : "Not allocated"}
                    </td>
                    <td>
                      <Badge color={STATUS_COLORS[booking.status] || "gray"}>
                        {booking.status?.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      {/* UC-VH-010: Meal booking indicators with fallback */}
                      {booking.has_meal_bookings ? (
                        <Badge 
                          size="sm" 
                          color="green" 
                          variant="filled"
                          leftSection={<IconToolsKitchen2 size={12} />}
                        >
                          {booking.total_meals_booked || 0} meals
                        </Badge>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#aaa' }}>
                          {booking.status === 'CheckedIn' ? 'No meals' : '-'}
                        </span>
                      )}
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
                    <td>
                      <Group spacing="xs">
                        <Tooltip label="View Details">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            onClick={() => handleViewDetails(booking)}
                            loading={loadingDetails}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        
                        {/* UC-VH-010: Meal Booking - Only for checked-in guests and VhCaretaker */}
                        {(role === "VhCaretaker") && booking.status === "CheckedIn" && (
                          <Tooltip label="Book Meals">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="blue"
                              onClick={() => handleMealBooking(booking)}
                              loading={loadingDetails}
                            >
                              <IconToolsKitchen2 size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </td>
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

      {/* Modals */}
      <ViewActiveBookingModal
        opened={!!viewingBooking}
        onClose={() => setViewingBooking(null)}
        bookingData={viewingBooking}
        userRole={role}
        onRefresh={fetchBookings}
        onCheckIn={async (payload) => {
          try {
            await bookingsAPI.checkIn(
              payload.bookingId,
              payload.name,
              payload.phone,
              payload.email || "",
              payload.address || "",
            );
            setViewingBooking(null);
            fetchBookings();
            return true;
          } catch (err) {
            setError(err.detail || err.error || "Failed to check in visitor.");
            return false;
          }
        }}
        onCheckOut={async (payload) => {
          try {
            await bookingsAPI.checkOut(
              payload.bookingId,
              Number(payload.mealBill || 0),
              Number(payload.roomBill || 0),
              payload.billSettlement || "Intender",
            );
            setViewingBooking(null);
            fetchBookings();
            return true;
          } catch (err) {
            setError(err.detail || err.error || "Failed to check out visitor.");
            return false;
          }
        }}
      />

      {/* UC-VH-010: Meal Booking Modal */}
      <MealBookingForm
        opened={mealBookingOpen}
        onClose={() => {
          setMealBookingOpen(false);
          setSelectedBookingForMeals(null);
        }}
        bookingData={selectedBookingForMeals}
        onMealBooking={handleMealBookingSubmit}
      />
    </Box>
  );
}

export default ActiveBookingsTable;

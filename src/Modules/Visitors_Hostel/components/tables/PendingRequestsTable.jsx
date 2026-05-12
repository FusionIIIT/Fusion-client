/**
 * PendingRequestsTable
 * Displays all pending booking requests for VhIncharge review
 * Actions: View, Confirm, Reject
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
  Button,
} from "@mantine/core";
import { IconEye, IconCheck, IconX, IconSearch, IconRefresh, IconArrowRight, IconEdit, IconPhone } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { bookingsAPI } from "../../services/visitorHostelApi";
import ViewBookingModal from "../common/ViewBookingModal";
import BookingRequestForm from "../forms/BookingRequestForm";
import UpdateBookingForm from "../forms/UpdateBookingForm";
import OfflineBookingForm from "../forms/OfflineBookingForm";

function PendingRequestsTable({ listMode = "queue" }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [bookingFormOpened, setBookingFormOpened] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [updateFormOpened, setUpdateFormOpened] = useState(false);
  const [offlineBookingFormOpened, setOfflineBookingFormOpened] = useState(false);

  const role = useSelector((state) => state.user?.role);

  useEffect(() => {
    fetchPendingBookings();
  }, [page, listMode]);

  const fetchPendingBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingsAPI.getPendingBookings({
        view: listMode,
        page,
        page_size: pageSize,
      });

      if (response.success) {
        setBookings(response.data || []);
        setTotalPages(response.total_pages || 1);
      } else {
        setError(response.message || "Failed to fetch pending bookings");
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
      booking.guest_name?.toLowerCase().includes(query) ||
      booking.guest_email?.toLowerCase().includes(query) ||
      booking.id?.toString().includes(query)
    );
  });

  const handleConfirm = async (booking) => {
    try {
      const result = await bookingsAPI.confirmBooking(
        booking.id,
        booking.visitor_category,
        [] // Empty rooms array - rooms will be assigned separately if needed
      );
      if (result.success) {
        fetchPendingBookings();
      } else {
        setError(result.detail || "Failed to confirm booking");
      }
    } catch (err) {
      setError("Failed to confirm booking: " + err.message);
    }
  };

  const handleForward = async (booking) => {
    try {
      const result = await bookingsAPI.forwardBooking(
        booking.id,
        booking.visitor_category,
        [],
        "Forwarded by caretaker"
      );
      if (result.success) {
        fetchPendingBookings();
      } else {
        setError(result.detail || "Failed to forward booking");
      }
    } catch (err) {
      setError("Failed to forward booking: " + err.message);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      const result = await bookingsAPI.rejectBooking(bookingId);
      if (result.success) {
        fetchPendingBookings();
      }
    } catch (err) {
      setError("Failed to reject booking");
    }
  };

  const handleCancelRequest = async (bookingId) => {
    try {
      const result = await bookingsAPI.cancelBookingRequest(bookingId);
      if (result.success) {
        fetchPendingBookings();
      } else {
        setError(result.detail || "Failed to request cancellation");
      }
    } catch (err) {
      setError("Failed to request cancellation: " + err.message);
    }
  };

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

  const handleModifyBooking = async (booking) => {
    try {
      setLoadingDetails(true);
      const response = await bookingsAPI.getBookingDetail(booking.id);
      if (response.success && response.data) {
        setEditingBooking(response.data);
        setUpdateFormOpened(true);
      } else {
        setError("Failed to load booking details for editing");
      }
    } catch (err) {
      setError("Error loading booking details: " + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateSuccess = () => {
    setUpdateFormOpened(false);
    setEditingBooking(null);
    fetchPendingBookings(); // Refresh the list
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
        <Group spacing="xs">
          <ActionIcon onClick={fetchPendingBookings} loading={loading} variant="default">
            <IconRefresh size={16} />
          </ActionIcon>
          {role !== "VhIncharge" && role !== "VhCaretaker" && (
            <Button 
              onClick={() => setBookingFormOpened(true)}
              size="sm"
              variant="filled"
            >
              + Create Booking
            </Button>
          )}
          {/* UC-VH-006: Offline booking button for caretakers */}
          {role === "VhCaretaker" && (
            <Button 
              onClick={() => setOfflineBookingFormOpened(true)}
              size="sm"
              variant="filled"
              color="blue"
              leftIcon={<IconPhone size={14} />}
            >
              Record Offline Booking
            </Button>
          )}
        </Group>
      </Group>

      {/* Booking Form Modal */}
      {bookingFormOpened && (
        <BookingRequestForm
          opened={bookingFormOpened}
          onClose={() => {
            setBookingFormOpened(false);
            fetchPendingBookings();
          }}
          onSuccess={() => {
            setBookingFormOpened(false);
            fetchPendingBookings();
          }}
        />
      )}

      {/* Table */}
      <Box style={{ position: "relative", overflow: "auto" }}>
        <LoadingOverlay visible={loading && page !== 1} />
        {filteredBookings.length === 0 ? (
          <Alert type="info">
            {listMode === "bookings" ? "No bookings found" : "No pending requests found"}
          </Alert>
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
                  <th>Status</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Persons</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.guest_name}</td>
                    <td>{booking.guest_email}</td>
                    <td>{booking.booking_from}</td>
                    <td>{booking.booking_to}</td>
                    <td>
                      <Badge
                        size="sm"
                        color={
                          booking.status === "Rejected"
                            ? "red"
                            : booking.status === "Forward"
                              ? "indigo"
                              : booking.status === "Pending"
                                ? "yellow"
                                : "gray"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge size="sm">{booking.visitor_category}</Badge>
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
                    <td>{booking.person_count || 1}</td>
                    <td>
                      <Group spacing="xs">
                        <Tooltip label="View Details">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="blue"
                            onClick={() => handleViewDetails(booking)}
                            loading={loadingDetails}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        
                        {/* ONLY VhIncharge can Confirm forwarded bookings */}
                        {role === "VhIncharge" && booking.status === "Forward" && (
                          <Tooltip label="Confirm Booking">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="green"
                              onClick={() => handleConfirm(booking)}
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}

                        {/* ONLY VhCaretaker can Forward pending bookings */}
                        {role === "VhCaretaker" && booking.status === "Pending" && (
                          <Tooltip label="Forward to VhIncharge">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="indigo"
                              onClick={() => handleForward(booking)}
                            >
                              <IconArrowRight size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        
                        {/* VhIncharge and VhCaretaker can Reject bookings */}
                        {((role === "VhIncharge" && booking.status === "Forward") ||
                          (role === "VhCaretaker" && booking.status === "Pending")) && (
                          <Tooltip label="Reject Booking">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="red"
                              onClick={() => handleReject(booking.id)}
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}

                        {/* Intender can modify booking only when status is Pending (UC-VH-003) */}
                        {role !== "VhIncharge" &&
                          role !== "VhCaretaker" &&
                          booking.status === "Pending" && (
                            <Tooltip label="Modify Booking">
                              <ActionIcon
                                size="sm"
                                variant="light"
                                color="blue"
                                onClick={() => handleModifyBooking(booking)}
                                loading={loadingDetails}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}

                        {/* Intender can request cancellation for active request states */}
                        {role !== "VhIncharge" &&
                          role !== "VhCaretaker" &&
                          ["Pending", "Forward", "Confirmed"].includes(booking.status) && (
                            <Tooltip label="Request Cancellation">
                              <ActionIcon
                                size="sm"
                                variant="light"
                                color="orange"
                                onClick={() => handleCancelRequest(booking.id)}
                              >
                                <IconX size={16} />
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
      <ViewBookingModal
        opened={!!viewingBooking}
        onClose={() => setViewingBooking(null)}
        bookingData={viewingBooking}
      />

      {/* Update Booking Modal */}
      <UpdateBookingForm
        opened={updateFormOpened}
        onClose={() => {
          setUpdateFormOpened(false);
          setEditingBooking(null);
        }}
        bookingId={editingBooking?.id}
        bookingData={editingBooking}
        onSuccess={handleUpdateSuccess}
      />

      {/* UC-VH-006: Offline Booking Modal */}
      <OfflineBookingForm
        opened={offlineBookingFormOpened}
        onClose={() => setOfflineBookingFormOpened(false)}
        onSuccess={() => {
          setOfflineBookingFormOpened(false);
          fetchPendingBookings(); // Refresh the list
        }}
      />
    </Box>
  );
}

export default PendingRequestsTable;

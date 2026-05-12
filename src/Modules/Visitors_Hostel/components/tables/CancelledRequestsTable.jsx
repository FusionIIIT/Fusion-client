/**
 * CancelledRequestsTable
 * Displays cancellation requests and allows caretaker/incharge review actions
 */

import React, { useState, useEffect } from "react";
import {
  Table,
  Group,
  Box,
  TextInput,
  Alert,
  LoadingOverlay,
  Pagination,
  ActionIcon,
  Modal,
  Text,
  Button,
} from "@mantine/core";
import { IconSearch, IconRefresh, IconInfoCircle, IconCheck, IconX } from "@tabler/icons-react";
import { bookingsAPI } from "../../services/visitorHostelApi";
import { useSelector } from "react-redux";

function CancelledRequestsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReason, setSelectedReason] = useState(null);
  const role = useSelector((state) => state.user?.role);
  const isStaff = role === "VhIncharge" || role === "VhCaretaker";

  useEffect(() => {
    fetchCancellationRequests();
  }, [page]);

  const fetchCancellationRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingsAPI.getCancelRequestedBookings({
        page,
        page_size: pageSize,
      });

      if (response.success) {
        setBookings(response.data || []);
        setTotalPages(response.total_pages || 1);
      } else {
        setError(response.message || "Failed to fetch cancellation requests");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    const txId = window.prompt("Enter online transaction ID for cancellation fee payment:");
    if (!txId) {
      setError("Transaction ID is required to approve cancellation.");
      return;
    }

    try {
      const response = await bookingsAPI.approveCancelRequest(bookingId, "", txId);
      if (!response.success) {
        setError(response.message || "Failed to approve cancellation request");
        return;
      }
      const finalCharges = Number(response.cancellation_charges || 0);
      window.alert(`Cancellation approved. Final cancellation charges: Rs. ${finalCharges}`);
      fetchCancellationRequests();
    } catch (err) {
      setError(err.message || "Failed to approve cancellation request");
    }
  };

  const handleReject = async (bookingId) => {
    const remark = window.prompt("Enter rejection reason (optional):", "") || "";
    try {
      const response = await bookingsAPI.rejectCancelRequest(bookingId, remark);
      if (!response.success) {
        setError(response.message || "Failed to reject cancellation request");
        return;
      }
      fetchCancellationRequests();
    } catch (err) {
      setError(err.message || "Failed to reject cancellation request");
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
        <ActionIcon onClick={fetchCancellationRequests} loading={loading} variant="default">
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>

      {/* Table */}
      <Box style={{ position: "relative", overflow: "auto" }}>
        <LoadingOverlay visible={loading && page !== 1} />
        {filteredBookings.length === 0 ? (
          <Alert type="info">No cancellation requests found</Alert>
        ) : (
          <>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Guest Name</th>
                  <th>Email</th>
                  <th>Check-In</th>
                  <th>Status</th>
                  <th>Est. Charges</th>
                  <th>Reason</th>
                  {isStaff && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.intender_name}</td>
                    <td>{booking.visitor_email}</td>
                    <td>{booking.booking_from}</td>
                    <td>{booking.status || "N/A"}</td>
                    <td>Rs. {Number(booking.estimated_cancellation_charges || 0)}</td>
                    <td>
                      <Group spacing="xs">
                        <Text size="sm" truncate>
                          {booking.remark
                            ? `${booking.remark.substring(0, 30)}...`
                            : "N/A"}
                        </Text>
                        {booking.remark && (
                          <ActionIcon
                            size="sm"
                            variant="light"
                            onClick={() => setSelectedReason(booking.remark)}
                          >
                            <IconInfoCircle size={14} />
                          </ActionIcon>
                        )}
                      </Group>
                    </td>
                    {isStaff && (
                      <td>
                        <Group spacing="xs">
                          <Button
                            size="xs"
                            leftSection={<IconCheck size={14} />}
                            onClick={() => handleApprove(booking.id)}
                            color="green"
                          >
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            leftSection={<IconX size={14} />}
                            onClick={() => handleReject(booking.id)}
                            color="red"
                            variant="light"
                          >
                            Reject
                          </Button>
                        </Group>
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

      {/* Reason Modal */}
      <Modal
        opened={!!selectedReason}
        onClose={() => setSelectedReason(null)}
        title="Cancellation Reason"
      >
        <Text>{selectedReason}</Text>
      </Modal>
    </Box>
  );
}

export default CancelledRequestsTable;

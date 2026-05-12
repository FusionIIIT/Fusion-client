/**
 * ViewActiveBookingModal
 * Modal component for viewing active booking details with check-in/check-out actions
 * 
 * Features:
 * - Display all booking details
 * - Show room assignments
 * - Print booking confirmation
 * - Check-in/Check-out actions
 * - Status indicators
 */

import React, { useState } from "react";
import {
  Modal,
  Grid,
  Badge,
  Button,
  Group,
  Divider,
  Stack,
  Paper,
  Alert,
  TextInput,
  MultiSelect,
} from "@mantine/core";
import { IconPrinter, IconCheck, IconX, IconHome, IconUser, IconToolsKitchen2 } from "@tabler/icons-react";
import CheckoutForm from "../forms/CheckoutForm";
import MealBookingForm from "../forms/MealBookingForm";
import MealBookingHistory from "./MealBookingHistory";
import { useActionConfirmation } from "./ActionConfirmationProvider";
import { bookingsAPI, mealsAPI, roomsAPI } from "../../services/visitorHostelApi";

const STATUS_COLORS = {
  Pending: "yellow",
  Forward: "indigo",
  Confirmed: "blue",
  CheckedIn: "green",
  Complete: "gray",
  Canceled: "red",
  Rejected: "red",
};

function ViewActiveBookingModal({ opened, onClose, bookingData, userRole, onCheckIn, onCheckOut, onRefresh }) {
  const { confirmAction } = useActionConfirmation();
  const primaryVisitor = bookingData?.visitors?.[0] || {};
  const [assignedRooms, setAssignedRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [allocationError, setAllocationError] = useState("");
  const [isAllocatingRooms, setIsAllocatingRooms] = useState(false);

  const [checkInForm, setCheckInForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [checkoutForm, setCheckoutForm] = useState({
    mealBill: 0,
    roomBill: 0,
    billSettlement: "Intender",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [mealBookingOpen, setMealBookingOpen] = useState(false);
  const [mealBookingSuccess, setMealBookingSuccess] = useState("");

  React.useEffect(() => {
    if (!bookingData) {
      return;
    }

    setAssignedRooms(bookingData.rooms || []);
    setAllocationError("");
    setSelectedRooms([]);
    setAvailableRooms([]);

    setCheckInForm({
      name: primaryVisitor.name || "",
      phone: primaryVisitor.phone || "",
      email: primaryVisitor.email || "",
      address: primaryVisitor.address || "",
    });
    setCheckoutForm({
      mealBill: Number(bookingData.total_meals_cost || 0),
      roomBill: 0,
      billSettlement: bookingData.bill_to_be_settled_by || "Intender",
    });
  }, [bookingData, primaryVisitor.address, primaryVisitor.email, primaryVisitor.name, primaryVisitor.phone]);

  React.useEffect(() => {
    const loadAvailableRooms = async () => {
      if (!opened || !bookingData || bookingData.status !== "Confirmed") {
        return;
      }

      if (assignedRooms.length > 0) {
        return;
      }

      try {
        const rooms = await roomsAPI.getAvailableRooms(
          bookingData.booking_from,
          bookingData.booking_to,
          bookingData.visitor_category
        );
        setAvailableRooms(Array.isArray(rooms) ? rooms : []);
      } catch (error) {
        setAllocationError(error?.detail || error?.message || "Unable to load available rooms.");
      }
    };

    loadAvailableRooms();
  }, [opened, bookingData, assignedRooms.length]);

  if (!bookingData) {
    return (
      <Modal opened={opened} onClose={onClose} title="Active Booking Details" size="lg">
        <Alert type="info">No booking data available</Alert>
      </Modal>
    );
  }

  const handleCheckIn = async () => {
    if (!checkInForm.name || !checkInForm.phone) {
      return;
    }

    if (!(await confirmAction("Are you sure you want to check in this booking?", {
      title: "Confirm Check-In",
      confirmLabel: "Check In",
      confirmColor: "green",
    }))) {
      return;
    }

    setIsProcessing(true);
    try {
      if (onCheckIn) {
        await onCheckIn({
          bookingId: bookingData.id,
          name: checkInForm.name,
          phone: checkInForm.phone,
          email: checkInForm.email,
          address: checkInForm.address,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!(await confirmAction("Are you sure you want to check out this booking?", {
      title: "Confirm Check-Out",
      confirmLabel: "Check Out",
      confirmColor: "orange",
    }))) {
      return;
    }

    setIsProcessing(true);
    try {
      if (onCheckOut) {
        await onCheckOut({
          bookingId: bookingData.id,
          mealBill: checkoutForm.mealBill,
          roomBill: checkoutForm.roomBill,
          billSettlement: checkoutForm.billSettlement,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMealBooking = async (mealData) => {
    try {
      const result = await mealsAPI.bookMeals(mealData);
      if (result.success) {
        setMealBookingSuccess("Meals booked successfully!");
        setTimeout(() => setMealBookingSuccess(""), 3000);
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Error booking meals:", error);
      throw error;
    }
  };

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="text-align: center; color: #228be6;">Active Booking Details</h2>
        <hr/>
        
        <h3>Booking Information</h3>
        <p><strong>Booking ID:</strong> ${bookingData.id}</p>
        <p><strong>Status:</strong> ${bookingData.status || "N/A"}</p>
        <p><strong>Check-In Date:</strong> ${bookingData.checked_in_date ? new Date(bookingData.checked_in_date).toLocaleDateString() : "Not checked in yet"}</p>
        
        <h3>Guest Information</h3>
        <p><strong>Name:</strong> ${primaryVisitor.name || "N/A"}</p>
        <p><strong>Email:</strong> ${primaryVisitor.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${primaryVisitor.phone || "N/A"}</p>
        <p><strong>Organization:</strong> ${primaryVisitor.organization || "N/A"}</p>

        <h3>Intender Information</h3>
        <p><strong>Name:</strong> ${bookingData.intender_name || "N/A"}</p>
        <p><strong>Email:</strong> ${bookingData.intender_email || "N/A"}</p>
        <p><strong>Phone:</strong> ${bookingData.intender_phone || "N/A"}</p>
        
        <h3>Stay Details</h3>
        <p><strong>Check-In:</strong> ${bookingData.booking_from || "N/A"}</p>
        <p><strong>Check-Out:</strong> ${bookingData.booking_to || "N/A"}</p>
        <p><strong>Room Category:</strong> ${bookingData.visitor_category || "N/A"}</p>
        
        ${assignedRooms.length > 0 ? `
          <h3>Room Assignments</h3>
          <p>${assignedRooms.map((room) => room.room_number).join(", ")}</p>
        ` : ""}
        
        <hr/>
        <p style="text-align: center; font-size: 12px; color: #666;">
          Printed on: ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const isCheckedIn = bookingData.status === "CheckedIn";
  const isCompleted = bookingData.status === "Complete";
  const requiredRoomCount = Number(bookingData.number_of_rooms || 1);

  const handleAllocateRooms = async () => {
    if (!bookingData?.id) {
      return;
    }

    if (selectedRooms.length !== requiredRoomCount) {
      setAllocationError(`Select exactly ${requiredRoomCount} room(s) before allocation.`);
      return;
    }

    if (!(await confirmAction("Are you sure you want to allocate the selected rooms?", {
      title: "Confirm Room Allocation",
      confirmLabel: "Allocate",
      confirmColor: "blue",
    }))) {
      return;
    }

    setIsAllocatingRooms(true);
    setAllocationError("");
    try {
      const response = await bookingsAPI.allocateRooms(bookingData.id, selectedRooms);
      if (response.success) {
        const allocatedRooms = Array.isArray(response.allocated_rooms)
          ? response.allocated_rooms
          : selectedRooms;
        setAssignedRooms(allocatedRooms.map((roomNumber) => ({ room_number: roomNumber })));
        setSelectedRooms([]);
        setAllocationError("");
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      setAllocationError(error?.detail || error?.message || "Failed to allocate rooms.");
    } finally {
      setIsAllocatingRooms(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Active Booking Details" size="lg" centered>
      <Stack spacing="md">
        {/* Header with Status */}
        <Paper p="md" style={{ backgroundColor: "#f1f3f5", borderRadius: "4px" }}>
          <Group position="apart" mb="sm">
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>
                Booking #{bookingData.id}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {bookingData.intender_name || "Intender"}
              </div>
            </div>
            <Badge
              size="lg"
              color={STATUS_COLORS[bookingData.status] || "gray"}
              variant="filled"
            >
              {bookingData.status?.toUpperCase() || "UNKNOWN"}
            </Badge>
          </Group>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Created: {bookingData.created_at ? new Date(bookingData.created_at).toLocaleDateString() : "N/A"}
          </div>
        </Paper>

        <Divider />

        {/* Guest Information */}
        <div>
          <Group mb="sm">
            <IconUser size={18} />
            <div style={{ fontWeight: 600 }}>Guest Information</div>
          </Group>
          <Grid gutter="xs">
            <Grid.Col span={6}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Name
              </div>
              <div style={{ fontWeight: 500 }}>{primaryVisitor.name || "N/A"}</div>
            </Grid.Col>
            <Grid.Col span={6}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Email
              </div>
              <div style={{ fontWeight: 500 }}>{primaryVisitor.email || "N/A"}</div>
            </Grid.Col>
            <Grid.Col span={6}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Phone
              </div>
              <div style={{ fontWeight: 500 }}>{primaryVisitor.phone || "N/A"}</div>
            </Grid.Col>
            <Grid.Col span={6}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Organization
              </div>
              <div style={{ fontWeight: 500 }}>{primaryVisitor.organization || "N/A"}</div>
            </Grid.Col>
          </Grid>
        </div>

        <Divider />

        <div>
          <Group mb="sm">
            <IconUser size={18} />
            <div style={{ fontWeight: 600 }}>Intender Information</div>
          </Group>
          <Grid gutter="xs">
            <Grid.Col span={6}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Name
              </div>
              <div style={{ fontWeight: 500 }}>{bookingData.intender_name || "N/A"}</div>
            </Grid.Col>
            <Grid.Col span={6}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Email
              </div>
              <div style={{ fontWeight: 500 }}>{bookingData.intender_email || "N/A"}</div>
            </Grid.Col>
            <Grid.Col span={6}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Phone
              </div>
              <div style={{ fontWeight: 500 }}>{bookingData.intender_phone || "N/A"}</div>
            </Grid.Col>
          </Grid>
        </div>

        <Divider />

        {/* Stay Details */}
        <div>
          <Group mb="sm">
            <IconHome size={18} />
            <div style={{ fontWeight: 600 }}>Stay Details</div>
          </Group>
          <Grid gutter="xs">
            <Grid.Col span={6}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Check-In
              </div>
              <div style={{ fontWeight: 500 }}>{bookingData.booking_from || "N/A"}</div>
            </Grid.Col>
            <Grid.Col span={6}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Check-Out
              </div>
              <div style={{ fontWeight: 500 }}>{bookingData.booking_to || "N/A"}</div>
            </Grid.Col>
            <Grid.Col span={6}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Room Category
              </div>
              <div style={{ fontWeight: 500 }}>{bookingData.visitor_category || "N/A"}</div>
            </Grid.Col>
            <Grid.Col span={6}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Number of Rooms
              </div>
              <div style={{ fontWeight: 500 }}>{bookingData.number_of_rooms || "N/A"}</div>
            </Grid.Col>
          </Grid>
        </div>

        {/* Room Assignments */}
        {assignedRooms.length > 0 && (
          <>
            <Divider />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '12px' }}>
                Assigned Rooms
              </div>
              <Group>
                {assignedRooms.map((room, idx) => (
                  <Badge key={idx} variant="light" color="blue">
                    {room.room_number}
                  </Badge>
                ))}
              </Group>
              {bookingData.status === "Confirmed" && (
                <Alert color="blue" mt="sm">
                  Room allocation is finalized for this booking and cannot be changed.
                </Alert>
              )}
            </div>
          </>
        )}

        {(userRole === "VhCaretaker") && bookingData.status === "Confirmed" && assignedRooms.length === 0 && (
          <>
            <Divider />
            <Stack spacing="xs">
              <div style={{ fontWeight: 600, fontSize: "14px" }}>Allocate Rooms Before Check-In</div>
              {allocationError && <Alert color="red">{allocationError}</Alert>}
              <Alert color="blue">
                Select exactly {requiredRoomCount} room(s) in category {bookingData.visitor_category}.
              </Alert>
              <MultiSelect
                data={availableRooms.map((roomNumber) => ({ value: roomNumber, label: roomNumber }))}
                value={selectedRooms}
                onChange={(values) => {
                  if (values.length > requiredRoomCount) {
                    setAllocationError(`You can select only ${requiredRoomCount} room(s) for this booking.`);
                    return;
                  }
                  setAllocationError("");
                  setSelectedRooms(values);
                }}
                searchable
                clearable
                placeholder="Select available rooms"
                disabled={isAllocatingRooms}
              />
              <Group position="right">
                <Button
                  onClick={handleAllocateRooms}
                  loading={isAllocatingRooms}
                  disabled={selectedRooms.length !== requiredRoomCount}
                >
                  Allocate Rooms
                </Button>
              </Group>
            </Stack>
          </>
        )}

        {/* Check-In Details */}
        {!isCheckedIn && !isCompleted && (
          <>
            <Divider />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
                Check-In Details
              </div>
              <Grid gutter="xs">
                <Grid.Col span={6}>
                  <TextInput
                    label="Name*"
                    value={checkInForm.name}
                    onChange={(e) =>
                      setCheckInForm((prev) => ({ ...prev, name: e.currentTarget.value }))
                    }
                    disabled={isProcessing}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Phone*"
                    value={checkInForm.phone}
                    onChange={(e) =>
                      setCheckInForm((prev) => ({ ...prev, phone: e.currentTarget.value }))
                    }
                    disabled={isProcessing}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Email"
                    value={checkInForm.email}
                    onChange={(e) =>
                      setCheckInForm((prev) => ({ ...prev, email: e.currentTarget.value }))
                    }
                    disabled={isProcessing}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Address"
                    value={checkInForm.address}
                    onChange={(e) =>
                      setCheckInForm((prev) => ({ ...prev, address: e.currentTarget.value }))
                    }
                    disabled={isProcessing}
                  />
                </Grid.Col>
              </Grid>
            </div>
          </>
        )}

        {/* Check-Out Bill Inputs */}
        {isCheckedIn && (
          <>
            <Divider />
            <CheckoutForm
              checkoutForm={checkoutForm}
              setCheckoutForm={setCheckoutForm}
              isProcessing={isProcessing}
            />
          </>
        )}

        {/* UC-VH-010: Meal Booking History */}
        {isCheckedIn && (
          <>
            <Divider />
            <MealBookingHistory 
              mealBookings={bookingData.meal_bookings || []}
              totalMealsCost={bookingData.total_meals_cost || 0}
            />
          </>
        )}

        {/* Meal Booking Success Alert */}
        {mealBookingSuccess && (
          <Alert color="green" mt="md">
            {mealBookingSuccess}
          </Alert>
        )}

        {/* Actions */}
        <Group position="right" mt="xl">
          <Button
            leftSection={<IconPrinter size={16} />}
            variant="default"
            onClick={handlePrint}
            disabled={isProcessing}
          >
            Print
          </Button>
          
          {/* UC-VH-010: Meal Booking - ONLY VhCaretaker can book meals for checked-in guests */}
          {(userRole === "VhCaretaker") && isCheckedIn && (
            <Button
              leftSection={<IconToolsKitchen2 size={16} />}
              color="blue"
              variant="light"
              onClick={() => setMealBookingOpen(true)}
              disabled={isProcessing}
            >
              Book Meals
            </Button>
          )}
          
          {/* ONLY VhCaretaker can Check-In */}
          {(userRole === "VhCaretaker") && !isCheckedIn && !isCompleted && (
            <Button
              leftSection={<IconCheck size={16} />}
              color="green"
              onClick={handleCheckIn}
              disabled={!checkInForm.name || !checkInForm.phone || assignedRooms.length === 0}
              loading={isProcessing}
            >
              Check In
            </Button>
          )}
          
          {/* ONLY VhCaretaker can Check-Out */}
          {(userRole === "VhCaretaker") && isCheckedIn && (
            <Button
              leftSection={<IconX size={16} />}
              color="orange"
              onClick={handleCheckOut}
              loading={isProcessing}
            >
              Check Out
            </Button>
          )}
          <Button onClick={onClose} disabled={isProcessing}>
            Close
          </Button>
        </Group>
      </Stack>
      
      {/* UC-VH-010: Meal Booking Modal */}
      <MealBookingForm
        opened={mealBookingOpen}
        onClose={() => setMealBookingOpen(false)}
        bookingData={bookingData}
        onMealBooking={handleMealBooking}
      />
    </Modal>
  );
}

export default ViewActiveBookingModal;


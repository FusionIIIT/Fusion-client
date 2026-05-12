import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  MantineProvider,
  TextInput,
  NumberInput,
  Button,
  Textarea,
  Group,
  Grid,
  Modal,
  LoadingOverlay,
  MultiSelect,
  Select,
} from "@mantine/core";
import { bookingsAPI, roomsAPI } from "../../services/visitorHostelApi";
import { ErrorHandlers } from "../../utils/errorHandler";
import ErrorBoundary from "../common/ErrorBoundary";

function ConfirmBookingIn({
  forwardmodalOpened,
  onClose,
  bookingId,
  bookingf,
}) {
  console.log("BOOKING ID: ", bookingId); // Log booking ID for debugging
      
  const [formData, setFormData] = useState({
    intenderUsername: "",
    intenderEmail: "",
    bookingFrom: "",
    bookingTo: "",
    visitorCategory: "",
    modifiedCategory: bookingf?.modifiedCategory || "", // Provide a fallback value
    personCount: 1,
    numberOfRooms: 1,
    rooms: bookingf?.rooms || [], // Provide a fallback value
    purpose: "",
    billToBeSettledBy: "",
    remarks: "",
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    visitorOrganization: "",
    visitorAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        // TODO: Implement GET /api/bookings/{bookingId}/ endpoint on backend
        // Currently, this endpoint is not available in the REST API
        
        // For now, use booking data from props (bookingf)
        if (bookingf) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            intenderUsername: bookingf.intenderUsername || "",
            intenderEmail: bookingf.intenderEmail || "",
            bookingFrom: bookingf.bookingFrom || "",
            bookingTo: bookingf.bookingTo || "",
            visitorCategory: bookingf.visitorCategory || "",
            modifiedCategory: bookingf.visitorCategory || "",
            personCount: bookingf.personCount || 1,
            numberOfRooms: bookingf.numberOfRooms || 1,
            rooms: bookingf?.rooms?.map((room) => room.room_number) || [],
            purpose: bookingf.purpose || "",
            billToBeSettledBy: bookingf.billToBeSettledBy || "",
            remarks: bookingf.remarks || "",
            visitorName: bookingf.visitorName || "",
            visitorEmail: bookingf.visitorEmail || "",
            visitorPhone: bookingf.visitorPhone || "",
            visitorOrganization: bookingf.visitorOrganization || "",
            visitorAddress: bookingf.visitorAddress || "",
          }));
          const rooms = bookingf.availableRooms?.map((room) => room.room_number) || [];
          setAvailableRooms(rooms);
        }
      } catch (error) {
        console.error("Error fetching booking data", error);
      }
    };

    if (bookingId) {
      fetchBookingData();
    }
  }, [bookingId, bookingf]);

  const handleInputChange = (name, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Token handling moved to service layer interceptor - getCookie no longer needed

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (action === "accept") {
        // SECURITY ENHANCEMENT: Room allocation now happens ONLY during VhIncharge confirmation
        // Validate that rooms are selected before confirming
        if (!formData.rooms || formData.rooms.length === 0) {
          alert("Please select at least one room before confirming the booking.");
          setLoading(false);
          return;
        }
        
        // Confirm the booking with new category and rooms - this will allocate rooms
        const response = await bookingsAPI.confirmBooking(
          bookingId,
          formData.modifiedCategory,
          formData.rooms,
        );
        console.log("Booking confirmed and rooms allocated", response);
        alert("Booking confirmed successfully! Rooms have been allocated to the guest.");
      } else if (action === "reject") {
        // Reject the booking with remarks
        const response = await bookingsAPI.rejectBooking(
          bookingId,
          formData.remarks,
        );
        console.log("Booking rejected", response);
        alert("Booking rejected successfully.");
      }

      onClose(); // Close the modal after action
      window.location.reload(); // Refresh to show updated bookings list
    } catch (error) {
      // Use centralized error handling
      if (action === "accept") {
        ErrorHandlers.bookingError(error, 'Booking Confirmation');
      } else {
        ErrorHandlers.bookingError(error, 'Booking Rejection');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <MantineProvider theme={{ fontFamily: "Arial, sans-serif" }}>
        <Modal
        opened={forwardmodalOpened}
        onClose={onClose}
        title="Action Booking Request"
        size="xl"
        overlayOpacity={0.55}
        overlayBlur={3}
        transition="fade"
        transitionDuration={500}
      >
        <LoadingOverlay visible={loading} overlayBlur={2} />
        <form>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Username"
                value={formData.intenderUsername}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Email"
                value={formData.intenderEmail}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="From"
                type="date"
                value={formData.bookingFrom}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="To"
                type="date"
                value={formData.bookingTo}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Category"
                value={formData.visitorCategory}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={6}>
              {console.log("FORMDATA :", formData)}
              <Select
                label="Modified Category"
                value={formData.modifiedCategory}
                onChange={(value) =>
                  handleInputChange("modifiedCategory", value)
                }
                data={["A", "B", "C", "D"]}
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Number Of People"
                value={formData.personCount}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Rooms Required"
                value={formData.numberOfRooms}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <MultiSelect
                label="🔒 Rooms (required*) - ALLOCATION HAPPENS ONLY AFTER CONFIRMATION"
                description="⚠️ SECURITY: Rooms will be allocated ONLY when you click 'Accept'. This ensures VhIncharge approval before room assignment."
                value={formData.rooms}
                onChange={(value) => handleInputChange("rooms", value)}
                data={availableRooms.map((room) => ({
                  value: room,
                  label: room,
                }))}
                required
                searchable
                clearable
                styles={{
                  label: { 
                    fontWeight: 'bold',
                    color: '#d63384'
                  },
                  description: {
                    color: '#fd7e14',
                    fontWeight: 500
                  }
                }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Purpose Of Visit"
                value={formData.purpose}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Bill to be settled by"
                value={formData.billToBeSettledBy}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Remarks"
                value={formData.remarks}
                onChange={(event) =>
                  handleInputChange("remarks", event.currentTarget.value)
                }
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Visitor Name"
                value={formData.visitorName}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Visitor Email"
                value={formData.visitorEmail}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Visitor Phone"
                value={formData.visitorPhone}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Visitor Organization"
                value={formData.visitorOrganization}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Visitor Address"
                value={formData.visitorAddress}
                readOnly
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Group position="right" mt="md">
                <Button
                  type="button"
                  color="red"
                  onClick={(e) => handleSubmit(e, "reject")}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  color="green"
                  onClick={(e) => handleSubmit(e, "accept")}
                >
                  Accept
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
        </Modal>
      </MantineProvider>
    </ErrorBoundary>
  );
}

ConfirmBookingIn.propTypes = {
  forwardmodalOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingId: PropTypes.string.isRequired,
  bookingf: PropTypes.shape({
    modifiedCategory: PropTypes.string,
    rooms: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default ConfirmBookingIn;

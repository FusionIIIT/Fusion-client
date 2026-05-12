/**
 * OfflineBookingForm
 * Component for caretakers to record telephonic or walk-in bookings (UC-VH-006)
 * 
 * Features:
 * - Caretaker can enter booking details on behalf of visitors
 * - System flags booking as Offline
 * - Includes both intender and visitor information
 * - Follows standard booking workflow
 * - Only accessible to VhCaretaker role
 */

import React, { useEffect, useState } from "react";
import {
  Box,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Button,
  Group,
  Modal,
  Alert,
  LoadingOverlay,
  Stack,
  Grid,
  Text,
  Divider,
  Badge,
  Switch,
} from "@mantine/core";
import { IconAlertCircle, IconPhone, IconUserPlus } from "@tabler/icons-react";
import { bookingsAPI, roomsAPI } from "../../services/visitorHostelApi";
import {
  validateEmail,
  validatePhone,
  validateDateRange,
  validateRequiredFields,
  validateName,
  validatePurpose,
  validateFutureDate,
  validateOrganization,
  validateAddress,
  validatePositiveNumber,
} from "../../utils/validators";

const ROOM_CATEGORIES = [
  { value: "A", label: "Category A" },
  { value: "B", label: "Category B" },
  { value: "C", label: "Category C" },
  { value: "D", label: "Category D" },
];

const BILL_SETTLEMENT_OPTIONS = [
  { value: "Intender", label: "Intender" },
  { value: "Visitor", label: "Visitor" },
  { value: "ProjectNo", label: "Project Number" },
  { value: "Institute", label: "Institute" },
];

const BOOKING_TYPES = [
  { value: "telephonic", label: "Telephonic Booking" },
  { value: "walkin", label: "Walk-in Booking" },
];

function OfflineBookingForm({ opened, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableRoomCount, setAvailableRoomCount] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const todayDate = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    // Offline booking specific
    bookingType: "telephonic",

    // Intender Information (person making the booking)
    intenderName: "",
    intenderEmail: "",
    intenderPhone: "",
    intenderRelation: "", // Relation to visitor

    // Visitor Information
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    visitorAddress: "",
    visitorOrganization: "",
    visitorNationality: "Indian",

    // Booking Details
    bookingFrom: "",
    bookingTo: "",
    numberOfRooms: 1,
    personCount: 1,
    category: "C",
    purposeOfVisit: "",
    billSettlement: "Intender",
    remarks: "",
  });
  const minCheckoutDate = formData.bookingFrom && formData.bookingFrom > todayDate
    ? formData.bookingFrom
    : todayDate;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  useEffect(() => {
    const loadAvailability = async () => {
      if (!formData.bookingFrom || !formData.bookingTo || !validateDateRange(formData.bookingFrom, formData.bookingTo)) {
        setAvailableRoomCount(null);
        setAvailabilityMessage("");
        return;
      }

      setAvailabilityLoading(true);
      try {
        const availableRooms = await roomsAPI.getAvailableRooms(
          formData.bookingFrom,
          formData.bookingTo,
          formData.category,
        );
        if (Array.isArray(availableRooms)) {
          setAvailableRoomCount(availableRooms.length);
          setAvailabilityMessage(`${availableRooms.length} room(s) available for the selected dates.`);
        } else {
          setAvailableRoomCount(null);
          setAvailabilityMessage("");
        }
      } catch (err) {
        setAvailableRoomCount(null);
        setAvailabilityMessage(err.message || "Unable to check room availability right now.");
      } finally {
        setAvailabilityLoading(false);
      }
    };

    loadAvailability();
  }, [formData.bookingFrom, formData.bookingTo, formData.category]);

  const validateForm = () => {
    const requiredFields = [
      "intenderName", "intenderPhone", "visitorName", "visitorPhone",
      "bookingFrom", "bookingTo", "purposeOfVisit"
    ];

    // Check required fields
    if (!validateRequiredFields(formData, requiredFields)) {
      setError("Please fill in all required fields");
      return false;
    }

    // Validate intender name
    if (!validateName(formData.intenderName)) {
      setError("Intender name must be at least 2 characters and contain only letters, spaces, and common punctuation");
      return false;
    }

    // Validate visitor name
    if (!validateName(formData.visitorName)) {
      setError("Visitor name must be at least 2 characters and contain only letters, spaces, and common punctuation");
      return false;
    }

    // Validate phone numbers
    if (!validatePhone(formData.intenderPhone)) {
      setError("Please enter a valid intender phone number (10-13 digits)");
      return false;
    }

    if (!validatePhone(formData.visitorPhone)) {
      setError("Please enter a valid visitor phone number (10-13 digits)");
      return false;
    }

    // Validate email addresses if provided
    if (formData.intenderEmail && !validateEmail(formData.intenderEmail)) {
      setError("Please enter a valid intender email address");
      return false;
    }

    if (formData.visitorEmail && !validateEmail(formData.visitorEmail)) {
      setError("Please enter a valid visitor email address");
      return false;
    }

    // Validate organization if provided
    if (formData.visitorOrganization && !validateOrganization(formData.visitorOrganization)) {
      setError("Organization name must be 2-100 characters long");
      return false;
    }

    // Validate address if provided
    if (formData.visitorAddress && !validateAddress(formData.visitorAddress)) {
      setError("Address must be 10-500 characters long if provided");
      return false;
    }

    // Validate purpose of visit
    if (!validatePurpose(formData.purposeOfVisit)) {
      setError("Purpose of visit must be 5-200 characters long");
      return false;
    }

    // Validate dates
    if (!validateFutureDate(formData.bookingFrom)) {
      setError("Check-in date cannot be in the past");
      return false;
    }

    if (!validateDateRange(formData.bookingFrom, formData.bookingTo)) {
      setError("Check-out date must be after check-in date");
      return false;
    }

    // Validate room and person counts
    if (!validatePositiveNumber(formData.personCount)) {
      setError("Person count must be a positive number");
      return false;
    }

    if (!validatePositiveNumber(formData.numberOfRooms)) {
      setError("Number of rooms must be a positive number");
      return false;
    }

    if (formData.personCount > formData.numberOfRooms * 4) {
      setError("Too many persons for the number of rooms requested");
      return false;
    }

    // Check room availability
    if (availableRoomCount !== null && formData.numberOfRooms > availableRoomCount) {
      setError(`Only ${availableRoomCount} room(s) are available for the selected dates`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create offline booking request
      const response = await bookingsAPI.createOfflineBooking({
        // Mark as offline booking
        booking_type: formData.bookingType,
        is_offline: true,

        // Intender details (person making booking)
        intender_name: formData.intenderName,
        intender_email: formData.intenderEmail || "",
        intender_phone: formData.intenderPhone,
        intender_relation: formData.intenderRelation || "",

        // Visitor details
        name: formData.visitorName,
        email: formData.visitorEmail || "",
        phone: formData.visitorPhone,
        address: formData.visitorAddress || "",
        organization: formData.visitorOrganization || "",
        nationality: formData.visitorNationality,

        // Booking details
        category: formData.category,
        number_of_people: formData.personCount,
        purpose_of_visit: formData.purposeOfVisit,
        booking_from: formData.bookingFrom,
        booking_to: formData.bookingTo,
        number_of_rooms: formData.numberOfRooms,
        bill_settlement: formData.billSettlement,
        remarks_during_booking_request: formData.remarks,
      });

      if (response.success) {
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({
          bookingType: "telephonic",
          intenderName: "", intenderEmail: "", intenderPhone: "", intenderRelation: "",
          visitorName: "", visitorEmail: "", visitorPhone: "", visitorAddress: "",
          visitorOrganization: "", visitorNationality: "Indian",
          bookingFrom: "", bookingTo: "", numberOfRooms: 1, personCount: 1,
          category: "C", purposeOfVisit: "", billSettlement: "Intender", remarks: "",
        });
      } else {
        setError(response.message || "Failed to create offline booking");
      }
    } catch (err) {
      setError(err.message || "Failed to create offline booking. Please try again.");
      console.error("Error creating offline booking:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconPhone size={20} />
          <Text>Record Offline Booking</Text>
          <Badge color="blue" variant="light">UC-VH-006</Badge>
        </Group>
      }
      size="xl"
      centered
      closeOnClickOutside={!loading}
    >
      <Box position="relative">
        <LoadingOverlay visible={loading} />

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            {/* Booking Type Selection */}
            <Box>
              <Text size="sm" fw={500} mb="xs">Booking Type*</Text>
              <Select
                placeholder="Select booking type"
                data={BOOKING_TYPES}
                value={formData.bookingType}
                onChange={(value) => handleChange("bookingType", value)}
                icon={<IconPhone size={16} />}
                required
              />
            </Box>

            <Divider label="Intender Information (Person Making Booking)" labelPosition="center" />

            {/* Intender Details */}
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Intender Full Name*"
                  placeholder="Enter full name"
                  value={formData.intenderName}
                  onChange={(e) => handleChange("intenderName", e.target.value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Intender Phone*"
                  placeholder="Enter phone number"
                  value={formData.intenderPhone}
                  onChange={(e) => handleChange("intenderPhone", e.target.value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Intender Email"
                  placeholder="Enter email address"
                  type="email"
                  value={formData.intenderEmail}
                  onChange={(e) => handleChange("intenderEmail", e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Relation to Visitor"
                  placeholder="e.g., Self, Father, Mother, etc."
                  value={formData.intenderRelation}
                  onChange={(e) => handleChange("intenderRelation", e.target.value)}
                />
              </Grid.Col>
            </Grid>

            {(availabilityLoading || availabilityMessage) && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={availabilityLoading ? "Checking availability" : "Availability"}
                color={availableRoomCount !== null && formData.numberOfRooms > availableRoomCount ? "red" : "blue"}
              >
                {availabilityLoading ? "Checking room availability for the selected dates..." : availabilityMessage}
              </Alert>
            )}

            <Divider label="Visitor Information" labelPosition="center" />

            {/* Visitor Details */}
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Visitor Full Name*"
                  placeholder="Enter visitor full name"
                  value={formData.visitorName}
                  onChange={(e) => handleChange("visitorName", e.target.value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Visitor Phone*"
                  placeholder="Enter visitor phone"
                  value={formData.visitorPhone}
                  onChange={(e) => handleChange("visitorPhone", e.target.value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Visitor Email"
                  placeholder="Enter visitor email"
                  type="email"
                  value={formData.visitorEmail}
                  onChange={(e) => handleChange("visitorEmail", e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Nationality"
                  placeholder="Enter nationality"
                  value={formData.visitorNationality}
                  onChange={(e) => handleChange("visitorNationality", e.target.value)}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Visitor Address"
              placeholder="Enter complete address"
              value={formData.visitorAddress}
              onChange={(e) => handleChange("visitorAddress", e.target.value)}
              minRows={2}
            />

            <TextInput
              label="Organization"
              placeholder="Enter organization/company name"
              value={formData.visitorOrganization}
              onChange={(e) => handleChange("visitorOrganization", e.target.value)}
            />

            <Divider label="Booking Details" labelPosition="center" />

            {/* Booking Dates */}
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Check-In Date*"
                  type="date"
                  min={todayDate}
                  value={formData.bookingFrom}
                  onChange={(e) => handleChange("bookingFrom", e.target.value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Check-Out Date*"
                  type="date"
                  min={minCheckoutDate}
                  value={formData.bookingTo}
                  onChange={(e) => handleChange("bookingTo", e.target.value)}
                  required
                />
              </Grid.Col>
            </Grid>

            {/* Room Details */}
            <Grid>
              <Grid.Col span={4}>
                <Select
                  label="Room Category*"
                  placeholder="Select category"
                  data={ROOM_CATEGORIES}
                  value={formData.category}
                  onChange={(value) => handleChange("category", value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="Number of Rooms*"
                  placeholder="Enter count"
                  min={1}
                  value={formData.numberOfRooms}
                  onChange={(val) => handleChange("numberOfRooms", val)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="Number of Persons*"
                  placeholder="Enter count"
                  min={1}
                  value={formData.personCount}
                  onChange={(val) => handleChange("personCount", val)}
                  required
                />
              </Grid.Col>
            </Grid>

            {/* Purpose and Settlement */}
            <Textarea
              label="Purpose of Visit*"
              placeholder="Enter purpose of visit"
              value={formData.purposeOfVisit}
              onChange={(e) => handleChange("purposeOfVisit", e.target.value)}
              minRows={2}
              required
            />

            <Select
              label="Bill Settlement*"
              placeholder="Select who will settle the bill"
              data={BILL_SETTLEMENT_OPTIONS}
              value={formData.billSettlement}
              onChange={(value) => handleChange("billSettlement", value)}
              required
            />

            <Textarea
              label="Additional Remarks"
              placeholder="Enter any additional remarks for this offline booking"
              value={formData.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
              minRows={2}
            />

            {/* Actions */}
            <Group position="right" mt="xl">
              <Button variant="default" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                leftIcon={<IconUserPlus size={16} />}
                disabled={availabilityLoading || (availableRoomCount !== null && formData.numberOfRooms > availableRoomCount)}
              >
                Record Offline Booking
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}

export default OfflineBookingForm;
/**
 * BookingRequestForm
 * Component for submitting new visitor hostel booking requests
 * 
 * Features:
 * - Form validation
 * - Guest type selection (Institute staff, Student, External)
 * - Date range selection
 * - Room category and count selection
 * - Purpose of visit
 * - Remarks
 * - Integration with visitorHostelApi.js
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
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { bookingsAPI, roomsAPI } from "../../services/visitorHostelApi";
import {
  validateEmail,
  validatePhone,
  validateDateRange,
  validateRequiredFields,
  validateName,
  validatePurpose,
  validateFutureDate,
  validateStudentRelation,
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

const GUEST_TYPES = [
  { value: "institute_staff", label: "Institute Staff" },
  { value: "student", label: "Student" },
  { value: "external", label: "External Guest" },
];

const STUDENT_RELATION_OPTIONS = [
  { value: "Parent", label: "Parent" },
  { value: "Spouse", label: "Spouse" },
];

const BILL_SETTLEMENT_OPTIONS = [
  { value: "Intender", label: "Intender" },
  { value: "Visitor", label: "Visitor" },
  { value: "ProjectNo", label: "Project No" },
  { value: "Institute", label: "Institute" },
];

function BookingRequestForm({ opened, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableRoomCount, setAvailableRoomCount] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  // Get token for authentication check
  const token = localStorage.getItem("authToken");
  const role = useSelector((state) => state.user?.role);
  const isStudentIndenter = (role || "").toLowerCase() === "student";
  const todayDate = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    guestType: "external",
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    visitorOrganization: "",
    visitorAddress: "",
    intenderRelation: "",
    bookingFrom: "",
    bookingTo: "",
    visitorCategory: "A",
    billSettlement: "Intender",
    personCount: 1,
    numberOfRooms: 1,
    purpose: "",
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

      // Ensure category has a default value if empty
      const categoryToCheck = formData.visitorCategory || "A";

      setAvailabilityLoading(true);
      try {
        const availableRooms = await roomsAPI.getAvailableRooms(
          formData.bookingFrom,
          formData.bookingTo,
          categoryToCheck,
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
  }, [formData.bookingFrom, formData.bookingTo, formData.visitorCategory]);

  const validateForm = () => {
    // Check required fields
    if (!validateRequiredFields(formData, ["visitorName", "visitorPhone", "bookingFrom", "bookingTo", "purpose"])) {
      setError("Please fill in all required fields");
      return false;
    }

    // Validate visitor name
    if (!validateName(formData.visitorName)) {
      setError("Visitor name must be at least 2 characters and contain only letters, spaces, and common punctuation");
      return false;
    }

    // Validate phone number
    if (!validatePhone(formData.visitorPhone)) {
      setError("Please enter a valid phone number (10-13 digits)");
      return false;
    }

    // Validate email if provided
    if (formData.visitorEmail && !validateEmail(formData.visitorEmail)) {
      setError("Please enter a valid email address");
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
    if (!validatePurpose(formData.purpose)) {
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

    // BR-VH-008: Student intender validation
    if (isStudentIndenter) {
      if (!formData.intenderRelation) {
        setError("Relation with visitor is required for student indenters");
        return false;
      }
      if (!validateStudentRelation(formData.intenderRelation)) {
        setError("Students can request booking only for Parent or Spouse");
        return false;
      }
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

    // Check if user is authenticated
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      console.error("No auth token in localStorage");
      return;
    }

    setLoading(true);
    try {
      // Backend will use request.user.id for intender, so we don't need to send it
      const payload = {
        name: formData.visitorName,
        email: formData.visitorEmail,
        phone: formData.visitorPhone,
        organization: formData.visitorOrganization,
        address: formData.visitorAddress,
        intender_relation: formData.intenderRelation,
        booking_from: formData.bookingFrom,
        booking_to: formData.bookingTo,
        category: formData.visitorCategory,
        number_of_people: formData.personCount,
        number_of_rooms: formData.numberOfRooms,
        purpose_of_visit: formData.purpose,
        remarks_during_booking_request: formData.remarks,
        bill_settlement: formData.billSettlement,
        nationality: "", // Optional
      };

      console.log("Submitting booking request with payload:", payload);
      const response = await bookingsAPI.requestBooking(payload);
      console.log("Booking request submitted successfully:", response);

      // Reset form
      setFormData({
        guestType: "external",
        visitorName: "",
        visitorEmail: "",
        visitorPhone: "",
        visitorOrganization: "",
        visitorAddress: "",
        intenderRelation: "",
        bookingFrom: "",
        bookingTo: "",
        visitorCategory: "A",
        billSettlement: "Intender",
        personCount: 1,
        numberOfRooms: 1,
        purpose: "",
        remarks: "",
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit booking request. Please try again.");
      console.error("Error submitting booking request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Submit Booking Request"
      size="lg"
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
            {/* Guest Type */}
            <Select
              label="Guest Type*"
              placeholder="Select guest type"
              data={GUEST_TYPES}
              value={formData.guestType}
              onChange={(val) => handleChange("guestType", val)}
              required
            />

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Visitor Name*"
                  placeholder="Enter name"
                  value={formData.visitorName}
                  onChange={(e) => handleChange("visitorName", e.target.value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Phone Number*"
                  placeholder="10-digit number"
                  value={formData.visitorPhone}
                  onChange={(e) => handleChange("visitorPhone", e.target.value)}
                  required
                />
              </Grid.Col>
            </Grid>

            {isStudentIndenter ? (
              <Select
                label="Relation with Visitor*"
                placeholder="Select relation"
                data={STUDENT_RELATION_OPTIONS}
                value={formData.intenderRelation}
                onChange={(val) => handleChange("intenderRelation", val || "")}
                description="As a student, you can book only for Parent or Spouse."
                required
              />
            ) : (
              <TextInput
                label="Relation with Visitor"
                placeholder="e.g., Parent, Spouse, Colleague"
                value={formData.intenderRelation}
                onChange={(e) => handleChange("intenderRelation", e.target.value)}
              />
            )}

            {(availabilityLoading || availabilityMessage) && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={availabilityLoading ? "Checking availability" : "Availability"}
                color={availableRoomCount !== null && formData.numberOfRooms > availableRoomCount ? "red" : "blue"}
              >
                {availabilityLoading ? "Checking room availability for the selected dates..." : availabilityMessage}
              </Alert>
            )}

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  placeholder="visitor@example.com"
                  type="email"
                  value={formData.visitorEmail}
                  onChange={(e) => handleChange("visitorEmail", e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Organization"
                  placeholder="Organization name"
                  value={formData.visitorOrganization}
                  onChange={(e) => handleChange("visitorOrganization", e.target.value)}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Address"
              placeholder="Visitor address"
              value={formData.visitorAddress}
              onChange={(e) => handleChange("visitorAddress", e.target.value)}
            />

            {/* Booking Dates */}
            <Text fw={500} size="sm">
              Booking Dates
            </Text>
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

            {/* Room Selection */}
            <Text fw={500} size="sm">
              Room Selection
            </Text>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Room Category*"
                  placeholder="Select category"
                  data={ROOM_CATEGORIES}
                  value={formData.visitorCategory}
                  onChange={(val) => handleChange("visitorCategory", val || "A")}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Bill Settlement*"
                  placeholder="Select bill settlement"
                  data={BILL_SETTLEMENT_OPTIONS}
                  value={formData.billSettlement}
                  onChange={(val) => handleChange("billSettlement", val)}
                  required
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Number of Rooms*"
                  placeholder="Enter count"
                  min={1}
                  value={formData.numberOfRooms}
                  onChange={(val) => handleChange("numberOfRooms", val)}
                  required
                />
              </Grid.Col>
            </Grid>

            <NumberInput
              label="Number of Persons*"
              placeholder="Enter count"
              min={1}
              value={formData.personCount}
              onChange={(val) => handleChange("personCount", val)}
              required
            />

            {/* Purpose & Remarks */}
            <Textarea
              label="Purpose of Visit*"
              placeholder="Enter purpose"
              value={formData.purpose}
              onChange={(e) => handleChange("purpose", e.target.value)}
              minRows={2}
              required
            />

            <Textarea
              label="Remarks"
              placeholder="Additional remarks (optional)"
              value={formData.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
              minRows={2}
            />

            {/* Actions */}
            <Group position="right" mt="xl">
              <Button variant="default" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} disabled={availabilityLoading || (availableRoomCount !== null && formData.numberOfRooms > availableRoomCount)}>
                Submit Request
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}

export default BookingRequestForm;


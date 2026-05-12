/**
 * UpdateBookingForm
 * Component for updating existing booking details
 * 
 * Features:
 * - Load existing booking data
 * - Update booking dates
 * - Modify room category and count
 * - Add remarks
 * - Integration with visitorHostelApi.js
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  TextInput,
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
  Badge,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { bookingsAPI } from "../../services/visitorHostelApi";
import {
  validateDateRange,
  validateRequiredFields,
  validateEmail,
  validatePhone,
  validateName,
  validatePurpose,
  validateFutureDate,
  validateOrganization,
  validateAddress,
  validatePositiveNumber,
} from "../../utils/validators";

function UpdateBookingForm({ opened, onClose, bookingId, bookingData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    visitorOrganization: "",
    visitorAddress: "",
    nationality: "",
    bookingFrom: "",
    bookingTo: "",
    numberOfRooms: 1,
    personCount: 1,
    purposeOfVisit: "",
  });

  const normalizeDateForInput = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 10);
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  };

  // Load booking data when modal opens or bookingData changes
  useEffect(() => {
    if (opened && bookingData) {
      console.log('Loading booking data:', bookingData);

      // Load visitor information from the first visitor if available.
      // Backend returns `visitors` for booking detail API, while some legacy paths used `visitor`.
      const visitors = bookingData.visitors || bookingData.visitor || [];
      let visitorData = {};
      if (Array.isArray(visitors) && visitors.length > 0) {
        const visitor = visitors[0];
        visitorData = {
          visitorName: visitor.name || visitor.visitor_name || "",
          visitorEmail: visitor.email || visitor.visitor_email || "",
          visitorPhone: visitor.phone || visitor.visitor_phone || "",
          visitorOrganization: visitor.organization || visitor.visitor_organization || "",
          visitorAddress: visitor.address || visitor.visitor_address || "",
          nationality: visitor.nationality || "",
        };
      }

      setFormData({
        ...visitorData,
        bookingFrom: normalizeDateForInput(bookingData.booking_from),
        bookingTo: normalizeDateForInput(bookingData.booking_to),
        numberOfRooms: bookingData.number_of_rooms || 1,
        personCount: bookingData.person_count || 1,
        purposeOfVisit: bookingData.purpose_of_visit || bookingData.purpose || "",
      });
      setError(null);
    }
  }, [opened, bookingData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    // Check required fields
    if (!validateRequiredFields(formData, ["visitorName", "visitorPhone", "bookingFrom", "bookingTo", "purposeOfVisit"])) {
      setError("Please fill in all required fields");
      return false;
    }

    // UC-VH-003: Ensure booking can only be modified when status is Pending
    if (bookingData && bookingData.status !== 'Pending') {
      setError("Booking can only be modified when status is Pending");
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

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Update the basic booking details
      const bookingResponse = await bookingsAPI.updateBooking(
        bookingId,
        formData.personCount,
        formData.purposeOfVisit,
        formData.bookingFrom,
        formData.bookingTo,
        formData.numberOfRooms,
      );

      // Update visitor information
      const visitorResponse = await bookingsAPI.updateVisitorInfo(bookingId, {
        visitorName: formData.visitorName,
        visitorEmail: formData.visitorEmail,
        visitorPhone: formData.visitorPhone,
        visitorOrganization: formData.visitorOrganization,
        visitorAddress: formData.visitorAddress,
        nationality: formData.nationality,
      });

      console.log("Booking updated:", bookingResponse);
      console.log("Visitor info updated:", visitorResponse);

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update booking. Please try again.");
      console.error("Error updating booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = bookingData && bookingData.status !== 'Pending';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Update Booking"
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

        {bookingData && (
          <form onSubmit={handleSubmit}>
            <Stack spacing="md">
              {/* Display Current Info */}
              <Box p="sm" style={{ backgroundColor: "#f1f3f5", borderRadius: "4px" }}>
                <Text size="sm" fw={500}>
                  Booking ID: {bookingData.id}
                </Text>
                <Text size="sm">
                  Guest: {bookingData.intender_name || "Unknown"}
                </Text>
                <Text size="sm">
                  Current Status: <Badge size="sm" color={bookingData.status === 'Pending' ? 'yellow' : 'gray'}>
                    {bookingData.status}
                  </Badge>
                </Text>
              </Box>

              {/* Visitor Information - Editable */}
              <Text fw={500} size="sm">
                Visitor Information
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Visitor Name*"
                    placeholder="Enter name"
                    value={formData.visitorName}
                    onChange={(e) => handleChange("visitorName", e.target.value)}
                    disabled={isFormDisabled}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Phone Number*"
                    placeholder="10-digit number"
                    value={formData.visitorPhone}
                    onChange={(e) => handleChange("visitorPhone", e.target.value)}
                    disabled={isFormDisabled}
                    required
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Email"
                    placeholder="visitor@example.com"
                    type="email"
                    value={formData.visitorEmail}
                    onChange={(e) => handleChange("visitorEmail", e.target.value)}
                    disabled={isFormDisabled}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Organization"
                    placeholder="Organization name"
                    value={formData.visitorOrganization}
                    onChange={(e) => handleChange("visitorOrganization", e.target.value)}
                    disabled={isFormDisabled}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Address"
                    placeholder="Visitor address"
                    value={formData.visitorAddress}
                    onChange={(e) => handleChange("visitorAddress", e.target.value)}
                    disabled={isFormDisabled}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Nationality"
                    placeholder="Nationality"
                    value={formData.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                    disabled={isFormDisabled}
                  />
                </Grid.Col>
              </Grid>

              {/* UC-VH-003: Status validation alert */}
              {bookingData.status !== 'Pending' && (
                <Alert icon={<IconAlertCircle size={16} />} title="Modification Not Allowed" color="orange">
                  This booking cannot be modified because its status is "{bookingData.status}".
                  Only pending bookings can be modified.
                </Alert>
              )}

              {/* Booking Dates */}
              <Text fw={500} size="sm">
                Booking Dates
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Check-In Date*"
                    type="date"
                    value={formData.bookingFrom}
                    onChange={(e) => handleChange("bookingFrom", e.target.value)}
                    disabled={isFormDisabled}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Check-Out Date*"
                    type="date"
                    value={formData.bookingTo}
                    onChange={(e) => handleChange("bookingTo", e.target.value)}
                    disabled={isFormDisabled}
                    required
                  />
                </Grid.Col>
              </Grid>

              {/* Room Selection */}
              <Text fw={500} size="sm">
                Room Selection
              </Text>
              <NumberInput
                label="Number of Rooms*"
                placeholder="Enter count"
                min={1}
                value={formData.numberOfRooms}
                onChange={(val) => handleChange("numberOfRooms", val)}
                disabled={isFormDisabled}
                required
              />

              <NumberInput
                label="Number of Persons*"
                placeholder="Enter count"
                min={1}
                value={formData.personCount}
                onChange={(val) => handleChange("personCount", val)}
                disabled={isFormDisabled}
                required
              />

              {/* Purpose */}
              <Textarea
                label="Purpose of Visit"
                placeholder="Enter purpose of visit"
                value={formData.purposeOfVisit}
                onChange={(e) => handleChange("purposeOfVisit", e.target.value)}
                disabled={isFormDisabled}
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
                  disabled={bookingData.status !== 'Pending'}
                >
                  Update Booking
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Box>
    </Modal>
  );
}

export default UpdateBookingForm;


/**
 * Doctor Availability Page
 * =========================
 * Displays all available doctors with schedules and status
 * Allows patients to book appointments
 * 
 * PHC-UC-01: View Doctor Availability
 * PHC-UC-04: Apply for Appointment
 */

import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Button,
  Loader,
  Card,
  SimpleGrid,
  Stack,
  Group,
  Badge,
  Modal,
  Select,
  Input,
  Textarea,
  NumberInput,
  Checkbox,
  TextInput,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import * as api from '../api';

export default function ScheduleViewer() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingData, setBookingData] = useState({
    appointment_date: null,
    appointment_time: '10:00',
    reason_for_visit: '',
    symptoms: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.getDoctorAvailability();
      const doctorsArray = Array.isArray(response.data) 
        ? response.data 
        : [response.data];
      setDoctors(doctorsArray);
    } catch (error) {
      
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to load doctor availability';
      
      
      
      // Handle 400 errors gracefully - likely due to missing user profile data
      if (statusCode === 400) {
        
        setDoctors([]);
        notifications.show({
          message: 'Please complete your profile setup to view doctor availability',
          color: 'yellow',
        });
      } else if (statusCode === 403) {
        notifications.show({
          message: 'You do not have permission to view doctor availability',
          color: 'red',
        });
      } else {
        notifications.show({
          message: errorMessage,
          color: 'red',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const convertTimeStringToDate = (timeString) => {
    if (!timeString) return null;
    if (timeString instanceof Date) return timeString;
    
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds || 0, 0);
    return date;
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !bookingData.appointment_date || !bookingData.appointment_time) {
      notifications.show({
        message: 'Please fill all required fields',
        color: 'yellow',
      });
      return;
    }

    try {
      setSubmitting(true);
      const appointmentPayload = {
        doctor_id: selectedDoctor.id,
        appointment_date: bookingData.appointment_date.toISOString().split('T')[0],
        appointment_time: bookingData.appointment_time,
        reason_for_visit: bookingData.reason_for_visit,
        symptoms: bookingData.symptoms,
      };
      
      await api.createAppointment(appointmentPayload);
      
      notifications.show({
        message: `Appointment booked with Dr. ${selectedDoctor.doctor_name}`,
        color: 'green',
      });
      
      setBookingModal(false);
      setSelectedDoctor(null);
      setBookingData({
        appointment_date: null,
        appointment_time: '10:00',
        reason_for_visit: '',
        symptoms: '',
      });
      
      // Refresh appointments list
      await fetchDoctors();
    } catch (error) {
      
      notifications.show({
        message: error.response?.data?.detail || 'Failed to book appointment',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Group position="center" style={{ height: '100vh' }}>
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Stack mb="xl">
        <Title order={1}>Doctor Availability</Title>
        <Text color="dimmed">Select a doctor to view schedule and book an appointment</Text>
      </Stack>

      {/* Doctors Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {doctors.length === 0 ? (
          <Text color="dimmed" align="center">
            No doctors available at the moment
          </Text>
        ) : (
          doctors.map((item) => {
            // Handle both direct doctor objects and nested response structure
            const doctorData = item.doctor || item;
            const doctorId = doctorData.id || item.id;
            const doctorName = doctorData.doctor_name || item.doctor_name;
            const specialization = doctorData.specialization || item.specialization;
            const qualifications = doctorData.qualifications || item.qualifications;
            const phone = doctorData.phone || item.phone;
            const email = doctorData.email || item.email;
            const schedule = item.schedule || item.schedules || [];
            const todaysStatus = item.todays_status || item.todays_attendance;

            return (
              <Card key={doctorId} withBorder p="lg" style={{ cursor: 'pointer' }}>
                <Stack gap="md">
                  {/* Doctor Info */}
                  <div>
                    <Text weight={700} size="lg">
                      Dr. {doctorName}
                    </Text>
                    <Text size="sm" color="dimmed">
                      {specialization}
                    </Text>
                    {qualifications && (
                      <Text size="xs" color="dimmed">
                        {qualifications}
                      </Text>
                    )}
                  </div>

                  {/* Contact Info */}
                  <Stack gap="xs">
                    {phone && (
                      <Text size="sm">
                        📞 {phone}
                      </Text>
                    )}
                    {email && (
                      <Text size="sm">
                        ✉️ {email}
                      </Text>
                    )}
                  </Stack>

                  {/* Divider */}
                  {todaysStatus && <hr style={{ margin: '8px 0', borderColor: '#ddd' }} />}

                  {/* Today's Schedule Status Section */}
                  {todaysStatus && (
                    <div>
                      <Text size="sm" color="dimmed" weight={600} mb="6px">
                        📅 Today's Status
                      </Text>
                      <Group gap="xs">
                        <Badge
                          size="lg"
                          color={
                            todaysStatus.status === 'PRESENT'
                              ? 'green'
                              : todaysStatus.status === 'ON_BREAK'
                              ? 'yellow'
                              : todaysStatus.status === 'DEPARTED'
                              ? 'red'
                              : 'gray'
                          }
                        >
                          {todaysStatus.status}
                        </Badge>
                        {todaysStatus.available_until && (
                          <Text size="xs" color="dimmed">
                            Until {todaysStatus.available_until}
                          </Text>
                        )}
                      </Group>
                    </div>
                  )}

                  {/* Weekly Schedule Section */}
                  {schedule && schedule.length > 0 && (
                    <div>
                      <Text size="sm" color="dimmed" weight={600} mb="6px">
                        📆 Weekly Schedule
                      </Text>
                      <Stack gap="xs">
                        {schedule.map((slot) => (
                          <div key={`${doctorId}-${slot.day_of_week}-${slot.start_time}`}>
                            <Text size="sm" weight={500}>
                              {slot.day_of_week}
                            </Text>
                            <Text size="xs" color="dimmed">
                              {slot.start_time} - {slot.end_time} (Room {slot.room_number})
                            </Text>
                          </div>
                        ))}
                      </Stack>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    fullWidth
                    variant="filled"
                    onClick={() => {
                      // Store both the nested structure and flattened data for booking
                      const bookingDoctor = {
                        id: doctorId,
                        doctor_name: doctorName,
                        specialization: specialization,
                        ...item
                      };
                      setSelectedDoctor(bookingDoctor);
                      setBookingModal(true);
                    }}
                  >
                    Book Appointment
                  </Button>
                </Stack>
              </Card>
            );
          })
        )}
      </SimpleGrid>

      {/* Booking Modal */}
      <Modal
        opened={bookingModal}
        onClose={() => {
          setBookingModal(false);
          setSelectedDoctor(null);
        }}
        title={selectedDoctor ? `Book Appointment - Dr. ${selectedDoctor.doctor_name}` : 'Book Appointment'}
        size="lg"
      >
        <Stack gap="md">
          {/* Doctor Info Summary */}
          {selectedDoctor && (
            <Paper p="md" bg="blue.0">
              <Text size="sm">
                <strong>Doctor:</strong> Dr. {selectedDoctor.doctor_name}
              </Text>
              <Text size="sm">
                <strong>Specialization:</strong> {selectedDoctor.specialization}
              </Text>
            </Paper>
          )}

          {/* Date Selection */}
          <div>
            <Text size="sm" weight={500} mb="xs">
              Preferred Date *
            </Text>
            <DatePicker
              placeholder="Select date"
              value={bookingData.appointment_date}
              onChange={(date) =>
                setBookingData({ ...bookingData, appointment_date: date })
              }
              minDate={new Date()}
            />
          </div>

          {/* Time Selection */}
          <div>
            <Text size="sm" weight={500} mb="xs">
              Preferred Time *
            </Text>
            <TextInput
              type="time"
              placeholder="HH:mm"
              value={bookingData.appointment_time}
              onChange={(e) =>
                setBookingData({ ...bookingData, appointment_time: e.currentTarget.value })
              }
            />
          </div>

          {/* Reason for Visit */}
          <div>
            <Text size="sm" weight={500} mb="xs">
              Reason for Visit
            </Text>
            <Textarea
              placeholder="e.g., Regular checkup, Headache, etc."
              value={bookingData.reason_for_visit}
              onChange={(e) =>
                setBookingData({
                  ...bookingData,
                  reason_for_visit: e.currentTarget.value,
                })
              }
            />
          </div>

          {/* Symptoms */}
          <div>
            <Text size="sm" weight={500} mb="xs">
              Symptoms
            </Text>
            <Textarea
              placeholder="Describe any symptoms you're experiencing"
              value={bookingData.symptoms}
              onChange={(e) =>
                setBookingData({ ...bookingData, symptoms: e.currentTarget.value })
              }
            />
          </div>

          {/* Action Buttons */}
          <Group position="right">
            <Button
              variant="default"
              onClick={() => {
                setBookingModal(false);
                setSelectedDoctor(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              onClick={handleBooking}
              loading={submitting}
            >
              Confirm Booking
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

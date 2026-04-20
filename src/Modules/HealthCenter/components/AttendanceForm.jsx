/**
 * Attendance Form Component
 * ========================
 * Mark doctor attendance (present/absent/on-break)
 * Track doctor status throughout the day
 */

import { useState, useEffect } from 'react';
import {
  Select,
  Button,
  Stack,
  Group,
  Card,
  Table,
  ScrollArea,
  Text,
  Modal,
  Badge,
  ActionIcon,
  Textarea,
  Grid,
  Paper,
  ThemeIcon,
  Box,
  Center,
  SimpleGrid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconPlus, IconEdit, IconTrash, IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import * as api from '../api';

const statusOptions = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'ON_BREAK', label: 'On Break' },
  { value: 'DEPARTED', label: 'Departed' },
];

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

const generateCalendarDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Get the first day of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Get the day of week for first day (0 = Sunday)
  const startingDayOfWeek = firstDay.getDay();
  
  // Create array of days
  const days = [];
  
  // Add previous month's days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  
  // Add current month's days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add next month's days to fill the grid
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

export default function AttendanceForm() {
  const [attendances, setAttendances] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    doctor_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    status: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const [attendRes, docRes] = await Promise.all([
        api.getDoctorAttendance(dateStr),
        api.getDoctors(),
      ]);
      setAttendances(normalizeArray(attendRes.data));
      setDoctors(normalizeArray(docRes.data));
    } catch (error) {
      
      notifications.show({ message: 'Failed to load attendance', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.doctor_id) newErrors.doctor_id = 'Doctor is required';
    if (!formData.status) newErrors.status = 'Status is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        doctor: parseInt(formData.doctor_id),
        attendance_date: formData.attendance_date,
        status: formData.status,
        notes: formData.notes,
      };

      if (editingId) {
        await api.updateDoctorAttendanceRecord(editingId, payload);
        notifications.show({
          message: 'Attendance updated successfully',
          color: 'green',
        });
      } else {
        await api.createDoctorAttendance(payload);
        notifications.show({
          message: 'Attendance recorded successfully',
          color: 'green',
        });
      }
      setModalOpened(false);
      resetForm();
      await fetchData();
    } catch (error) {
      
      notifications.show({
        message: error.response?.data?.detail || 'Failed to save attendance',
        color: 'red',
      });
    }
  };

  const handleEdit = (attendance) => {
    setEditingId(attendance.id);
    setFormData({
      doctor_id: attendance.doctor.toString(),
      attendance_date: attendance.attendance_date,
      status: attendance.status,
      notes: attendance.notes || '',
    });
    setModalOpened(true);
  };

  const handleDelete = (id) => {
    modals.openConfirmModal({
      title: 'Confirm Deletion',
      children: 'Delete this attendance record?',
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.deleteDoctorAttendance(id);
          notifications.show({
            message: 'Attendance record deleted',
            color: 'green',
          });
          await fetchData();
        } catch (error) {
          notifications.show({ message: 'Failed to delete attendance', color: 'red' });
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      doctor_id: '',
      attendance_date: new Date().toISOString().split('T')[0],
      status: '',
      notes: '',
    });
    setErrors({});
    setEditingId(null);
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return 'Unknown';
    return `Dr. ${doctor.doctor_name}${doctor.specialization ? ` (${doctor.specialization})` : ''}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: 'blue',
      AVAILABLE: 'green',
      ON_BREAK: 'yellow',
      DEPARTED: 'red',
    };
    return colors[status] || 'gray';
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Text size="lg" weight={600}>
            Doctor Attendance
          </Text>
          <Text size="sm" color="dimmed">
            Date: {selectedDate.toDateString()}
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            resetForm();
            setModalOpened(true);
          }}
        >
          Record Attendance
        </Button>
      </Group>

      <Card withBorder p="lg" radius="md">
        <Card.Section withBorder inheritPadding py="md">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                <IconCalendar size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="md">
                  Select Date
                </Text>
                <Text size="xs" c="dimmed">
                  Choose a date to view attendance records
                </Text>
              </div>
            </Group>
            <Paper bg="blue.0" p="xs" radius="md">
              <Text size="sm" fw={500} c="blue.9">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </Paper>
          </Group>
        </Card.Section>

        <Card.Section withBorder inheritPadding py="lg">
          <Stack gap="md">
            {/* Month Navigation */}
            <Group justify="space-between" align="center">
              <Text fw={700} size="lg">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedDate(newDate);
                  }}
                  disabled={new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1) > new Date()}
                >
                  <IconChevronLeft size={18} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    if (newDate <= new Date()) {
                      setSelectedDate(newDate);
                    }
                  }}
                  disabled={new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1) > new Date()}
                >
                  <IconChevronRight size={18} />
                </ActionIcon>
              </Group>
            </Group>

            {/* Weekday Headers */}
            <SimpleGrid
              cols={7}
              spacing="sm"
              sx={{
                '& > div': {
                  textAlign: 'center',
                },
              }}
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} size="xs" fw={700} c="dimmed" tt="uppercase">
                  {day}
                </Text>
              ))}
            </SimpleGrid>

            {/* Calendar Days Grid */}
            <SimpleGrid cols={7} spacing="xs">
              {generateCalendarDays(selectedDate).map((day, idx) => {
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                const isToday =
                  day.toDateString() === new Date().toDateString();
                const isSelected =
                  day.toDateString() === selectedDate.toDateString();
                const isFuture = day > new Date();

                return (
                  <Stack
                    key={idx}
                    gap={2}
                    align="center"
                    sx={{
                      cursor: isCurrentMonth && !isFuture ? 'pointer' : 'default',
                      opacity: isFuture ? 0.5 : 1,
                      pointerEvents: isFuture ? 'none' : 'auto',
                    }}
                    onClick={() => {
                      if (isCurrentMonth && !isFuture) {
                        setSelectedDate(day);
                      }
                    }}
                  >
                    <Paper
                      p="xs"
                      radius="lg"
                      sx={(theme) => ({
                        width: '100%',
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected
                          ? theme.colors.blue[6]
                          : isToday
                          ? theme.colors.orange[0]
                          : 'transparent',
                        color: isSelected ? 'white' : isCurrentMonth ? 'inherit' : theme.colors.gray[4],
                        fontWeight: isSelected || isToday ? 700 : 500,
                        border:
                          isToday && !isSelected
                            ? `2px solid ${theme.colors.orange[5]}`
                            : isSelected
                            ? `2px solid ${theme.colors.blue[8]}`
                            : '2px solid transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: isCurrentMonth && !isFuture 
                            ? isSelected ? undefined : theme.colors.gray[1] 
                            : 'transparent',
                          transform: isCurrentMonth && !isFuture ? 'scale(1.05)' : 'scale(1)',
                        },
                      })}
                    >
                      <Text size="sm" fw={isSelected || isToday ? 700 : 500}>
                        {day.getDate()}
                      </Text>
                    </Paper>
                    
                    {/* Badge for Today or Selected */}
                    {isToday && !isSelected && (
                      <Badge size="xs" variant="light" color="orange" radius="sm">
                        Today
                      </Badge>
                    )}
                    {isSelected && (
                      <Badge size="xs" variant="filled" color="blue" radius="sm">
                        Selected
                      </Badge>
                    )}
                  </Stack>
                );
              })}
            </SimpleGrid>
          </Stack>
        </Card.Section>
      </Card>

      <Card withBorder p="lg">
        {attendances.length === 0 ? (
          <Text color="dimmed" align="center" py="xl">
            No attendance records for this date
          </Text>
        ) : (
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Doctor</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Notes</Table.Th>
                <Table.Th>Recorded At</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {attendances.map((attendance) => (
                <Table.Tr key={attendance.id}>
                  <Table.Td weight={500}>{getDoctorName(attendance.doctor)}</Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(attendance.status)}>
                      {attendance.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td size="sm">{attendance.notes || '-'}</Table.Td>
                  <Table.Td size="sm">
                    {new Date(attendance.marked_at).toLocaleTimeString()}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={0}>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => handleEdit(attendance)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(attendance.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table></ScrollArea>
        )}
      </Card>

      <Modal
        opened={modalOpened}
        onClose={() => {
          resetForm();
          setModalOpened(false);
        }}
        title={editingId ? 'Edit Attendance' : 'Record Attendance'}
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Doctor *"
            placeholder="Select doctor"
            data={doctors.map((d) => ({
              value: d.id.toString(),
              label: `Dr. ${d.doctor_name}${d.specialization ? ` (${d.specialization})` : ''}`,
            }))}
            value={formData.doctor_id}
            onChange={(value) => setFormData({ ...formData, doctor_id: value })}
            error={errors.doctor_id}
            searchable
          />

          <Select
            label="Status *"
            placeholder="Select status"
            data={statusOptions}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
            error={errors.status}
          />

          <Textarea
            label="Notes"
            placeholder="Optional notes about doctor's status"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.currentTarget.value })
            }
          />

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                resetForm();
                setModalOpened(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Update' : 'Record'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

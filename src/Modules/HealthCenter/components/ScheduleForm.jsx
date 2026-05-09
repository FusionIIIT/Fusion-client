/**
 * Schedule Form Component
 * ======================
 * Create/edit doctor schedules
 * Allows compounder to assign schedules to doctors
 */

import { useState, useEffect } from 'react';
import {
  Paper,
  Select,
  TextInput,
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus, IconClock } from '@tabler/icons-react';
import * as api from '../api';

const daysOfWeek = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function ScheduleForm() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    doctor_id: '',
    day_of_week: '',
    start_time: '09:00',
    end_time: '17:00',
    room_number: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, doctorsRes] = await Promise.all([
        api.getDoctorSchedules(),
        api.getDoctors(),
      ]);
      setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
    } catch (error) {
      
      notifications.show({ message: 'Failed to load schedules', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.doctor_id) newErrors.doctor_id = 'Doctor is required';
    if (!formData.day_of_week) newErrors.day_of_week = 'Day is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time)
      newErrors.end_time = 'End time must be after start time';
    if (!formData.room_number || formData.room_number < 1)
      newErrors.room_number = 'Valid room number required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        doctor_id: parseInt(formData.doctor_id),
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room_number: formData.room_number || '',
      };

      if (editingId) {
        await api.updateDoctorSchedule(editingId, payload);
        notifications.show({
          message: 'Schedule updated successfully',
          color: 'green',
        });
      } else {
        await api.createDoctorSchedule(payload);
        notifications.show({
          message: 'Schedule created successfully',
          color: 'green',
        });
      }
      setModalOpened(false);
      resetForm();
      await fetchData();
    } catch (error) {
      
      notifications.show({
        message: error.response?.data?.detail || 'Failed to save schedule',
        color: 'red',
      });
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

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setFormData({
      doctor_id: schedule.doctor.toString(),
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time || '09:00',
      end_time: schedule.end_time || '17:00',
      room_number: schedule.room_number.toString(),
    });
    setModalOpened(true);
  };

  const handleDelete = (id) => {
    modals.openConfirmModal({
      title: 'Confirm Deletion',
      children: 'Delete this schedule?',
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
        await api.deleteDoctorSchedule(id);
        notifications.show({
          message: 'Schedule deleted successfully',
          color: 'green',
        });
        await fetchData();
        } catch (error) {
        notifications.show({ message: 'Failed to delete schedule', color: 'red' });
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      doctor_id: '',
      day_of_week: '',
      start_time: '09:00',
      end_time: '17:00',
      room_number: '',
    });
    setErrors({});
    setEditingId(null);
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? `Dr. ${doctor.doctor_name}` : 'Unknown';
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Text size="lg" weight={600}>
          Schedule Management
        </Text>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            resetForm();
            setModalOpened(true);
          }}
        >
          Add Schedule
        </Button>
      </Group>

      <Card withBorder p="lg">
        {schedules.length === 0 ? (
          <Text color="dimmed" align="center" py="xl">
            No schedules found
          </Text>
        ) : (
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Doctor</Table.Th>
                <Table.Th>Day</Table.Th>
                <Table.Th>Time</Table.Th>
                <Table.Th>Room</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {schedules.map((schedule) => (
                <Table.Tr key={schedule.id}>
                  <Table.Td>{getDoctorName(schedule.doctor)}</Table.Td>
                  <Table.Td>{schedule.day_of_week}</Table.Td>
                  <Table.Td>{`${schedule.start_time} - ${schedule.end_time}`}</Table.Td>
                  <Table.Td>{schedule.room_number}</Table.Td>
                  <Table.Td>
                    <Group gap={0}>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => handleEdit(schedule)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(schedule.id)}
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
        title={editingId ? 'Edit Schedule' : 'Add New Schedule'}
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Doctor *"
            placeholder="Select doctor"
            data={doctors.map((d) => ({
              value: d.id.toString(),
              label: `Dr. ${d.doctor_name} (${d.specialization})`,
            }))}
            value={formData.doctor_id}
            onChange={(value) => setFormData({ ...formData, doctor_id: value })}
            error={errors.doctor_id}
            searchable
          />

          <Select
            label="Day of Week *"
            placeholder="Select day"
            data={daysOfWeek}
            value={formData.day_of_week}
            onChange={(value) =>
              setFormData({ ...formData, day_of_week: value })
            }
            error={errors.day_of_week}
          />

          <TextInput
            label="Start Time *"
            type="time"
            icon={<IconClock size={16} />}
            value={formData.start_time}
            onChange={(e) =>
              setFormData({ ...formData, start_time: e.currentTarget.value })
            }
            error={errors.start_time}
          />

          <TextInput
            label="End Time *"
            type="time"
            icon={<IconClock size={16} />}
            value={formData.end_time}
            onChange={(e) =>
              setFormData({ ...formData, end_time: e.currentTarget.value })
            }
            error={errors.end_time}
          />

          <TextInput
            label="Room Number *"
            placeholder="e.g., 101"
            type="number"
            value={formData.room_number}
            onChange={(e) =>
              setFormData({ ...formData, room_number: e.currentTarget.value })
            }
            error={errors.room_number}
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
              {editingId ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

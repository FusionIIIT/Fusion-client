/**
 * Doctor Form Component
 * ====================
 * Add/Edit doctor information
 * Used in CompoundDashboard for doctor management
 */

import { useState, useEffect } from 'react';
import {
  Paper,
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
  Select,
  Checkbox,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';
import * as api from '../api';

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function DoctorForm() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState({
    doctor_name: '',
    specialization: '',
    doctor_phone: '',
    email: '',
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  const specializations = [
    'Cardiology',
    'Neurology',
    'General Medicine',
    'Pediatrics',
    'Orthopedics',
    'Surgery',
    'Ophthalmology',
    'ENT',
    'Dermatology',
    'Psychiatry',
  ];

  useEffect(() => {
    fetchDoctors();
  }, [showInactive]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.getDoctors(!showInactive);
      const doctorsArray = Array.isArray(response.data) ? response.data : [];
      setDoctors(doctorsArray);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load doctors',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.doctor_name.trim()) newErrors.doctor_name = 'Doctor name is required';
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
    if (!formData.doctor_phone || formData.doctor_phone.length < 10)
      newErrors.doctor_phone = 'Valid phone number required (10+ digits)';
    if (!formData.email || !formData.email.includes('@'))
      newErrors.email = 'Valid email required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        await api.updateDoctor(editingId, formData);
        notifications.show({
          message: 'Doctor updated successfully',
          color: 'green',
        });
      } else {
        await api.createDoctor(formData);
        notifications.show({
          message: 'Doctor created successfully',
          color: 'green',
        });
      }
      setModalOpened(false);
      setFormData({
        doctor_name: '',
        specialization: '',
        doctor_phone: '',
        email: '',
        is_active: true,
      });
      await fetchDoctors();
    } catch (error) {
      
      notifications.show({
        message: error.response?.data?.detail || 'Failed to save doctor',
        color: 'red',
      });
    }
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor.id);
    setFormData({
      doctor_name: doctor.doctor_name,
      specialization: doctor.specialization,
      doctor_phone: doctor.doctor_phone,
      email: doctor.email,
      is_active: doctor.is_active !== undefined ? doctor.is_active : true,
    });
    setModalOpened(true);
  };

  const handleDelete = (id) => {
    modals.openConfirmModal({
      title: 'Confirm Deletion',
      children: (
        <Text size="sm">
          Are you sure you want to delete this doctor? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete Doctor', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.deleteDoctor(id);
          notifications.show({
            message: 'Doctor deleted successfully',
            color: 'green',
          });
          await fetchDoctors();
        } catch (error) {
          notifications.show({
            message: error.response?.data?.detail || 'Failed to delete doctor',
            color: 'red',
          });
        }
      },
    });
  };

  const handleToggleStatus = async (doctor) => {
    try {
      const updatedData = {
        doctor_name: doctor.doctor_name,
        specialization: doctor.specialization,
        doctor_phone: doctor.doctor_phone,
        email: doctor.email,
        is_active: !doctor.is_active,
      };
      await api.updateDoctor(doctor.id, updatedData);
      notifications.show({
        message: `Doctor ${!doctor.is_active ? 'activated' : 'deactivated'} successfully`,
        color: 'green',
      });
      await fetchDoctors();
    } catch (error) {
      
      notifications.show({
        message: 'Failed to change doctor status',
        color: 'red',
      });
    }
  };

  const handleModalClose = () => {
    setModalOpened(false);
    setEditingId(null);
    setFormData({
      doctor_name: '',
      specialization: '',
      doctor_phone: '',
      email: '',
      is_active: true,
    });
    setErrors({});
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <Text size="lg" weight={600}>
          Doctor Management
        </Text>
        <Group gap="md">
          <Group gap="xs">
            <Checkbox
              label="Show Inactive"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.currentTarget.checked)}
            />
          </Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setModalOpened(true)}
          >
            Add Doctor
          </Button>
        </Group>
      </Group>

      {/* Doctor List Table */}
      <Card withBorder p="lg">
        {doctors.length === 0 ? (
          <Text color="dimmed" align="center" py="xl">
            No doctors found
          </Text>
        ) : (
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Specialization</Table.Th>
                <Table.Th>Phone</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {doctors.map((doctor) => (
                <Table.Tr key={doctor.id}>
                  <Table.Td weight={500}>Dr. {doctor.doctor_name}</Table.Td>
                  <Table.Td>{doctor.specialization}</Table.Td>
                  <Table.Td>{doctor.doctor_phone}</Table.Td>
                  <Table.Td>{doctor.email}</Table.Td>
                  <Table.Td>
                    <Badge color={doctor.is_active ? 'green' : 'red'}>
                      {doctor.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={0}>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color={doctor.is_active ? 'green' : 'red'}
                        title={doctor.is_active ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggleStatus(doctor)}
                      >
                        {doctor.is_active ? <IconToggleRight size={16} /> : <IconToggleLeft size={16} />}
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => handleEdit(doctor)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(doctor.id)}
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

      {/* Modal Form */}
      <Modal
        opened={modalOpened}
        onClose={handleModalClose}
        title={editingId ? 'Edit Doctor' : 'Add New Doctor'}
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Doctor Name *"
            placeholder="Enter full name"
            value={formData.doctor_name}
            onChange={(e) =>
              setFormData({ ...formData, doctor_name: e.currentTarget.value })
            }
            error={errors.doctor_name}
          />

          <Select
            label="Specialization *"
            placeholder="Select specialization"
            data={specializations}
            value={formData.specialization}
            onChange={(value) =>
              setFormData({ ...formData, specialization: value })
            }
            error={errors.specialization}
          />

          <TextInput
            label="Phone Number *"
            placeholder="10-digit mobile number"
            value={formData.doctor_phone}
            onChange={(e) =>
              setFormData({ ...formData, doctor_phone: e.currentTarget.value })
            }
            error={errors.doctor_phone}
          />

          <TextInput
            label="Email *"
            placeholder="doctor@hospital.com"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.currentTarget.value })
            }
            error={errors.email}
          />

          <Checkbox
            label="Active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.currentTarget.checked })
            }
            description="Check to activate doctor, uncheck to deactivate"
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={handleModalClose}>
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

/**
 * Ambulance Management Component
 * =============================
 * CRUD for ambulance records
 * Track ambulance availability and usage
 */

import { useState, useEffect } from 'react';
import {
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
  NumberInput,
  Tabs,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconPlus, IconEdit, IconTrash, IconEye, IconCar, IconList } from '@tabler/icons-react';
import * as api from '../api';
import AmbulanceLogTab from './AmbulanceLogTab';

const statusOptions = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'IN_USE', label: 'In Use' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

const vehicleTypeOptions = [
  { value: 'Type A', label: 'Type A - Basic' },
  { value: 'Type B', label: 'Type B - Standard' },
  { value: 'Type C', label: 'Type C - Advanced' },
  { value: 'Advanced', label: 'Advanced - Full Equipment' },
  { value: 'Basic', label: 'Basic - Transport Only' },
];

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function AmbulanceManagement() {
  const [activeTab, setActiveTab] = useState('fleet');
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_type: '',
    registration_number: '',
    driver_name: '',
    driver_contact: '',
    driver_license: '',
    last_maintenance_date: '',
    next_maintenance_due: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const response = await api.getAmbulances();
      setAmbulances(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load ambulances',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicle_type)
      newErrors.vehicle_type = 'Vehicle type is required';
    if (!formData.registration_number.trim())
      newErrors.registration_number = 'Registration number is required';
    if (!formData.driver_name.trim())
      newErrors.driver_name = 'Driver name is required';
    if (!formData.driver_contact || formData.driver_contact.length < 10)
      newErrors.driver_contact = 'Valid phone number required (10+ digits)';
    if (!formData.driver_license.trim())
      newErrors.driver_license = 'Driver license is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        // For update, only send fields accepted by update serializer
        await api.updateAmbulance(editingId, {
          last_maintenance_date: formData.last_maintenance_date || null,
          notes: formData.notes || '',
        });
        notifications.show({
          message: 'Ambulance updated successfully',
          color: 'green',
        });
      } else {
        // For create, send all required fields
        await api.createAmbulance({
          vehicle_type: formData.vehicle_type,
          registration_number: formData.registration_number,
          driver_name: formData.driver_name,
          driver_contact: formData.driver_contact,
          driver_license: formData.driver_license,
          last_maintenance_date: formData.last_maintenance_date || null,
          next_maintenance_due: formData.next_maintenance_due || null,
          notes: formData.notes || '',
        });
        notifications.show({
          message: 'Ambulance added successfully',
          color: 'green',
        });
      }
      setModalOpened(false);
      resetForm();
      await fetchAmbulances();
    } catch (error) {
      
      notifications.show({
        message: error.response?.data?.detail || 'Failed to save ambulance',
        color: 'red',
      });
    }
  };

  const handleEdit = (ambulance) => {
    setEditingId(ambulance.id);
    setFormData({
      vehicle_type: ambulance.vehicle_type,
      registration_number: ambulance.registration_number,
      driver_name: ambulance.driver_name,
      driver_contact: ambulance.driver_contact,
      driver_license: ambulance.driver_license || '',
      last_maintenance_date: ambulance.last_maintenance_date || '',
      next_maintenance_due: ambulance.next_maintenance_due || '',
      notes: ambulance.notes || '',
    });
    setModalOpened(true);
  };

  const handleDelete = (id) => {
    modals.openConfirmModal({
      title: 'Confirm Deletion',
      children: 'Delete this ambulance?',
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
        await api.deleteAmbulance(id);
        notifications.show({
          message: 'Ambulance deleted successfully',
          color: 'green',
        });
        await fetchAmbulances();
        } catch (error) {
        notifications.show({ message: 'Failed to delete ambulance', color: 'red' });
        }
      }
    });
  };

  const handleViewDetails = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setDetailsModalOpened(true);
  };

  const resetForm = () => {
    setFormData({
      vehicle_type: '',
      registration_number: '',
      driver_name: '',
      driver_contact: '',
      driver_license: '',
      last_maintenance_date: '',
      next_maintenance_due: '',
      notes: '',
    });
    setErrors({});
    setEditingId(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      AVAILABLE: 'green',
      IN_USE: 'blue',
      MAINTENANCE: 'yellow',
    };
    return colors[status] || 'gray';
  };

  return (
    <Card p="md" withBorder radius="md">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="fleet" leftSection={<IconCar size={16} />}>
            Fleet Management
          </Tabs.Tab>
          <Tabs.Tab value="logs" leftSection={<IconList size={16} />}>
            Usage Logs
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="fleet">
          <Stack gap="lg">
            <Group justify="space-between">
              <Text size="lg" weight={600}>
                Ambulance Fleet
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  resetForm();
                  setModalOpened(true);
                }}
              >
                Add Ambulance
              </Button>
            </Group>

            <Card withBorder p="lg">
        {ambulances.length === 0 ? (
          <Text color="dimmed" align="center" py="xl">
            No ambulances registered
          </Text>
        ) : (
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Type</Table.Th>
                <Table.Th>Registration</Table.Th>
                <Table.Th>Driver</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ambulances.map((ambulance) => (
                <Table.Tr key={ambulance.id}>
                  <Table.Td weight={500}>{ambulance.vehicle_type}</Table.Td>
                  <Table.Td>{ambulance.registration_number}</Table.Td>
                  <Table.Td>{ambulance.driver_name}</Table.Td>
                  <Table.Td>{ambulance.driver_contact}</Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(ambulance.status)}>
                      {ambulance.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={0}>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        title="View details"
                        onClick={() => handleViewDetails(ambulance)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => handleEdit(ambulance)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(ambulance.id)}
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
        title={editingId ? 'Edit Ambulance' : 'Add New Ambulance'}
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Vehicle Type *"
            placeholder="Select vehicle type"
            data={vehicleTypeOptions}
            value={formData.vehicle_type}
            onChange={(value) =>
              setFormData({ ...formData, vehicle_type: value })
            }
            error={errors.vehicle_type}
            searchable
            disabled={editingId !== null}
          />

          <TextInput
            label="Registration Number *"
            placeholder="e.g., MH02AB1234"
            value={formData.registration_number}
            onChange={(e) =>
              setFormData({ ...formData, registration_number: e.currentTarget.value })
            }
            error={errors.registration_number}
            disabled={editingId !== null}
          />

          <TextInput
            label="Driver Name *"
            placeholder="Full name"
            value={formData.driver_name}
            onChange={(e) =>
              setFormData({ ...formData, driver_name: e.currentTarget.value })
            }
            error={errors.driver_name}
            disabled={editingId !== null}
          />

          <TextInput
            label="Driver Contact *"
            placeholder="10-digit phone number"
            value={formData.driver_contact}
            onChange={(e) =>
              setFormData({ ...formData, driver_contact: e.currentTarget.value })
            }
            error={errors.driver_contact}
            disabled={editingId !== null}
          />

          <TextInput
            label="Driver License *"
            placeholder="License number"
            value={formData.driver_license}
            onChange={(e) =>
              setFormData({ ...formData, driver_license: e.currentTarget.value })
            }
            error={errors.driver_license}
            disabled={editingId !== null}
          />

          <TextInput
            label="Last Maintenance Date"
            type="date"
            value={formData.last_maintenance_date}
            onChange={(e) =>
              setFormData({ ...formData, last_maintenance_date: e.currentTarget.value })
            }
          />

          <TextInput
            label="Next Maintenance Due"
            type="date"
            value={formData.next_maintenance_due}
            onChange={(e) =>
              setFormData({ ...formData, next_maintenance_due: e.currentTarget.value })
            }
          />

          <TextInput
            label="Notes"
            placeholder="Additional notes"
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
              {editingId ? 'Update' : 'Add'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Details Modal */}
      <Modal
        opened={detailsModalOpened}
        onClose={() => {
          setDetailsModalOpened(false);
          setSelectedAmbulance(null);
        }}
        title="Ambulance Details"
        size="md"
      >
        {selectedAmbulance && (
          <Stack gap="md">
            <Card withBorder p="lg" radius="md" bg="gray.0">
              <Stack gap="lg">
                {/* Vehicle Information */}
                <Stack gap="xs">
                  <Text size="xs" c="dimmed" tt="uppercase" weight={700}>
                    Vehicle Information
                  </Text>
                  <Text size="sm">
                    <strong>Type:</strong> {selectedAmbulance.vehicle_type}
                  </Text>
                  <Text size="sm">
                    <strong>Registration:</strong> {selectedAmbulance.registration_number}
                  </Text>
                  <Group gap="xs">
                    <Text size="sm" weight={500}>
                      <strong>Status:</strong>
                    </Text>
                    <Badge color={getStatusColor(selectedAmbulance.status)}>
                      {selectedAmbulance.status}
                    </Badge>
                  </Group>
                </Stack>

                {/* Driver Information */}
                <Stack gap="xs">
                  <Text size="xs" c="dimmed" tt="uppercase" weight={700}>
                    Driver Information
                  </Text>
                  <Text size="sm">
                    <strong>Name:</strong> {selectedAmbulance.driver_name}
                  </Text>
                  <Text size="sm">
                    <strong>Contact:</strong> {selectedAmbulance.driver_contact}
                  </Text>
                  <Text size="sm">
                    <strong>License:</strong> {selectedAmbulance.driver_license}
                  </Text>
                </Stack>

                {/* Maintenance Information */}
                <Stack gap="xs">
                  <Text size="xs" c="dimmed" tt="uppercase" weight={700}>
                    Maintenance Information
                  </Text>
                  <Text size="sm">
                    <strong>Last Maintenance:</strong>{' '}
                    {selectedAmbulance.last_maintenance_date
                      ? new Date(selectedAmbulance.last_maintenance_date).toLocaleDateString()
                      : 'Not recorded'}
                  </Text>
                  <Text size="sm">
                    <strong>Next Due:</strong>{' '}
                    {selectedAmbulance.next_maintenance_due
                      ? new Date(selectedAmbulance.next_maintenance_due).toLocaleDateString()
                      : 'Not scheduled'}
                  </Text>
                </Stack>

                {/* Notes */}
                {selectedAmbulance.notes && (
                  <Stack gap="xs">
                    <Text size="xs" c="dimmed" tt="uppercase" weight={700}>
                      Notes
                    </Text>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedAmbulance.notes}
                    </Text>
                  </Stack>
                )}

                {/* Status Information */}
                <Stack gap="xs">
                  <Text size="xs" c="dimmed" tt="uppercase" weight={700}>
                    System Information
                  </Text>
                  <Text size="sm">
                    <strong>Active:</strong> {selectedAmbulance.is_active ? 'Yes' : 'No'}
                  </Text>
                  {selectedAmbulance.created_at && (
                    <Text size="sm">
                      <strong>Created:</strong>{' '}
                      {new Date(selectedAmbulance.created_at).toLocaleString()}
                    </Text>
                  )}
                  {selectedAmbulance.updated_at && (
                    <Text size="sm">
                      <strong>Last Updated:</strong>{' '}
                      {new Date(selectedAmbulance.updated_at).toLocaleString()}
                    </Text>
                  )}
                </Stack>
              </Stack>
            </Card>

            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => {
                  setDetailsModalOpened(false);
                  setSelectedAmbulance(null);
                }}
              >
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="logs">
          <AmbulanceLogTab ambulances={ambulances} />
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}

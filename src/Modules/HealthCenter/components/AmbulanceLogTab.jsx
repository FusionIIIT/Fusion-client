import { useState, useEffect } from 'react';
import {
  Stack,
  Group,
  Card,
  Table,
  ScrollArea,
  Text,
  Button,
  Modal,
  TextInput,
  ActionIcon,
  Select,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import * as api from '../api';

export default function AmbulanceLogTab({ ambulances }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [formData, setFormData] = useState({
    ambulance: '',
    patient_name: '',
    destination: '',
    call_date: new Date().toISOString().split('T')[0],
    call_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    purpose: '',
    contact_number: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.getAmbulanceLogs();
      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load ambulance logs',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patient_name.trim()) newErrors.patient_name = 'Patient name is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.call_date) newErrors.call_date = 'Date is required';
    if (!formData.call_time) newErrors.call_time = 'Time is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = { ...formData };
      if (!payload.ambulance) payload.ambulance = null;

      await api.createAmbulanceLog(payload);
      notifications.show({
        message: 'Ambulance log added successfully',
        color: 'green',
      });
      setModalOpened(false);
      resetForm();
      fetchLogs();
    } catch (error) {
      
      
      alert('Backend Error Details:\n\n' + JSON.stringify(error.response?.data, null, 2));
      notifications.show({
        message:
          error.response?.data?.detail ||
          (error.response?.data && typeof error.response.data === 'object'
            ? Object.entries(error.response.data)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
            : 'Failed to save ambulance log'),
        color: 'red',
        autoClose: 10000,
      });
    }
  };

  const handleDelete = (id) => {
    modals.openConfirmModal({
      title: 'Confirm Deletion',
      children: 'Delete this ambulance log entry? This action will be audited.',
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.deleteAmbulanceLog(id);
          notifications.show({
            message: 'Ambulance log deleted successfully',
            color: 'green',
          });
          fetchLogs();
        } catch (error) {
          notifications.show({ message: 'Failed to delete ambulance log', color: 'red' });
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      ambulance: '',
      patient_name: '',
      destination: '',
      call_date: new Date().toISOString().split('T')[0],
      call_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      purpose: '',
      contact_number: '',
    });
    setErrors({});
  };

  const ambulanceOptions = ambulances.map((amb) => ({
    value: amb.id.toString(),
    label: `${amb.registration_number} (${amb.vehicle_type})`,
  }));

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Text size="lg" weight={600}>
          Ambulance Usage Log
        </Text>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            resetForm();
            setModalOpened(true);
          }}
        >
          Log Dispatch
        </Button>
      </Group>

      <Card withBorder p="lg">
        {logs.length === 0 ? (
          <Text color="dimmed" align="center" py="xl">
            No ambulance usage logs found
          </Text>
        ) : (
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date & Time</Table.Th>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Destination</Table.Th>
                <Table.Th>Ambulance</Table.Th>
                <Table.Th>Logged By</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {logs.map((log) => (
                <Table.Tr key={log.id}>
                  <Table.Td>
                    {log.call_date} {log.call_time}
                  </Table.Td>
                  <Table.Td>{log.patient_name}</Table.Td>
                  <Table.Td>{log.destination}</Table.Td>
                  <Table.Td>{log.ambulance_registration || 'N/A'}</Table.Td>
                  <Table.Td>{log.logged_by_name || 'System'}</Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      onClick={() => handleDelete(log.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
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
        title="Log Ambulance Dispatch"
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Ambulance"
            placeholder="Select dispatched ambulance (optional)"
            data={ambulanceOptions}
            value={formData.ambulance}
            onChange={(value) => setFormData({ ...formData, ambulance: value })}
            clearable
          />

          <TextInput
            label="Patient Name *"
            placeholder="Full name of patient"
            value={formData.patient_name}
            onChange={(e) => setFormData({ ...formData, patient_name: e.currentTarget.value })}
            error={errors.patient_name}
          />

          <TextInput
            label="Destination *"
            placeholder="Hospital or clinic name"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.currentTarget.value })}
            error={errors.destination}
          />

          <Group grow>
            <TextInput
              label="Date *"
              type="date"
              value={formData.call_date}
              onChange={(e) => setFormData({ ...formData, call_date: e.currentTarget.value })}
              error={errors.call_date}
            />
            <TextInput
              label="Time *"
              type="time"
              value={formData.call_time}
              onChange={(e) => setFormData({ ...formData, call_time: e.currentTarget.value })}
              error={errors.call_time}
            />
          </Group>

          <TextInput
            label="Purpose"
            placeholder="Reason for dispatch"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.currentTarget.value })}
          />

          <TextInput
            label="Contact Number"
            placeholder="Phone number of caller"
            value={formData.contact_number}
            onChange={(e) => setFormData({ ...formData, contact_number: e.currentTarget.value })}
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
            <Button onClick={handleSubmit}>Log Dispatch</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

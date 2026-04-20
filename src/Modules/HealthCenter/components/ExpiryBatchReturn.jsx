/**
 * Expiry Batch Return Component
 * ============================
 * Mark medicine batches as expired/returned
 * Track batch returns and expiry management
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
  NumberInput,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconPlus, IconTrash, IconCheck } from '@tabler/icons-react';
import * as api from '../api';

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function ExpiryBatchReturn() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [formData, setFormData] = useState({
    batch_id: '',
    medicine_name: '',
    quantity: '',
    reason: '',
    returned_qty: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.getExpiryBatches();
      const batchList = normalizeArray(response.data);
      setBatches(batchList);
    } catch (error) {
      
      notifications.show({ message: 'Failed to load data', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.batch_id) newErrors.batch_id = 'Batch is required';
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = 'Quantity must be > 0';
    if (!formData.reason || formData.reason.trim() === '')
      newErrors.reason = 'Reason is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        returned_qty: parseInt(formData.quantity),
        return_reason: formData.reason,
      };

      await api.markBatchAsReturned(formData.batch_id, payload);
      notifications.show({
        message: `Batch marked as returned - Reason: ${formData.reason}`,
        color: 'green',
      });
      setModalOpened(false);
      resetForm();
      await fetchData();
    } catch (error) {
      
      notifications.show({
        message: error.response?.data?.detail || 'Failed to mark batch as returned',
        color: 'red',
      });
    }
  };

  const handleDelete = (id) => {
    modals.openConfirmModal({
      title: 'Confirm Deletion',
      children: 'Delete this batch?',
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.deleteBatch(id);
          notifications.show({
            message: 'Batch deleted',
            color: 'green',
          });
          await fetchData();
        } catch (error) {
          notifications.show({ message: 'Failed to delete batch', color: 'red' });
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      batch_id: '',
      medicine_name: '',
      quantity: '',
      reason: '',
      returned_qty: '',
    });
    setErrors({});
  };

  const getStatusColor = (batch) => {
    if (batch.is_returned) return 'red';
    const today = new Date().toISOString().split('T')[0];
    if (batch.expiry_date <= today) return 'orange';
    return 'blue';
  };

  const getStatusBadge = (batch) => {
    if (batch.is_returned) return 'Returned';
    const today = new Date().toISOString().split('T')[0];
    if (batch.expiry_date <= today) return 'Expired';
    return 'Active';
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Text size="lg" weight={600}>
          Expiry & Batch Returns
        </Text>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            resetForm();
            setModalOpened(true);
          }}
        >
          Mark as Returned
        </Button>
      </Group>

      <Card withBorder p="lg">
        {batches.length === 0 ? (
          <Text color="dimmed" align="center" py="xl">
            No batches found
          </Text>
        ) : (
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Medicine</Table.Th>
                <Table.Th>Batch No</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Expiry Date</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {batches.map((batch) => {
                const medicine = batch.stock?.medicine_detail || {};
                return (
                  <Table.Tr key={batch.id}>
                    <Table.Td weight={500}>{medicine.medicine_name || 'N/A'}</Table.Td>
                    <Table.Td>{batch.batch_no || '-'}</Table.Td>
                    <Table.Td>{batch.qty}</Table.Td>
                    <Table.Td>
                      {new Date(batch.expiry_date).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(batch)}>
                        {getStatusBadge(batch)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{batch.return_reason || '-'}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="center">
                        {!batch.is_returned && (
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="blue"
                            title="Mark batch as returned"
                            onClick={() => {
                              const medicineDetail = batch.stock?.medicine_detail || {};
                              setFormData({
                                batch_id: batch.id.toString(),
                                medicine_name: medicineDetail.medicine_name || '',
                                quantity: batch.qty.toString(),
                                reason: '',
                                returned_qty: batch.qty.toString(),
                              });
                              setModalOpened(true);
                            }}
                          >
                            <IconCheck size={16} />
                          </ActionIcon>
                        )}
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          title="Delete batch"
                          onClick={() => handleDelete(batch.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
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
        title="Mark Batch as Returned"
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Batch *"
            placeholder="Select batch to mark as returned"
            data={batches
              .filter((b) => !b.is_returned)
              .map((batch) => {
                const medicine = batch.stock?.medicine_detail || {};
                return {
                  value: batch.id.toString(),
                  label: `${medicine.medicine_name} - Batch ${batch.batch_no} (Exp: ${new Date(batch.expiry_date).toLocaleDateString()})`,
                };
              })}
            value={formData.batch_id}
            onChange={(value) => {
              const batch = batches.find((b) => b.id.toString() === value);
              const medicineDetail = batch?.stock?.medicine_detail || {};
              setFormData({
                batch_id: value || '',
                medicine_name: medicineDetail.medicine_name || '',
                quantity: batch ? batch.qty.toString() : '',
                reason: '',
                returned_qty: batch ? batch.qty.toString() : '',
              });
            }}
            error={errors.batch_id}
            searchable
          />

          <TextInput
            label="Medicine"
            placeholder="Auto-populated from batch selection"
            value={formData.medicine_name}
            readOnly
            disabled
          />

          <NumberInput
            label="Quantity *"
            value={formData.quantity === '' ? undefined : formData.quantity}
            onChange={(value) =>
              setFormData({ ...formData, quantity: value === undefined ? '' : String(value) })
            }
            error={errors.quantity}
            min={1}
          />

          <Textarea
            label="Reason *"
            placeholder="Enter reason for marking batch as returned"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.currentTarget.value })}
            error={errors.reason}
            minRows={3}
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
            <Button onClick={handleSubmit}>Mark as Returned</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

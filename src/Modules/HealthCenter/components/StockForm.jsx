/**
 * Stock Form Component
 * ===================
 * Add/manage medicine stock
 * Track inventory and manage medicine availability
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
  ActionIcon,
  NumberInput,
  Textarea,
  Select,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import * as api from '../api';

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function StockForm() {
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockModalOpened, setStockModalOpened] = useState(false);
  const [medicineModalOpened, setMedicineModalOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [stockFormData, setStockFormData] = useState({
    medicine_id: '',
    total_qty: '',
    expiry_date: new Date().toISOString().split('T')[0],
    batch_no: '',
  });
  const [medicineFormData, setMedicineFormData] = useState({
    medicine_name: '',
    brand_name: '',
    generic_name: '',
    manufacturer_name: '',
    unit: 'tablets',
    pack_size_label: '',
    reorder_threshold: 10,
  });
  const [stockErrors, setStockErrors] = useState({});
  const [medicineErrors, setMedicineErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadMedicineOptions(), loadStockList()]);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMedicineOptions = async () => {
    try {
      const response = await api.getMedicines();
      const options = normalizeArray(response.data).map(med => ({
        value: String(med.id),
        label: med.pack_size_label ? `${med.medicine_name} (${med.pack_size_label})` : med.medicine_name,
      }));
      setMedicineOptions(options);
    } catch (error) {
      
    }
  };

  const loadStockList = async () => {
    try {
      const response = await api.getStock();
      
      setStockList(normalizeArray(response.data));
    } catch (error) {
      
    }
  };

  const validateStockForm = () => {
    const newErrors = {};
    if (!stockFormData.medicine_id || stockFormData.medicine_id === '') newErrors.medicine_id = 'Medicine is required';
    if (!stockFormData.total_qty || stockFormData.total_qty === '' || Number(stockFormData.total_qty) <= 0) newErrors.total_qty = 'Quantity must be > 0';
    if (!stockFormData.expiry_date) newErrors.expiry_date = 'Expiry date is required';
    if (!stockFormData.batch_no.trim()) newErrors.batch_no = 'Batch number is required';
    setStockErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMedicineForm = () => {
    const newErrors = {};
    if (!medicineFormData.medicine_name.trim()) newErrors.medicine_name = 'Medicine name is required';
    if (!medicineFormData.generic_name.trim()) newErrors.generic_name = 'Generic name is required';
    if (medicineFormData.reorder_threshold <= 0) newErrors.reorder_threshold = 'Reorder threshold must be > 0';
    setMedicineErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStockSubmit = async () => {
    if (!validateStockForm()) return;

    try {
      const payload = {
        medicine_id: Number(stockFormData.medicine_id),
        total_qty: Number(stockFormData.total_qty),
        expiry_date: stockFormData.expiry_date,
        batch_no: stockFormData.batch_no.trim(),
      };

      

      if (editingId) {
        await api.updateStock(editingId, payload);
        notifications.show({
          message: 'Stock updated successfully',
          color: 'green',
        });
      } else {
        await api.addStock(payload);
        notifications.show({
          message: 'Stock added successfully',
          color: 'green',
        });
      }
      setStockModalOpened(false);
      resetStockForm();
      await loadStockList();
    } catch (error) {
      
      const errorMsg = error.response?.data?.errors?.detail || error.response?.data?.detail || error.response?.data?.batch_no?.[0] || error.response?.data?.medicine_id?.[0] || error.response?.data?.qty?.[0] || error.response?.data?.expiry_date?.[0] || 'Failed to save stock';
      notifications.show({
        message: errorMsg,
        color: 'red',
      });
    }
  };

  const handleMedicineSubmit = async () => {
    if (!validateMedicineForm()) return;

    try {
      const payload = {
        medicine_name: medicineFormData.medicine_name.trim(),
        brand_name: medicineFormData.brand_name.trim(),
        generic_name: medicineFormData.generic_name.trim(),
        manufacturer_name: medicineFormData.manufacturer_name.trim(),
        unit: medicineFormData.unit,
        pack_size_label: medicineFormData.pack_size_label.trim(),
        reorder_threshold: Number(medicineFormData.reorder_threshold),
      };

      

      const response = await api.addMedicine(payload);
      notifications.show({
        message: 'Medicine added successfully',
        color: 'green',
      });

      setMedicineModalOpened(false);
      resetMedicineForm();
      
      // Reload medicines and set the newly added medicine as selected
      await loadMedicineOptions();
      const newMedicineId = response.data.id || response.data.medicine_id;
      setStockFormData(prev => ({ ...prev, medicine_id: String(newMedicineId) }));
    } catch (error) {
      
      const errorMsg = error.response?.data?.errors?.detail || error.response?.data?.detail || error.response?.data?.medicine_name?.[0] || error.response?.data?.generic_name?.[0] || 'Failed to save medicine';
      notifications.show({
        message: errorMsg,
        color: 'red',
      });
    }
  };

  const handleEdit = (stock) => {
    setEditingId(stock.id);
    setStockFormData({
      medicine_id: stock.medicine_id || stock.medicine,
      total_qty: stock.qty || stock.total_qty,
      expiry_date: stock.expiry_date || new Date().toISOString().split('T')[0],
      batch_no: stock.batch_no || '',
    });
    setStockModalOpened(true);
  };

  const handleDelete = (id) => {
    modals.openConfirmModal({
      title: 'Confirm Deletion',
      children: 'Delete this medicine from stock?',
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
        await api.deleteStock(id);
        notifications.show({
          message: 'Medicine deleted successfully',
          color: 'green',
        });
        await loadStockList();
        } catch (error) {
        notifications.show({ message: 'Failed to delete medicine', color: 'red' });
        }
      }
    });
  };

  const resetStockForm = () => {
    setStockFormData({
      medicine_id: '',
      total_qty: '',
      expiry_date: new Date().toISOString().split('T')[0],
      batch_no: '',
    });
    setStockErrors({});
    setEditingId(null);
  };

  const resetMedicineForm = () => {
    setMedicineFormData({
      medicine_name: '',
      brand_name: '',
      generic_name: '',
      manufacturer_name: '',
      unit: 'tablets',
      pack_size_label: '',
      reorder_threshold: 10,
    });
    setMedicineErrors({});
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Text size="lg" weight={600}>
          Stock Management
        </Text>
        <Group gap="sm">
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            onClick={() => {
              resetMedicineForm();
              setMedicineModalOpened(true);
            }}
          >
            Add Medicine
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              resetStockForm();
              setStockModalOpened(true);
            }}
          >
            Add Stock
          </Button>
        </Group>
      </Group>

      <Card withBorder p="lg">
        {stockList.length === 0 ? (
          <Text color="dimmed" align="center" py="xl">
            No medicines in stock
          </Text>
        ) : (
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Medicine</Table.Th>
                <Table.Th>Generic Name</Table.Th>
                <Table.Th>Pack Size</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Batches</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {stockList.map((stock) => {
                const med = stock.medicine_detail || {};
                return (
                <Table.Tr key={stock.id}>
                  <Table.Td weight={500}>{med.medicine_name || 'N/A'}</Table.Td>
                  <Table.Td>{med.generic_name || 'N/A'}</Table.Td>
                  <Table.Td>{med.pack_size_label || 'N/A'}</Table.Td>
                  <Table.Td>
                    {stock.total_qty || 0} {med.unit || 'units'}
                  </Table.Td>
                  <Table.Td>
                    {stock.expiry_batches && stock.expiry_batches.length > 0 
                      ? `${stock.expiry_batches.length} batch(es)` 
                      : 'No batches'}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={0}>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => handleEdit(stock)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(stock.id)}
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
        opened={stockModalOpened}
        onClose={() => {
          resetStockForm();
          setStockModalOpened(false);
        }}
        title={editingId ? 'Edit Stock' : 'Add Stock'}
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Medicine *"
            placeholder="Select a medicine"
            searchable
            clearable
            data={medicineOptions}
            value={stockFormData.medicine_id}
            onChange={(value) => {
              setStockFormData({ ...stockFormData, medicine_id: value || '' });
            }}
            error={stockErrors.medicine_id}
          />

          <NumberInput
            label="Quantity *"
            placeholder="Total quantity"
            value={stockFormData.total_qty === '' ? undefined : stockFormData.total_qty}
            onChange={(value) => {
              setStockFormData({ ...stockFormData, total_qty: value === undefined ? '' : String(value) });
            }}
            error={stockErrors.total_qty}
            min={1}
          />

          <TextInput
            label="Expiry Date *"
            placeholder="YYYY-MM-DD"
            inputMode="date"
            value={stockFormData.expiry_date}
            onChange={(e) => {
              setStockFormData({ ...stockFormData, expiry_date: e.currentTarget.value });
            }}
            error={stockErrors.expiry_date}
          />

          <TextInput
            label="Batch Number *"
            placeholder="Batch number (e.g., B001)"
            value={stockFormData.batch_no}
            onChange={(e) => {
              setStockFormData({ ...stockFormData, batch_no: e.currentTarget.value });
            }}
            error={stockErrors.batch_no}
          />

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                resetStockForm();
                setStockModalOpened(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleStockSubmit}>
              {editingId ? 'Update' : 'Add'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={medicineModalOpened}
        onClose={() => {
          resetMedicineForm();
          setMedicineModalOpened(false);
        }}
        title="Add New Medicine"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Medicine Name *"
            placeholder="e.g., Aspirin"
            value={medicineFormData.medicine_name}
            onChange={(e) => {
              setMedicineFormData({ ...medicineFormData, medicine_name: e.currentTarget.value });
            }}
            error={medicineErrors.medicine_name}
          />

          <TextInput
            label="Brand Name"
            placeholder="e.g., Bayer Aspirin"
            value={medicineFormData.brand_name}
            onChange={(e) => {
              setMedicineFormData({ ...medicineFormData, brand_name: e.currentTarget.value });
            }}
          />

          <TextInput
            label="Generic Name *"
            placeholder="e.g., Acetylsalicylic Acid"
            value={medicineFormData.generic_name}
            onChange={(e) => {
              setMedicineFormData({ ...medicineFormData, generic_name: e.currentTarget.value });
            }}
            error={medicineErrors.generic_name}
          />

          <TextInput
            label="Manufacturer Name"
            placeholder="e.g., Bayer AG"
            value={medicineFormData.manufacturer_name}
            onChange={(e) => {
              setMedicineFormData({ ...medicineFormData, manufacturer_name: e.currentTarget.value });
            }}
          />

          <Select
            label="Unit"
            placeholder="Select unit"
            data={['tablets', 'capsules', 'ml', 'strips', 'injections', 'gm']}
            value={medicineFormData.unit}
            onChange={(value) => {
              setMedicineFormData({ ...medicineFormData, unit: value || 'tablets' });
            }}
          />

          <TextInput
            label="Pack Size Label"
            placeholder="e.g., 500mg"
            value={medicineFormData.pack_size_label}
            onChange={(e) => {
              setMedicineFormData({ ...medicineFormData, pack_size_label: e.currentTarget.value });
            }}
          />

          <NumberInput
            label="Reorder Threshold *"
            placeholder="Minimum quantity before reorder"
            value={medicineFormData.reorder_threshold}
            onChange={(value) => {
              setMedicineFormData({ ...medicineFormData, reorder_threshold: value || 10 });
            }}
            error={medicineErrors.reorder_threshold}
            min={1}
          />

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                resetMedicineForm();
                setMedicineModalOpened(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleMedicineSubmit}>
              Add Medicine
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}


/**
 * Inventory Management Page
 * ==========================
 * Allows PHC staff to:
 * - View current medicinie inventory
 * - Update stock quantities
 * - View expiring medicines
 * - Track low stock alerts
 * 
 * PHC-UC-09: Manage Inventory
 * PHC-UC-18: View Low Stock Alerts
 * PHC-BR-07: Low stock threshold logic
 */

import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Loader,
  Card,
  Stack,
  Group,
  Badge,
  Button,
  Modal,
  NumberInput,
  Select,
  Table,
  ScrollArea,
  Tabs,
  SimpleGrid,
  TextInput,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconPackage,
  IconClock,
  IconEdit,
  IconSearch,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import * as api from '../api';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExpired, setFilterExpired] = useState('all'); // all, expiring, expired
  
  // Stock update modal
  const [stockModal, setStockModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantityChange, setQuantityChange] = useState('');
  const [updateReason, setUpdateReason] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [inventoryRes, alertsRes] = await Promise.all([
        api.getInventory(),
        api.getLowStockAlerts(),
      ]);

      setInventory(inventoryRes.data || []);
      setLowStockAlerts(alertsRes.data || []);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load inventory data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async () => {
    if (!quantityChange || !updateReason) {
      notifications.show({
        message: 'Please fill all required fields',
        color: 'yellow',
      });
      return;
    }

    try {
      setUpdatingStock(true);
      await api.updateInventoryStock(
        selectedMedicine.id,
        parseInt(quantityChange),
        updateReason
      );

      notifications.show({
        message: 'Stock updated successfully',
        color: 'green',
      });

      setStockModal(false);
      setSelectedMedicine(null);
      setQuantityChange('');
      setUpdateReason('');
      await fetchInventoryData();
    } catch (error) {
      
      notifications.show({
        message: 'Failed to update stock',
        color: 'red',
      });
    } finally {
      setUpdatingStock(false);
    }
  };

  // Filter inventory based on search and expiry filter
  const getFilteredInventory = () => {
    let filtered = inventory;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.medicine_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // Expiry filter
    if (filterExpired === 'expired') {
      const today = new Date();
      filtered = filtered.filter((item) => {
        if (!item.expiry_date) return false;
        return new Date(item.expiry_date) < today;
      });
    } else if (filterExpired === 'expiring') {
      const today = new Date();
      const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((item) => {
        if (!item.expiry_date) return false;
        const expiry = new Date(item.expiry_date);
        return expiry >= today && expiry <= thirtyDaysLater;
      });
    }

    return filtered;
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

  const filteredInventory = getFilteredInventory();

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Stack mb="xl">
        <Title order={1}>Inventory Management</Title>
        <Text color="dimmed">Manage medicine stock and track alerts</Text>
      </Stack>

      {/* Statistics */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <Card withBorder p="lg">
          <Group position="apart">
            <div>
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                Total Medicines
              </Text>
              <Text weight={700} size="lg">
                {inventory.length}
              </Text>
            </div>
            <IconPackage size={32} color="blue" />
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group position="apart">
            <div>
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                Low Stock Alerts
              </Text>
              <Text weight={700} size="lg">
                {lowStockAlerts.length}
              </Text>
            </div>
            <IconAlertTriangle size={32} color="red" />
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group position="apart">
            <div>
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                Expiring Soon
              </Text>
              <Text weight={700} size="lg">
                {inventory.filter((item) => {
                  if (!item.expiry_date) return false;
                  const today = new Date();
                  const thirtyDaysLater = new Date(
                    today.getTime() + 30 * 24 * 60 * 60 * 1000
                  );
                  const expiry = new Date(item.expiry_date);
                  return expiry >= today && expiry <= thirtyDaysLater;
                }).length}
              </Text>
            </div>
            <IconClock size={32} color="orange" />
          </Group>
        </Card>
      </SimpleGrid>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <Tabs.List>
          <Tabs.Tab value="all">All Inventory</Tabs.Tab>
          <Tabs.Tab value="lowstock">Low Stock ({lowStockAlerts.length})</Tabs.Tab>
          <Tabs.Tab
            value="expiring"
            label="Expiring Soon"
          ></Tabs.Tab>
          <Tabs.Tab value="expired">Expired</Tabs.Tab>
        </Tabs.List>

        {/* All Inventory Tab */}
        <Tabs.Panel value="all" pt="xl">
          <Stack gap="md" mb="md">
            <TextInput
              placeholder="Search medicines..."
              icon={<IconSearch size={14} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Stack>

          <InventoryTable
            data={filteredInventory}
            onUpdateStock={(medicine) => {
              setSelectedMedicine(medicine);
              setStockModal(true);
            }}
          />
        </Tabs.Panel>

        {/* Low Stock Tab */}
        <Tabs.Panel value="lowstock" pt="xl">
          {lowStockAlerts.length > 0 ? (
            <LowStockTable
              alerts={lowStockAlerts}
              onUpdateStock={(medicine) => {
                setSelectedMedicine({
                  id: medicine.medicine_id,
                  medicine_name: medicine.medicine_name,
                  current_stock: medicine.current_stock,
                  reorder_threshold: medicine.threshold,
                });
                setStockModal(true);
              }}
            />
          ) : (
            <Card withBorder p="xl">
              <Text color="dimmed" align="center">
                No low stock alerts
              </Text>
            </Card>
          )}
        </Tabs.Panel>

        {/* Expiring Tab */}
        <Tabs.Panel value="expiring" pt="xl">
          {(() => {
            const today = new Date();
            const thirtyDaysLater = new Date(
              today.getTime() + 30 * 24 * 60 * 60 * 1000
            );
            const expiringItems = inventory.filter((item) => {
              if (!item.expiry_date) return false;
              const expiry = new Date(item.expiry_date);
              return expiry >= today && expiry <= thirtyDaysLater;
            });

            return expiringItems.length > 0 ? (
              <InventoryTable data={expiringItems} onUpdateStock={() => {}} />
            ) : (
              <Card withBorder p="xl">
                <Text color="dimmed" align="center">
                  No medicines expiring soon
                </Text>
              </Card>
            );
          })()}
        </Tabs.Panel>

        {/* Expired Tab */}
        <Tabs.Panel value="expired" pt="xl">
          {(() => {
            const today = new Date();
            const expiredItems = inventory.filter((item) => {
              if (!item.expiry_date) return false;
              return new Date(item.expiry_date) < today;
            });

            return expiredItems.length > 0 ? (
              <InventoryTable data={expiredItems} onUpdateStock={() => {}} />
            ) : (
              <Card withBorder p="xl">
                <Text color="dimmed" align="center">
                  No expired medicines
                </Text>
              </Card>
            );
          })()}
        </Tabs.Panel>
      </Tabs>

      {/* Stock Update Modal */}
      <Modal
        opened={stockModal}
        onClose={() => {
          setStockModal(false);
          setSelectedMedicine(null);
          setQuantityChange('');
          setUpdateReason('');
        }}
        title={
          selectedMedicine
            ? `Update Stock - ${selectedMedicine.medicine_name}`
            : 'Update Stock'
        }
        size="md"
      >
        <Stack gap="md">
          {selectedMedicine && (
            <Card p="md" bg="blue.0">
              <SimpleGrid cols={2} spacing="sm">
                <div>
                  <Text size="xs" color="dimmed">
                    Current Stock
                  </Text>
                  <Text weight={700}>
                    {selectedMedicine.current_stock} units
                  </Text>
                </div>
                <div>
                  <Text size="xs" color="dimmed">
                    Reorder Threshold
                  </Text>
                  <Text weight={700}>
                    {selectedMedicine.reorder_threshold} units
                  </Text>
                </div>
              </SimpleGrid>
            </Card>
          )}

          <NumberInput
            label="Quantity Change *"
            placeholder="Positive for increase, negative for decrease"
            value={quantityChange}
            onChange={setQuantityChange}
          />

          <Select
            label="Reason *"
            placeholder="Select reason"
            value={updateReason}
            onChange={setUpdateReason}
            data={[
              { value: 'PURCHASE', label: 'Purchase/Restock' },
              { value: 'USAGE', label: 'Usage/Consumption' },
              { value: 'EXPIRY', label: 'Expiry/Return' },
              { value: 'INVENTORY_CHECK', label: 'Inventory Correction' },
              { value: 'DAMAGE', label: 'Damage/Loss' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />

          <Group position="right">
            <Button
              variant="default"
              onClick={() => {
                setStockModal(false);
                setSelectedMedicine(null);
                setQuantityChange('');
                setUpdateReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              onClick={handleStockUpdate}
              loading={updatingStock}
            >
              Update Stock
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

/**
 * Inventory Table Component
 */
function InventoryTable({ data, onUpdateStock }) {
  if (data.length === 0) {
    return (
      <Card withBorder p="xl">
        <Text color="dimmed" align="center">
          No items to display
        </Text>
      </Card>
    );
  }

  return (
    <ScrollArea><Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Medicine Name</Table.Th>
          <Table.Th>Current Stock</Table.Th>
          <Table.Th>Batch Number</Table.Th>
          <Table.Th>Expiry Date</Table.Th>
          <Table.Th>Supplier</Table.Th>
          <Table.Th>Action</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((item) => {
          const isExpired =
            item.expiry_date &&
            new Date(item.expiry_date) < new Date();
          const isExpiringSoon =
            item.expiry_date &&
            new Date(item.expiry_date) <
              new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) &&
            new Date(item.expiry_date) >= new Date();

          return (
            <Table.Tr key={item.id}>
              <Table.Td weight={500}>{item.medicine_name}</Table.Td>
              <Table.Td>
                <Badge
                  color={
                    item.quantity_remaining === 0
                      ? 'red'
                      : item.quantity_remaining < item.reorder_threshold
                      ? 'yellow'
                      : 'green'
                  }
                >
                  {item.quantity_remaining}
                </Badge>
              </Table.Td>
              <Table.Td>{item.batch_number || '-'}</Table.Td>
              <Table.Td>
                {item.expiry_date && (
                  <Badge
                    color={
                      isExpired
                        ? 'red'
                        : isExpiringSoon
                        ? 'yellow'
                        : 'gray'
                    }
                  >
                    {item.expiry_date}
                  </Badge>
                )}
              </Table.Td>
              <Table.Td>{item.supplier || '-'}</Table.Td>
              <Table.Td>
                <Tooltip label="Update stock">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => onUpdateStock(item)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table></ScrollArea>
  );
}

/**
 * Low Stock Alerts Table Component
 */
function LowStockTable({ alerts, onUpdateStock }) {
  return (
    <ScrollArea><Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Medicine</Table.Th>
          <Table.Th>Current Stock</Table.Th>
          <Table.Th>Threshold</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Action</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {alerts.map((alert) => (
          <Table.Tr key={alert.id}>
            <Table.Td weight={500}>{alert.medicine_name}</Table.Td>
            <Table.Td>
              <Badge color="red">{alert.current_stock}</Badge>
            </Table.Td>
            <Table.Td>{alert.threshold}</Table.Td>
            <Table.Td>
              <Badge color="red">Critical</Badge>
            </Table.Td>
            <Table.Td>
              <Tooltip label="Reorder now">
                <ActionIcon
                  variant="light"
                  color="green"
                  onClick={() => onUpdateStock(alert)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table></ScrollArea>
  );
}

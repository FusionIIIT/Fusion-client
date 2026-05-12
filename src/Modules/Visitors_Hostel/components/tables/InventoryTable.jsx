/**
 * InventoryTable
 * UC-VH-011: Enhanced inventory management with threshold alerts and replenishment
 * VHMS TRACEABILITY:
 * - UC-VH-011: Manage inventory and threshold alerts
 * - BR-VH-007, BR-VH-016: Threshold policy and incharge approval flow
 * Features:
 * - BR-VH-007: Threshold alert system
 * - BR-VH-016: Replenishment approval workflow
 * - Critical item highlighting
 * - Role-based permissions
 */

import React, { useState, useEffect } from "react";
import {
  Table,
  Box,
  ActionIcon,
  Tooltip,
  Tabs,
  TextInput,
  Alert,
  LoadingOverlay,
  Pagination,
  Group,
  Badge,
  Button,
  Modal,
  Text,
  Stack,
  NumberInput,
  Textarea,
  Select,
} from "@mantine/core";
import { IconEdit, IconSearch, IconRefresh, IconAlertTriangle, IconShoppingCart } from "@tabler/icons-react";
import { inventoryAPI } from "../../services/visitorHostelApi";
import { useSelector } from "react-redux";
import { useActionConfirmation } from "../common/ActionConfirmationProvider";

const INVENTORY_LIST_SUPPORTED = true; // UC-VH-011: Enable inventory functionality

function InventoryTable() {
  const { confirmAction } = useActionConfirmation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [criticalItems, setCriticalItems] = useState([]);
  const [showReplenishmentModal, setShowReplenishmentModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const role = useSelector((state) => state.user?.role);
  const isStaff = role === "VhIncharge" || role === "VhCaretaker";
  const isIncharge = role === "VhIncharge";
  const isCaretaker = role === "VhCaretaker";

  useEffect(() => {
    fetchInventory();
    if (isStaff) {
      checkThresholds();
    }
  }, [page, isStaff]);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryAPI.getInventoryList();
      if (response.success) {
        setItems(response.data || []);
      } else {
        setError(response.message || "Failed to fetch inventory");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const checkThresholds = async () => {
    try {
      const response = await inventoryAPI.checkInventoryThresholds();
      if (response.success) {
        setCriticalItems(response.critical_items || []);
      }
    } catch (err) {
      console.error("Failed to check thresholds:", err);
    }
  };

  const triggerThresholdCheck = async () => {
    if (!(await confirmAction("Are you sure you want to run inventory threshold check now?", {
      title: "Confirm Threshold Check",
      confirmLabel: "Run",
      confirmColor: "orange",
    }))) {
      return;
    }

    try {
      await inventoryAPI.triggerThresholdCheck();
      checkThresholds();
      fetchInventory();
    } catch (err) {
      setError("Failed to trigger threshold check");
    }
  };

  const handleRequestReplenishment = (item) => {
    setSelectedItem(item);
    setShowReplenishmentModal(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowUpdateModal(true);
  };

  const filteredItems = items.filter((item) =>
    item.item_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTabItems = () => {
    switch (activeTab) {
      case "critical":
        return filteredItems.filter((item) => item.is_critical);
      case "consumables":
        return filteredItems.filter((item) => item.consumable);
      case "non-consumables":
        return filteredItems.filter((item) => !item.consumable);
      default:
        return filteredItems;
    }
  };

  const tabItems = getTabItems();

  return (
    <Box>
      {/* UC-VH-011: Critical Items Alert */}
      {criticalItems.length > 0 && isStaff && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Critical Inventory Alert "
          color="red"
          mb="md"
        >
          <Text size="sm" mb="xs">
            {criticalItems.length} item(s) are below threshold and need immediate attention.
          </Text>
          <Group spacing="xs">
            {criticalItems.slice(0, 3).map((item) => (
              <Badge key={item.id} color="red" size="sm">
                {item.item_name}: {item.quantity} {item.unit}
              </Badge>
            ))}
            {criticalItems.length > 3 && (
              <Badge color="red" size="sm">
                +{criticalItems.length - 3} more
              </Badge>
            )}
          </Group>
        </Alert>
      )}

      <Group mb="md" justify="space-between">
        <TextInput
          placeholder="Search inventory items..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: "400px" }}
        />
        <Group spacing="xs">
          {isStaff && (
            <Button
              leftSection={<IconAlertTriangle size={16} />}
              variant="outline"
              color="orange"
              onClick={triggerThresholdCheck}
              loading={loading}
            >
              Check Thresholds
            </Button>
          )}
          <ActionIcon onClick={fetchInventory} loading={loading} variant="default">
            <IconRefresh size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      <LoadingOverlay visible={loading} />

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="all">All Items ({filteredItems.length})</Tabs.Tab>
          <Tabs.Tab
            value="critical"
            color="red"
            rightSection={
              filteredItems.filter((item) => item.is_critical).length > 0 ? (
                <Badge size="xs" color="red">
                  {filteredItems.filter((item) => item.is_critical).length}
                </Badge>
              ) : null
            }
          >
            Critical Items
          </Tabs.Tab>
          <Tabs.Tab value="consumables">
            Consumables ({filteredItems.filter((item) => item.consumable).length})
          </Tabs.Tab>
          <Tabs.Tab value="non-consumables">
            Non-Consumables ({filteredItems.filter((item) => !item.consumable).length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={activeTab} pt="md">
          <InventoryTabContent
            items={tabItems}
            isStaff={isStaff}
            isIncharge={isIncharge}
            isCaretaker={isCaretaker}
            onRequestReplenishment={handleRequestReplenishment}
            onEditItem={handleEditItem}
          />
        </Tabs.Panel>
      </Tabs>

      <InventoryUpdateModal
        opened={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        item={selectedItem}
        onSuccess={() => {
          setShowUpdateModal(false);
          checkThresholds();
          fetchInventory();
        }}
      />

      {/* Replenishment Request Modal */}
      <ReplenishmentRequestModal
        opened={showReplenishmentModal}
        onClose={() => setShowReplenishmentModal(false)}
        item={selectedItem}
        onSuccess={() => {
          setShowReplenishmentModal(false);
          fetchInventory();
        }}
      />
    </Box>
  );
}

function InventoryTabContent({ items, isStaff, isIncharge, isCaretaker, onRequestReplenishment, onEditItem }) {
  if (items.length === 0) {
    return <Alert color="blue">No items found in this category</Alert>;
  }

  return (
    <Table striped highlightOnHover>
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Current Stock</th>
          <th>Threshold</th>
          <th>Status</th>
          <th>Category</th>
          <th>Total Stock</th>
          <th>In Use</th>
          {isStaff && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} style={item.is_critical ? { backgroundColor: "#ffe0e0" } : {}}>
            <td>
              <Group spacing="xs">
                <Text fw={item.is_critical ? 600 : 400}>{item.item_name}</Text>
                {item.is_critical && (
                  <IconAlertTriangle size={16} color="red" />
                )}
              </Group>
            </td>
            <td>
              <Badge
                color={
                  item.is_critical
                    ? "red"
                    : item.quantity < item.threshold_quantity * 1.5
                      ? "yellow"
                      : "green"
                }
                variant={item.is_critical ? "filled" : "light"}
              >
                {item.quantity} {item.unit}
              </Badge>
            </td>
            <td>
              <Text size="sm" color="dimmed">
                {item.threshold_quantity} {item.unit}
              </Text>
            </td>
            <td>
              <Stack spacing={4}>
                {item.is_critical && (
                  <Badge size="xs" color="red">
                    Critical
                  </Badge>
                )}
                {item.pending_replenishment && (
                  <Badge size="xs" color="blue">
                    Replenishment Pending
                  </Badge>
                )}
                {!item.is_critical && !item.pending_replenishment && (
                  <Badge size="xs" color="green">
                    OK
                  </Badge>
                )}
              </Stack>
            </td>
            <td>
              <Badge size="sm" variant="outline">
                {item.category}
              </Badge>
            </td>
            <td>{item.total_stock}</td>
            <td>{item.inuse}</td>
            {isStaff && (
              <td>
                <Group spacing="xs">
                  {(isIncharge || isCaretaker) && (
                    <Tooltip label="Update Item Quantity">
                      <ActionIcon
                        size="sm"
                        variant="light"
                        color="blue"
                        onClick={() => onEditItem(item)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  {isCaretaker && item.is_critical && !item.pending_replenishment && (
                    <Tooltip label="Request Replenishment">
                      <ActionIcon
                        size="sm"
                        variant="light"
                        color="orange"
                        onClick={() => onRequestReplenishment(item)}
                      >
                        <IconShoppingCart size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function InventoryUpdateModal({ opened, onClose, item, onSuccess }) {
  const { confirmAction } = useActionConfirmation();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity ?? 0);
      setError("");
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item) return;

    if (!(await confirmAction("Are you sure you want to update this inventory quantity?", {
      title: "Confirm Quantity Update",
      confirmLabel: "Update",
      confirmColor: "blue",
    }))) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await inventoryAPI.updateInventoryQuantity(item.id, Number(quantity), "set");
      if (response?.success) {
        onSuccess();
      } else {
        setError(response?.detail || "Failed to update item quantity");
      }
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to update item quantity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Update Inventory Item - {item?.item_name}</Text>}
      size="md"
    >
      {item && (
        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            {error && <Alert color="red">{error}</Alert>}

            <Text size="sm" c="dimmed">
              Unit: {item.unit} | Current: {item.quantity} | Threshold: {item.threshold_quantity}
            </Text>

            <NumberInput
              label="New Quantity"
              placeholder="Enter updated stock quantity"
              value={quantity}
              onChange={setQuantity}
              min={0}
              required
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update Item
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}

function ReplenishmentRequestModal({ opened, onClose, item, onSuccess }) {
  const { confirmAction } = useActionConfirmation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    requestedQuantity: 10,
    urgency: "medium",
    justification: "",
  });

  useEffect(() => {
    if (item) {
      setError("");
      setFormData({
        requestedQuantity: Math.max(item.threshold_quantity * 2 - item.quantity, 5),
        urgency: item.quantity === 0 ? "critical" : item.quantity < 3 ? "high" : "medium",
        justification: `Replenishment needed for ${item.item_name}. Current stock: ${item.quantity} ${item.unit}, below threshold of ${item.threshold_quantity} ${item.unit}.`,
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item) return;

    if (!(await confirmAction("Are you sure you want to submit this replenishment request?", {
      title: "Confirm Replenishment Request",
      confirmLabel: "Submit",
      confirmColor: "orange",
    }))) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await inventoryAPI.createReplenishmentRequest(
        item.id,
        formData.requestedQuantity,
        formData.urgency,
        formData.justification
      );

      if (!response?.success) {
        throw new Error(response?.detail || response?.message || "Failed to create replenishment request.");
      }

      onSuccess();
    } catch (err) {
      const errorMessage =
        err?.detail ||
        err?.message ||
        err?.payload?.detail ||
        "Failed to create replenishment request.";
      setError(errorMessage);
      console.error("Failed to create replenishment request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconShoppingCart size={20} />
          <Text>Request Replenishment - {item?.item_name}</Text>
        </Group>
      }
      size="md"
    >
      {item && (
        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            {error && <Alert color="red">{error}</Alert>}
            <Alert icon={<IconAlertTriangle size={16} />} color="orange">
              <Text size="sm">
                Current stock: <strong>{item.quantity} {item.unit}</strong> (Below threshold of {item.threshold_quantity} {item.unit})
              </Text>
            </Alert>

            <NumberInput
              label="Requested Quantity*"
              placeholder="Enter quantity needed"
              value={formData.requestedQuantity}
              onChange={(val) => setFormData(prev => ({ ...prev, requestedQuantity: val }))}
              min={1}
              required
            />

            <Select
              label="Urgency Level*"
              placeholder="Select urgency"
              data={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
              value={formData.urgency}
              onChange={(val) => setFormData(prev => ({ ...prev, urgency: val }))}
              required
            />

            <Textarea
              label="Justification*"
              placeholder="Explain why replenishment is needed"
              value={formData.justification}
              onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
              minRows={3}
              required
            />

            <Group position="right">
              <Button variant="default" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                leftSection={<IconShoppingCart size={16} />}
              >
                Submit Request
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}

export default InventoryTable;
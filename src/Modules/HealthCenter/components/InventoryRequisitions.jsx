/**
 * Inventory Requisition Component
 * =======================
 * PHC-UC-10: Create Inventory Requisition (compounder submits stock request)
 * PHC-UC-14: Mark Requisition as Fulfilled (compounder closes on receipt of stock)
 * PHC-WF-02: Full workflow visibility — CREATED → SUBMITTED → APPROVED/REJECTED → FULFILLED
 *
 * PHC-UC-16 (Approve Inventory Requisition) is handled by the Approving Authority.
 * Its backend endpoint (AuthorityInventoryRequisitionView) is implemented but commented
 * out in views.py pending institute-level role definition (cross-module boundary).
 */

import { useState, useEffect } from 'react';
import {
  Button,
  Stack,
  Group,
  Card,
  Table,
  ScrollArea,
  Text,
  Modal,
  NumberInput,
  Select,
  Badge,
  ActionIcon,
  Tooltip,
  Textarea,
  Alert,
  Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconSend,
  IconRefresh,
  IconCheck,
  IconInfoCircle,
  IconAlertCircle,
} from '@tabler/icons-react';
import * as api from '../api';

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

const STATUS_COLOR = {
  CREATED:   'gray',
  SUBMITTED: 'blue',
  APPROVED:  'green',
  REJECTED:  'red',
  FULFILLED: 'teal',
};

const STATUS_LABEL = {
  CREATED:   'Created',
  SUBMITTED: 'Pending Approval',
  APPROVED:  'Approved',
  REJECTED:  'Rejected',
  FULFILLED: 'Fulfilled',
};

export default function InventoryRequisition() {
  const [requisitions, setRequisitions]     = useState([]);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [loading, setLoading]               = useState(true);

  // ── New Requisition modal
  const [modalOpened, setModalOpened]   = useState(false);
  const [formData, setFormData]         = useState({ medicine_id: '', quantity: '' });
  const [formErrors, setFormErrors]     = useState({});

  // ── Fulfill modal (PHC-UC-14)
  const [fulfillModalOpened, setFulfillModalOpened] = useState(false);
  const [fulfillTarget, setFulfillTarget]           = useState(null);
  const [quantityFulfilled, setQuantityFulfilled]   = useState('');
  const [fulfillError, setFulfillError]             = useState('');
  const [fulfillLoading, setFulfillLoading]         = useState(false);

  // ── Details popover
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [detailReq, setDetailReq]                 = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadMedicineOptions(), loadRequisitions()]);
    } catch {
      notifications.show({ message: 'Failed to load data', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const loadMedicineOptions = async () => {
    try {
      const res = await api.getMedicines();
      setMedicineOptions(
        normalizeArray(res.data).map((med) => ({
          value: String(med.id),
          label: med.pack_size_label
            ? `${med.medicine_name} (${med.pack_size_label})`
            : med.medicine_name,
        }))
      );
    } catch { /* silently fail */ }
  };

  const loadRequisitions = async () => {
    try {
      const res = await api.getCompounderRequisitions();
      setRequisitions(normalizeArray(res.data));
    } catch { /* silently fail */ }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Create Requisition  (PHC-UC-10)
  // ─────────────────────────────────────────────────────────────────────────

  const validateForm = () => {
    const errs = {};
    if (!formData.medicine_id) errs.medicine_id = 'Medicine is required';
    if (!formData.quantity || Number(formData.quantity) <= 0)
      errs.quantity = 'Quantity must be > 0';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitRequisition = async () => {
    if (!validateForm()) return;
    try {
      await api.createCompounderRequisition(
        Number(formData.medicine_id),
        Number(formData.quantity)
      );
      notifications.show({
        message: 'Requisition request sent to authority for approval',
        color: 'green',
      });
      setModalOpened(false);
      resetForm();
      await loadRequisitions();
    } catch {
      notifications.show({ message: 'Failed to send requisition request', color: 'red' });
    }
  };

  const resetForm = () => { setFormData({ medicine_id: '', quantity: '' }); setFormErrors({}); };

  // ─────────────────────────────────────────────────────────────────────────
  // Mark as Fulfilled  (PHC-UC-14)
  // ─────────────────────────────────────────────────────────────────────────

  const openFulfillModal = (req) => {
    setFulfillTarget({
      id: req.id,
      medicine_name: req.medicine_detail?.medicine_name || 'N/A',
      quantity_requested: req.quantity_requested,
      approval_remarks: req.approval_remarks || '',
    });
    setQuantityFulfilled(String(req.quantity_requested));
    setFulfillError('');
    setFulfillModalOpened(true);
  };

  const handleFulfill = async () => {
    const qty = Number(quantityFulfilled);
    if (!qty || qty < 1) { setFulfillError('Quantity fulfilled must be at least 1'); return; }
    setFulfillLoading(true);
    try {
      await api.fulfillCompounderRequisition(fulfillTarget.id, qty);
      notifications.show({
        message: `Requisition #${fulfillTarget.id} marked as fulfilled`,
        color: 'teal',
      });
      setFulfillModalOpened(false);
      setFulfillTarget(null);
      await loadRequisitions();
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Failed to fulfill requisition';
      notifications.show({ message: msg, color: 'red' });
    } finally {
      setFulfillLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const pendingApproval = requisitions.filter((r) => r.status === 'SUBMITTED').length;
  const approved        = requisitions.filter((r) => r.status === 'APPROVED').length;

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="lg" weight={600}>Inventory Requisition</Text>
          <Text size="sm" color="dimmed">
            Submit stock requests to the Approving Authority. Mark them as fulfilled once supplies arrive.
          </Text>
          <Group gap="sm" mt={4}>
            {pendingApproval > 0 && (
              <Badge color="blue" variant="light">{pendingApproval} pending approval</Badge>
            )}
            {approved > 0 && (
              <Badge color="green" variant="light">{approved} approved — awaiting fulfillment</Badge>
            )}
          </Group>
        </Stack>
        <Group gap="sm">
          <Button variant="subtle" leftSection={<IconRefresh size={16} />} onClick={loadData} loading={loading}>
            Refresh
          </Button>
          <Button leftSection={<IconSend size={16} />} onClick={() => { resetForm(); setModalOpened(true); }}>
            New Request
          </Button>
        </Group>
      </Group>

      {/* Requisitions Table */}
      <Card withBorder p="lg">
        {requisitions.length === 0 ? (
          <Text color="dimmed" ta="center" py="xl">No requisitions found.</Text>
        ) : (
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Medicine</Table.Th>
                <Table.Th>Qty Requested</Table.Th>
                <Table.Th>Qty Fulfilled</Table.Th>
                <Table.Th>Submitted On</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {requisitions.map((req) => (
                <Table.Tr key={req.id}>
                  <Table.Td>#{req.id}</Table.Td>
                  <Table.Td fw={500}>{req.medicine_detail?.medicine_name || 'N/A'}</Table.Td>
                  <Table.Td>{req.quantity_requested}</Table.Td>
                  <Table.Td>
                    {req.status === 'FULFILLED'
                      ? <Text c="teal" fw={600}>{req.quantity_fulfilled}</Text>
                      : <Text c="dimmed">—</Text>}
                  </Table.Td>
                  <Table.Td>{new Date(req.created_date).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_COLOR[req.status] || 'gray'}>
                      {STATUS_LABEL[req.status] || req.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6}>
                      {/* Info — always available */}
                      <Tooltip label="View details">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => { setDetailReq(req); setDetailModalOpened(true); }}
                        >
                          <IconInfoCircle size={16} />
                        </ActionIcon>
                      </Tooltip>

                      {/* Mark as Fulfilled — only for APPROVED (PHC-UC-14) */}
                      {req.status === 'APPROVED' && (
                        <Tooltip label="Mark as Fulfilled — confirm supplies received">
                          <ActionIcon
                            color="teal"
                            variant="light"
                            size="sm"
                            onClick={() => openFulfillModal(req)}
                          >
                            <IconCheck size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table></ScrollArea>
        )}
      </Card>

      {/* ─── New Requisition Modal (PHC-UC-10) ──────────────────────────────── */}
      <Modal
        opened={modalOpened}
        onClose={() => { resetForm(); setModalOpened(false); }}
        title="New Requisition Request"
        size="md"
      >
        <Stack gap="md">
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            This request will be forwarded to the Approving Authority for review.
            Once approved, you can mark it as fulfilled when the stock arrives.
          </Alert>

          <Select
            label="Medicine *"
            placeholder="Search and select a medicine"
            searchable
            clearable
            data={medicineOptions}
            value={formData.medicine_id}
            onChange={(v) => setFormData({ ...formData, medicine_id: v || '' })}
            error={formErrors.medicine_id}
          />

          <NumberInput
            label="Quantity Requested *"
            placeholder="Amount needed"
            value={formData.quantity === '' ? undefined : Number(formData.quantity)}
            onChange={(v) => setFormData({ ...formData, quantity: v === undefined ? '' : String(v) })}
            error={formErrors.quantity}
            min={1}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => { resetForm(); setModalOpened(false); }}>
              Cancel
            </Button>
            <Button leftSection={<IconSend size={16} />} onClick={handleSubmitRequisition}>
              Submit Request
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ─── Mark as Fulfilled Modal (PHC-UC-14) ────────────────────────────── */}
      <Modal
        opened={fulfillModalOpened}
        onClose={() => { setFulfillModalOpened(false); setFulfillTarget(null); }}
        title="Mark Requisition as Fulfilled"
        size="md"
      >
        {fulfillTarget && (
          <Stack gap="md">
            <Alert icon={<IconCheck size={16} />} color="teal" variant="light">
              Confirm that the ordered supplies have been physically received.
            </Alert>

            <Card withBorder p="sm" bg="gray.0">
              <Group justify="space-between">
                <Text size="sm" fw={600}>Requisition #{fulfillTarget.id}</Text>
                <Badge color="green">Approved</Badge>
              </Group>
              <Text size="sm" mt={4}><b>Medicine:</b> {fulfillTarget.medicine_name}</Text>
              <Text size="sm"><b>Quantity Requested:</b> {fulfillTarget.quantity_requested}</Text>
              {fulfillTarget.approval_remarks && (
                <Text size="sm" c="dimmed" mt={4}>
                  <b>Authority Remarks:</b> {fulfillTarget.approval_remarks}
                </Text>
              )}
            </Card>

            <NumberInput
              label="Quantity Actually Received *"
              description="Enter actual quantity received. May differ from what was requested."
              placeholder="e.g. 50"
              value={quantityFulfilled === '' ? undefined : Number(quantityFulfilled)}
              onChange={(v) => {
                setQuantityFulfilled(v === undefined ? '' : String(v));
                setFulfillError('');
              }}
              error={fulfillError}
              min={1}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => { setFulfillModalOpened(false); setFulfillTarget(null); }}>
                Cancel
              </Button>
              <Button
                color="teal"
                leftSection={<IconCheck size={16} />}
                onClick={handleFulfill}
                loading={fulfillLoading}
              >
                Confirm Fulfillment
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* ─── Details Modal ───────────────────────────────────────────────────── */}
      <Modal
        opened={detailModalOpened}
        onClose={() => { setDetailModalOpened(false); setDetailReq(null); }}
        title={`Requisition #${detailReq?.id} — Details`}
        size="md"
      >
        {detailReq && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Medicine</Text>
              <Text size="sm" fw={600}>{detailReq.medicine_detail?.medicine_name || 'N/A'}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Quantity Requested</Text>
              <Text size="sm">{detailReq.quantity_requested}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Status</Text>
              <Badge color={STATUS_COLOR[detailReq.status] || 'gray'}>
                {STATUS_LABEL[detailReq.status] || detailReq.status}
              </Badge>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Submitted On</Text>
              <Text size="sm">{new Date(detailReq.created_date).toLocaleDateString()}</Text>
            </Group>
            <Divider />

            {/* Approval details */}
            {detailReq.approved_date && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Approved On</Text>
                <Text size="sm">{new Date(detailReq.approved_date).toLocaleDateString()}</Text>
              </Group>
            )}
            {detailReq.approval_remarks && (
              <Stack gap={2}>
                <Text size="sm" c="dimmed">Authority Remarks</Text>
                <Text size="sm">{detailReq.approval_remarks}</Text>
              </Stack>
            )}

            {/* Rejection details */}
            {detailReq.status === 'REJECTED' && detailReq.rejection_reason && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mt="xs">
                <Text size="sm" fw={600}>Rejected</Text>
                <Text size="sm">{detailReq.rejection_reason}</Text>
              </Alert>
            )}

            {/* Fulfillment details */}
            {detailReq.status === 'FULFILLED' && (
              <>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Quantity Received</Text>
                  <Text size="sm" c="teal" fw={600}>{detailReq.quantity_fulfilled}</Text>
                </Group>
                {detailReq.fulfilled_date && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Fulfilled On</Text>
                    <Text size="sm">{new Date(detailReq.fulfilled_date).toLocaleDateString()}</Text>
                  </Group>
                )}
              </>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

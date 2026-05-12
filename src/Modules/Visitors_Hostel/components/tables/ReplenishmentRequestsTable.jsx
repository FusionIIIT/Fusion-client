/**
 * ReplenishmentRequestsTable
 * UC-VH-011: Replenishment approval workflow for VhIncharge (BR-VH-016)
 * VHMS TRACEABILITY:
 * - UC-VH-011: Inventory replenishment operations
 * - BR-VH-016: Incharge-only approve/reject authority
 * Shows pending replenishment requests that need VhIncharge approval
 */

import React, { useState, useEffect } from "react";
import {
  Table,
  Group,
  Badge,
  Box,
  ActionIcon,
  Tooltip,
  TextInput,
  Alert,
  LoadingOverlay,
  Pagination,
  Button,
  Modal,
  Stack,
  NumberInput,
  Textarea,
  Text,
} from "@mantine/core";
import { IconCheck, IconX, IconSearch, IconRefresh, IconShoppingCart, IconClock } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { inventoryAPI } from "../../services/visitorHostelApi";
import { useActionConfirmation } from "../common/ActionConfirmationProvider";

const URGENCY_COLORS = {
  low: "blue",
  medium: "yellow", 
  high: "orange",
  critical: "red",
};

const STATUS_COLORS = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
  ordered: "blue",
  received: "gray",
};

function ReplenishmentRequestsTable() {
  const { confirmAction } = useActionConfirmation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalData, setApprovalData] = useState({ quantity: 0, remarks: "" });

  const role = useSelector((state) => state.user?.role);
  const isIncharge = role === "VhIncharge";

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryAPI.getReplenishmentRequests();
      if (response.success) {
        setRequests(response.requests || []);
      } else {
        setError(response.message || "Failed to fetch replenishment requests");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setApprovalData({ 
      quantity: request.requested_quantity, 
      remarks: `Approved replenishment for ${request.item_name}` 
    });
    setShowApprovalModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setApprovalData({ quantity: 0, remarks: "" });
    setShowRejectionModal(true);
  };

  const submitApproval = async () => {
    if (!selectedRequest) return;

    if (!(await confirmAction("Are you sure you want to approve this replenishment request?", {
      title: "Confirm Approval",
      confirmLabel: "Approve",
      confirmColor: "green",
    }))) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryAPI.approveReplenishmentRequest(
        selectedRequest.id,
        approvalData.quantity,
        approvalData.remarks
      );

      if (!response?.success) {
        throw new Error(response?.detail || response?.message || "Failed to approve request");
      }

      setShowApprovalModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      const backendMessage =
        err?.detail ||
        err?.payload?.detail ||
        err?.message ||
        "Failed to approve request";
      setError("Failed to approve request: " + backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const submitRejection = async () => {
    if (!selectedRequest) return;

    if (!(await confirmAction("Are you sure you want to reject this replenishment request?", {
      title: "Confirm Rejection",
      confirmLabel: "Reject",
      confirmColor: "red",
    }))) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryAPI.rejectReplenishmentRequest(
        selectedRequest.id,
        approvalData.remarks
      );

      if (!response?.success) {
        throw new Error(response?.detail || response?.message || "Failed to reject request");
      }

      setShowRejectionModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      const backendMessage =
        err?.detail ||
        err?.payload?.detail ||
        err?.message ||
        "Failed to reject request";
      setError("Failed to reject request: " + backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const query = searchQuery.toLowerCase();
    return (
      request.item_name?.toLowerCase().includes(query) ||
      request.requested_by?.toLowerCase().includes(query) ||
      request.urgency?.toLowerCase().includes(query)
    );
  });

  if (!isIncharge) {
    return (
      <Box p="md">
        <Alert color="orange">
          Access denied. Only VhIncharge can view and approve replenishment requests.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Group mb="md" justify="space-between">
        <TextInput
          placeholder="Search by item name, requester, or urgency..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: "400px" }}
        />
        <ActionIcon onClick={fetchRequests} loading={loading} variant="default">
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {/* BR-VH-016 Authority Notice */}
      <Alert color="blue" mb="md" icon={<IconShoppingCart size={16} />}>
        <Text size="sm">
          <strong>BR-VH-016:</strong> As VhIncharge, you have exclusive authority to approve or reject inventory replenishment requests.
        </Text>
      </Alert>

      <Box style={{ position: "relative" }}>
        <LoadingOverlay visible={loading} />
        
        {filteredRequests.length === 0 ? (
          <Alert color="blue">
            {loading ? "Loading requests..." : "No replenishment requests found"}
          </Alert>
        ) : (
          <>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Current Stock</th>
                  <th>Requested Qty</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Requested By</th>
                  <th>Days Pending</th>
                  <th>Justification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <Text fw={500}>{request.item_name}</Text>
                    </td>
                    <td>
                      <Badge 
                        color={request.current_quantity < 5 ? "red" : "blue"} 
                        size="sm"
                      >
                        {request.current_quantity} {request.unit}
                      </Badge>
                    </td>
                    <td>
                      <Text fw={500}>{request.requested_quantity} {request.unit}</Text>
                    </td>
                    <td>
                      <Badge 
                        color={URGENCY_COLORS[request.urgency] || "gray"} 
                        size="sm"
                        variant={request.urgency === 'critical' ? 'filled' : 'light'}
                      >
                        {request.urgency?.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge color={STATUS_COLORS[request.status] || "gray"} size="sm">
                        {request.status?.toUpperCase()}
                      </Badge>
                    </td>
                    <td>{request.requested_by}</td>
                    <td>
                      <Group spacing={4}>
                        <IconClock size={14} />
                        <Text size="sm">{request.days_pending} days</Text>
                      </Group>
                    </td>
                    <td style={{ maxWidth: "200px" }}>
                      <Text size="xs" lineClamp={2}>
                        {request.justification}
                      </Text>
                    </td>
                    <td>
                      {request.status === 'pending' && (
                        <Group spacing="xs">
                          <Tooltip label="Approve Request">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="green"
                              onClick={() => handleApprove(request)}
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Reject Request">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="red"
                              onClick={() => handleReject(request)}
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      )}
                      {request.status !== 'pending' && (
                        <Text size="xs" color="dimmed">
                          {request.status === 'approved' && `Approved: ${request.approved_quantity} ${request.unit}`}
                          {request.status === 'rejected' && 'Rejected'}
                        </Text>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Group justify="center" mt="md">
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                boundaries={1}
                siblings={1}
              />
            </Group>
          </>
        )}
      </Box>

      {/* Approval Modal */}
      <Modal
        opened={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title={`Approve Replenishment - ${selectedRequest?.item_name}`}
        size="md"
      >
        {selectedRequest && (
          <Stack spacing="md">
            <Alert color="green">
              <Text size="sm">
                <strong>Current Stock:</strong> {selectedRequest.current_quantity} {selectedRequest.unit}<br/>
                <strong>Requested:</strong> {selectedRequest.requested_quantity} {selectedRequest.unit}<br/>
                <strong>Urgency:</strong> {selectedRequest.urgency?.toUpperCase()}
              </Text>
            </Alert>

            <NumberInput
              label="Approved Quantity*"
              placeholder="Enter approved quantity"
              value={approvalData.quantity}
              onChange={(val) => setApprovalData(prev => ({ ...prev, quantity: val }))}
              min={0}
              required
            />

            <Textarea
              label="Approval Remarks"
              placeholder="Enter any remarks or conditions"
              value={approvalData.remarks}
              onChange={(e) => setApprovalData(prev => ({ ...prev, remarks: e.target.value }))}
              minRows={3}
            />

            <Group position="right">
              <Button variant="default" onClick={() => setShowApprovalModal(false)}>
                Cancel
              </Button>
              <Button 
                color="green" 
                onClick={submitApproval}
                leftSection={<IconCheck size={16} />}
                disabled={!approvalData.quantity}
              >
                Approve Request
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        opened={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        title={`Reject Replenishment - ${selectedRequest?.item_name}`}
        size="md"
      >
        {selectedRequest && (
          <Stack spacing="md">
            <Alert color="red">
              <Text size="sm">
                You are about to reject the replenishment request for <strong>{selectedRequest.item_name}</strong>.
                Please provide a clear reason for rejection.
              </Text>
            </Alert>

            <Textarea
              label="Rejection Reason*"
              placeholder="Explain why this request is being rejected"
              value={approvalData.remarks}
              onChange={(e) => setApprovalData(prev => ({ ...prev, remarks: e.target.value }))}
              minRows={3}
              required
            />

            <Group position="right">
              <Button variant="default" onClick={() => setShowRejectionModal(false)}>
                Cancel
              </Button>
              <Button 
                color="red" 
                onClick={submitRejection}
                leftSection={<IconX size={16} />}
                disabled={!approvalData.remarks}
              >
                Reject Request
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}

export default ReplenishmentRequestsTable;
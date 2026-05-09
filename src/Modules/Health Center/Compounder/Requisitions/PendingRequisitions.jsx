import React, { useState, useEffect } from "react";
import { Paper, Title, Table, Button, Badge, Loader, Center, Modal, TextInput, Group, Text } from "@mantine/core";
import { fetchPendingRequisitions, actionRequisitionApi } from "../../services/api";
import NavCom from "../NavCom";
import RequisitionsNav from "./RequisitionsNav";
import CustomBreadcrumbs from "../../components/common/Breadcrumbs";

function PendingRequisitions() {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionRemarks, setActionRemarks] = useState("");
  const [actionModalOpen, setActionModalOpen] = useState(false);

  const fetchRequisitions = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingRequisitions();
      setRequisitions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        alert("You do not have Approving Authority access.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const openActionModal = (req) => {
    setSelectedReq(req);
    setActionRemarks("");
    setActionModalOpen(true);
  };

  const handleAction = async (status) => {
    try {
      await actionRequisitionApi(selectedReq.id, { status, remarks: actionRemarks });
      alert(`Requisition ${status} successfully`);
      setActionModalOpen(false);
      fetchRequisitions();
    } catch (err) {
      alert(err.response?.data?.error || `Error marking requisition as ${status}`);
    }
  };

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <RequisitionsNav />
      <br />
      <Paper shadow="sm" p="xl" withBorder>
        <Title order={3} style={{ color: "#15abff", marginBottom: 20 }}>Pending Approvals</Title>
        {loading ? (
          <Center p="xl"><Loader /></Center>
        ) : (
          <Table withTableBorder withColumnBorders striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Originator</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Items</Table.Th>
                <Table.Th>User Remarks</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {requisitions.map((req) => (
                <Table.Tr key={req.id}>
                  <Table.Td>#{req.id}</Table.Td>
                  <Table.Td>{req.originator_name}</Table.Td>
                  <Table.Td>{new Date(req.created_at).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    {req.items?.map(item => (
                      <div key={item.id}>{item.quantity} x {item.medicine_name}</div>
                    ))}
                  </Table.Td>
                  <Table.Td>{req.remarks || "N/A"}</Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="outline" onClick={() => openActionModal(req)}>
                      Review
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
              {requisitions.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={6} align="center">No pending requisitions.</Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal opened={actionModalOpen} onClose={() => setActionModalOpen(false)} title="Review Requisition">
        {selectedReq && (
          <div>
            <Text mb="md"><strong>Requisition #{selectedReq.id}</strong> by {selectedReq.originator_name}</Text>
            <TextInput
              label="Action Remarks"
              placeholder="Reason for approval/rejection"
              value={actionRemarks}
              onChange={(e) => setActionRemarks(e.target.value)}
              mb="md"
            />
            <Group justify="flex-end">
              <Button color="red" onClick={() => handleAction("Rejected")}>Reject</Button>
              <Button color="green" onClick={() => handleAction("Approved")}>Approve</Button>
            </Group>
          </div>
        )}
      </Modal>
    </>
  );
}

export default PendingRequisitions;

import React, { useState, useEffect } from "react";
import { Paper, Title, Table, Button, Badge, Group, Loader, Center } from "@mantine/core";
import { fetchStaffRequisitions, fulfillRequisitionApi } from "../../services/api";
import NavCom from "../NavCom";
import RequisitionsNav from "./RequisitionsNav";
import CustomBreadcrumbs from "../../components/common/Breadcrumbs";

function RequisitionList() {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequisitions = async () => {
    setLoading(true);
    try {
      const res = await fetchStaffRequisitions();
      setRequisitions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const handleFulfill = async (id) => {
    try {
      await fulfillRequisitionApi(id);
      alert("Requisition fulfilled successfully");
      fetchRequisitions();
    } catch (err) {
      alert(err.response?.data?.error || "Error fulfilling requisition");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Submitted": return "blue";
      case "Approved": return "green";
      case "Rejected": return "red";
      case "Fulfilled": return "gray";
      default: return "gray";
    }
  };

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <RequisitionsNav />
      <br />
      <Paper shadow="sm" p="xl" withBorder>
        <Title order={3} style={{ color: "#15abff", marginBottom: 20 }}>My Inventory Requisitions</Title>
        {loading ? (
          <Center p="xl"><Loader /></Center>
        ) : (
          <Table withTableBorder withColumnBorders striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Items</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Remarks</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {requisitions.map((req) => (
                <Table.Tr key={req.id}>
                  <Table.Td>#{req.id}</Table.Td>
                  <Table.Td>{new Date(req.created_at).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    {req.items?.map(item => (
                      <div key={item.id}>{item.quantity} x {item.medicine_name}</div>
                    ))}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(req.status)}>{req.status}</Badge>
                  </Table.Td>
                  <Table.Td>{req.remarks || "N/A"}</Table.Td>
                  <Table.Td>
                    {req.status === "Approved" && (
                      <Button size="xs" color="teal" onClick={() => handleFulfill(req.id)}>
                        Mark Fulfilled
                      </Button>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
              {requisitions.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={6} align="center">No requisitions found.</Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </>
  );
}

export default RequisitionList;

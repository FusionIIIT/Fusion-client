import React, { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Table,
  Container,
  Paper,
  Title,
  Button,
  Flex,
  TextInput,
  Loader,
} from "@mantine/core";
import axios from "axios";
import { deregistrationRequestRoute } from "../routes";

function ViewDeregistrationRequests() {
  const [deregistrationData, setDeregistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeregistrationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(deregistrationRequestRoute, {
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });
      setDeregistrationData(
        (response.data.payload || []).map((item) => ({
          ...item,
          remark: item.deregistration_remark || "",
        })),
      );
    } catch (err) {
      setError("Error fetching deregistration requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeregistrationRequests();
  }, []);

  const handleUpdate = async (requestItem, newStatus) => {
    try {
      setError(null);
      const data = {
        id: requestItem.id,
        status: newStatus,
        deregistration_remark: requestItem.remark,
      };
      if (newStatus === "escalated") {
        data.escalation_remark = requestItem.remark;
      }

      const response = await axios.put(deregistrationRequestRoute, data, {
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.status === 200) {
        setDeregistrationData((prevData) =>
          prevData.filter((request) => request.id !== requestItem.id),
        );
      } else {
        setError("Failed to update request.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error updating deregistration request.",
      );
    }
  };

  const handleRemarkChange = (requestId, newRemark) => {
    setDeregistrationData((prevData) =>
      prevData.map((request) =>
        request.id === requestId ? { ...request, remark: newRemark } : request,
      ),
    );
  };

  const pendingRequests = deregistrationData.filter(
    (item) => item.status === "pending",
  );

  const renderRows = () =>
    pendingRequests.map((item) => (
      <Table.Tr key={item.id}>
        <Table.Td align="center" p={12}>
          {item.student_id}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.end_date}
        </Table.Td>
        <Table.Td align="center" p={12}>
          <Badge color="yellow" variant="light">
            Pending
          </Badge>
        </Table.Td>
        <Table.Td align="center" p={12}>
          <TextInput
            value={item.remark}
            onChange={(e) => handleRemarkChange(item.id, e.target.value)}
            placeholder="Enter remark"
          />
        </Table.Td>
        <Table.Td align="center" p={12}>
          <Button
            onClick={() => handleUpdate(item, "accept")}
            variant="filled"
            color="green"
            size="xs"
            style={{ marginRight: "8px" }}
          >
            Accept
          </Button>
          <Button
            onClick={() => handleUpdate(item, "reject")}
            variant="filled"
            color="red"
            size="xs"
            style={{ marginRight: "8px" }}
          >
            Reject
          </Button>
          <Button
            onClick={() => handleUpdate(item, "escalated")}
            variant="light"
            color="yellow"
            size="xs"
          >
            Escalate
          </Button>
        </Table.Td>
      </Table.Tr>
    ));

  if (loading) {
    return (
      <Flex justify="center" align="center" mih={200}>
        <Loader size="lg" />
      </Flex>
    );
  }

  return (
    <Container size="lg" mt={30} miw="75rem">
      <Paper shadow="md" radius="md" p="lg" withBorder>
        <Flex justify="space-between" align="center" mb="lg">
          <Title order={2} align="center" style={{ color: "#1c7ed6" }}>
            Deregistration Requests
          </Title>
          <Button variant="light" onClick={fetchDeregistrationRequests}>
            Refresh
          </Button>
        </Flex>

        {error ? (
          <Alert color="red" title="Error" mb="md">
            {error}
          </Alert>
        ) : null}

        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  Student ID
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  End Date
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  Status
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  Remark
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  Action
                </Flex>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {pendingRequests.length > 0 ? (
              renderRows()
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5} align="center" p={20}>
                  No pending deregistration requests.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

export default ViewDeregistrationRequests;

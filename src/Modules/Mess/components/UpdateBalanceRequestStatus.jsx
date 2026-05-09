import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Title,
  Space,
  Box,
  Table,
  Flex,
  Loader,
  Alert,
  Text,
} from "@mantine/core";
import axios from "axios";
import { updateBalanceRequestRoute, host } from "../routes";

const statusMeta = {
  accept: {
    label: "Accepted",
    backgroundColor: "#40C057",
    borderColor: "#40C057",
    color: "white",
  },
  pending: {
    label: "Pending",
    backgroundColor: "#fff3bf",
    borderColor: "#fab005",
    color: "#8f5b00",
  },
  escalated: {
    label: "Escalated",
    backgroundColor: "#d0ebff",
    borderColor: "#228be6",
    color: "#1864ab",
  },
  reject: {
    label: "Rejected",
    backgroundColor: "#ffe3e3",
    borderColor: "#fa5252",
    color: "#c92a2a",
  },
};

function UpdateBalanceRequestStatus() {
  const [balanceRequests, setBalanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(updateBalanceRequestRoute, {
          headers: { Authorization: `Token ${token}` },
        });
        setBalanceRequests(response.data.payload || []);
      } catch (err) {
        setError(
          err.response?.data?.error || "Unable to fetch payment update status.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <Flex justify="center" p="xl">
        <Loader />
      </Flex>
    );
  }

  if (error) {
    return <Alert color="red">{error}</Alert>;
  }

  return (
    <Container
      size="xl"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "25px",
      }}
    >
      <Paper shadow="md" radius="md" p="xl" withBorder miw="75rem">
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Update Balance Request Status
        </Title>

        <Table striped highlightOnHover withBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Flex align="center" justify="center">
                  Transaction Number
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center">
                  Image
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center">
                  Amount
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center">
                  Remark
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center">
                  Status
                </Flex>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {balanceRequests.length > 0 ? (
              balanceRequests.map((item) => {
                const currentStatus =
                  statusMeta[item.status] || statusMeta.reject;

                return (
                  <Table.Tr key={item.id}>
                    <Table.Td align="center" p={12}>
                      {item.Txn_no}
                    </Table.Td>
                    <Table.Td align="center" p={12}>
                      {item.img ? (
                        <a
                          href={
                            item.img?.startsWith("http")
                              ? item.img
                              : `${host}${item.img?.startsWith("/") ? "" : "/"}${item.img}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Proof
                        </a>
                      ) : (
                        <Text c="dimmed" size="sm">
                          No file
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td align="center" p={12}>
                      {item.amount}
                    </Table.Td>
                    <Table.Td align="center" p={12}>
                      {item.update_remark || "-"}
                    </Table.Td>
                    <Table.Td align="center" p={12}>
                      <Box
                        display="inline-block"
                        p={8}
                        fz={14}
                        fw={600}
                        bg={currentStatus.backgroundColor}
                        bd={`1.5px solid ${currentStatus.borderColor}`}
                        c={currentStatus.color}
                        style={{ borderRadius: "4px" }}
                      >
                        {currentStatus.label}
                      </Box>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5} align="center">
                  No update requests found.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
      <Space h="xl" />
    </Container>
  );
}

export default UpdateBalanceRequestStatus;

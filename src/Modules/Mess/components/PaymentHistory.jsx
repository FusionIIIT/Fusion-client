import React, { useEffect, useState } from "react";
import {
  Table,
  Text,
  Container,
  Paper,
  Flex,
  Badge,
  Group,
  Loader,
  Alert,
} from "@mantine/core";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { paymentRoute } from "../routes";

function PaymentHistory() {
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    fetch(paymentRoute, {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load payment history.");
        }
        return data;
      })
      .then((data) => {
        const mappedData = (data.payload || []).map((payment) => ({
          id: payment.id,
          paymentDate: payment.payment_date,
          amount: payment.amount_paid,
          month: payment.payment_month || "",
          year: payment.payment_year || payment.year,
          status: payment.status || "accept",
        }));
        setPaymentData(mappedData);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authToken]);

  if (loading) {
    return (
      <Flex justify="center" p="xl">
        <Loader />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert color="red" icon={<WarningCircle size={18} />}>
        {error}
      </Alert>
    );
  }

  const totalPayments = paymentData.reduce(
    (total, item) => total + (item.amount || 0),
    0,
  );

  return (
    <Container fluid px={0} mt="lg">
      <Paper
        shadow="xs"
        radius="lg"
        withBorder
        p="0"
        style={{ overflow: "hidden" }}
      >
        <div style={{ overflowX: "auto" }}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr
                style={{
                  backgroundColor: "#f8f9fa",
                  borderBottom: "2px solid #e9ecef",
                }}
              >
                <Table.Th
                  style={{
                    padding: "16px",
                    color: "#495057",
                    fontSize: "14px",
                  }}
                >
                  Payment Date
                </Table.Th>
                <Table.Th
                  style={{
                    padding: "16px",
                    color: "#495057",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  Amount
                </Table.Th>
                <Table.Th
                  style={{
                    padding: "16px",
                    color: "#495057",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  Billing Cycle
                </Table.Th>
                <Table.Th
                  style={{
                    padding: "16px",
                    color: "#495057",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  Status
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paymentData.map((row) => (
                <Table.Tr
                  key={row.id}
                  style={{ borderBottom: "1px solid #f1f3f5" }}
                >
                  <Table.Td p={16}>
                    <Text fw={600} size="sm">
                      {row.paymentDate
                        ? new Date(row.paymentDate).toLocaleDateString(
                            "en-US",
                            { day: "numeric", month: "long", year: "numeric" },
                          )
                        : "Not recorded"}
                    </Text>
                  </Table.Td>
                  <Table.Td align="center" p={16}>
                    <Text fw={700} c="green.8">
                      Rs. {Number(row.amount || 0).toLocaleString()}
                    </Text>
                  </Table.Td>
                  <Table.Td align="center" p={16}>
                    <Badge color="blue" variant="light" size="lg">
                      {[row.month, row.year].filter(Boolean).join(" - ") ||
                        "General"}
                    </Badge>
                  </Table.Td>
                  <Table.Td align="center" p={16}>
                    <Group gap="xs" justify="center">
                      <CheckCircle
                        size={18}
                        color={row.status === "accept" ? "teal" : "orange"}
                        weight="fill"
                      />
                      <Text
                        c={row.status === "accept" ? "teal" : "orange"}
                        fw={600}
                        size="sm"
                      >
                        {row.status === "accept" ? "Accepted" : "Pending"}
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {paymentData.length === 0 && (
            <Flex justify="center" p="xl">
              <Text c="dimmed">No payment history found.</Text>
            </Flex>
          )}
        </div>

        <Flex
          justify="space-between"
          align="center"
          p="md"
          style={{ backgroundColor: "#1A2980", color: "white" }}
        >
          <Text size="sm" fw={500} opacity={0.9}>
            Overall Processed
          </Text>
          <Text size="xl" fw={800}>
            Rs. {totalPayments.toLocaleString()}
          </Text>
        </Flex>
      </Paper>
    </Container>
  );
}

export default PaymentHistory;

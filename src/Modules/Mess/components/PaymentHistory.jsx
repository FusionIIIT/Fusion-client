import React from "react";
import { Table, Text, Container, Paper, Title, Flex } from "@mantine/core";

function PaymentHistory() {
  const paymentHistoryData = [
    {
      paymentDate: "2024-01-15",
      amount: 1800,
      month: "January",
      year: 2024,
    },
    {
      paymentDate: "2024-02-10",
      amount: 2100,
      month: "February",
      year: 2024,
    },
    {
      paymentDate: "2024-03-05",
      amount: 1600,
      month: "March",
      year: 2024,
    },
  ];

  const renderHeader = () => (
    <Table.Tr>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Payment Date
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Amount (₹)
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Month
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Year
        </Flex>
      </Table.Th>
    </Table.Tr>
  );

  const renderRows = () =>
    paymentHistoryData.map((row, index) => (
      <Table.Tr key={index}>
        <Table.Td align="center" p={12}>
          {row.paymentDate}
        </Table.Td>
        <Table.Td align="center" p={12}>
          ₹{row.amount}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.month}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.year}
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Container
      size="lg"
      style={{ maxWidth: "800px", width: "870px", marginTop: "25px" }}
    >
      <Paper shadow="md" radius="md" p="lg" withBorder>
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Payment History
        </Title>

        {/* Table */}
        <Table striped highlightOnHover withBorder withColumnBorders>
          <Table.Thead>{renderHeader()}</Table.Thead>
          <Table.Tbody>{renderRows()}</Table.Tbody>
        </Table>

        <Flex direction="column" mt="lg">
          <Text size="lg" weight={700} align="center" mt="md">
            Total Payments: ₹5500
          </Text>
        </Flex>
      </Paper>
    </Container>
  );
}

export default PaymentHistory;

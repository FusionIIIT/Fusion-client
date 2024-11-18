import React from "react";
import {
  Table,
  Text,
  Button,
  Group,
  Container,
  Paper,
  Title,
  Flex,
} from "@mantine/core";
import { DownloadSimple } from "@phosphor-icons/react";

function MessBilling() {
  const billData = [
    {
      month: "2024-01",
      baseAmount: 15000,
      rebateCount: 1,
      rebateAmount: 1000,
      monthlyBill: 14000,
    },
    {
      month: "2024-02",
      baseAmount: 15000,
      rebateCount: 2,
      rebateAmount: 2000,
      monthlyBill: 13000,
    },
    {
      month: "2024-03",
      baseAmount: 15000,
      rebateCount: 3,
      rebateAmount: 3000,
      monthlyBill: 12000,
    },
  ];

  const renderHeader = () => (
    <Table.Tr>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Month
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Monthly Base Amount (₹)
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Rebate Count
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Rebate Amount (₹)
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Your Monthly Bill (₹)
        </Flex>
      </Table.Th>
    </Table.Tr>
  );

  const renderRows = () =>
    billData.map((row, index) => (
      <Table.Tr key={index}>
        <Table.Td align="center" p={12}>
          {row.month}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.baseAmount}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.rebateCount}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.rebateAmount}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {row.monthlyBill}
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Container size="lg" style={{ marginTop: "25px" }}>
      <Paper shadow="md" radius="md" p="lg" withBorder>
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          View Bill
        </Title>

        {/* Table */}
        <Table striped highlightOnHover withBorder withColumnBorders>
          <Table.Thead>{renderHeader()}</Table.Thead>
          <Table.Tbody>{renderRows()}</Table.Tbody>
        </Table>

        <Flex direction="column" mt="lg">
          <Text size="lg" weight={700} mb="xs">
            Total Remaining Balance: ₹0
          </Text>
          <Text size="lg" weight={600}>
            Current Mess Status: Deregistered
          </Text>
        </Flex>

        <Group position="right" mt="md">
          <Button
            variant="filled"
            color="blue"
            leftIcon={<DownloadSimple size={16} />}
          >
            Download
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}

export default MessBilling;

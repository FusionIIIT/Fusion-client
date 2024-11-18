import React from "react";
import { Table, Container, Paper, Title, Flex, Box } from "@mantine/core";

// Sample data for the rebate requests
const rebateData = [
  {
    date: "01-11-2024",
    type: "Food",
    from: "01-11-2024",
    to: "05-11-2024",
    remark: "Family Event",
    status: "approved",
  },
  {
    date: "05-11-2024",
    type: "Stay",
    from: "10-11-2024",
    to: "15-11-2024",
    remark: "Outstation",
    status: "pending",
  },
  {
    date: "10-11-2024",
    type: "Food",
    from: "12-11-2024",
    to: "16-11-2024",
    remark: "Medical Leave",
    status: "declined",
  },
];

function RebateStatus() {
  // Render header for the table
  const renderHeader = () => (
    <Table.Tr>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Date
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Type
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          From
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          To
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Remark
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Status
        </Flex>
      </Table.Th>
    </Table.Tr>
  );

  // Render rows for the table based on the rebate data
  const renderRows = () =>
    rebateData.map((item, index) => (
      <Table.Tr key={index} style={{ height: "60px" }}>
        <Table.Td align="center" p={12}>
          {item.date}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.type}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.from}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.to}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.remark}
        </Table.Td>
        <Table.Td align="center" p={12}>
          <Box
            display="inline-block"
            p={8}
            fz={14}
            fw={600}
            bg={
              item.status === "approved"
                ? "#40C057"
                : item.status === "declined"
                  ? "transparent"
                  : "transparent"
            }
            bd={
              item.status === "approved"
                ? "1.5px solid #40C057"
                : item.status === "pending"
                  ? "1.5px solid grey"
                  : "1.5px solid red"
            }
            c={
              item.status === "approved"
                ? "white"
                : item.status === "pending"
                  ? "grey"
                  : "red"
            }
            style={{ borderRadius: "4px" }}
          >
            {item.status === "approved"
              ? "Approved"
              : item.status === "pending"
                ? "Pending"
                : "Declined"}
          </Box>
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Container
      size="lg"
      style={{ maxWidth: "800px", width: "570px", marginTop: "25px" }}
    >
      <Paper shadow="md" radius="md" p="lg" withBorder>
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Rebate Status
        </Title>

        {/* Table */}
        <Table striped highlightOnHover withBorder withColumnBorders>
          <Table.Thead>{renderHeader()}</Table.Thead>
          <Table.Tbody>{renderRows()}</Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

export default RebateStatus;

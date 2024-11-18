import React from "react";
import { Table, Container, Paper, Title, Flex, Box } from "@mantine/core";

// Sample data for the rebate requests
const SpecialfoodData = [
  {
    ApplicationDate: "01-11-2024",
    Purpose: "Dussehra",
    from: "01-11-2024",
    to: "05-11-2024",
    status: "approved",
  },
  {
    ApplicationDate: "01-11-2024",
    Purpose: "Diwali",
    from: "01-11-2024",
    to: "05-11-2024",
    status: "pending",
  },
  {
    ApplicationDate: "01-11-2024",
    Purpose: "Holi",
    from: "01-11-2024",
    to: "05-11-2024",
    status: "declined",
  },
];

function SpecialFoodStatus() {
  // Render header for the table
  const renderHeader = () => (
    <Table.Tr>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Application Date
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Purpose
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
          Status
        </Flex>
      </Table.Th>
    </Table.Tr>
  );

  // Render rows for the table based on the special food status data
  const renderRows = () =>
    SpecialfoodData.map((item, index) => (
      <Table.Tr key={index} style={{ height: "60px" }}>
        <Table.Td align="center" p={12}>
          {item.ApplicationDate}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.Purpose}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.from}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.to}
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
          Special Food Status
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

export default SpecialFoodStatus;

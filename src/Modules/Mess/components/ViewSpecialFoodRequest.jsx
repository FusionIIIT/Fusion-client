import React, { useState } from "react";
import { Table, Container, Paper, Title, Button, Flex } from "@mantine/core";
import * as PhosphorIcons from "@phosphor-icons/react"; // Default import for icons

const initialFoodRequestData = [
  {
    rdate: "2024-10-05",
    student_id: "22bcs123",
    food: "Gluten-free",
    reason: "Medical condition",
    from: "2024-10-05",
    to: "2024-10-07",
    approve: false,
  },
  {
    rdate: "2024-10-07",
    student_id: "21bec083",
    food: "Vegan",
    reason: "Personal preference",
    from: "2024-10-08",
    to: "2024-10-10",
    approve: true,
  },
  {
    rdate: "2024-10-09",
    student_id: "22bcs198",
    food: "Navratri Food",
    reason: "Fasting",
    from: "2024-10-10",
    to: "2024-10-12",
    approve: false,
  },
];

const tableHeader = [
  "Date",
  "Student ID",
  "Food",
  "Reason",
  "From",
  "To",
  "Approval",
];

// Main component
function ViewSpecialFoodRequest() {
  const [foodRequestData, setFoodRequestData] = useState(
    initialFoodRequestData,
  );
  const [activeTab, setActiveTab] = useState("all");

  // Function to toggle approval status
  const toggleApproval = (index) => {
    setFoodRequestData((prevData) =>
      prevData.map((request, i) =>
        i === index ? { ...request, approve: !request.approve } : request,
      ),
    );
  };

  // Filter requests based on active tab
  const filteredFoodRequestData = foodRequestData.filter((request) => {
    if (activeTab === "approved") return request.approve;
    if (activeTab === "unapproved") return !request.approve;
    return true;
  });

  // Render food request table rows
  const renderRows = () =>
    filteredFoodRequestData.map((item, index) => (
      <Table.Tr key={index} h={50}>
        <Table.Td align="center" p={12}>
          {item.rdate}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.student_id}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.food}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.reason}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.from}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.to}
        </Table.Td>
        <Table.Td align="center" p={12}>
          <Button
            onClick={() => toggleApproval(index)}
            variant={item.approve ? "filled" : "outline"}
            color={item.approve ? "green" : "red"}
            size="xs"
          >
            {item.approve ? "Approved" : "Not Approved"}
          </Button>
        </Table.Td>
      </Table.Tr>
    ));

  const renderHeader = (titles) => {
    return titles.map((title, index) => (
      <Table.Th key={index}>
        <Flex align="center" justify="center" h="100%">
          {title}
        </Flex>
      </Table.Th>
    ));
  };

  return (
    <Container size="lg" mt={30} miw="80rem">
      <Paper shadow="md" radius="md" p="lg" withBorder>
        <Title order={2} align="center" mb="lg" c="#1c7ed6">
          View Special Food Requests
        </Title>

        {/* Tabs for filtering food requests */}
        <Flex justify="center" align="center" mb={30} gap={20}>
          <Button
            onClick={() => setActiveTab("all")}
            leftSection={<PhosphorIcons.Eye size={20} />}
            variant={activeTab === "all" ? "filled" : "outline"}
            size="xs"
          >
            All Requests
          </Button>
          <Button
            onClick={() => setActiveTab("approved")}
            leftSection={<PhosphorIcons.Check size={20} />}
            variant={activeTab === "approved" ? "filled" : "outline"}
            size="xs"
          >
            Approved
          </Button>
          <Button
            onClick={() => setActiveTab("unapproved")}
            leftSection={<PhosphorIcons.XCircle size={20} />}
            variant={activeTab === "unapproved" ? "filled" : "outline"}
            size="xs"
          >
            Unapproved
          </Button>
        </Flex>

        {/* Table */}
        <Table striped highlightOnHover withBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>{renderHeader(tableHeader)}</Table.Tr>
          </Table.Thead>
          <Table.Tbody>{renderRows()}</Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

export default ViewSpecialFoodRequest;

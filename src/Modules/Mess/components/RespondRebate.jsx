import React, { useState, useEffect } from "react";
import {
  Table,
  Container,
  Paper,
  Title,
  Button,
  TextInput,
  Flex,
} from "@mantine/core";
import * as PhosphorIcons from "@phosphor-icons/react";
import { rebateRoute } from "../routes";

function RespondToRebateRequest() {
  const [rebateData, setRebateData] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const authToken = localStorage.getItem("authToken");

  // Fetch the rebate data from the API
  useEffect(() => {
    fetch(rebateRoute, {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Map the status field to show the actual status
        const formattedData = data.payload.map((item) => ({
          ...item,
          statusText:
            item.status === "2"
              ? "Approved"
              : item.status === "1"
                ? "Pending"
                : "Declined",
          status: item.status || "1", // Default to "Pending" if no status exists
          remark: item.rebate_remark || "", // Pre-fill remark with rebate_remark or default to empty
        }));
        setRebateData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching rebate data:", error);
      });
  }, [authToken]);

  // Toggle approval status with remark validation
  const toggleApproval = async (index, newStatus) => {
    if (!rebateData[index].remark.trim()) {
      alert("Remark is mandatory to approve or disapprove a request.");
      return;
    }

    const {
      student_id,
      start_date,
      end_date,
      purpose,
      app_date,
      leave_type,
      remark,
    } = rebateData[index];

    const updatedRequest = {
      student_id,
      start_date,
      end_date,
      purpose,
      app_date,
      leave_type,
      rebate_remark: remark,
      status: newStatus, // Set the new status (1 for Pending, 0 for Declined, 2 for Approved)
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/mess/api/rebateApi", {
        method: "PUT",
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRequest),
      });

      if (response.ok) {
        setRebateData((prevData) =>
          prevData.map((request, i) =>
            i === index
              ? {
                  ...request,
                  status: newStatus,
                  statusText:
                    newStatus === "2"
                      ? "Approved"
                      : newStatus === "1"
                        ? "Pending"
                        : "Declined",
                }
              : request,
          ),
        );
      } else {
        console.error("Failed to update approval:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating approval:", error);
    }
  };

  // Handle remark input change
  const handleRemarkChange = (index, value) => {
    setRebateData((prevData) =>
      prevData.map((request, i) =>
        i === index ? { ...request, remark: value } : request,
      ),
    );
  };

  // Filter data based on the selected status
  const filteredRebateData = rebateData.filter((request) => {
    if (filterStatus === "approved") return request.status === "2";
    if (filterStatus === "unapproved") return request.status === "0";
    return true; // Show all data
  });

  // Render table headers
  const renderHeader = () => (
    <Table.Tr>
      <Table.Th>Date</Table.Th>
      <Table.Th>Student ID</Table.Th>
      <Table.Th>Purpose</Table.Th>
      <Table.Th>From</Table.Th>
      <Table.Th>To</Table.Th>
      <Table.Th>Remark</Table.Th>
      <Table.Th>Status</Table.Th>
      <Table.Th>Actions</Table.Th>
    </Table.Tr>
  );

  // Render table rows
  const renderRows = () =>
    filteredRebateData.map((item, index) => (
      <Table.Tr key={index}>
        <Table.Td>{item.app_date}</Table.Td>
        <Table.Td>{item.student_id}</Table.Td>
        <Table.Td>{item.purpose || "No Purpose Provided"}</Table.Td>
        <Table.Td>{item.start_date}</Table.Td>
        <Table.Td>{item.end_date}</Table.Td>
        <Table.Td>
          <TextInput
            placeholder="Enter remark"
            value={item.remark}
            onChange={(e) => handleRemarkChange(index, e.target.value)}
          />
        </Table.Td>
        <Table.Td>{item.statusText}</Table.Td>
        <Table.Td>
          {item.status === "1" ? (
            <>
              <Button
                onClick={() => toggleApproval(index, "2")}
                variant="outline"
                color="green"
                size="xs"
                mr={5}
              >
                Approve
              </Button>
              <Button
                onClick={() => toggleApproval(index, "0")}
                variant="outline"
                color="red"
                size="xs"
              >
                Decline
              </Button>
            </>
          ) : item.status === "2" ? (
            <Button
              onClick={() => toggleApproval(index, "0")}
              variant="filled"
              color="red"
              size="xs"
            >
              Revert to Declined
            </Button>
          ) : (
            <Button
              onClick={() => toggleApproval(index, "2")}
              variant="filled"
              color="green"
              size="xs"
            >
              Revert to Approved
            </Button>
          )}
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Container size="lg" mt={30} miw="75rem">
      <Paper shadow="md" radius="md" p="lg" withBorder>
        <Title order={2} align="center" mb="lg" color="#1c7ed6">
          Respond to Rebate Request
        </Title>

        {/* Filter Buttons */}
        <Flex justify="center" align="center" mb={30} gap={20}>
          <Button
            leftSection={<PhosphorIcons.Eye size={20} />}
            variant={filterStatus === "all" ? "filled" : "outline"}
            onClick={() => setFilterStatus("all")}
          >
            All Requests
          </Button>
          <Button
            leftSection={<PhosphorIcons.Check size={20} />}
            variant={filterStatus === "approved" ? "filled" : "outline"}
            onClick={() => setFilterStatus("approved")}
          >
            Approved
          </Button>
          <Button
            leftSection={<PhosphorIcons.XCircle size={20} />}
            variant={filterStatus === "unapproved" ? "filled" : "outline"}
            onClick={() => setFilterStatus("unapproved")}
          >
            Unapproved
          </Button>
        </Flex>

        {/* Rebate Table */}
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>{renderHeader()}</Table.Thead>
          <Table.Tbody>{renderRows()}</Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

export default RespondToRebateRequest;

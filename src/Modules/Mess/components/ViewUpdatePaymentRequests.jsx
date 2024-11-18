import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Container,
  Paper,
  Title,
  Button,
  Flex,
  Loader,
  Alert,
  TextInput,
} from "@mantine/core";

const tableHeaders = [
  "Student ID",
  "Transaction No",
  "Image",
  "Amount",
  "Payment Date",
  "Remark",
  "Accept/Reject",
];

function ViewUpdatePaymentRequests() {
  const [updatePaymentData, setUpdatePaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch update payment requests data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Authentication token not found.");
          return;
        }

        const response = await axios.get(
          "http://127.0.0.1:8000/mess/api/updatePaymentRequestApi", // Replace with your correct API endpoint
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );

        console.log("API Response Data:", response.data); // Debugging log to check data

        if (response.data && response.data.payload) {
          setUpdatePaymentData(response.data.payload); // Store update payment data
        } else {
          setError("No payment request data found.");
        }
      } catch (errors) {
        setError("Error fetching payment request data.");
        console.error("Error fetching payment request data:", errors);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle Accept Action
  const handleAccept = (id) => {
    console.log("Accepting payment request:", id);
    // Implement API call for accepting payment request here
  };

  // Handle Reject Action
  const handleReject = (id) => {
    console.log("Rejecting payment request:", id);
    // Implement API call for rejecting payment request here
  };

  // Handle Change in Remark Field
  const handleRemarkChange = (id, value) => {
    setUpdatePaymentData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, remark: value } : item,
      ),
    );
  };

  return (
    <Container size="lg" mt={30} miw="75rem">
      <Paper shadow="lg" radius="lg" p="xl" withBorder>
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Update Payment Requests
        </Title>

        {/* Error and Loading State */}
        {loading ? (
          <Flex justify="center" align="center" style={{ minHeight: "200px" }}>
            <Loader size="xl" />
          </Flex>
        ) : error ? (
          <Alert color="red" title="Error" mb="lg">
            {error}
          </Alert>
        ) : (
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                {tableHeaders.map((header, index) => (
                  <Table.Th key={index}>{header}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {updatePaymentData.length > 0 ? (
                updatePaymentData.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.student_id}</Table.Td>
                    <Table.Td>{item.Txn_no}</Table.Td>
                    <Table.Td>
                      <a
                        href={item.img}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={item.img}
                          alt="Payment"
                          style={{ width: "50px", cursor: "pointer" }}
                        />
                      </a>
                    </Table.Td>
                    <Table.Td>{item.amount}</Table.Td>
                    <Table.Td>{item.payment_date}</Table.Td>
                    <Table.Td>
                      <TextInput
                        value={item.remark || ""}
                        onChange={(e) =>
                          handleRemarkChange(item.id, e.target.value)
                        }
                        placeholder="Enter remark"
                        size="xs"
                      />
                    </Table.Td>
                    <Table.Td>
                      <Button
                        color="green"
                        size="xs"
                        onClick={() => handleAccept(item.id)}
                        style={{ marginRight: "8px" }}
                      >
                        Accept
                      </Button>
                      <Button
                        color="red"
                        size="xs"
                        onClick={() => handleReject(item.id)}
                      >
                        Reject
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: "center" }}>
                    No payment requests available.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}

export default ViewUpdatePaymentRequests;

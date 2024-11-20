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
} from "@mantine/core";
import { viewRegistrationRequestsRoute } from "../routes";

const tableHeaders = [
  "Student ID",
  "Transaction No",
  "Image",
  "Amount",
  "Start Date",
  "Payment Date",
  "Remark",
  "Status",
  "Accept/Reject",
];

function ViewRegistration() {
  const [registrationData, setRegistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch registration data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Authentication token not found.");
          return;
        }

        const response = await axios.get(
          viewRegistrationRequestsRoute, // Replace with the correct API endpoint
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );

        console.log("API Response Data:", response.data); // Debugging log to check data

        if (response.data && response.data.payload) {
          setRegistrationData(response.data.payload); // Store registration data
        } else {
          setError("No registration data found.");
        }
      } catch (errors) {
        setError("Error fetching registration data.");
        console.error("Error fetching registration data:", errors);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle Accept Action
  const handleAccept = (id) => {
    console.log("Accepting registration:", id);
    // Implement API call for accepting registration here
  };

  // Handle Reject Action
  const handleReject = (id) => {
    console.log("Rejecting registration:", id);
    // Implement API call for rejecting registration here
  };

  return (
    <Container size="lg" mt={30} miw="75rem">
      <Paper shadow="lg" radius="lg" p="xl" withBorder>
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Registration Requests
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
              {registrationData.length > 0 ? (
                registrationData.map((item) => (
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
                          alt="Student"
                          style={{ width: "50px", cursor: "pointer" }}
                        />
                      </a>
                    </Table.Td>
                    <Table.Td>{item.amount}</Table.Td>
                    <Table.Td>{item.start_date}</Table.Td>
                    <Table.Td>{item.payment_date}</Table.Td>
                    <Table.Td>{item.registration_remark}</Table.Td>
                    <Table.Td>{item.status || "N/A"}</Table.Td>
                    <Table.Td>
                      <Button
                        color="green"
                        size="xs"
                        onClick={() => handleAccept(item.id)}
                        style={{ marginRight: "8px" }} // Add right margin to the Accept button
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
                  <Table.Td colSpan={9} style={{ textAlign: "center" }}>
                    No registration data available.
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

export default ViewRegistration;

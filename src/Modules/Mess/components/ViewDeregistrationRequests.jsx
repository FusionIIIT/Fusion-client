import React, { useState, useEffect } from "react";
import { Table, Container, Paper, Title, Button, Flex } from "@mantine/core";
import axios from "axios";

function ViewDeregistrationRequests() {
  const [deregistrationData, setDeregistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeregistrationRequests = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/mess/api/deRegistrationRequestApi",
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        },
      );
      console.log(response.data.payload); // Log to check the structure
      setDeregistrationData(response.data.payload); // Accessing the payload
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeregistrationRequests();
  }, []);

  const handleAccept = (index) => {
    setDeregistrationData((prevData) =>
      prevData.map((request, i) =>
        i === index ? { ...request, accepted: true } : request,
      ),
    );
  };

  const handleReject = (index) => {
    setDeregistrationData((prevData) =>
      prevData.map((request, i) =>
        i === index ? { ...request, accepted: false } : request,
      ),
    );
  };

  const renderRows = () =>
    deregistrationData.map((item, index) => (
      <Table.Tr key={index}>
        <Table.Td align="center" p={12}>
          {item.student_id}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.deregistration_remark} {/* Fixed typo here */}
        </Table.Td>
        <Table.Td align="center" p={12}>
          <Button
            onClick={() => handleAccept(index)}
            variant="filled"
            color="green"
            size="xs"
            disabled={item.accepted === false} // Disable if already rejected
            style={{ marginRight: "8px" }}
          >
            Accept
          </Button>
          <Button
            onClick={() => handleReject(index)}
            variant="filled"
            color="red"
            size="xs"
            disabled={item.accepted === true} // Disable if already accepted
          >
            Reject
          </Button>
        </Table.Td>
      </Table.Tr>
    ));

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container size="lg" mt={30} miw="75rem">
      <Paper shadow="md" radius="md" p="lg" withBorder>
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Deregistration Requests
        </Title>

        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  Student ID
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  Remark
                </Flex>
              </Table.Th>
              <Table.Th>
                <Flex align="center" justify="center" h="100%">
                  Action
                </Flex>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>{renderRows()}</Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

export default ViewDeregistrationRequests;

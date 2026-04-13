import React, { useState, useEffect } from "react";
import { Table, Title, Container, Paper, Badge, ScrollArea, Loader, Center } from "@mantine/core";
import axios from "axios";

function GraduateStatus() {
  const authToken = localStorage.getItem("authToken");
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGraduateSeminarStatus();
  }, []);

  const fetchGraduateSeminarStatus = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const rollNo = userData.roll_no;

      if (!rollNo) {
        setError("Roll number not found in user data");
        setLoading(false);
        return;
      }

      const response = await axios.get("/api/otheracademic/get-graduate-seminar-status/", {
        params: { roll_no: rollNo },
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      setForms(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch graduate seminar status: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "green";
      case "Rejected":
        return "red";
      case "Pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Center style={{ height: "400px" }}>
        <Loader />
      </Center>
    );
  }

  const rows = forms.map((form) => (
    <Table.Tr key={form.id}>
      <Table.Td>{form.semester}</Table.Td>
      <Table.Td>{form.date_of_seminar}</Table.Td>
      <Table.Td>{form.theme_of_work.substring(0, 40)}...</Table.Td>
      <Table.Td>{form.place}</Table.Td>
      <Table.Td>{form.quality_of_work}/10</Table.Td>
      <Table.Td>{form.quantity_of_work}/10</Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(form.status)}>{form.status}</Badge>
      </Table.Td>
      <Table.Td>{form.remarks || "-"}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="lg" style={{ marginTop: "50px", marginBottom: "50px" }}>
      <Paper padding="md" shadow="xs">
        <Title order={2} align="center" mb="lg">
          Graduate Seminar Status
        </Title>

        {error && (
          <Paper p="md" style={{ backgroundColor: "#ffe3e3", marginBottom: "1rem" }}>
            <p style={{ color: "#d32f2f" }}>{error}</p>
          </Paper>
        )}

        {forms.length === 0 ? (
          <Paper p="md" style={{ textAlign: "center", backgroundColor: "#f8f9fa" }}>
            <p>No graduate seminar submissions found.</p>
          </Paper>
        ) : (
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Semester</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Theme</Table.Th>
                  <Table.Th>Place</Table.Th>
                  <Table.Th>Quality</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Remarks</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>
    </Container>
  );
}

export default GraduateStatus;


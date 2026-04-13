import React, { useState, useEffect } from "react";
import { Table, Button, Paper, Container, Title, Group, Modal, Badge, ScrollArea, Select, multiselect, Grid } from "@mantine/core";
import axios from "axios";

// Department mapping - maps department type to model field names and display names
const DEPARTMENT_CONFIG = {
  hostel: {
    displayName: "Hostel",
    clearField: "hostel_clear",
    notClearField: "hostel_notclear",
    credentialField: "hostel_credential",
  },
  library: {
    displayName: "Library",
    clearField: "library_clear",
    notClearField: "library_notclear",
    credentialField: "library_credential",
  },
  mess: {
    displayName: "Mess",
    clearField: "mess_clear",
    notClearField: "mess_notclear",
    credentialField: "mess_credential",
  },
  ece: {
    displayName: "ECE Lab",
    clearField: "ece_clear",
    notClearField: "ece_notclear",
    credentialField: "ece_credential",
  },
  physics_lab: {
    displayName: "Physics Lab",
    clearField: "physics_lab_clear",
    notClearField: "physics_lab_notclear",
    credentialField: "physics_credential",
  },
  bank: {
    displayName: "Bank",
    clearField: "bank_clear",
    notClearField: "bank_notclear",
    credentialField: "bank_credential",
  },
  icard_dsa: {
    displayName: "I-Card DSA",
    clearField: "icard_dsa_clear",
    notClearField: "icard_dsa_notclear",
  },
  design_studio: {
    displayName: "Design Studio",
    clearField: "design_studio_clear",
    notClearField: "design_studio_notclear",
    credentialField: "design_credential",
  },
  discipline_office: {
    displayName: "Discipline Office",
    clearField: "discipline_office_clear",
    notClearField: "discipline_office_notclear",
    credentialField: "discipline_credential",
  },
  account: {
    displayName: "Accounts",
    clearField: "account_clear",
    notClearField: "account_notclear",
    credentialField: "acad_credential",
  },
};

function GenericDepartmentAdmin({ department = "hostel" }) {
  const authToken = localStorage.getItem("authToken");
  const [noDuesRecords, setNoDuesRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [actionType, setActionType] = useState("clear"); // 'clear' or 'notclear'
  const [modalOpened, setModalOpened] = useState(false);

  const config = DEPARTMENT_CONFIG[department];

  useEffect(() => {
    fetchNoDuesRecords();
  }, [department]);

  const fetchNoDuesRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/otheracademic/get-nodues-records/", {
        params: { department },
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });
      setNoDuesRecords(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch records: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCleared = (record) => {
    setSelectedStudentId(record.id);
    setActionType("clear");
    setModalOpened(true);
  };

  const handleMarkAsNotCleared = (record) => {
    setSelectedStudentId(record.id);
    setActionType("notclear");
    setModalOpened(true);
  };

  const submitAction = async () => {
    try {
      const payload = {
        record_id: selectedStudentId,
        department: department,
        action: actionType,
      };

      await axios.post("/api/otheracademic/update-nodues-status/", payload, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      setModalOpened(false);
      fetchNoDuesRecords();
    } catch (err) {
      setError("Failed to update status: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading records...</div>;
  }

  const rows = noDuesRecords.map((record) => {
    const isClear = record[config.clearField];
    const isNotClear = record[config.notClearField];

    return (
      <Table.Tr key={record.id}>
        <Table.Td>{record.roll_no}</Table.Td>
        <Table.Td>{record.name}</Table.Td>
        <Table.Td>
          <Badge color={isClear ? "green" : "red"}>
            {isClear ? "Clear" : "Not Clear"}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <Button
              size="xs"
              color="green"
              variant={isClear ? "filled" : "light"}
              onClick={() => handleMarkAsCleared(record)}
            >
              Mark Clear
            </Button>
            <Button
              size="xs"
              color="red"
              variant={isNotClear ? "filled" : "light"}
              onClick={() => handleMarkAsNotCleared(record)}
            >
              Mark Not Clear
            </Button>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Container size="lg" style={{ marginTop: "50px", marginBottom: "50px" }}>
      <Paper padding="md" shadow="xs">
        <Title order={2} align="center" mb="lg">
          {config.displayName} - No Dues Management
        </Title>

        {error && (
          <Paper p="md" style={{ backgroundColor: "#ffe3e3", marginBottom: "1rem" }}>
            <p style={{ color: "#d32f2f" }}>{error}</p>
          </Paper>
        )}

        {noDuesRecords.length === 0 ? (
          <Paper p="md" style={{ textAlign: "center", backgroundColor: "#f8f9fa" }}>
            <p>No students found.</p>
          </Paper>
        ) : (
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Roll No</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setSelectedStudentId(null);
        }}
        title={actionType === "clear" ? "Mark as Cleared" : "Mark as Not Cleared"}
      >
        <p>Are you sure you want to mark this student as {actionType === "clear" ? "cleared" : "not cleared"} in {config.displayName}?</p>
        <Group justify="flex-end" style={{ marginTop: "1rem" }}>
          <Button
            variant="default"
            onClick={() => {
              setModalOpened(false);
              setSelectedStudentId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            color={actionType === "clear" ? "green" : "red"}
            onClick={submitAction}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default GenericDepartmentAdmin;

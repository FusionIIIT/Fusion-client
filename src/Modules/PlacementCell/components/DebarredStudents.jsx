import React, { useState, useEffect, useMemo } from "react";
import {
  TextInput,
  Button,
  Group,
  Textarea,
  Card,
  Title,
  Grid,
  Modal,
  Text,
  Container,
} from "@mantine/core";
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { notifications } from "@mantine/notifications";
import axios from "axios";

function DebarredStudents() {
  const [debarredStudents, setDebarredStudents] = useState([]);
  const [rollNo, setRollNo] = useState("");
  const [reason, setReason] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch debarred students from the backend
    // For now, we will use sample data
    const sampleData = [
      { rollNo: "12345", name: "John Doe", reason: "Academic misconduct" },
      { rollNo: "67890", name: "Jane Smith", reason: "Violation of code of conduct" },
    ];
    setDebarredStudents(sampleData);
  }, []);

  const handleDebar = async () => {
    setLoading(true);
    try {
      // Send debar request to the backend
      // For now, we will just add the student to the sample data
      const newDebarredStudent = {
        rollNo,
        name: studentDetails.name,
        reason,
      };
      setDebarredStudents((prev) => [...prev, newDebarredStudent]);
      notifications.show({
        title: "Success",
        message: "Student debarred successfully!",
        color: "green",
        position: "top-center",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error debarring student:", error);
      notifications.show({
        title: "Error",
        message: "An error occurred while debarring the student.",
        color: "red",
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchStudentDetails = async () => {
    try {
      // Fetch student details from the backend
      // For now, we will use sample data
      const sampleStudentDetails = {
        rollNo,
        name: "Sample Student",
        email: "sample@student.com",
        department: "Computer Science",
        year: "3rd Year",
      };
      setStudentDetails(sampleStudentDetails);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching student details:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch student details.",
        color: "red",
        position: "top-center",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'rollNo',
        header: 'Roll No',
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: debarredStudents, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
  });

  return (
    <Container>
      <Card shadow="sm" padding="lg" radius="lg" withBorder>
        <Title order={3} align="center" style={{ marginBottom: "20px" }}>
          Debarred Students
        </Title>
        <MantineReactTable table={table} />
      </Card>

      <Card shadow="sm" padding="lg" radius="lg" withBorder style={{ marginTop: "20px" }}>
        <Title order={3} align="center" style={{ marginBottom: "20px" }}>
          Debar a Student
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Roll No"
              placeholder="Enter roll number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Button
              variant="light"
              color="blue"
              style={{ marginTop: "30px" }}
              onClick={handleFetchStudentDetails}
            >
              Fetch Student Details
            </Button>
          </Grid.Col>
        </Grid>
      </Card>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Debar Student"
        size="lg"
      >
        {studentDetails && (
          <Card shadow="sm" padding="lg" radius="lg" withBorder>
            <Title order={4} align="center" style={{ marginBottom: "20px" }}>
              Student Details
            </Title>
            <Text><strong>Roll No:</strong> {studentDetails.rollNo}</Text>
            <Text><strong>Name:</strong> {studentDetails.name}</Text>
            <Text><strong>Email:</strong> {studentDetails.email}</Text>
            <Text><strong>Department:</strong> {studentDetails.department}</Text>
            <Text><strong>Year:</strong> {studentDetails.year}</Text>
            <Textarea
              label="Reason for Debarring"
              placeholder="Enter reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minRows={3}
              style={{ marginTop: "20px" }}
            />
            <Group position="right" style={{ marginTop: "20px" }}>
              <Button onClick={handleDebar} loading={loading}>
                Debar Student
              </Button>
            </Group>
          </Card>
        )}
      </Modal>
    </Container>
  );
}

export default DebarredStudents;
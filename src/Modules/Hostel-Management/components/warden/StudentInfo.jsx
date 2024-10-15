import React, { useState } from "react";
import {
  Box,
  Card,
  Container,
  Group,
  Input,
  Select,
  Text,
  Title,
  Modal,
  Button,
} from "@mantine/core";
import { MagnifyingGlass } from "@phosphor-icons/react";

// Mock data for demonstration
const studentData = [
  {
    name: "Student 1",
    id: "22BEC009",
    room: "443",
    age: 20,
    major: "Computer Science",
  },
  {
    name: "Student 2",
    id: "22BEC010",
    room: "444",
    age: 21,
    major: "Mechanical Engineering",
  },
  {
    name: "Student 3",
    id: "22BEC011",
    room: "445",
    age: 22,
    major: "Electrical Engineering",
  },
  {
    name: "Student 4",
    id: "22BEC012",
    room: "446",
    age: 23,
    major: "Civil Engineering",
  },
  {
    name: "Student 5",
    id: "22BEC013",
    room: "447",
    age: 24,
    major: "Information Technology",
  },
  {
    name: "Student 6",
    id: "22BEC014",
    room: "448",
    age: 25,
    major: "Data Science",
  },
  {
    name: "Student 4",
    id: "22BEC012",
    room: "446",
    age: 23,
    major: "Civil Engineering",
  },
  {
    name: "Student 5",
    id: "22BEC013",
    room: "447",
    age: 24,
    major: "Information Technology",
  },
  {
    name: "Student 6",
    id: "22BEC014",
    room: "448",
    age: 25,
    major: "Data Science",
  },
];

export default function Component() {
  const [opened, setOpened] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setOpened(true);
  };

  return (
    <Container size="l" px="xs">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} mb="md">
          Student Info
        </Title>
        <Group mb="md">
          <Input
            placeholder="Search"
            icon={<MagnifyingGlass size={16} />}
            style={{ flex: 1 }}
          />
          <Select
            data={[
              "Block - A",
              "Block - B",
              "Block - C",
              "Block - D",
              "Block - E",
            ]}
            defaultValue="Block - E"
            style={{ width: 120 }}
          />
        </Group>
        <Box>
          {studentData.map((student, index) => (
            <Card
              key={index}
              mb="sm"
              padding="sm"
              withBorder
              onClick={() => handleOpenModal(student)}
            >
              <Group noWrap align="center" spacing="xs">
                <Text style={{ flex: 1 }}>{student.name}</Text>
                <Text style={{ flex: 1 }}>{student.id}</Text>
                <Text
                  size="sm"
                  style={{
                    textAlign: "right",
                    backgroundColor: "#f1f3f5", // Background color for room number
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  Room {student.room}
                </Text>
              </Group>
            </Card>
          ))}
        </Box>
      </Card>

      {/* Modal to display student details */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Student Details"
      >
        {selectedStudent && (
          <Box>
            <Text weight={500}>Name: {selectedStudent.name}</Text>
            <Text>ID: {selectedStudent.id}</Text>
            <Text>Room: {selectedStudent.room}</Text>
            <Text>Age: {selectedStudent.age}</Text>
            <Text>Major: {selectedStudent.major}</Text>
            <Button onClick={() => setOpened(false)} mt="md" color="blue">
              Close
            </Button>
          </Box>
        )}
      </Modal>
    </Container>
  );
}

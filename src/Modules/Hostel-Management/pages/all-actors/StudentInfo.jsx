import React, { useState } from "react";
import {
  Paper,
  Text,
  Input,
  Select,
  Group,
  Card,
  ScrollArea,
  Modal,
  Button,
  Container,
  Stack,
  Divider,
  SimpleGrid,
} from "@mantine/core";
import { MagnifyingGlass } from "@phosphor-icons/react";

// Mock data for demonstration (expanded for scrolling effect)
const studentData = [
  { name: "Student 1", id: "22BEC009", room: "443", age: 20, major: "Computer Science" },
  { name: "Student 2", id: "22BEC010", room: "444", age: 21, major: "Mechanical Engineering" },
  { name: "Student 3", id: "22BEC011", room: "445", age: 22, major: "Electrical Engineering" },
  { name: "Student 4", id: "22BEC012", room: "446", age: 23, major: "Civil Engineering" },
  { name: "Student 5", id: "22BEC013", room: "447", age: 24, major: "Information Technology" },
  { name: "Student 6", id: "22BEC014", room: "448", age: 25, major: "Data Science" },
  { name: "Student 7", id: "22BEC015", room: "449", age: 22, major: "Chemical Engineering" },
  { name: "Student 8", id: "22BEC016", room: "450", age: 23, major: "Biomedical Engineering" },
  { name: "Student 9", id: "22BEC017", room: "451", age: 24, major: "Aerospace Engineering" },
  { name: "Student 10", id: "22BEC018", room: "452", age: 21, major: "Environmental Engineering" },
  // Add more students as needed for scrolling effect
];

export default function StudentInfo() {
  const [opened, setOpened] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("Block - E");

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setOpened(true);
  };

  const filteredStudents = studentData.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.room.toLowerCase().includes(searchTerm.toLowerCase())
      
  );

  return (
    <Paper
      shadow="md"
      p="md"
      withBorder
      sx={(theme) => ({
        position: "fixed",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.white,
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
      })}
    >
      <Text
        align="left"
        mb="xl"
        size="24px"
        style={{ color: "#757575", fontWeight: "bold" }}
      >
        Student Info
      </Text>

      <Group mb="md">
        <Input
          placeholder="Search"
          icon={<MagnifyingGlass size={16} />}
          style={{ flex: 1 }}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
        />
        <Select
          data={["Block - A", "Block - B", "Block - C", "Block - D", "Block - E"]}
          value={selectedBlock}
          onChange={setSelectedBlock}
          style={{ width: 120 }}
        />
      </Group>

      <ScrollArea style={{ flex: 1, height: 'calc(62vh)'}}>
        <Stack spacing="sm">
          {filteredStudents.map((student, index) => (
            <Card
              key={index}
              padding="sm"
              withBorder
              onClick={() => handleOpenModal(student)}
              sx={(theme) => ({
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: theme.colors.gray[0],
                },
              })}
            >
              <Group align="center" spacing="xs">
                <Text style={{ flex: 1 }}>{student.name}</Text>
                <Text style={{ flex: 1 }}>{student.id}</Text>
                <Text
                  size="sm"
                  style={{
                    textAlign: "right",
                    backgroundColor: "#f1f3f5",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  Room {student.room}
                </Text>
              </Group>
            </Card>
          ))}
        </Stack>
      </ScrollArea>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        size="md"
        styles={(theme) => ({
          body: { 
            backgroundColor: theme.colors.gray[0] 
          },
        })}
      >
        {selectedStudent && (
          <Container>
            <Stack spacing="md">
              <Paper p="md" radius="md" withBorder>
                <Group position="apart">
                  <Text size="lg" weight={500} color="blue">Name:</Text>
                  <Text size="lg" italic>{selectedStudent.name}</Text>
                </Group>
              </Paper>
              <SimpleGrid cols={2} spacing="md">
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">Roll No:</Text>
                  <Text size="lg">{selectedStudent.id}</Text>
                </Paper>
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">Room:</Text>
                  <Text size="lg">{selectedStudent.room}</Text>
                </Paper>
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">Age:</Text>
                  <Text size="lg">{selectedStudent.age}</Text>
                </Paper>
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">Major:</Text>
                  <Text size="lg">{selectedStudent.major}</Text>
                </Paper>
              </SimpleGrid>
              <Button 
                onClick={() => setOpened(false)} 
                mt="md" 
                color="blue" 
                fullWidth
                size="lg"
                variant="light"
              >
                Close
              </Button>
            </Stack>
          </Container>
        )}
      </Modal>
    </Paper>
  );
}
import React, { useState } from "react";
import {
  Text,
  Paper,
  Group,
  Avatar,
  Button,
  Stack,
  Flex,
  Select,
  Card,
  TextInput,
  NumberInput,
  Textarea,
  ScrollArea,
} from "@mantine/core";
import {
  MagnifyingGlass,
  Student,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";

// Sample student data
const students = [
  { id: "1", name: "Vishal Keshari", hall: "Hall-2" },
  { id: "2", name: "Tushar Sharma", hall: "Hall-1" },
  { id: "3", name: "Akshay Behl", hall: "Hall-3" },
  { id: "4", name: "Ayodhya", hall: "Hall-2" },
  { id: "5", name: "Rohit Singh", hall: "Maa Saraswati Hostel" },
];

export default function ImposeFine() {
  const [selectedHall, setSelectedHall] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fineAmount, setFineAmount] = useState(0);
  const [fineDetails, setFineDetails] = useState("");

  const handleHallChange = (value) => setSelectedHall(value);
  const handleSearchChange = (event) =>
    setSearchTerm(event.currentTarget.value);
  const handleStudentSelect = (student) => setSelectedStudent(student);

  const handleImposeFine = () => {
    console.log(`Fine imposed on ${selectedStudent.name}`);
    console.log(`Amount: ${fineAmount}`);
    console.log(`Details: ${fineDetails}`);
    setFineAmount(0);
    setFineDetails("");
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter(
    (student) =>
      (!selectedHall || student.hall === selectedHall) &&
      student.name.toLowerCase().includes(searchTerm.toLowerCase()),
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
        Impose Fine
      </Text>

      <ScrollArea style={{ flex: 1, height: "calc(66vh)" }}>
        <Stack spacing="md" pb="md">
          <Select
            label="Filter by Hostel"
            placeholder="Select a hostel"
            icon={<Student size={16} />}
            data={[
              { value: "Hall-1", label: "Hall-1" },
              { value: "Hall-2", label: "Hall-2" },
              { value: "Hall-3", label: "Hall-3" },
              { value: "Hall-4", label: "Hall-4" },
              { value: "Hall-5", label: "Hall-5" },
              { value: "Maa Saraswati Hostel", label: "Maa Saraswati Hostel" },
            ]}
            value={selectedHall}
            onChange={handleHallChange}
          />

          <TextInput
            label="Search Student"
            placeholder="Enter student name"
            icon={<MagnifyingGlass size={16} />}
            value={searchTerm}
            onChange={handleSearchChange}
          />

          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <Paper
                key={student.id}
                p="md"
                withBorder
                shadow="xs"
                sx={(theme) => ({
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: theme.white,
                  borderColor: theme.colors.gray[3],
                })}
              >
                <Flex
                  align="center"
                  justify="space-between"
                  style={{ width: "100%" }}
                >
                  <Group spacing="md" noWrap>
                    <Avatar color="cyan" radius="xl">
                      {student.name[0]}
                    </Avatar>
                    <div>
                      <Text weight={500} size="sm" lineClamp={1}>
                        {student.name}
                      </Text>
                      <Text color="dimmed" size="xs">
                        {student.hall}
                      </Text>
                    </div>
                  </Group>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleStudentSelect(student)}
                  >
                    Select
                  </Button>
                </Flex>
              </Paper>
            ))
          ) : (
            <Text align="center" color="dimmed" size="lg">
              No students found.
            </Text>
          )}

          {selectedStudent && (
            <Card shadow="sm" p="lg" mt="md" withBorder>
              <Text weight={500} size="lg" mb="md">
                Impose Fine on {selectedStudent.name}
              </Text>
              <Text size="sm" color="dimmed" mb="md">
                Hall: {selectedStudent.hall}
              </Text>

              <NumberInput
                label="Fine Amount"
                placeholder="Enter fine amount"
                icon={<CurrencyCircleDollar size={16} />}
                value={fineAmount}
                onChange={setFineAmount}
                min={0}
                mb="md"
              />

              <Textarea
                label="Fine Details"
                placeholder="Enter fine details"
                value={fineDetails}
                onChange={(event) => setFineDetails(event.currentTarget.value)}
                mb="md"
              />

              <Button color="yellow" fullWidth onClick={handleImposeFine}>
                Impose Fine
              </Button>
            </Card>
          )}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}

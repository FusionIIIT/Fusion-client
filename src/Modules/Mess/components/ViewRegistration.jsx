import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Loader,
  ScrollArea,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  FunnelSimple,
  MagnifyingGlass,
  WarningCircle,
} from "@phosphor-icons/react";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { viewRegistrationDataRoute } from "../routes";

const messLabelMap = {
  mess1: "Central Mess 1",
  mess2: "Central Mess 2",
};

function getStatusColor(status = "") {
  const normalized = status.toLowerCase();
  if (normalized.includes("register")) return "teal";
  if (normalized.includes("deregister")) return "red";
  return "gray";
}

function ViewRegistrations() {
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [programFilter, setProgramFilter] = useState("All");
  const [messFilter, setMessFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRegistrations = async (isSearch = false) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      const requestData = isSearch
        ? {
            type: "search",
            student_id: searchQuery.trim().toUpperCase(),
          }
        : {
            type: "filter",
            status: statusFilter === "All" ? "all" : statusFilter,
            program: programFilter === "All" ? "all" : programFilter,
            mess_option:
              messFilter === "All"
                ? "all"
                : messFilter.toLowerCase().replace(/\s+/g, ""),
          };

      const response = await axios.post(
        viewRegistrationDataRoute,
        requestData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      const payload = response.data.payload || response.data;
      setFilteredStudents(Array.isArray(payload) ? payload : [payload]);
    } catch (fetchError) {
      if (fetchError.response?.status === 404) {
        setFilteredStudents([]);
        notifications.show({
          title: "Student Not Found",
          message: "The requested student could not be found.",
          color: "red",
        });
      } else {
        setError("Unable to load registration records right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations(false);
  }, []);

  return (
    <Card shadow="sm" radius="xl" p="xl" withBorder>
      <Group justify="space-between" align="flex-start" gap="md" mb="lg">
        <div>
          <Title order={3}>Student Registrations</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Search by roll number or filter the currently registered student
            list.
          </Text>
        </div>
        <Badge size="lg" radius="xl" color="blue" variant="light">
          {filteredStudents.length} result
          {filteredStudents.length === 1 ? "" : "s"}
        </Badge>
      </Group>

      {error ? (
        <Alert color="red" icon={<WarningCircle size={18} />} mb="lg">
          {error}
        </Alert>
      ) : null}

      <Grid gutter="md" mb="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <TextInput
            label="Search by roll number"
            placeholder="Enter roll number"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            leftSection={<MagnifyingGlass size={18} />}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Button
            fullWidth
            mt={{ base: 0, md: 24 }}
            onClick={() => fetchRegistrations(true)}
          >
            Search
          </Button>
        </Grid.Col>
      </Grid>

      <Grid gutter="md" align="flex-end">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "All")}
            data={["Registered", "Deregistered", "All"]}
            leftSection={<FunnelSimple size={16} />}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Program"
            value={programFilter}
            onChange={(value) => setProgramFilter(value || "All")}
            data={["B.Tech", "M.Tech", "All"]}
            leftSection={<FunnelSimple size={16} />}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Mess"
            value={messFilter}
            onChange={(value) => setMessFilter(value || "All")}
            data={["Mess 1", "Mess 2", "All"]}
            leftSection={<FunnelSimple size={16} />}
          />
        </Grid.Col>
      </Grid>

      <Group justify="flex-end" mt="md">
        <Button variant="light" onClick={() => fetchRegistrations(false)}>
          Apply filters
        </Button>
      </Group>

      {loading ? (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      ) : (
        <ScrollArea mt="lg" offsetScrollbars>
          <Table
            striped
            highlightOnHover
            verticalSpacing="md"
            horizontalSpacing="md"
            miw={760}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Roll No</Table.Th>
                <Table.Th>Program</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Mess</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <Table.Tr key={student.id || student.student_id}>
                    <Table.Td>{student.first_name || "-"}</Table.Td>
                    <Table.Td>{student.student_id || "-"}</Table.Td>
                    <Table.Td>{student.program || "-"}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={getStatusColor(student.current_mess_status)}
                        variant="light"
                      >
                        {student.current_mess_status || "Unknown"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="outline">
                        {messLabelMap[student.mess_option] ||
                          student.mess_option ||
                          "NA"}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text ta="center" c="dimmed" py="lg">
                      No registrations matched the current search or filter.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}
    </Card>
  );
}

export default ViewRegistrations;

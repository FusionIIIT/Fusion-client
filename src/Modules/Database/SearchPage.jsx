import { useState } from "react";
import { Button, Card, Group, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { dbSearchRoute } from "../../routes/dashboardRoutes";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const token = localStorage.getItem("authToken");
  const authHeaders = { Authorization: `Token ${token}` };

  const searchUsers = async () => {
    if (query.trim().length < 3) {
      notifications.show({ title: "Search", message: "Enter at least 3 characters", color: "yellow" });
      return;
    }

    try {
      const { data } = await axios.get(dbSearchRoute, {
        headers: authHeaders,
        params: { q: query.trim() },
      });
      setResults(data.results || []);
    } catch (error) {
      notifications.show({
        title: "Search",
        message: error?.response?.data?.error || "Search failed",
        color: "red",
      });
      setResults([]);
    }
  };

  return (
    <Stack>
      <Title order={3}>User Search</Title>
      <Card withBorder>
        <Group>
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Search by name or username"
            style={{ flex: 1 }}
          />
          <Button onClick={searchUsers}>Search</Button>
        </Group>
      </Card>

      {results.length > 0 ? (
        <Table striped withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Username</Table.Th>
              <Table.Th>First Name</Table.Th>
              <Table.Th>Last Name</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {results.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.username}</Table.Td>
                <Table.Td>{user.first_name}</Table.Td>
                <Table.Td>{user.last_name}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text c="dimmed">No results yet.</Text>
      )}
    </Stack>
  );
}

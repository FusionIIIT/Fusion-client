import { useState, useEffect } from "react";
import {
  Stack, Card, Box, Title, Text, Badge, Group,
  Paper, Loader, Center, SimpleGrid, Table, ScrollArea, Divider,
} from "@mantine/core";
import { IconTrophy, IconClipboardList } from "@tabler/icons-react";
import { getAutoAwards, getAllAwardApplications } from "../services/awardsAPI";

const FUSION_BLUE = "#15abff";
const GOLD = "#f59f00";

export default function AwardsConvenorDashboard() {
  const [autoAwards, setAutoAwards]     = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [aRes, appRes] = await Promise.all([
          getAutoAwards().catch(() => ({ data: [] })),
          getAllAwardApplications().catch(() => ({ data: [] })),
        ]);
        setAutoAwards(Array.isArray(aRes.data) ? aRes.data : []);
        setApplications(Array.isArray(appRes.data) ? appRes.data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Center py={80}><Loader size="lg" color={FUSION_BLUE} /></Center>;

  const autoGrouped = autoAwards.reduce((acc, r) => {
    acc[r.award_name] = acc[r.award_name] || [];
    acc[r.award_name].push(r);
    return acc;
  }, {});

  return (
    <Stack gap="xl">
      <Paper
        withBorder p="xl" radius="lg"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
      >
        <Group justify="space-between" wrap="wrap" gap="md">
          <Box>
            <Text size="xs" c="rgba(255,255,255,0.6)" tt="uppercase" fw={600}>SPACS Convenor — Awards Oversight</Text>
            <Title order={2} c="white" mt={4}>Awards Summary View</Title>
          </Box>
          <SimpleGrid cols={2} spacing="sm">
            {[
              { label: "Auto Awards", value: autoAwards.length },
              { label: "Applications", value: applications.length },
            ].map((s) => (
              <Paper key={s.label} px="xl" py="md" radius="md" style={{ background: "rgba(255,255,255,0.1)", textAlign: "center" }}>
                <Text fw={900} size="xl" c="white">{s.value}</Text>
                <Text size="xs" c="rgba(255,255,255,0.6)">{s.label}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Group>
      </Paper>

      {/* Auto Awards Summary */}
      <Card withBorder radius="md" p="xl" shadow="sm">
        <Group mb="lg" gap="xs">
          <IconTrophy size={22} color={GOLD} />
          <Title order={4}>Academic Auto Awards</Title>
        </Group>
        <Divider mb="lg" />
        {autoAwards.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">No auto awards generated yet.</Text>
        ) : (
          <Stack gap="md">
            {Object.entries(autoGrouped).map(([name, winners]) => (
              <Paper key={name} withBorder p="md" radius="md">
                <Group mb="sm">
                  <IconTrophy size={16} color={GOLD} />
                  <Text fw={700}>{name}</Text>
                  <Badge color="yellow" ml="auto">{winners.length}</Badge>
                </Group>
                {winners.map((w) => (
                  <Group key={w.id} py={4} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <Text size="sm" fw={600}>{w.roll_no}</Text>
                    <Text size="sm">{w.student_name}</Text>
                    <Text size="xs" c="dimmed">{w.programme} · {w.branch}</Text>
                    <Badge ml="auto" variant="gradient" gradient={{ from: "yellow", to: "orange" }}>CPI {w.cpi}</Badge>
                  </Group>
                ))}
              </Paper>
            ))}
          </Stack>
        )}
      </Card>

      {/* Applications Summary */}
      <Card withBorder radius="md" p="xl" shadow="sm">
        <Group mb="lg" gap="xs">
          <IconClipboardList size={22} color={FUSION_BLUE} />
          <Title order={4}>Applications Summary</Title>
        </Group>
        <Divider mb="lg" />
        {applications.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">No applications received.</Text>
        ) : (
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Award</Table.Th>
                  <Table.Th>Roll No</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>CPI</Table.Th>
                  <Table.Th>Applied At</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {applications.map((a) => (
                  <Table.Tr key={a.id}>
                    <Table.Td><Badge variant="light" color="blue">{a.award_label}</Badge></Table.Td>
                    <Table.Td><Text fw={600} size="sm">{a.roll_no}</Text></Table.Td>
                    <Table.Td>{a.student_name}</Table.Td>
                    <Table.Td><Badge color="teal">{a.cpi}</Badge></Table.Td>
                    <Table.Td><Text size="xs" c="dimmed">{a.created_at}</Text></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Card>
    </Stack>
  );
}

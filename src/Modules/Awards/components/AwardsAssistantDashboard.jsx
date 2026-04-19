import { useState, useEffect } from "react";
import {
  Stack, Tabs, Card, Box, Title, Text, Badge, Group,
  Button, Paper, ThemeIcon, Loader, Center, Divider,
  Select, Table, ScrollArea, Alert, Modal, SimpleGrid,
  NumberInput, ActionIcon, Tooltip,
} from "@mantine/core";
import {
  IconTrophy, IconMedal, IconDownload, IconRefresh,
  IconClipboardList, IconStar, IconUsers, IconAlertCircle,
  IconCircleCheck, IconFilter,
} from "@tabler/icons-react";
import {
  generateAutoAwards,
  getAutoAwards,
  getAllAwardApplications,
  exportAutoAwards,
  exportAwardApplications,
} from "../services/awardsAPI";

const FUSION_BLUE = "#15abff";
const GOLD = "#f59f00";

const AWARD_TYPE_OPTIONS = [
  { value: "", label: "All Awards" },
  { value: "IIITDM_PRIZE", label: "IIITDM Proficiency Prize" },
  { value: "CULTURAL", label: "Cultural Medal" },
  { value: "SPORTS", label: "Sports Medal" },
  { value: "DM_PROFICIENCY", label: "D&M Proficiency Gold Medal" },
  { value: "DIRECTOR_SILVER", label: "Director's Silver Medal" },
];

const BATCH_OPTIONS = ["2023", "2024", "2025", "2026"];

const downloadBlob = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function AwardsAssistantDashboard() {
  const [tab, setTab]               = useState("auto-awards");
  const [autoAwards, setAutoAwards] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("2023");
  const [filterType, setFilterType] = useState("");
  const [genModal, setGenModal]     = useState(false);
  const [genResult, setGenResult]   = useState(null);
  const [error, setError]           = useState("");

  const fetchAll = async () => {
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
  };

  useEffect(() => { fetchAll(); }, []);

  const onGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await generateAutoAwards(parseInt(selectedBatch));
      setGenResult(res.data);
      await fetchAll();
      setGenModal(true);
    } catch (e) {
      setError(e?.response?.data?.error || "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const onExportAutoAwards = async () => {
    const res = await exportAutoAwards(selectedBatch);
    downloadBlob(res.data, `auto_awards_batch${selectedBatch}.csv`);
  };

  const onExportApplications = async () => {
    const res = await exportAwardApplications(filterType || undefined);
    downloadBlob(res.data, "award_applications.csv");
  };

  const filteredApps = filterType
    ? applications.filter((a) => a.award_type === filterType)
    : applications;

  // Group auto awards by award name
  const autoGrouped = autoAwards.reduce((acc, r) => {
    acc[r.award_name] = acc[r.award_name] || [];
    acc[r.award_name].push(r);
    return acc;
  }, {});

  if (loading)
    return <Center py={80}><Loader size="lg" color={FUSION_BLUE} /></Center>;

  return (
    <Stack gap="xl">
      {/* Header */}
      <Paper
        withBorder p="xl" radius="lg"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
          color: "#fff",
        }}
      >
        <Group justify="space-between" wrap="wrap" gap="md">
          <Box>
            <Text size="xs" c="rgba(255,255,255,0.6)" tt="uppercase" fw={600}>
              SPACS Assistant — Awards Module
            </Text>
            <Title order={2} c="white" mt={4}>Awards Control Panel</Title>
            <Text size="sm" c="rgba(255,255,255,0.7)" mt={2}>
              Generate academic awards · Manage applications · Export data
            </Text>
          </Box>
          <SimpleGrid cols={2} spacing="sm">
            <Paper px="xl" py="md" radius="md" style={{ background: "rgba(255,255,255,0.1)", textAlign: "center" }}>
              <Text fw={900} size="xl" c="white">{autoAwards.length}</Text>
              <Text size="xs" c="rgba(255,255,255,0.6)">Auto Awards</Text>
            </Paper>
            <Paper px="xl" py="md" radius="md" style={{ background: "rgba(255,255,255,0.1)", textAlign: "center" }}>
              <Text fw={900} size="xl" c="white">{applications.length}</Text>
              <Text size="xs" c="rgba(255,255,255,0.6)">Applications</Text>
            </Paper>
          </SimpleGrid>
        </Group>
      </Paper>

      {error && (
        <Alert icon={<IconAlertCircle />} color="red" withCloseButton onClose={() => setError("")}>{error}</Alert>
      )}

      <Card withBorder radius="md" p={0} shadow="sm">
        <Tabs value={tab} onChange={setTab}>
          <Box px="xl" pt="md" style={{ background: "#f8f9fa" }}>
            <Tabs.List variant="pills">
              <Tabs.Tab value="auto-awards" leftSection={<IconTrophy size={16} />}>
                Auto Awards {autoAwards.length > 0 && <Badge size="xs" ml={4} color="yellow">{autoAwards.length}</Badge>}
              </Tabs.Tab>
              <Tabs.Tab value="applications" leftSection={<IconClipboardList size={16} />}>
                Applications {applications.length > 0 && <Badge size="xs" ml={4}>{applications.length}</Badge>}
              </Tabs.Tab>
            </Tabs.List>
          </Box>
          <Divider />
          <Box p="xl">

            {/* ── Auto Awards Tab ── */}
            <Tabs.Panel value="auto-awards">
              <Stack gap="lg">
                {/* Controls */}
                <Paper withBorder p="lg" radius="md" bg="blue.0">
                  <Group wrap="wrap" gap="md" justify="space-between">
                    <Group gap="md">
                      <Select
                        label="Select Batch"
                        data={BATCH_OPTIONS}
                        value={selectedBatch}
                        onChange={setSelectedBatch}
                        w={140}
                        size="sm"
                      />
                      <Box mt={24}>
                        <Button
                          color="blue"
                          loading={generating}
                          leftSection={<IconRefresh size={16} />}
                          onClick={onGenerate}
                        >
                          Generate Auto Awards
                        </Button>
                      </Box>
                    </Group>
                    <Box mt={24}>
                      <Button
                        variant="light"
                        color="teal"
                        leftSection={<IconDownload size={16} />}
                        onClick={onExportAutoAwards}
                        disabled={autoAwards.length === 0}
                      >
                        Export CSV
                      </Button>
                    </Box>
                  </Group>
                </Paper>

                {/* Results */}
                {autoAwards.length === 0 ? (
                  <Paper withBorder p="xl" ta="center" radius="md">
                    <IconTrophy size={48} color="#fab005" style={{ opacity: 0.35 }} />
                    <Text mt="md" c="dimmed">No auto awards generated yet. Select a batch and click Generate.</Text>
                  </Paper>
                ) : (
                  <Stack gap="md">
                    {Object.entries(autoGrouped).map(([awardName, winners]) => (
                      <Card key={awardName} withBorder radius="md" p={0} shadow="xs">
                        <Box px="xl" py="sm" style={{ background: "linear-gradient(90deg, #1a1a2e, #0f3460)" }}>
                          <Group gap="xs">
                            <IconTrophy size={18} color={GOLD} />
                            <Text fw={700} c="white">{awardName}</Text>
                            <Badge color="yellow" size="sm" ml="auto">{winners.length} winner{winners.length > 1 ? 's' : ''}</Badge>
                          </Group>
                        </Box>
                        <ScrollArea>
                          <Table striped highlightOnHover>
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th>Roll No</Table.Th>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Programme</Table.Th>
                                <Table.Th>Branch</Table.Th>
                                <Table.Th>CPI</Table.Th>
                                <Table.Th>Batch</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {winners.map((w) => (
                                <Table.Tr key={w.id}>
                                  <Table.Td><Text fw={600} size="sm">{w.roll_no}</Text></Table.Td>
                                  <Table.Td>{w.student_name}</Table.Td>
                                  <Table.Td><Badge variant="light">{w.programme}</Badge></Table.Td>
                                  <Table.Td>{w.branch}</Table.Td>
                                  <Table.Td>
                                    <Badge variant="gradient" gradient={{ from: "yellow", to: "orange" }} size="lg">
                                      {w.cpi}
                                    </Badge>
                                  </Table.Td>
                                  <Table.Td>{w.batch}</Table.Td>
                                </Table.Tr>
                              ))}
                            </Table.Tbody>
                          </Table>
                        </ScrollArea>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Tabs.Panel>

            {/* ── Applications Tab ── */}
            <Tabs.Panel value="applications">
              <Stack gap="lg">
                {/* Filter + Export */}
                <Paper withBorder p="lg" radius="md" bg="teal.0">
                  <Group justify="space-between" wrap="wrap" gap="md">
                    <Group gap="md">
                      <Select
                        label="Filter by Award Type"
                        data={AWARD_TYPE_OPTIONS}
                        value={filterType}
                        onChange={(v) => setFilterType(v || "")}
                        w={250}
                        size="sm"
                        leftSection={<IconFilter size={14} />}
                      />
                    </Group>
                    <Box mt={24}>
                      <Button
                        variant="light"
                        color="teal"
                        leftSection={<IconDownload size={16} />}
                        onClick={onExportApplications}
                        disabled={applications.length === 0}
                      >
                        Export CSV
                      </Button>
                    </Box>
                  </Group>
                </Paper>

                {filteredApps.length === 0 ? (
                  <Paper withBorder p="xl" ta="center" radius="md">
                    <IconClipboardList size={48} color={FUSION_BLUE} style={{ opacity: 0.35 }} />
                    <Text mt="md" c="dimmed">No applications found.</Text>
                  </Paper>
                ) : (
                  <ScrollArea>
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                      <Table.Thead style={{ background: "#f8f9fa" }}>
                        <Table.Tr>
                          <Table.Th>#</Table.Th>
                          <Table.Th>Award</Table.Th>
                          <Table.Th>Roll No</Table.Th>
                          <Table.Th>Name</Table.Th>
                          <Table.Th>Programme</Table.Th>
                          <Table.Th>Branch</Table.Th>
                          <Table.Th>CPI</Table.Th>
                          <Table.Th>Applied At</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {filteredApps.map((app, i) => (
                          <Table.Tr key={app.id}>
                            <Table.Td>{i + 1}</Table.Td>
                            <Table.Td>
                              <Badge color="blue" variant="light">{app.award_label}</Badge>
                            </Table.Td>
                            <Table.Td><Text fw={600} size="sm">{app.roll_no}</Text></Table.Td>
                            <Table.Td>{app.student_name}</Table.Td>
                            <Table.Td>{app.programme}</Table.Td>
                            <Table.Td>{app.branch}</Table.Td>
                            <Table.Td>
                              <Badge variant="gradient" gradient={{ from: "teal", to: "blue" }}>
                                {app.cpi}
                              </Badge>
                            </Table.Td>
                            <Table.Td><Text size="xs" c="dimmed">{app.created_at}</Text></Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                )}
              </Stack>
            </Tabs.Panel>

          </Box>
        </Tabs>
      </Card>

      {/* Generation Result Modal */}
      <Modal
        opened={genModal}
        onClose={() => setGenModal(false)}
        title={<Group gap="xs"><IconCircleCheck color="green" /><Text fw={700}>Awards Generated!</Text></Group>}
        centered radius="lg"
      >
        {genResult && (
          <Stack gap="sm">
            <Text size="sm">
              Generated <b>{genResult.generated}</b> award entries for batch <b>{genResult.batch}</b>.
            </Text>
            <Alert color="blue" variant="light" icon={<IconClipboardList />}>
              The committee process is offline. Export the data and share with the committee for final decisions.
            </Alert>
            <Button fullWidth mt="md" color="blue" leftSection={<IconDownload size={16} />} onClick={() => { onExportAutoAwards(); setGenModal(false); }}>
              Export Now
            </Button>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

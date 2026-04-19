import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
  Alert,
  Loader,
  Paper,
  Divider,
} from "@mantine/core";
import {
  IconRefresh,
  IconAlertCircle,
  IconSchool,
  IconUsers,
  IconListDetails,
} from "@tabler/icons-react";

import {
  getConvenorMcmMeritList,
  getMCMApplications,
  getSingleParentApplications,
  updateMCMLinkApplication,
  updateSingleParentApplication,
  generateMeritList as apiGenerateMeritList
} from "../services/scholarshipAPI";
import { STATUS, STATUS_COLORS, STATUS_LABELS, normalizeStatus } from "../constants/status";

const statusBadge = (status) => {
  const normalized = normalizeStatus(status);
  return <Badge color={STATUS_COLORS[normalized] || "gray"} variant="light" size="sm">{STATUS_LABELS[normalized] || normalized}</Badge>;
};

export default function SPACSConvenorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionKey, setActionKey] = useState("");

  const [mcmApps, setMcmApps] = useState([]);
  const [spApps, setSpApps] = useState([]);
  const [meritRows, setMeritRows] = useState([]);

  const [activeTab, setActiveTab] = useState("mcm-review");
  const [mcmFilter, setMcmFilter] = useState("verified");
  const [spFilter, setSpFilter] = useState("verified");

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [generationBatch, setGenerationBatch] = useState("all");
  const [generating, setGenerating] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const mcmStatusFilter = mcmFilter !== "all" ? mcmFilter : "";
      const spStatusFilter = spFilter !== "all" ? spFilter : "";

      const [mcmRes, spRes, meritRes] = await Promise.all([
        getMCMApplications({ status: mcmStatusFilter }).catch(e => { console.error("MCM fetch fail:", e); return { data: [] }; }),
        getSingleParentApplications({ status: spStatusFilter }).catch(e => { console.error("SP fetch fail:", e); return { data: [] }; }),
        getConvenorMcmMeritList().catch(e => { console.error("Merit fetch fail:", e); return { data: [] }; })
      ]);

      const mcmData = Array.isArray(mcmRes?.data) ? mcmRes.data : mcmRes?.data?.results || [];
      const spData = Array.isArray(spRes?.data) ? spRes.data : spRes?.data?.results || [];
      const meritData = Array.isArray(meritRes?.data) ? meritRes.data : meritRes?.data?.results || [];

      setMcmApps(mcmData);
      setSpApps(spData);
      setMeritRows(meritData);
    } catch (fetchError) {
      setError("An unexpected error occurred while loading dashboard data. Please try again.");
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [mcmFilter, spFilter]);

  const takeDecision = async (type, appId, nextStatus) => {
    const actionId = `${type}-${appId}-${nextStatus}`;
    setActionKey(actionId);

    try {
      const payload = { status: nextStatus };
      if (type === "MCM") {
        await updateMCMLinkApplication(appId, payload);
        setMcmApps((prev) => prev.map(app => app.id === appId ? { ...app, status: nextStatus } : app));
      } else {
        await updateSingleParentApplication(appId, payload);
        setSpApps((prev) => prev.map(app => app.id === appId ? { ...app, status: nextStatus } : app));
      }
    } catch (actionError) {
      const msg = actionError?.response?.data?.detail || actionError?.response?.data?.error || "Failed to update application.";
      window.alert(msg);
    } finally {
      setActionKey("");
    }
  };

  const handleGenerateMeritList = async () => {
    if (!generationBatch) {
      window.alert("Select a batch first.");
      return;
    }

    setGenerating(true);
    try {
      const res = await apiGenerateMeritList({
        application_type: "MCM",
        batch: generationBatch
      });
      window.alert(res.data?.message || "Success");
      const meritRes = await getConvenorMcmMeritList();
      setMeritRows(Array.isArray(meritRes?.data) ? meritRes.data : meritRes?.data?.results || []);
    } catch (err) {
      window.alert(err?.response?.data?.error || "Error generating merit list.");
    } finally {
      setGenerating(false);
    }
  };

  const filteredMcm = useMemo(() => {
    return mcmApps.filter(app => {
      const bMatch = selectedBatch ? String(app.batch) === selectedBatch : true;
      const rMatch = selectedBranch ? String(app.programme || "").toUpperCase().includes(selectedBranch.toUpperCase()) : true;
      return bMatch && rMatch;
    });
  }, [mcmApps, selectedBatch, selectedBranch]);

  const filteredSp = useMemo(() => {
    return spApps.filter(app => {
      const bMatch = selectedBatch ? String(app.batch) === selectedBatch : true;
      return bMatch;
    });
  }, [spApps, selectedBatch]);

  const filteredMerit = useMemo(() => {
    return meritRows.filter((row) => {
      const bMatch = selectedBatch ? String(row.batch) === selectedBatch : true;
      const rMatch = selectedBranch ? String(row.branch) === selectedBranch : true;
      return bMatch && rMatch;
    });
  }, [meritRows, selectedBatch, selectedBranch]);

  const batchList = ["2023", "2024", "2025", "2026"];
  const branchList = ["B.Tech CSE", "B.Tech ECE", "B.Tech EE", "B.Tech ME", "B.Tech SM", "B.Des"];

  if (loading) {
    return (
      <Stack align="center" py={120}>
        <Loader size="xl" variant="bars" color="blue" />
        <Text fw={500} c="dimmed">Synchronizing administrative data...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <Paper p="xl" radius="md" withBorder shadow="sm" style={{ background: "linear-gradient(135deg, #15abff08 0%, #15abff15 100%)", borderColor: "#15abff55" }}>
        <Group justify="space-between" align="center">
          <Stack gap={0}>
            <Title order={2} style={{ color: "#1a1a2e", letterSpacing: "-0.5px" }}>Scholarship Oversight Command</Title>
            <Text size="sm" c="dimmed">Manage MCM and Single Parent scholarship applications and verified rosters.</Text>
          </Stack>
          <Button variant="white" color="blue" leftSection={<IconRefresh size={16} />} onClick={fetchDashboardData} shadow="xs">Refresh Operations</Button>
        </Group>
      </Paper>

      <Tabs variant="pills" color="blue" radius="xl" value={activeTab} onChange={setActiveTab}>
        <Group justify="space-between" mb="md">
          <Tabs.List>
            <Tabs.Tab value="mcm-review" leftSection={<IconSchool size={16} />}>MCM Review</Tabs.Tab>
            <Tabs.Tab value="sp-review" leftSection={<IconUsers size={16} />}>Single Parent Review</Tabs.Tab>
            <Tabs.Tab value="merit-list" leftSection={<IconListDetails size={16} />}>Merit Rosters</Tabs.Tab>
          </Tabs.List>
          
          <Group gap="sm">
            <Select placeholder="Filter Batch" size="xs" w={120} clearable data={batchList} value={selectedBatch} onChange={setSelectedBatch} />
            <Select placeholder="Filter Branch" size="xs" w={150} clearable data={branchList} value={selectedBranch} onChange={setSelectedBranch} />
          </Group>
        </Group>

        <Divider mb="xl" />

        <Tabs.Panel value="mcm-review" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Verification Queue</Title>
              <Select
                size="xs"
                w={180}
                data={[
                  { value: "verified", label: "Pending Convenor" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                  { value: "all", label: "All Records" }
                ]}
                value={mcmFilter}
                onChange={v => setMcmFilter(v || "verified")}
              />
            </Group>

            {filteredMcm.length === 0 ? (
              <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">No MCM records found for the current selection.</Alert>
            ) : (
              <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                <Table striped highlightOnHover verticalSpacing="sm">
                  <Table.Thead bg="gray.1">
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Roll No</Table.Th>
                      <Table.Th>Branch/Year</Table.Th>
                      <Table.Th>Merit Stat</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th ta="right">Review</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredMcm.map(app => (
                      <Table.Tr key={app.id}>
                        <Table.Td><Text size="sm" fw={600}>{app.student_full_name}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{app.roll_no}</Text></Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            <Badge variant="dot" color="blue" size="sm">{app.programme}</Badge>
                            <Text size="xs" fw={700}>{app.batch}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" fw={700} c="blue">
                            {app.batch === "2026" ? `Rank: ${app.jee_uceed_rank || "NA"}` : `CPI: ${app.current_cpi || "0.0"}`}
                          </Text>
                        </Table.Td>
                        <Table.Td>{statusBadge(app.status)}</Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="flex-end">
                            {normalizeStatus(app.status) === "verified" ? (
                              <>
                                <Button variant="light" color="green" size="compact-xs" loading={actionKey === `MCM-${app.id}-${STATUS.APPROVED}`} onClick={() => takeDecision("MCM", app.id, STATUS.APPROVED)}>Approve</Button>
                                <Button variant="light" color="red" size="compact-xs" loading={actionKey === `MCM-${app.id}-${STATUS.REJECTED}`} onClick={() => takeDecision("MCM", app.id, STATUS.REJECTED)}>Reject</Button>
                              </>
                            ) : (
                              <Text size="xs" c="dimmed">Finalized</Text>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="sp-review" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Single Parent Roster</Title>
              <Select
                size="xs"
                w={180}
                data={[
                  { value: "verified", label: "Pending Approval" },
                  { value: "approved", label: "Approved Recipients" },
                  { value: "rejected", label: "Rejected" },
                  { value: "all", label: "All Applicants" }
                ]}
                value={spFilter}
                onChange={v => setSpFilter(v || "verified")}
              />
            </Group>

            {filteredSp.length === 0 ? (
              <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">No applications match the current criteria.</Alert>
            ) : (
              <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                <Table striped highlightOnHover verticalSpacing="sm">
                  <Table.Thead bg="gray.1">
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Roll No</Table.Th>
                      <Table.Th>Batch</Table.Th>
                      <Table.Th>CPI</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th ta="right">Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredSp.map(app => (
                      <Table.Tr key={app.id}>
                        <Table.Td><Text size="sm" fw={600}>{app.student_full_name}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{app.roll_no}</Text></Table.Td>
                        <Table.Td><Badge color="gray" variant="outline" size="sm">{app.batch}</Badge></Table.Td>
                        <Table.Td><Text size="sm" fw={700}>{app.current_cpi || "0.0"}</Text></Table.Td>
                        <Table.Td>{statusBadge(app.status)}</Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="flex-end">
                            {normalizeStatus(app.status) === "verified" ? (
                              <>
                                <Button color="green" size="compact-xs" loading={actionKey === `SP-${app.id}-${STATUS.APPROVED}`} onClick={() => takeDecision("SP", app.id, STATUS.APPROVED)}>Grant</Button>
                                <Button color="red" variant="light" size="compact-xs" loading={actionKey === `SP-${app.id}-${STATUS.REJECTED}`} onClick={() => takeDecision("SP", app.id, STATUS.REJECTED)}>Reject</Button>
                              </>
                            ) : (
                               <Text size="xs" c="dimmed">Closed</Text>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="merit-list" pt="md">
          <Stack gap="xl">
            <Card withBorder radius="md" p="lg" shadow="sm">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4}>
                    <Text fw={700} size="lg">MCM Merit Generator</Text>
                    <Text size="xs" c="dimmed">Automated selection of top 10% students by batch and branch.</Text>
                  </Stack>
                  <Badge color="blue" variant="filled" size="lg">10% Cutoff Rule Active</Badge>
                </Group>
                
                <Paper withBorder bg="gray.1" p="md" radius="md">
                  <Group align="flex-end" grow>
                    <Select
                      label="Operation Scope"
                      description="Select 'all' to sync all lists or pick a batch"
                      data={[
                        { value: "all", label: "Full Refresh (All Batches)" },
                        { value: "2023", label: "Batch 2023 Only" },
                        { value: "2024", label: "Batch 2024 Only" },
                        { value: "2025", label: "Batch 2025 Only" },
                        { value: "2026", label: "Batch 2026 Only" },
                      ]}
                      value={generationBatch}
                      onChange={v => setGenerationBatch(v || "all")}
                    />
                    <Button 
                      color="blue" 
                      size="md"
                      loading={generating} 
                      onClick={handleGenerateMeritList} 
                      leftSection={<IconRefresh size={18} />}
                    >
                      {generationBatch === "all" ? "Regenerate Everything" : `Refresh Batch ${generationBatch}`}
                    </Button>
                  </Group>
                </Paper>
              </Stack>
            </Card>

            <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
              <Table striped highlightOnHover verticalSpacing="sm">
                <Table.Thead bg="blue.0">
                  <Table.Tr>
                    <Table.Th>Batch</Table.Th>
                    <Table.Th>Branch</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Roll No</Table.Th>
                    <Table.Th>Merit Score</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredMerit.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={5} ta="center" py="xl"><Text c="dimmed">No merit records found for current filters.</Text></Table.Td></Table.Tr>
                  ) : (
                    filteredMerit.map(row => (
                      <Table.Tr key={row.id}>
                        <Table.Td><Badge color="indigo" variant="light">{row.batch}</Badge></Table.Td>
                        <Table.Td><Text size="sm">{row.branch}</Text></Table.Td>
                        <Table.Td><Text size="sm" fw={500}>{row.full_name}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{row.roll_no}</Text></Table.Td>
                        <Table.Td>
                          <Text fw={700} color="blue" size="sm">
                            {row.batch === "2026" ? `Rank: ${row.cpi || "N/A"}` : `CPI: ${row.cpi || "N/A"}`}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Paper>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

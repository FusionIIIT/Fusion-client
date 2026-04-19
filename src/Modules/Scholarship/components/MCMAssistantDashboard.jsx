import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Grid,
  Group,
  Modal,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
  Paper,
  ThemeIcon,
  ActionIcon,
  Tooltip,
  Divider,
  SimpleGrid,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconEye,
  IconFolder,
  IconSchool,
  IconUsers,
  IconRefresh,
  IconCheck,
  IconX,
  IconExternalLink,
  IconAlertCircle,
  IconCalendar,
} from "@tabler/icons-react";

import {
  getMCMApplications,
  getSingleParentApplications,
  updateMCMLinkApplication,
  updateSingleParentApplication,
} from "../services/scholarshipAPI";
import { STATUS, STATUS_COLORS, STATUS_LABELS, normalizeStatus } from "../constants/status";
import classes from "../../Dashboard/Dashboard.module.css";

const FUSION_BLUE = "#15abff";
const FUSION_BLUE_LIGHT = "#15abff13";

const STATUS_FILTERS = [STATUS.PENDING, STATUS.VERIFIED, STATUS.REVERTED, STATUS.APPROVED, STATUS.REJECTED];
const BATCH_OPTIONS = [
  { value: "2023", short: "Batch 23", long: "Batch 2023" },
  { value: "2024", short: "Batch 24", long: "Batch 2024" },
  { value: "2025", short: "Batch 25", long: "Batch 2025" },
  { value: "2026", short: "Batch 26", long: "Batch 2026" },
];

function getStatusBadge(status) {
  const normalized = normalizeStatus(status);
  return (
    <Badge color={STATUS_COLORS[normalized] || "gray"} variant="light" size="sm">
      {STATUS_LABELS[normalized] || normalized}
    </Badge>
  );
}

function getDocumentRows(app, selectedType) {
  if (selectedType === "MCM") {
    return [
      { label: "Questionnaire Form", link: app?.questionnaire_cum_application_link },
      { label: "Form A/B", link: app?.form_ab_link },
      { label: "Form D", link: app?.form_d_link },
      { label: "Father Income", link: app?.father_income_certificate_link },
      { label: "Mother Income", link: app?.mother_income_certificate_link },
      { label: "Caste Certificate", link: app?.caste_certificate_link },
      { label: "JEE/UCEED Rank Card", link: app?.jee_uceed_scorecard_link },
      { label: "Undertaking Form", link: app?.undertaking_form_link },
    ];
  }

  return [
    { label: "Caste/Category Certificate", link: app?.caste_certificate },
    { label: "Undertaking Form", link: app?.undertaking_form },
    { label: "Death Certificate", link: app?.death_certificate },
    { label: "Affidavit (No Earning Member)", link: app?.affidavit_no_earning_member },
  ];
}

function SelectionCard({ title, subtitle, icon: Icon, onClick, color = "blue" }) {
  return (
    <Paper
      withBorder
      p="xl"
      radius="md"
      onClick={onClick}
      className={classes.selectionCard}
      style={{
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Stack align="center" gap="md">
        <ThemeIcon size={64} radius="xl" variant="light" color={color}>
          <Icon size={32} />
        </ThemeIcon>
        <Stack align="center" gap={4}>
          <Title order={4} ta="center">{title}</Title>
          <Text size="sm" c="dimmed" ta="center" px="md">
            {subtitle}
          </Text>
        </Stack>
      </Stack>
      <Button variant="light" color={color} fullWidth mt="xl" radius="md">
        Manage Applications
      </Button>
    </Paper>
  );
}

export default function MCMAssistantDashboard() {
  const [mcmApplications, setMcmApplications] = useState([]);
  const [singleParentApplications, setSingleParentApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedType, setSelectedType] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [statusFilter, setStatusFilter] = useState(STATUS.PENDING);

  const [previewApp, setPreviewApp] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [revertTarget, setRevertTarget] = useState(null);
  const [revertReason, setRevertReason] = useState("");
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchApplications = async () => {
    if (!selectedType || !selectedBatch) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = { status: statusFilter, batch: selectedBatch };

      if (selectedType === "MCM") {
        const mcmRes = await getMCMApplications(params);
        const mcmData = Array.isArray(mcmRes?.data) ? mcmRes.data : mcmRes?.data?.results || [];
        setMcmApplications(mcmData);
      } else {
        const spRes = await getSingleParentApplications(params);
        const spData = Array.isArray(spRes?.data) ? spRes.data : spRes?.data?.results || [];
        setSingleParentApplications(spData);
      }
    } catch (fetchError) {
      setError(fetchError?.response?.data?.detail || "Failed to load scholarship applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedType, selectedBatch, statusFilter]);

  const activeApplications = useMemo(() => {
    if (selectedType === "MCM") return mcmApplications;
    if (selectedType === "SINGLE_PARENT") return singleParentApplications;
    return [];
  }, [mcmApplications, selectedType, singleParentApplications]);

  const filteredApplications = useMemo(() => {
    return activeApplications.filter(
      (app) => String(app?.batch || "").trim() === String(selectedBatch || "").trim() && normalizeStatus(app?.status) === statusFilter
    );
  }, [activeApplications, selectedBatch, statusFilter]);



  const updateApplicationStatus = async (app, nextStatus, reason = "") => {
    const type = selectedType;
    const appId = app?.id;
    if (!type || !appId) return;

    if (nextStatus === STATUS.REVERTED && !reason.trim()) {
      window.alert("Please provide a reason for reversion.");
      return;
    }

    const actionId = `${type}-${appId}-${nextStatus}`;
    setActionLoadingId(actionId);

    try {
      const payload = { status: nextStatus };
      if (nextStatus === STATUS.REVERTED) {
        payload.revert_reason = reason.trim();
      }

      if (type === "MCM") {
        await updateMCMLinkApplication(appId, payload);
      } else {
        await updateSingleParentApplication(appId, payload);
      }

      setIsRevertModalOpen(false);
      setRevertTarget(null);
      setRevertReason("");
      
      // Auto-refetch to ensure state is synchronized
      await fetchApplications();
    } catch (updateError) {
      const msg = updateError?.response?.data?.detail || updateError?.response?.data?.error || "Update operation failed.";
      window.alert(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getMeritDisplay = (app) => {
    if (selectedType === "MCM" && String(app?.batch) === "2026") {
      return `Rank: ${app?.jee_uceed_rank || "NA"}`;
    }
    return `CPI: ${app?.current_cpi || "0.0"}`;
  };



  if (error) {
    return (
      <Alert color="red" icon={<IconAlertCircle size={16} />}>
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      {!selectedType && (
        <Stack gap="xl">
          <Paper p="xl" radius="md" withBorder style={{ backgroundColor: FUSION_BLUE_LIGHT, borderColor: FUSION_BLUE }}>
            <Group justify="space-between" align="center">
              <Stack gap={0}>
                <Title order={2} style={{ color: "#1a1a2e" }}>Assistant Dashboard</Title>
                <Text size="sm" c="dimmed">Batch-wise scholarship verification and merit operations.</Text>
              </Stack>
            </Group>
          </Paper>

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <SelectionCard
                title="MCM Scholarship"
                subtitle="Verify MCM applications by batch and branch."
                icon={IconSchool}
                color="blue"
                onClick={() => {
                  setSelectedType("MCM");
                  setSelectedBatch(null);
                  setStatusFilter(STATUS.PENDING);
                  setMeritMessage("");
                  setMeritPreview([]);
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <SelectionCard
                title="Single Parent Scholarship"
                subtitle="Review Single Parent applications by batch."
                icon={IconUsers}
                color="teal"
                onClick={() => {
                  setSelectedType("SINGLE_PARENT");
                  setSelectedBatch(null);
                  setStatusFilter(STATUS.PENDING);
                }}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      )}

      {selectedType && (
        <Stack gap="md">
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" align="center" wrap="wrap">
              <Group>
                <ActionIcon
                  variant="light"
                  color="gray"
                  size="lg"
                  onClick={() => {
                    setSelectedType(null);
                    setSelectedBatch(null);
                  }}
                >
                  <IconArrowLeft size={18} />
                </ActionIcon>
                <Stack gap={0}>
                  <Title order={4} style={{ color: "#1a1a2e" }}>
                    {selectedType === "MCM" ? "MCM Applications" : "Single Parent Applications"}
                  </Title>
                  <Text size="xs" c="dimmed">
                    {selectedBatch ? `Viewing ${selectedBatch} • ${STATUS_LABELS[statusFilter]}` : "Select a batch to continue"}
                  </Text>
                </Stack>
              </Group>

              <Button
                variant="light"
                leftSection={<IconRefresh size={14} />}
                onClick={fetchApplications}
                disabled={!selectedBatch}
                loading={loading}
              >
                Refresh
              </Button>
            </Group>
          </Paper>

          <Paper p="md" radius="md" withBorder>
            <Stack gap="sm">
              <Group gap="xs">
                <ThemeIcon color="blue" variant="light" size="sm">
                  <IconCalendar size={14} />
                </ThemeIcon>
                <Text fw={600} size="sm">Select Batch</Text>
              </Group>
              <Group gap="xs" wrap="wrap">
                {BATCH_OPTIONS.map((batch) => (
                  <Button
                    key={batch.value}
                    size="xs"
                    variant={selectedBatch === batch.value ? "filled" : "light"}
                    color={selectedBatch === batch.value ? "blue" : "gray"}
                    onClick={() => {
                      setSelectedBatch(batch.value);
                    }}
                    radius="xl"
                  >
                    {batch.short}
                  </Button>
                ))}
              </Group>
            </Stack>
          </Paper>

          {selectedBatch && (
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" wrap="wrap">
                <Group gap="xs">
                  {STATUS_FILTERS.map((status) => (
                    <Button
                      key={status}
                      size="xs"
                      variant={statusFilter === status ? "filled" : "light"}
                      color={statusFilter === status ? "blue" : "gray"}
                      onClick={() => {
                        setStatusFilter(status);
                      }}
                      radius="xl"
                    >
                      {STATUS_LABELS[status]}
                    </Button>
                  ))}
                </Group>
              </Group>
            </Paper>
          )}

          {!selectedBatch && (
            <Alert color="blue" icon={<IconAlertCircle size={16} />}>
              Select one of the four batches to view and process applications.
            </Alert>
          )}

          {selectedBatch && (
            <Paper radius="md" withBorder style={{ overflow: "hidden" }}>
              {loading ? (
                <Stack align="center" py={50}>
                  <IconRefresh size={36} className={classes.rotate} style={{ color: FUSION_BLUE }} />
                  <Text fw={600} c="dimmed">Loading applications...</Text>
                </Stack>
              ) : (
                <Table striped highlightOnHover verticalSpacing="sm">
                  <Table.Thead style={{ backgroundColor: "#f8f9fa" }}>
                    <Table.Tr>
                      <Table.Th>Roll No.</Table.Th>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Batch</Table.Th>
                      <Table.Th>CPI</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th ta="right">Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredApplications.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={6} py={40}>
                          <Stack align="center" gap={4}>
                            <IconFolder size={32} color="#dee2e6" />
                            <Text c="dimmed" size="sm">
                              No {STATUS_LABELS[statusFilter]} applications found for {selectedBatch}.
                            </Text>
                          </Stack>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filteredApplications.map((app) => {
                        const status = normalizeStatus(app?.status);
                        const isPending = status === STATUS.PENDING;
                        return (
                          <Table.Tr key={app.id}>
                            <Table.Td><Text size="sm" fw={500}>{app?.roll_no || "N/A"}</Text></Table.Td>
                            <Table.Td><Text size="sm">{app?.student_full_name || "N/A"}</Text></Table.Td>
                            <Table.Td><Badge variant="outline" color="gray" size="sm">{app?.batch || "N/A"}</Badge></Table.Td>
                            <Table.Td>
                              <Text size="sm" fw={700} c={String(app?.batch) === "2026" ? "indigo" : "blue"}>
                                {getMeritDisplay(app)}
                              </Text>
                            </Table.Td>
                            <Table.Td>{getStatusBadge(app?.status)}</Table.Td>
                            <Table.Td>
                              <Group gap={8} justify="flex-end">
                                <Tooltip label="Review Full Details">
                                  <ActionIcon variant="light" color="blue" onClick={() => { setPreviewApp(app); setIsPreviewOpen(true); }}>
                                    <IconEye size={18} />
                                  </ActionIcon>
                                </Tooltip>
                                {isPending && (
                                  <>
                                    <Tooltip label="Verify & Forward to Convenor">
                                      <ActionIcon
                                        variant="filled"
                                        color="green"
                                        loading={actionLoadingId === `${selectedType}-${app.id}-${STATUS.VERIFIED}`}
                                        onClick={() => updateApplicationStatus(app, STATUS.VERIFIED)}
                                      >
                                        <IconCheck size={18} />
                                      </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Revert to Student">
                                      <ActionIcon
                                        variant="filled"
                                        color="orange"
                                        loading={actionLoadingId === `${selectedType}-${app.id}-${STATUS.REVERTED}`}
                                        onClick={() => { setRevertTarget(app); setRevertReason(""); setIsRevertModalOpen(true); }}
                                      >
                                        <IconArrowLeft size={18} />
                                      </ActionIcon>
                                    </Tooltip>
                                  </>
                                )}
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    )}
                  </Table.Tbody>
                </Table>
              )}
            </Paper>
          )}
        </Stack>
      )}

      <Modal opened={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={<Text fw={700}>Application Details</Text>} size="lg" radius="md">
        {previewApp ? (
          <Stack gap="lg">
            <Paper withBorder p="md" radius="md" style={{ backgroundColor: "#f8f9fa" }}>
              <SimpleGrid cols={2}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Student Name</Text>
                  <Text fw={600}>{previewApp?.student_full_name || "N/A"}</Text>
                </Stack>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Roll Number</Text>
                  <Text fw={600}>{previewApp?.roll_no || "N/A"}</Text>
                </Stack>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Academic Batch</Text>
                  <Text fw={600}>{previewApp?.batch || "N/A"}</Text>
                </Stack>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Current CPI</Text>
                  <Text fw={600} c="blue">{previewApp?.current_cpi || "N/A"}</Text>
                </Stack>
              </SimpleGrid>
            </Paper>

            <Divider label="Status & Timeline" labelPosition="center" />

            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Text size="sm" fw={600}>Current Status:</Text>
                {getStatusBadge(previewApp?.status)}
              </Group>
              <Text size="xs" c="dimmed">Submitted: {new Date(previewApp?.submitted_at || Date.now()).toLocaleDateString()}</Text>
            </Group>

            {previewApp?.revert_reason && (
              <Alert color="orange" icon={<IconAlertCircle size={16} />} radius="md">
                <Text size="sm" fw={500}>Revert Reason:</Text>
                <Text size="sm">{previewApp.revert_reason}</Text>
              </Alert>
            )}

            <Divider label="Supporting Documents" labelPosition="center" />

            <Stack gap="xs">
              {getDocumentRows(previewApp, selectedType).map(({ label, link }) => (
                <Paper key={label} withBorder px="md" py="xs" radius="md" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text size="sm" fw={500}>{label}</Text>
                  {link ? (
                    <Button component="a" href={link} target="_blank" size="compact-xs" variant="light" rightSection={<IconExternalLink size={12} />}>
                      View
                    </Button>
                  ) : (
                    <Text size="xs" c="dimmed">Not provided</Text>
                  )}
                </Paper>
              ))}
            </Stack>

            {normalizeStatus(previewApp?.status) === STATUS.PENDING && (
              <Group grow mt="md">
                <Button
                  color="blue"
                  onClick={() => { updateApplicationStatus(previewApp, STATUS.VERIFIED); setIsPreviewOpen(false); }}
                  leftSection={<IconCheck size={16} />}
                >
                  Verify Now
                </Button>
                <Button
                  variant="light"
                  color="orange"
                  onClick={() => { setRevertTarget(previewApp); setRevertReason(""); setIsRevertModalOpen(true); setIsPreviewOpen(false); }}
                  leftSection={<IconArrowLeft size={16} />}
                >
                  Revert Back
                </Button>
              </Group>
            )}
          </Stack>
        ) : null}
      </Modal>

      <Modal opened={isRevertModalOpen} onClose={() => setIsRevertModalOpen(false)} title={<Text fw={700}>Revert Application</Text>} radius="md">
        <Stack>
          <Textarea
            label="Reason for Reversion"
            description="Clearly explain what the student needs to correct in their application."
            placeholder="e.g. Income certificate is expired, Form D missing signature..."
            value={revertReason}
            onChange={(e) => setRevertReason(e.target.value)}
            minRows={4}
            required
            autoFocus
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setIsRevertModalOpen(false)}>Cancel</Button>
            <Button
              color="orange"
              onClick={() => updateApplicationStatus(revertTarget, STATUS.REVERTED, revertReason)}
              leftSection={<IconX size={16} />}
            >
              Confirm Revert
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

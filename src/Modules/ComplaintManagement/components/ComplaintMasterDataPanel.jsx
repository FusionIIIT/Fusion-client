import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  createCaretaker,
  createSupervisor,
  createWorker,
  deleteCaretaker,
  deleteSupervisor,
  deleteWorker,
  fetchCaretakers,
  fetchSupervisors,
  fetchWorkers,
  updateCaretaker,
  updateSupervisor,
  updateWorker,
} from "../services";
import classes from "../ComplaintManagement.module.css";

const AREA_OPTIONS = [
  "hall-1",
  "hall-3",
  "hall-4",
  "library",
  "computer center",
  "core_lab",
  "LHTC",
  "NR2",
  "NR3",
  "Admin building",
  "Rewa_Residency",
  "Maa Saraswati Hostel",
  "Nagarjun Hostel",
  "Panini Hostel",
].map((value) => ({ value, label: value }));

const TYPE_OPTIONS = [
  "Electricity",
  "carpenter",
  "plumber",
  "garbage",
  "dustbin",
  "internet",
  "other",
].map((value) => ({ value, label: value }));

const getApiErrorMessage = (error, fallback) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data) {
    return JSON.stringify(error.response.data);
  }

  return error?.message || fallback;
};

const toNullableInt = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return Number(value);
};

export default function ComplaintMasterDataPanel({ normalizedRole }) {
  const [workers, setWorkers] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeEntity, setActiveEntity] = useState("workers");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("create");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form, setForm] = useState({});

  const canManageWorkers =
    normalizedRole.includes("caretaker") ||
    normalizedRole.includes("admin") ||
    normalizedRole.includes("superuser");
  const canManageCaretakers =
    normalizedRole.includes("supervisor") ||
    normalizedRole.includes("admin") ||
    normalizedRole.includes("superuser") ||
    normalizedRole.includes("convener");
  const canManageSupervisors =
    normalizedRole.includes("admin") || normalizedRole.includes("superuser");

  const capabilityLabel = useMemo(() => {
    if (activeEntity === "workers") {
      return canManageWorkers;
    }
    if (activeEntity === "caretakers") {
      return canManageCaretakers;
    }
    return canManageSupervisors;
  }, [
    activeEntity,
    canManageCaretakers,
    canManageSupervisors,
    canManageWorkers,
  ]);

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [workersData, caretakersData, supervisorsData] = await Promise.all([
        fetchWorkers(),
        fetchCaretakers(),
        fetchSupervisors(),
      ]);
      setWorkers(workersData);
      setCaretakers(caretakersData);
      setSupervisors(supervisorsData);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Failed to load master data",
        message: getApiErrorMessage(
          error,
          "Could not load workers/caretakers/supervisors.",
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const openCreate = (entity) => {
    setActiveEntity(entity);
    setEditorMode("create");
    setSelectedRecord(null);

    if (entity === "workers") {
      setForm({
        secincharge_id: "",
        name: "",
        age: "",
        phone: "",
        worker_type: "internet",
      });
    } else if (entity === "caretakers") {
      setForm({ staff_id: "", area: "hall-3", rating: 0, myfeedback: "" });
    } else {
      setForm({ sup_id: "", type: "Electricity", area: "" });
    }

    setEditorOpen(true);
  };

  const openEdit = (entity, record) => {
    setActiveEntity(entity);
    setEditorMode("edit");
    setSelectedRecord(record);

    if (entity === "workers") {
      setForm({
        secincharge_id: record.secincharge_id ?? "",
        name: record.name ?? "",
        age: record.age ?? "",
        phone: record.phone ?? "",
        worker_type: record.worker_type ?? "internet",
      });
    } else if (entity === "caretakers") {
      setForm({
        staff_id: record.staff_id ?? "",
        area: record.area ?? "hall-3",
        rating: record.rating ?? 0,
        myfeedback: record.myfeedback ?? "",
      });
    } else {
      setForm({
        sup_id: record.sup_id ?? "",
        type: record.type ?? "Electricity",
        area: record.area ?? "",
      });
    }

    setEditorOpen(true);
  };

  const handleDelete = async (entity, id) => {
    try {
      if (entity === "workers") {
        await deleteWorker(id);
      } else if (entity === "caretakers") {
        await deleteCaretaker(id);
      } else {
        await deleteSupervisor(id);
      }

      notifications.show({
        color: "green",
        title: "Deleted",
        message: `${entity.slice(0, -1)} ${id} deleted successfully`,
      });
      await loadMasterData();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Delete failed",
        message: getApiErrorMessage(error, "Could not delete this record."),
      });
    }
  };

  const handleSave = async () => {
    try {
      if (activeEntity === "workers") {
        const payload = {
          secincharge_id: toNullableInt(form.secincharge_id),
          name: String(form.name || "").trim(),
          age: String(form.age || "").trim(),
          phone: toNullableNumber(form.phone),
          worker_type: form.worker_type,
        };

        if (editorMode === "create") {
          await createWorker(payload);
        } else {
          await updateWorker(selectedRecord.id, payload);
        }
      }

      if (activeEntity === "caretakers") {
        const payload = {
          staff_id: toNullableInt(form.staff_id),
          area: form.area,
          rating: toNullableInt(form.rating) ?? 0,
          myfeedback: String(form.myfeedback || ""),
        };

        if (editorMode === "create") {
          await createCaretaker(payload);
        } else {
          await updateCaretaker(selectedRecord.id, payload);
        }
      }

      if (activeEntity === "supervisors") {
        const payload = {
          sup_id: toNullableInt(form.sup_id),
          type: form.type,
          area: String(form.area || ""),
        };

        if (editorMode === "create") {
          await createSupervisor(payload);
        } else {
          await updateSupervisor(selectedRecord.id, payload);
        }
      }

      notifications.show({
        color: "green",
        title: editorMode === "create" ? "Created" : "Updated",
        message: `${activeEntity.slice(0, -1)} record saved successfully`,
      });
      setEditorOpen(false);
      setSelectedRecord(null);
      await loadMasterData();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Save failed",
        message: getApiErrorMessage(error, "Could not save this record."),
      });
    }
  };

  return (
    <Stack gap="md">
      <Paper className={classes.oversightHeader} withBorder>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Text fw={700} className={classes.title}>
              Master Data Management
            </Text>
            <Text className={classes.subtitle}>
              Manage workers, caretakers, and supervisors using complaint API
              CRUD endpoints.
            </Text>
            <Text className={classes.statusNote}>
              Changes here impact assignment and escalation workflows across the
              module.
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="default"
              onClick={loadMasterData}
              loading={loading}
            >
              Refresh Data
            </Button>
            <Badge color={capabilityLabel ? "green" : "yellow"} variant="light">
              {capabilityLabel ? "Role can manage this tab" : "Read-only role"}
            </Badge>
          </Group>
        </Group>
      </Paper>

      <Paper withBorder p="md" className={classes.moduleCard}>
        <Tabs
          value={activeEntity}
          onChange={(value) => setActiveEntity(value || "workers")}
        >
          <Tabs.List>
            <Tabs.Tab value="workers">Workers ({workers.length})</Tabs.Tab>
            <Tabs.Tab value="caretakers">
              Caretakers ({caretakers.length})
            </Tabs.Tab>
            <Tabs.Tab value="supervisors">
              Supervisors ({supervisors.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="workers" pt="md">
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Workers</Text>
              <Button
                size="xs"
                onClick={() => openCreate("workers")}
                disabled={!canManageWorkers}
              >
                Add Worker
              </Button>
            </Group>
            <ScrollArea>
              <Table withTableBorder withColumnBorders striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Age</Table.Th>
                    <Table.Th>Phone</Table.Th>
                    <Table.Th>Section Incharge</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {workers.map((worker) => (
                    <Table.Tr key={worker.id}>
                      <Table.Td>{worker.id}</Table.Td>
                      <Table.Td>{worker.name}</Table.Td>
                      <Table.Td>{worker.worker_type}</Table.Td>
                      <Table.Td>{worker.age}</Table.Td>
                      <Table.Td>{worker.phone}</Table.Td>
                      <Table.Td>{worker.secincharge_id}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => openEdit("workers", worker)}
                            disabled={!canManageWorkers}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            onClick={() => handleDelete("workers", worker.id)}
                            disabled={!canManageWorkers}
                          >
                            Delete
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="caretakers" pt="md">
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Caretakers</Text>
              <Button
                size="xs"
                onClick={() => openCreate("caretakers")}
                disabled={!canManageCaretakers}
              >
                Add Caretaker
              </Button>
            </Group>
            <ScrollArea>
              <Table withTableBorder withColumnBorders striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Staff ID</Table.Th>
                    <Table.Th>Area</Table.Th>
                    <Table.Th>Rating</Table.Th>
                    <Table.Th>Feedback</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {caretakers.map((caretaker) => (
                    <Table.Tr key={caretaker.id}>
                      <Table.Td>{caretaker.id}</Table.Td>
                      <Table.Td>{caretaker.staff_id}</Table.Td>
                      <Table.Td>{caretaker.area}</Table.Td>
                      <Table.Td>{caretaker.rating}</Table.Td>
                      <Table.Td>{caretaker.myfeedback}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => openEdit("caretakers", caretaker)}
                            disabled={!canManageCaretakers}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            onClick={() =>
                              handleDelete("caretakers", caretaker.id)
                            }
                            disabled={!canManageCaretakers}
                          >
                            Delete
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="supervisors" pt="md">
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Supervisors</Text>
              <Button
                size="xs"
                onClick={() => openCreate("supervisors")}
                disabled={!canManageSupervisors}
              >
                Add Supervisor
              </Button>
            </Group>
            <ScrollArea>
              <Table withTableBorder withColumnBorders striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Supervisor ID</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Area</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {supervisors.map((supervisor) => (
                    <Table.Tr key={supervisor.id}>
                      <Table.Td>{supervisor.id}</Table.Td>
                      <Table.Td>{supervisor.sup_id}</Table.Td>
                      <Table.Td>{supervisor.type}</Table.Td>
                      <Table.Td>{supervisor.area || "all-areas"}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => openEdit("supervisors", supervisor)}
                            disabled={!canManageSupervisors}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            onClick={() =>
                              handleDelete("supervisors", supervisor.id)
                            }
                            disabled={!canManageSupervisors}
                          >
                            Delete
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Modal
        opened={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={`${editorMode === "create" ? "Create" : "Edit"} ${activeEntity.slice(0, -1)}`}
        centered
      >
        <Stack>
          {activeEntity === "workers" && (
            <>
              <NumberInput
                label="Section Incharge ID"
                value={form.secincharge_id}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, secincharge_id: value || "" }))
                }
              />
              <TextInput
                label="Name"
                value={form.name || ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    name: event.currentTarget.value,
                  }))
                }
              />
              <TextInput
                label="Age"
                value={form.age || ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    age: event.currentTarget.value,
                  }))
                }
              />
              <NumberInput
                label="Phone"
                value={form.phone}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, phone: value || "" }))
                }
              />
              <Select
                label="Worker Type"
                data={TYPE_OPTIONS}
                value={form.worker_type || "internet"}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    worker_type: value || "internet",
                  }))
                }
              />
            </>
          )}

          {activeEntity === "caretakers" && (
            <>
              <NumberInput
                label="Staff ID"
                value={form.staff_id}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, staff_id: value || "" }))
                }
              />
              <Select
                label="Area"
                data={AREA_OPTIONS}
                value={form.area || "hall-3"}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, area: value || "hall-3" }))
                }
              />
              <NumberInput
                label="Rating"
                value={form.rating}
                min={0}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, rating: value || 0 }))
                }
              />
              <TextInput
                label="Feedback"
                value={form.myfeedback || ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    myfeedback: event.currentTarget.value,
                  }))
                }
              />
            </>
          )}

          {activeEntity === "supervisors" && (
            <>
              <NumberInput
                label="Supervisor ID"
                value={form.sup_id}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, sup_id: value || "" }))
                }
              />
              <Select
                label="Complaint Type"
                data={TYPE_OPTIONS}
                value={form.type || "Electricity"}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, type: value || "Electricity" }))
                }
              />
              <Select
                label="Area (optional)"
                data={[{ value: "", label: "All Areas" }, ...AREA_OPTIONS]}
                value={form.area ?? ""}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, area: value ?? "" }))
                }
                clearable
              />
            </>
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editorMode === "create" ? "Create" : "Save"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

ComplaintMasterDataPanel.propTypes = {
  normalizedRole: PropTypes.string.isRequired,
};

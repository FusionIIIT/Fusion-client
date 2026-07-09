import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Pencil, UsersThree } from "@phosphor-icons/react";
import {
  sectionBatchesRoute,
  sectionStudentsRoute,
  assignSectionRoute,
} from "../../routes/academicRoutes";

const SECTION_OPTIONS = ["A", "B", "C", "D", "E", "F"];
const OTHER = "__OTHER__";

function SectionAssignment() {
  const [batches, setBatches] = useState([]);

  // Cascading selection: year (Batch) -> discipline -> resolved batch id.
  const [year, setYear] = useState("");
  const [discipline, setDiscipline] = useState("");

  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Modal state: editRoll null => bulk assign checked rows, else the single roll being edited.
  const [modalOpen, setModalOpen] = useState(false);
  const [editRoll, setEditRoll] = useState(null);
  const [chosenSection, setChosenSection] = useState("");
  const [otherSection, setOtherSection] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("authToken");
  const authHeader = { headers: { Authorization: `Token ${token}` } };

  // 1) Load running batches once.
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(sectionBatchesRoute, authHeader);
        setBatches(res.data || []);
      } catch (err) {
        showNotification({
          title: "Failed to load batches",
          message: err.response?.data?.detail || err.message,
          color: "red",
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Distinct years for the first dropdown.
  const yearOptions = useMemo(() => {
    const years = [...new Set(batches.map((b) => String(b.year)))];
    years.sort((a, b) => Number(b) - Number(a));
    return years.map((y) => ({ value: y, label: y }));
  }, [batches]);

  // Disciplines for the chosen year; option value is the Batch id (resolves to one batch).
  const disciplineOptions = useMemo(() => {
    if (!year) return [];
    return batches
      .filter((b) => String(b.year) === year)
      .map((b) => ({
        value: String(b.id),
        label: `${b.discipline_acronym || b.discipline_name} (${b.name})`,
      }));
  }, [batches, year]);

  // `discipline` holds the chosen Batch id (see disciplineOptions above).
  const batchId = discipline ? Number(discipline) : null;

  // 2) Fetch students whenever a concrete batch is resolved.
  useEffect(() => {
    if (!batchId) {
      setStudents([]);
      setSelected(new Set());
      return;
    }
    (async () => {
      setLoadingStudents(true);
      try {
        const res = await axios.get(sectionStudentsRoute, {
          ...authHeader,
          params: { batch_id: batchId },
        });
        setStudents(res.data || []);
        setSelected(new Set());
      } catch (err) {
        showNotification({
          title: "Failed to load students",
          message: err.response?.data?.detail || err.message,
          color: "red",
        });
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  const allChecked = students.length > 0 && selected.size === students.length;
  const someChecked = selected.size > 0 && !allChecked;

  const toggleAll = () => {
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(students.map((s) => s.roll_no)));
  };

  const toggleOne = (roll) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(roll)) next.delete(roll);
      else next.add(roll);
      return next;
    });
  };

  const openBulkModal = () => {
    if (selected.size === 0) {
      showNotification({
        title: "No students selected",
        message: "Select at least one student to assign a section.",
        color: "yellow",
      });
      return;
    }
    setEditRoll(null);
    setChosenSection("");
    setOtherSection("");
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditRoll(student.roll_no);
    const isKnown = SECTION_OPTIONS.includes(student.section);
    setChosenSection(
      student.section ? (isKnown ? student.section : OTHER) : "",
    );
    setOtherSection(isKnown ? "" : student.section || "");
    setModalOpen(true);
  };

  const submitSection = async () => {
    const section =
      chosenSection === OTHER
        ? otherSection.trim().toUpperCase()
        : chosenSection;

    if (!section) {
      showNotification({
        title: "Pick a section",
        message: "Choose A–F or enter a section under Other.",
        color: "yellow",
      });
      return;
    }
    if (!/^[A-Z]{1,2}$/.test(section)) {
      showNotification({
        title: "Invalid section",
        message: "Section must be one or two letters.",
        color: "yellow",
      });
      return;
    }

    const rollNumbers = editRoll ? [editRoll] : [...selected];
    setSaving(true);
    try {
      const res = await axios.post(
        assignSectionRoute,
        { roll_numbers: rollNumbers, section },
        authHeader,
      );
      // Update the table in place.
      setStudents((prev) =>
        prev.map((s) =>
          rollNumbers.includes(s.roll_no) ? { ...s, section } : s,
        ),
      );
      setModalOpen(false);
      setSelected(new Set());
      showNotification({
        title: "Section assigned",
        message:
          res.data?.detail || `Updated ${rollNumbers.length} student(s).`,
        color: "green",
      });
    } catch (err) {
      showNotification({
        title: "Assignment failed",
        message: err.response?.data?.detail || err.message,
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box mt="md">
      <Paper withBorder p="md" mb="md" radius="md">
        <Flex gap="md" align="flex-end" wrap="wrap">
          <Select
            label="Batch"
            placeholder="Select batch year"
            data={yearOptions}
            value={year}
            onChange={(v) => {
              setYear(v || "");
              setDiscipline("");
            }}
            searchable
            style={{ flex: 1, minWidth: 200 }}
          />
          <Select
            label="Discipline"
            placeholder={year ? "Select discipline" : "Select a batch first"}
            data={disciplineOptions}
            value={discipline}
            onChange={(v) => setDiscipline(v || "")}
            disabled={!year}
            searchable
            style={{ flex: 1, minWidth: 200 }}
          />
          <Button
            onClick={openBulkModal}
            disabled={selected.size === 0}
            leftSection={<UsersThree size={18} weight="bold" />}
            color="indigo"
            variant="filled"
            radius="md"
            size="md"
            style={{ minWidth: 190 }}
          >
            Assign Section{selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
        </Flex>
      </Paper>

      {loadingStudents ? (
        <Flex justify="center" p="xl">
          <Loader />
        </Flex>
      ) : students.length === 0 ? (
        <Text c="dimmed" ta="center" p="xl">
          {batchId
            ? "No students found for this batch and discipline."
            : "Select a batch and discipline to view students."}
        </Text>
      ) : (
        <Paper withBorder radius="md" style={{ overflowX: "auto" }}>
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 40 }}>
                  <Checkbox
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </Table.Th>
                <Table.Th style={{ width: 70 }}>S.No.</Table.Th>
                <Table.Th>Roll No.</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th style={{ width: 100 }}>Section</Table.Th>
                <Table.Th style={{ width: 80 }}>Edit</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {students.map((s) => (
                <Table.Tr key={s.roll_no}>
                  <Table.Td>
                    <Checkbox
                      checked={selected.has(s.roll_no)}
                      onChange={() => toggleOne(s.roll_no)}
                      aria-label={`Select ${s.roll_no}`}
                    />
                  </Table.Td>
                  <Table.Td>{s.sno}</Table.Td>
                  <Table.Td>{s.roll_no}</Table.Td>
                  <Table.Td>{s.name}</Table.Td>
                  <Table.Td>
                    {s.section ? (
                      <Text fw={600}>{s.section}</Text>
                    ) : (
                      <Text c="dimmed">—</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      size="xs"
                      leftSection={<Pencil size={14} />}
                      onClick={() => openEditModal(s)}
                    >
                      Edit
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editRoll
            ? `Assign section — ${editRoll}`
            : `Assign section — ${selected.size} student(s)`
        }
        centered
      >
        <Text size="sm" mb="xs">
          Choose a section
        </Text>
        <Group mb="md">
          {SECTION_OPTIONS.map((opt) => (
            <Button
              key={opt}
              variant={chosenSection === opt ? "filled" : "outline"}
              onClick={() => setChosenSection(opt)}
            >
              {opt}
            </Button>
          ))}
          <Button
            variant={chosenSection === OTHER ? "filled" : "outline"}
            onClick={() => setChosenSection(OTHER)}
          >
            Other
          </Button>
        </Group>

        {chosenSection === OTHER && (
          <TextInput
            label="Enter section"
            placeholder="e.g. G"
            value={otherSection}
            maxLength={2}
            onChange={(e) => setOtherSection(e.currentTarget.value)}
            mb="md"
          />
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submitSection} loading={saving}>
            Submit
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}

export default SectionAssignment;

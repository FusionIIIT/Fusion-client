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

  // Roll-number range for bulk select/unselect.
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");

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

  // Split a roll into its prefix + trailing number ("21BCS007" -> {21BCS, 7}).
  const parseRoll = (roll) => {
    const s = String(roll || "")
      .trim()
      .toUpperCase();
    const m = s.match(/^(.*?)(\d+)$/);
    return m
      ? { prefix: m[1], num: parseInt(m[2], 10) }
      : { prefix: s, num: NaN };
  };

  // Select/unselect listed students in [from, to]. Prefix-aware, so a
  // transferred-in student who kept a different roll prefix (e.g. 21BME015 in a
  // CSE list) is NOT matched by a numeric range.
  const applyRange = (mode) => {
    const f = parseRoll(rangeFrom);
    const t = parseRoll(rangeTo);
    if (Number.isNaN(f.num) || Number.isNaN(t.num)) {
      showNotification({
        title: "Enter a valid range",
        message: "Provide both From and To roll numbers.",
        color: "yellow",
      });
      return;
    }
    const lo = Math.min(f.num, t.num);
    const hi = Math.max(f.num, t.num);
    // Prefix from the inputs if given, else the most common prefix in the list.
    let prefix = f.prefix || t.prefix;
    if (!prefix) {
      const counts = {};
      students.forEach((s) => {
        const p = parseRoll(s.roll_no).prefix;
        counts[p] = (counts[p] || 0) + 1;
      });
      prefix =
        Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || "";
    }
    const matches = students.filter((s) => {
      const p = parseRoll(s.roll_no);
      return (
        !Number.isNaN(p.num) &&
        p.prefix === prefix &&
        p.num >= lo &&
        p.num <= hi
      );
    });
    if (matches.length === 0) {
      showNotification({
        title: "No matches",
        message: `No ${prefix || ""} students in that roll-number range.`,
        color: "yellow",
      });
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      matches.forEach((s) =>
        mode === "select" ? next.add(s.roll_no) : next.delete(s.roll_no),
      );
      return next;
    });
    showNotification({
      title: mode === "select" ? "Range selected" : "Range unselected",
      message: `${matches.length} student(s) ${mode === "select" ? "added to" : "removed from"} selection.`,
      color: mode === "select" ? "indigo" : "gray",
      autoClose: 2000,
    });
  };

  // Majority roll prefix = this discipline's native students; the rest are
  // transferred-in (kept a foreign roll prefix) and are handled as one group.
  const nativePrefix = (() => {
    const counts = {};
    students.forEach((s) => {
      const p = parseRoll(s.roll_no).prefix;
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || "";
  })();

  const transferRolls = students.filter(
    (s) => parseRoll(s.roll_no).prefix !== nativePrefix,
  );

  const applyTransfers = (mode) => {
    if (transferRolls.length === 0) return;
    setSelected((prev) => {
      const next = new Set(prev);
      transferRolls.forEach((s) =>
        mode === "select" ? next.add(s.roll_no) : next.delete(s.roll_no),
      );
      return next;
    });
    showNotification({
      title: mode === "select" ? "Transfers selected" : "Transfers unselected",
      message: `${transferRolls.length} transferred student(s) ${mode === "select" ? "added to" : "removed from"} selection.`,
      color: mode === "select" ? "orange" : "gray",
      autoClose: 2000,
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
        message: "Choose one of the listed sections, or enter one under Other.",
        color: "yellow",
      });
      return;
    }
    if (!/^[A-Z0-9]{1,8}$/.test(section)) {
      showNotification({
        title: "Invalid section",
        message: "Section can be up to 8 letters or digits.",
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

        {students.length > 0 && (
          <Flex gap="md" align="flex-end" wrap="wrap" mt="md">
            <TextInput
              label="From roll no."
              placeholder="e.g. 21BCS001 or 1"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 150 }}
            />
            <TextInput
              label="To roll no."
              placeholder="e.g. 21BCS050 or 50"
              value={rangeTo}
              onChange={(e) => setRangeTo(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 150 }}
            />
            <Button
              variant="light"
              color="indigo"
              onClick={() => applyRange("select")}
            >
              Select range
            </Button>
            <Button
              variant="light"
              color="gray"
              onClick={() => applyRange("unselect")}
            >
              Unselect range
            </Button>
            {transferRolls.length > 0 && (
              <>
                <Button
                  variant="light"
                  color="orange"
                  onClick={() => applyTransfers("select")}
                >
                  Select transfers ({transferRolls.length})
                </Button>
                <Button
                  variant="light"
                  color="gray"
                  onClick={() => applyTransfers("unselect")}
                >
                  Unselect transfers
                </Button>
              </>
            )}
          </Flex>
        )}
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
            placeholder="e.g. G, A1, CS2"
            value={otherSection}
            maxLength={8}
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

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Tabs,
  Text,
  Button,
  TextInput,
  NumberInput,
  Group,
  Stack,
  Badge,
  Table,
  ActionIcon,
  Switch,
  Select,
  MultiSelect,
  Modal,
  Divider,
  Alert,
  Loader,
  Center,
  Tooltip,
  ScrollArea,
  Paper,
  SimpleGrid,
  Box,
  SegmentedControl,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  Plus,
  Pencil,
  Trash,
  ArrowsClockwise,
  Eye,
  X,
  CheckCircle,
  Door,
  GridFour,
  Rows,
  DownloadSimple,
  Prohibit,
  Check,
  Printer,
} from "@phosphor-icons/react";
import { showNotification } from "@mantine/notifications";
import { host } from "../../routes/globalRoutes";

const BASE = `${host}/examination/api`;
const ROOMS_URL = `${BASE}/exam-rooms/`;
const SEATING_GENERATE_URL = `${BASE}/seating/generate/`;
const SEATING_LIST_URL = `${BASE}/seating/list/`;
const SEATING_EXAM_DATES_URL = `${BASE}/seating/exam-dates/`;
const TOGGLE_EXCLUDE_URL = (id) => `${BASE}/seating/${id}/toggle-exclude/`;
const ROOM_EXCLUDE_URL = `${BASE}/seating/room-exclude/`;
const SEATING_CLEAR_URL = `${BASE}/seating/clear/`;
const UNIQUE_REG_YEARS_URL = `${BASE}/unique-course-reg-years/`;
const DEFAULT_ACADEMIC_YEARS = [
  "2026-27",
  "2025-26",
  "2024-25",
  "2023-24",
  "2022-23",
  "2021-22",
  "2020-21",
];

const getToken = () => localStorage.getItem("authToken");
const authHeaders = () => ({ Authorization: `Token ${getToken()}` });
// ─── Helper: Local Date Formatter (Prevents 1-day-behind UTC timezone shift) ──
export function formatLocalDate(d) {
  if (!d) return "";
  if (typeof d === "string") return d.slice(0, 10);
  if (d instanceof Date && !isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return "";
}

// ─── Helper: Exam Capacity & Room Policies ───────────────────────────────────
// - Stepped L-rooms (L-106: 114, L-107: 68, L-206: 104, L-207: 54 seats)
// - L-rooms (16 cols): Active cols [1, 3, 6, 8, 9, 11, 14, 16] -> capacity / 2 (120 seats).
// - L-rooms no gap: L-102 (126), L-202 (126), L-201 (70)
// - CR 9x9 rooms (CR-101..104, 201, 202): Active cols [1, 3, 5, 7, 9] -> 5 * 9 = 45 seats.
// - CR 9x5 rooms (CR-107..109, 208): Active cols [1, 2, 4, 5], col 3 blank -> 4 * 9 = 36 seats.

export const ROOM_COL_ROWS = {
  "L-106": { 1: 9, 2: 9, 3: 12, 4: 12, 5: 12, 6: 12, 7: 12, 8: 12, 9: 12, 10: 12 },
  "L-107": { 1: 7, 2: 7, 3: 9, 4: 9, 5: 9, 6: 9, 7: 9, 8: 9 },
  "L-206": { 1: 9, 2: 9, 3: 11, 4: 11, 5: 11, 6: 11, 7: 11, 8: 11, 9: 10, 10: 10 },
  "L-207": { 1: 6, 2: 6, 3: 7, 4: 7, 5: 7, 6: 7, 7: 7, 8: 7 },
};

export function normalizeRoomNo(roomNo) {
  let rn = (roomNo || "").trim().toUpperCase();
  if (rn.startsWith("L") && !rn.startsWith("L-")) {
    rn = `L-${rn.slice(1)}`;
  } else if (rn.startsWith("CR") && !rn.startsWith("CR-")) {
    rn = `CR-${rn.slice(2)}`;
  }
  return rn;
}

export function isLRoom(room) {
  const roomNo = normalizeRoomNo(room?.room_no || "");
  const block = (room?.block || "").trim().toUpperCase();
  return roomNo.startsWith("L") || block === "L";
}

export function getExamCapacity(room) {
  if (!room) return 0;
  if (typeof room.exam_capacity === "number") {
    return room.exam_capacity;
  }
  const roomNo = normalizeRoomNo(room.room_no);
  const cols = room.cols || 9;
  const maxRows = Math.ceil(room.seating_capacity / cols);

  // Stepped L-rooms:
  if (roomNo in ROOM_COL_ROWS) {
    return Object.values(ROOM_COL_ROWS[roomNo]).reduce((a, b) => a + b, 0);
  }
  if (roomNo.endsWith("106") && isLRoom(room)) return 114;
  if (roomNo.endsWith("107") && isLRoom(room)) return 68;
  if (roomNo.endsWith("206") && isLRoom(room)) return 104;
  if (roomNo.endsWith("207") && isLRoom(room)) return 54;

  // L-102 (14x9) and L-202 (14x9): no gap -> full capacity 126
  if (roomNo.startsWith("L") && (roomNo.endsWith("102") || roomNo.endsWith("202"))) {
    return room.seating_capacity;
  }
  // L-201 (10x7): no gap -> full capacity 70
  if (roomNo.startsWith("L") && roomNo.endsWith("201")) {
    return room.seating_capacity;
  }
  // 16-col L-rooms (L-104, L-105, etc.): gap mode -> capacity / 2 (120 seats)
  if (isLRoom(room)) {
    return Math.max(Math.floor(room.seating_capacity / 2), 1);
  }
  // 5-column rooms (CR-107, 108, 109, 208): 4 active columns (1, 2, 4, 5) -> 4 * rows = 36
  if (cols === 5 || /107|108|109|208/.test(roomNo)) {
    return 4 * maxRows;
  }
  // 9-column rooms (CR-101, 102, 103, 104, 201, 202): 5 active columns (1, 3, 5, 7, 9) -> 5 * rows = 45
  if (cols === 9 || /101|102|103|104|201|202/.test(roomNo)) {
    return 5 * maxRows;
  }
  return room.seating_capacity;
}

// ─── Colour palette for courses & rooms ──────────────────────────────────────
const COURSE_PALETTE = [
  "#2563eb",
  "#059669",
  "#7c3aed",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#db2777",
  "#0d9488",
  "#4f46e5",
  "#ea580c",
  "#0284c7",
  "#9333ea",
  "#16a34a",
  "#b45309",
  "#be123c",
];
const ROOM_COLORS = [...COURSE_PALETTE];

function roomColor(roomNo, rooms) {
  const idx = (rooms || []).findIndex((r) => r.room_no === roomNo);
  return ROOM_COLORS[(idx < 0 ? 0 : idx) % ROOM_COLORS.length] ?? "#2563eb";
}

// ─── RoomManagement tab ───────────────────────────────────────────────────────
function RoomManagement({ rooms, fetchRooms, loading }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({
    room_no: "",
    seating_capacity: 45,
    cols: 9,
    block: "",
  });

  const openAdd = () => {
    setForm({ room_no: "", seating_capacity: 45, cols: 9, block: "" });
    setEditRoom(null);
    setAddOpen(true);
  };

  const openEdit = (r) => {
    setForm({
      room_no: r.room_no,
      seating_capacity: r.seating_capacity,
      cols: r.cols ?? 9,
      block: r.block || "",
    });
    setEditRoom(r);
    setAddOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editRoom) {
        await axios.patch(`${ROOMS_URL}${editRoom.id}/`, form, {
          headers: authHeaders(),
        });
        showNotification({
          title: "Updated",
          message: `Room ${form.room_no} updated.`,
          color: "green",
        });
      } else {
        await axios.post(ROOMS_URL, form, { headers: authHeaders() });
        showNotification({
          title: "Added",
          message: `Room ${form.room_no} added.`,
          color: "green",
        });
      }
      setAddOpen(false);
      fetchRooms();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Save failed.",
        color: "red",
      });
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Delete room ${room.room_no}?`)) return;
    try {
      await axios.delete(`${ROOMS_URL}${room.id}/`, { headers: authHeaders() });
      showNotification({
        title: "Deleted",
        message: `Room ${room.room_no} deleted.`,
        color: "orange",
      });
      fetchRooms();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Delete failed.",
        color: "red",
      });
    }
  };

  const toggleActive = async (room) => {
    try {
      await axios.patch(
        `${ROOMS_URL}${room.id}/`,
        { is_active: !room.is_active },
        { headers: authHeaders() },
      );
      fetchRooms();
    } catch {
      showNotification({
        title: "Error",
        message: "Toggle failed.",
        color: "red",
      });
    }
  };

  const totalRawCapacity = rooms
    .filter((r) => r.is_active)
    .reduce((s, r) => s + r.seating_capacity, 0);
  const totalExamCapacity = rooms
    .filter((r) => r.is_active)
    .reduce((s, r) => s + getExamCapacity(r), 0);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Badge color="blue" variant="light" size="lg">
            {rooms.length} Total Rooms
          </Badge>
          <Badge color="green" variant="light" size="lg">
            {totalExamCapacity} Effective Exam Seats
          </Badge>
          <Text size="xs" c="dimmed">
            (Total physical capacity: {totalRawCapacity} seats)
          </Text>
        </Group>
        <Button leftSection={<Plus size={16} />} onClick={openAdd} color="blue">
          Add Room
        </Button>
      </Group>

      {loading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : rooms.length === 0 ? (
        <Alert color="blue" title="No Rooms Available">
          Add exam rooms to begin generating seating arrangements.
        </Alert>
      ) : (
        <Paper withBorder radius="md" p={0} style={{ overflow: "hidden" }}>
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Room No.</Table.Th>
                  <Table.Th>Block / Type</Table.Th>
                  <Table.Th>Physical Capacity</Table.Th>
                  <Table.Th>Exam Capacity (Effective)</Table.Th>
                  <Table.Th>Layout (Rows × Cols)</Table.Th>
                  <Table.Th>Active</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rooms.map((r) => {
                  const cols = r.cols ?? 9;
                  const rows = Math.ceil(r.seating_capacity / cols);
                  const isL = isLRoom(r);
                  const examCap = getExamCapacity(r);
                  const norm = normalizeRoomNo(r.room_no);
                  const isStepped = norm in ROOM_COL_ROWS;
                  const colRows = isStepped ? ROOM_COL_ROWS[norm] : null;
                  const minR = colRows ? Math.min(...Object.values(colRows)) : rows;
                  const maxR = colRows ? Math.max(...Object.values(colRows)) : rows;
                  return (
                    <Table.Tr key={r.id}>
                      <Table.Td fw={700}>
                        <Group gap={6}>
                          <Door size={18} color={isL ? "#4f46e5" : "#0284c7"} />
                          <span>{r.room_no}</span>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={isL ? "indigo" : "gray"}
                          variant="light"
                          size="sm"
                        >
                          {r.block || (isL ? "L Hall" : "CR")}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{r.seating_capacity} seats</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={isL ? "indigo" : "blue"}
                          variant="filled"
                          size="sm"
                        >
                          {examCap} seats
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="violet" variant="light" size="sm">
                          {isStepped ? `Stepped (${minR}-${maxR} rows) × ${cols} cols` : `${rows} rows × ${cols} cols`}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Switch
                          checked={r.is_active}
                          onChange={() => toggleActive(r)}
                          color="green"
                          size="sm"
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} justify="center">
                          <Tooltip label="Edit Room">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => openEdit(r)}
                            >
                              <Pencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete Room">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDelete(r)}
                            >
                              <Trash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      )}

      <Modal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        title={editRoom ? "Edit Room" : "Add New Room"}
        centered
      >
        <Stack gap="sm">
          <TextInput
            label="Room Number"
            placeholder="e.g. CR-101 or L-105"
            value={form.room_no}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              const norm = normalizeRoomNo(val);
              const isL = norm.startsWith("L");
              const isL106 = isL && norm.endsWith("106");
              const isL107 = isL && norm.endsWith("107");
              const isL206 = isL && norm.endsWith("206");
              const isL207 = isL && norm.endsWith("207");
              const isL102or202 = isL && (norm.endsWith("102") || norm.endsWith("202"));
              const isL201 = isL && norm.endsWith("201");
              const is5Col = /107|108|109|208/.test(norm) && !isL;
              const is9Col = /101|102|103|104|201|202/.test(norm) && !isL;
              let defaults = {};
              if (!editRoom) {
                if (isL106) defaults = { seating_capacity: 114, cols: 10, block: "L" };
                else if (isL107) defaults = { seating_capacity: 68, cols: 8, block: "L" };
                else if (isL206) defaults = { seating_capacity: 104, cols: 10, block: "L" };
                else if (isL207) defaults = { seating_capacity: 54, cols: 8, block: "L" };
                else if (isL102or202) defaults = { seating_capacity: 126, cols: 9, block: "L" };
                else if (isL201) defaults = { seating_capacity: 70, cols: 7, block: "L" };
                else if (isL) defaults = { seating_capacity: 240, cols: 16, block: "L" };
                else if (is5Col) defaults = { seating_capacity: 45, cols: 5, block: "CR" };
                else if (is9Col) defaults = { seating_capacity: 81, cols: 9, block: "CR" };
              }
              setForm((prev) => ({
                ...prev,
                room_no: val,
                ...defaults,
              }));
            }}
            required
          />
          <Group grow>
            <NumberInput
              label="Physical Seating Capacity"
              placeholder="e.g. 240 or 81"
              value={form.seating_capacity}
              onChange={(v) => setForm({ ...form, seating_capacity: v })}
              min={1}
              max={500}
              required
            />
            <NumberInput
              label="No. of Columns"
              description="Physical columns in room"
              placeholder="e.g. 15 or 9"
              value={form.cols}
              onChange={(v) => setForm({ ...form, cols: v })}
              min={1}
              max={30}
              required
            />
          </Group>
          <TextInput
            label="Block / Building (optional)"
            placeholder="e.g. L, CR"
            value={form.block}
            onChange={(e) => setForm({ ...form, block: e.target.value })}
          />
          {form.cols > 0 && form.seating_capacity > 0 && (
            <Alert color="blue" py="xs">
              <Text size="xs">
                Physical Layout:{" "}
                <b>{Math.ceil(form.seating_capacity / form.cols)}</b> rows ×{" "}
                <b>{form.cols}</b> cols ({form.seating_capacity} physical seats).
                {normalizeRoomNo(form.room_no).endsWith("106") && (form.room_no.startsWith("L") || form.block === "L") ? (
                  <span style={{ display: "block", marginTop: 2 }}>
                    L-106 Stepped Room (10 cols: Cols 1-2: 9 rows, Cols 3-10: 12 rows): Exam capacity ={" "}
                    <b>114 seats</b> (No gap mode, all 10 columns active).
                  </span>
                ) : normalizeRoomNo(form.room_no).endsWith("107") && (form.room_no.startsWith("L") || form.block === "L") ? (
                  <span style={{ display: "block", marginTop: 2 }}>
                    L-107 Stepped Room (8 cols: Cols 1-2: 7 rows, Cols 3-8: 9 rows): Exam capacity ={" "}
                    <b>68 seats</b> (No gap mode, all 8 columns active).
                  </span>
                ) : normalizeRoomNo(form.room_no).endsWith("206") && (form.room_no.startsWith("L") || form.block === "L") ? (
                  <span style={{ display: "block", marginTop: 2 }}>
                    L-206 Stepped Room (10 cols: Cols 1-2: 9 rows, Cols 3-8: 11 rows, Cols 9-10: 10 rows): Exam capacity ={" "}
                    <b>104 seats</b> (No gap mode, all 10 columns active).
                  </span>
                ) : normalizeRoomNo(form.room_no).endsWith("207") && (form.room_no.startsWith("L") || form.block === "L") ? (
                  <span style={{ display: "block", marginTop: 2 }}>
                    L-207 Stepped Room (8 cols: Cols 1-2: 6 rows, Cols 3-8: 7 rows): Exam capacity ={" "}
                    <b>54 seats</b> (No gap mode, all 8 columns active).
                  </span>
                ) : /102|202/.test(form.room_no) && form.room_no.startsWith("L") ? (
                  <span style={{ display: "block", marginTop: 2 }}>
                    L-Room (14 rows × 9 cols): Exam capacity ={" "}
                    <b>{form.seating_capacity} seats</b> (No gap mode, all 9 columns active).
                  </span>
                ) : form.room_no === "L-201" || (form.room_no.startsWith("L") && form.room_no.endsWith("201")) ? (
                  <span style={{ display: "block", marginTop: 2 }}>
                    L-Room (10 rows × 7 cols): Exam capacity ={" "}
                    <b>{form.seating_capacity} seats</b> (No gap mode, all 7 columns active).
                  </span>
                ) : form.room_no.toUpperCase().startsWith("L") ||
                form.block.toUpperCase() === "L" ? (
                  <span
                    style={{ color: "#c2410c", display: "block", marginTop: 2 }}
                  >
                    ⚠️ L-Room (16 cols): Exam capacity ={" "}
                    <b>{Math.floor(form.seating_capacity / 2)} seats</b> (Cols 1, 3, 6, 8, 9, 11, 14, 16 active).
                  </span>
                ) : /107|108|109|208/.test(form.room_no) || form.cols === 5 ? (
                  <span style={{ display: "block", marginTop: 2 }}>
                    CR 5-Col Room: Exam capacity ={" "}
                    <b>{4 * Math.ceil(form.seating_capacity / form.cols)} seats</b> (Cols 1, 2, 4, 5 active, Col 3 blank).
                  </span>
                ) : (
                  <span style={{ display: "block", marginTop: 2 }}>
                    CR 9-Col Room: Exam capacity ={" "}
                    <b>{5 * Math.ceil(form.seating_capacity / form.cols)} seats</b> (Cols 1, 3, 5, 7, 9 active, even cols blank).
                  </span>
                )}
              </Text>
            </Alert>
          )}
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} color="blue">
              {editRoom ? "Update Room" : "Add Room"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── GenerateSeating tab ──────────────────────────────────────────────────────
function GenerateSeating({ rooms, onGeneratedSwitchToView }) {
  const [academicYears, setAcademicYears] = useState(DEFAULT_ACADEMIC_YEARS);
  const [form, setForm] = useState({
    exam_title: "midsem",
    exam_date: null,
    shift: "morning",
    academic_year: "2024-25",
    programme_type: "UG",
    rooms: [],
    course_codes: "",
    batch_years: ["2024"],
    clear_slot: false,
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let isMounted = true;
    axios
      .get(UNIQUE_REG_YEARS_URL, { headers: authHeaders() })
      .then((res) => {
        if (isMounted && res.data && Array.isArray(res.data.academic_years)) {
          const merged = Array.from(
            new Set([...DEFAULT_ACADEMIC_YEARS, ...res.data.academic_years])
          ).sort((a, b) => b.localeCompare(a));
          setAcademicYears(merged);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const activeRooms = useMemo(() => rooms.filter((r) => r.is_active), [rooms]);

  // Selected capacity sums exam_capacity: L-rooms are divided by 2, CR-rooms use full capacity
  const selectedCapacity = useMemo(() => {
    return activeRooms
      .filter((r) => form.rooms.includes(r.room_no))
      .reduce((sum, r) => sum + getExamCapacity(r), 0);
  }, [activeRooms, form.rooms]);

  const handleGenerate = async () => {
    if (!form.exam_date || form.rooms.length === 0) {
      showNotification({
        title: "Missing Information",
        message: "Please choose an Exam Date and at least one Exam Room.",
        color: "orange",
      });
      return;
    }

    const selectedBatches =
      form.batch_years.length > 0
        ? form.batch_years.map(Number)
        : [2026, 2025, 2024, 2023, 2022];

    setGenerating(true);
    setResult(null);
    try {
      const payload = {
        exam_title: form.exam_title,
        exam_date: formatLocalDate(form.exam_date),
        shift: form.shift,
        academic_year: form.academic_year,
        programme_type: form.programme_type,
        rooms: form.rooms,
        course_codes: form.course_codes
          ? form.course_codes
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [],
        batch_years: selectedBatches,
        clear_slot: form.clear_slot,
      };

      const res = await axios.post(SEATING_GENERATE_URL, payload, {
        headers: authHeaders(),
      });
      setResult(res.data);
      showNotification({
        title: "Seating Generated Successfully",
        message: `${res.data.generated} unique students seated across ${res.data.rooms_used?.length ?? form.rooms.length} room(s).`,
        color: "green",
      });
    } catch (e) {
      showNotification({
        title: "Generation Failed",
        message:
          e.response?.data?.error || "Could not generate seating arrangement.",
        color: "red",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Stack gap="md">
      <Paper withBorder p="lg" radius="md">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          <Select
            label="Exam Type"
            data={[
              { value: "midsem", label: "Mid-Semester Examination" },
              { value: "endsem", label: "End-Semester Examination" },
            ]}
            value={form.exam_title}
            onChange={(v) => setForm({ ...form, exam_title: v })}
            required
          />
          <DateInput
            label="Exam Date"
            placeholder="Select date"
            value={form.exam_date}
            onChange={(v) => setForm({ ...form, exam_date: v })}
            required
          />
          <Select
            label="Shift / Slot"
            data={[
              { value: "morning", label: "Morning Shift" },
              { value: "evening", label: "Evening Shift" },
            ]}
            value={form.shift}
            onChange={(v) => setForm({ ...form, shift: v })}
            required
          />
          <Select
            label="Academic Year"
            placeholder="Select Academic Year"
            data={academicYears.map((y) => ({ value: y, label: y }))}
            value={form.academic_year}
            onChange={(v) =>
              setForm({ ...form, academic_year: v || "2024-25" })
            }
            searchable
          />
          <Select
            label="Programme Type"
            data={[
              { value: "UG", label: "UG (B.Tech, B.Des)" },
              { value: "PG", label: "PG (M.Tech, M.Des)" },
              { value: "PHD", label: "PhD Scholars" },
            ]}
            value={form.programme_type}
            onChange={(v) => setForm({ ...form, programme_type: v })}
          />
          <TextInput
            label="Course Codes (Optional Filter)"
            placeholder="e.g. CS1001, ES1002"
            value={form.course_codes}
            onChange={(e) => setForm({ ...form, course_codes: e.target.value })}
          />
        </SimpleGrid>

        <Divider my="md" />

        {/* Student Batches */}
        <Stack gap="xs">
          <Text fw={500} size="sm">
            Student Batches
          </Text>
          <MultiSelect
            placeholder="Select student batches (e.g. 2026, 2025, 2024)"
            data={[
              { value: "2026", label: "Batch 2026" },
              { value: "2025", label: "Batch 2025" },
              { value: "2024", label: "Batch 2024" },
              { value: "2023", label: "Batch 2023" },
              { value: "2022", label: "Batch 2022" },
              { value: "2021", label: "Batch 2021" },
            ]}
            value={form.batch_years}
            onChange={(v) => setForm({ ...form, batch_years: v })}
            clearable
          />
        </Stack>

        <Divider my="md" />

        {/* Exam Rooms Selection */}
        <Stack gap="xs">
          <Text fw={500} size="sm">
            Select Exam Rooms <span style={{ color: "#dc2626" }}>*</span>
          </Text>

          <MultiSelect
            placeholder="Choose exam rooms..."
            data={activeRooms.map((r) => {
              const examCap = getExamCapacity(r);
              return {
                value: r.room_no,
                label: `${r.room_no} (${examCap} seats)`,
              };
            })}
            value={form.rooms}
            onChange={(v) => setForm({ ...form, rooms: v })}
            required
          />

          {form.rooms.length > 0 && (
            <Group gap="xs" mt={4}>
              <Badge color="blue" variant="filled" size="md">
                Total Exam Capacity: {selectedCapacity} seats
              </Badge>
            </Group>
          )}
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button
            leftSection={<ArrowsClockwise size={18} />}
            loading={generating}
            onClick={handleGenerate}
            size="md"
            color="blue"
          >
            Generate Seating Plan
          </Button>
        </Group>
      </Paper>

      {result && (
        <Alert
          icon={<CheckCircle size={22} />}
          color={result.remaining_unseated === 0 ? "green" : "blue"}
          title={`Seating Generated: ${result.generated} Seats Assigned in This Run`}
        >
          <Stack gap="xs">
            <Group gap="xs" wrap="wrap">
              <Badge color="dark" variant="filled" size="md">
                Batch Total:{" "}
                {result.total_in_batch ?? result.total_students_found} Students
              </Badge>
              <Badge color="blue" variant="filled" size="md">
                Total Seated Today:{" "}
                {result.total_seated_today ?? result.generated} Students
              </Badge>
              {result.remaining_unseated > 0 ? (
                <Badge color="orange" variant="filled" size="md">
                  Remaining Unseated: {result.remaining_unseated} Students
                </Badge>
              ) : (
                <Badge color="green" variant="filled" size="md">
                  All Students Seated (100%)
                </Badge>
              )}
            </Group>

            {result.remaining_unseated > 0 ? (
              <Text size="sm" c="dimmed">
                <b>{result.remaining_unseated}</b> students are still unseated.
                Select the next room(s) (e.g. next CR or L-room) and click{" "}
                <b>Generate Seating Plan</b> again to seat the remaining
                students seamlessly!
              </Text>
            ) : (
              <Text size="sm" c="dimmed">
                All students from the selected batch(es) have been successfully
                seated across rooms!
              </Text>
            )}

            {result.rooms_used && (
              <Group gap="xs" wrap="wrap">
                {result.rooms_used.map((r) => (
                  <Badge
                    key={r.room_no}
                    color="dark"
                    variant="outline"
                    size="md"
                  >
                    {r.room_no}: {r.assigned} students
                  </Badge>
                ))}
              </Group>
            )}
            <Group justify="flex-end" mt="xs">
              <Button
                variant="filled"
                color="dark"
                size="xs"
                leftSection={<Eye size={16} />}
                onClick={() => onGeneratedSwitchToView(form)}
              >
                View Seating in Grid / Table →
              </Button>
            </Group>
          </Stack>
        </Alert>
      )}
    </Stack>
  );
}

// ─── Room Grid View (Clean Black & White Theme) ──────────────────────────────
function RoomGrid({ room, seats, roomMeta, onToggle }) {
  const normRn = normalizeRoomNo(room);
  const colRows =
    roomMeta?.col_rows && Object.keys(roomMeta.col_rows).length > 0
      ? roomMeta.col_rows
      : ROOM_COL_ROWS[normRn] || null;

  const cols = roomMeta?.cols ?? (colRows ? Object.keys(colRows).length : 16);
  const maxColRow = colRows ? Math.max(...Object.values(colRows).map(Number)) : 0;
  const maxRow = Math.max(...seats.map((s) => s.row_no), maxColRow, 0) || 15;

  // Map seat by "R{row}C{col}"
  const seatMap = {};
  seats.forEach((s) => {
    seatMap[`R${s.row_no}C${s.col_no}`] = s;
  });

  return (
    <Stack gap="xs">
      <ScrollArea style={{ borderRadius: 6, background: "#ffffff" }}>
        <Box
          style={{
            width: "100%",
            minWidth: cols > 10 ? 820 : "100%",
            margin: "0 auto",
          }}
        >
          {/* Room Banner (Header in clean Black & White) */}
          <Box
            style={{
              background: "#ffffff",
              border: "2px solid #000000",
              borderBottom: "none",
              padding: "4px 0",
              textAlign: "center",
              fontSize: 16,
              fontWeight: 800,
              color: "#000000",
              letterSpacing: "1px",
            }}
          >
            {room}
          </Box>

          <table
            style={{
              borderCollapse: "collapse",
              border: "2px solid #000000",
              width: "100%",
              background: "#ffffff",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: 44,
                    minWidth: 40,
                    border: "1px solid #000000",
                    background: "#ffffff",
                    padding: "4px 2px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#000000",
                    textAlign: "center",
                  }}
                >
                  Row
                </th>
                {Array.from({ length: cols }, (_, ci) => (
                  <th
                    key={ci}
                    title={`Column ${ci + 1}`}
                    style={{
                      border: "1px solid #000000",
                      background: "#ffffff",
                      padding: "4px 1px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#000000",
                      textAlign: "center",
                    }}
                  >
                    {cols > 10 ? `C${ci + 1}` : `Col ${ci + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxRow }, (_, ri) => (
                <tr key={ri}>
                  <td
                    title={`Row ${ri + 1}`}
                    style={{
                      border: "1px solid #000000",
                      background: "#ffffff",
                      padding: "3px 2px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#000000",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cols > 10 ? `R${ri + 1}` : `Row ${ri + 1}`}
                  </td>
                  {Array.from({ length: cols }, (__col, ci) => {
                    const colNo = ci + 1;
                    const colMaxRows = colRows
                      ? (colRows[colNo] ?? colRows[String(colNo)])
                      : null;

                    // If stepped room and row exceeds this column's physical rows,
                    // render transparent empty cell so room outline matches actual layout
                    if (colMaxRows !== undefined && colMaxRows !== null && ri + 1 > colMaxRows) {
                      return (
                        <td
                          key={ci}
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: 0,
                          }}
                        />
                      );
                    }

                    const key = `R${ri + 1}C${colNo}`;
                    const s = seatMap[key];

                    if (!s) {
                      return (
                        <td
                          key={ci}
                          style={{
                            border: "1px solid #000000",
                            background: "#e2e8f0",
                            padding: "2px 1px",
                            height: 24,
                          }}
                        />
                      );
                    }

                    return (
                      <Tooltip
                        key={ci}
                        label={
                          <Stack gap={2} p={4}>
                            <Text size="xs" fw={700}>
                              {s.student_roll} — {s.student_name}
                            </Text>
                            <Text size="xs">
                              {s.course_code} - {s.course_name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Seat #{s.seat_no} | Row {s.row_no}, Col {s.col_no}
                            </Text>
                            <Text
                              size="xs"
                              fw={600}
                              c={s.is_excluded ? "red" : "teal"}
                            >
                              {s.is_excluded
                                ? "Status: Excluded from exam (Click to Include)"
                                : "Status: Active (Click to Exclude)"}
                            </Text>
                          </Stack>
                        }
                        withArrow
                        position="top"
                      >
                        <td
                          onClick={() => onToggle(s)}
                          style={{
                            border: s.is_excluded
                              ? "2px solid #ef4444"
                              : "1px solid #000000",
                            background: s.is_excluded ? "#fee2e2" : "#ffffff",
                            padding: "2px 1px",
                            textAlign: "center",
                            cursor: "pointer",
                            position: "relative",
                            transition: "background 0.15s ease",
                            height: 24,
                          }}
                        >
                          <Text
                            size="xs"
                            fw={700}
                            c={s.is_excluded ? "#991b1b" : "#000000"}
                            style={{
                              fontSize: 9.5,
                              lineHeight: 1,
                              textDecoration: s.is_excluded
                                ? "line-through"
                                : "none",
                              fontFamily: "monospace, sans-serif",
                              letterSpacing: "-0.4px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.student_roll}
                          </Text>
                          {s.is_excluded && (
                            <Box
                              style={{
                                position: "absolute",
                                top: 0,
                                right: 1,
                                color: "#ef4444",
                                fontSize: 8,
                                fontWeight: 900,
                              }}
                            >
                              ✕
                            </Box>
                          )}
                        </td>
                      </Tooltip>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>


        </Box>
      </ScrollArea>
    </Stack>
  );
}


// ─── ViewSeating tab ──────────────────────────────────────────────────────────
function ViewSeating({ rooms, initialFilters }) {
  const [examDates, setExamDates] = useState([]);
  const [filters, setFilters] = useState(
    initialFilters || { exam_date: "", shift: "", exam_title: "", room_no: "" },
  );
  const [seats, setSeats] = useState([]);
  const [roomMeta, setRoomMeta] = useState({});
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [roomToggling, setRoomToggling] = useState({});
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [searchQuery, setSearchQuery] = useState("");
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchExamDates = useCallback(async () => {
    setLoadingDates(true);
    try {
      const r = await axios.get(SEATING_EXAM_DATES_URL, {
        headers: authHeaders(),
      });
      setExamDates(r.data);
      if (!filters.exam_date && r.data.length > 0) {
        setFilters((prev) => ({
          ...prev,
          exam_date: r.data[0].exam_date,
          shift: r.data[0].shift,
          exam_title: r.data[0].exam_title,
        }));
      }
    } catch {
      // Ignored
    } finally {
      setLoadingDates(false);
    }
  }, [filters.exam_date]);

  useEffect(() => {
    fetchExamDates();
  }, [fetchExamDates]);

  const fetchSeats = useCallback(async () => {
    const params = {};
    if (filters.exam_date) params.exam_date = filters.exam_date;
    if (filters.shift) params.shift = filters.shift;
    if (filters.exam_title) params.exam_title = filters.exam_title;
    if (filters.room_no) params.room_no = filters.room_no;

    setLoadingSeats(true);
    try {
      const res = await axios.get(SEATING_LIST_URL, {
        headers: authHeaders(),
        params,
      });
      setSeats(res.data.results || []);
      setRoomMeta(res.data.room_meta || {});
    } catch {
      showNotification({
        title: "Error",
        message: "Could not load seating data.",
        color: "red",
      });
    } finally {
      setLoadingSeats(false);
    }
  }, [filters]);

  useEffect(() => {
    if (filters.exam_date) {
      fetchSeats();
    }
  }, [
    fetchSeats,
    filters.exam_date,
    filters.shift,
    filters.exam_title,
    filters.room_no,
  ]);

  // Toggle single seat exclude
  const toggleExclude = async (seat) => {
    setToggling(seat.id);
    try {
      const res = await axios.patch(
        TOGGLE_EXCLUDE_URL(seat.id),
        {},
        { headers: authHeaders() },
      );
      setSeats((prev) =>
        prev.map((s) =>
          s.id === seat.id ? { ...s, is_excluded: res.data.is_excluded } : s,
        ),
      );
    } catch {
      showNotification({
        title: "Error",
        message: "Toggle failed.",
        color: "red",
      });
    } finally {
      setToggling(null);
    }
  };

  // Toggle room-wise exclude (All seats in a room)
  const toggleRoomExclude = async (roomNo, currentAllExcluded) => {
    setRoomToggling((prev) => ({ ...prev, [roomNo]: true }));
    try {
      const payload = {
        exam_date: filters.exam_date,
        shift: filters.shift,
        room_no: roomNo,
        exclude: !currentAllExcluded,
      };
      const res = await axios.post(ROOM_EXCLUDE_URL, payload, {
        headers: authHeaders(),
      });
      setSeats((prev) =>
        prev.map((s) =>
          s.room_no === roomNo
            ? { ...s, is_excluded: res.data.is_excluded }
            : s,
        ),
      );
      showNotification({
        title: res.data.is_excluded ? "Room Excluded" : "Room Included",
        message: `${res.data.updated} seats updated in Room ${roomNo}.`,
        color: res.data.is_excluded ? "orange" : "green",
      });
    } catch (e) {
      showNotification({
        title: "Action Failed",
        message: e.response?.data?.error || "Could not toggle room exclusion.",
        color: "red",
      });
    } finally {
      setRoomToggling((prev) => ({ ...prev, [roomNo]: false }));
    }
  };

  // Clear seating (either currently filtered date/slot or all)
  const handleClearSeating = async (clearAll = false) => {
    setClearing(true);
    try {
      const payload = clearAll
        ? { clear_all: true }
        : {
            exam_date: filters.exam_date,
            shift: filters.shift,
            room_no: filters.room_no,
          };
      const res = await axios.post(SEATING_CLEAR_URL, payload, {
        headers: authHeaders(),
      });
      showNotification({
        title: "Seating Deleted",
        message: res.data.message || `${res.data.deleted} seats removed.`,
        color: "green",
      });
      setClearModalOpen(false);
      setSeats([]);
      fetchExamDates();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to clear seating.",
        color: "red",
      });
    } finally {
      setClearing(false);
    }
  };

  // Group by room
  const byRoom = useMemo(() => {
    return seats.reduce((acc, s) => {
      acc[s.room_no] = acc[s.room_no] || [];
      acc[s.room_no].push(s);
      return acc;
    }, {});
  }, [seats]);

  const uniqueDates = useMemo(() => {
    return [...new Set(examDates.map((d) => d.exam_date))].sort().reverse();
  }, [examDates]);

  // Filter for table view search
  const filteredSeats = useMemo(() => {
    if (!searchQuery.trim()) return seats;
    const q = searchQuery.toLowerCase().trim();
    return seats.filter(
      (s) =>
        s.student_roll.toLowerCase().includes(q) ||
        s.student_name.toLowerCase().includes(q) ||
        s.course_code.toLowerCase().includes(q) ||
        s.room_no.toLowerCase().includes(q),
    );
  }, [seats, searchQuery]);

  // Export seating plan to CSV
  const exportToCSV = () => {
    if (!seats.length) return;
    const headers = [
      "Exam Title",
      "Date",
      "Shift",
      "Room",
      "Seat #",
      "Row",
      "Col",
      "Roll No",
      "Student Name",
      "Course Code",
      "Course Name",
      "Excluded",
    ];
    const rows = seats.map((s) => [
      s.exam_title,
      s.exam_date,
      s.shift,
      s.room_no,
      s.seat_no,
      s.row_no,
      s.col_no,
      s.student_roll,
      `"${s.student_name.replace(/"/g, '""')}"`,
      s.course_code,
      `"${s.course_name.replace(/"/g, '""')}"`,
      s.is_excluded ? "Yes" : "No",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Seating_Plan_${filters.exam_date}_${filters.shift}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification({
      title: "Exported",
      message: "Seating arrangement exported successfully.",
      color: "green",
    });
  };

  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="md">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
          <Select
            label="Exam Date"
            placeholder="Select date"
            data={uniqueDates.map((d) => ({ value: d, label: d }))}
            value={filters.exam_date}
            onChange={(v) => setFilters({ ...filters, exam_date: v || "" })}
            disabled={loadingDates}
          />
          <Select
            label="Shift"
            placeholder="All shifts"
            clearable
            data={[
              { value: "", label: "All Shifts" },
              { value: "morning", label: "Morning Shift" },
              { value: "evening", label: "Evening Shift" },
            ]}
            value={filters.shift}
            onChange={(v) => setFilters({ ...filters, shift: v || "" })}
          />
          <Select
            label="Exam Type"
            placeholder="All types"
            clearable
            data={[
              { value: "", label: "All Types" },
              { value: "midsem", label: "Mid-Semester Examination" },
              { value: "endsem", label: "End-Semester Examination" },
            ]}
            value={filters.exam_title}
            onChange={(v) => setFilters({ ...filters, exam_title: v || "" })}
          />
          <Select
            label="Filter Room"
            placeholder="All rooms"
            clearable
            data={[
              { value: "", label: "All Rooms" },
              ...rooms.map((r) => ({ value: r.room_no, label: r.room_no })),
            ]}
            value={filters.room_no}
            onChange={(v) => setFilters({ ...filters, room_no: v || "" })}
          />
        </SimpleGrid>

        <Group justify="space-between" mt="md" align="center">
          <Group gap="xs">
            {seats.length > 0 && (
              <SegmentedControl
                size="sm"
                value={viewMode}
                onChange={setViewMode}
                data={[
                  {
                    value: "grid",
                    label: (
                      <Center style={{ gap: 6, flexWrap: "nowrap" }}>
                        <GridFour size={16} />
                        <span style={{ whiteSpace: "nowrap" }}>Grid View</span>
                      </Center>
                    ),
                  },
                  {
                    value: "table",
                    label: (
                      <Center style={{ gap: 6, flexWrap: "nowrap" }}>
                        <Rows size={16} />
                        <span style={{ whiteSpace: "nowrap" }}>Table View</span>
                      </Center>
                    ),
                  },
                ]}
              />
            )}
            {viewMode === "table" && seats.length > 0 && (
              <TextInput
                placeholder="Search roll, name, course..."
                size="xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 220 }}
              />
            )}
          </Group>

          <Group gap="xs">
            {seats.length > 0 && (
              <>
                <Button
                  variant="default"
                  leftSection={<Printer size={16} />}
                  onClick={() => setPrintModalOpen(true)}
                  size="sm"
                >
                  Print Table (B&W)
                </Button>
                <Button
                  variant="light"
                  color="green"
                  leftSection={<DownloadSimple size={16} />}
                  onClick={exportToCSV}
                  size="sm"
                >
                  Export CSV
                </Button>
              </>
            )}
            <Button
              variant="light"
              color="red"
              leftSection={<Trash size={16} />}
              onClick={() => setClearModalOpen(true)}
              size="sm"
            >
              Clear Seating
            </Button>
            <Button
              leftSection={<Eye size={16} />}
              onClick={fetchSeats}
              loading={loadingSeats}
              color="blue"
              size="sm"
            >
              Load Seating
            </Button>
          </Group>
        </Group>
      </Paper>

      {loadingSeats ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : seats.length === 0 ? (
        <Alert color="blue" title="No Seating Found">
          Select exam filters and click <b>Load Seating</b>, or generate a new
          seating arrangement from the <b>Generate Seating</b> tab.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Group justify="space-between" align="center" px="xs">
            <Group gap="xs">
              <Badge color="dark" variant="filled" size="md">
                Total Seated: {seats.length} students
              </Badge>
              <Badge
                color={
                  seats.filter((s) => s.is_excluded).length > 0 ? "red" : "gray"
                }
                variant="outline"
                size="md"
              >
                Excluded: {seats.filter((s) => s.is_excluded).length} students
              </Badge>
              <Badge color="dark" variant="outline" size="md">
                {Object.keys(byRoom).length} Active Rooms
              </Badge>
            </Group>
          </Group>

          {viewMode === "grid" ? (
            Object.entries(byRoom).map(([room, roomSeats]) => {
              const meta = roomMeta[room];
              const isL = meta?.is_l_room || room.startsWith("L");
              const excludedInRoom = roomSeats.filter(
                (s) => s.is_excluded,
              ).length;
              const allExcludedInRoom = excludedInRoom === roomSeats.length;

              return (
                <Paper key={room} withBorder radius="md" p="sm" shadow="xs">
                  <Group
                    mb="sm"
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                  >
                    <Group gap="sm">
                      <Door size={22} color="#000000" />
                      <Text fw={800} size="lg" c="#000000">
                        Room {room}
                      </Text>
                      <Badge color="dark" variant="outline">
                        {roomSeats.length} Students
                      </Badge>
                      {meta && (
                        <Badge color="gray" variant="outline">
                          {Math.ceil(roomSeats.length / (meta.cols ?? 9))} rows
                          × {meta.cols ?? 9} cols
                        </Badge>
                      )}
                      {isL && (
                        <Badge color="dark" variant="light">
                          Lecture Hall
                        </Badge>
                      )}
                      {excludedInRoom > 0 && (
                        <Badge color="red" variant="filled">
                          {excludedInRoom} Excluded
                        </Badge>
                      )}
                    </Group>

                    {/* Room-wise Exclude Toggle Button (as noted in requirements diagram) */}
                    <Button
                      size="xs"
                      variant={allExcludedInRoom ? "filled" : "outline"}
                      color={allExcludedInRoom ? "green" : "dark"}
                      leftSection={
                        allExcludedInRoom ? (
                          <Check size={14} />
                        ) : (
                          <Prohibit size={14} />
                        )
                      }
                      loading={roomToggling[room]}
                      onClick={() => toggleRoomExclude(room, allExcludedInRoom)}
                    >
                      {allExcludedInRoom
                        ? "Include All Seats in Room"
                        : "Exclude Entire Room"}
                    </Button>
                  </Group>

                  <Divider mb="sm" />

                  <RoomGrid
                    room={room}
                    seats={roomSeats}
                    roomMeta={meta}
                    toggling={toggling}
                    onToggle={toggleExclude}
                  />
                </Paper>
              );
            })
          ) : (
            <Paper withBorder radius="md" p={0} style={{ overflow: "hidden" }}>
              <ScrollArea>
                <Table
                  striped
                  highlightOnHover
                  withTableBorder
                  withColumnBorders
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Seat #</Table.Th>
                      <Table.Th>Room</Table.Th>
                      <Table.Th>Row</Table.Th>
                      <Table.Th>Col</Table.Th>
                      <Table.Th>Roll No.</Table.Th>
                      <Table.Th>Student Name</Table.Th>
                      <Table.Th>Course Code</Table.Th>
                      <Table.Th>Course Name</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th style={{ textAlign: "center" }}>
                        Action
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredSeats.map((s) => (
                      <Table.Tr
                        key={s.id}
                        style={{ opacity: s.is_excluded ? 0.45 : 1 }}
                      >
                        <Table.Td fw={700}>#{s.seat_no}</Table.Td>
                        <Table.Td>
                          <Badge
                            variant="light"
                            color={roomColor(s.room_no, rooms)}
                          >
                            {s.room_no}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="blue" variant="light" size="sm">
                            R{s.row_no}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="grape" variant="light" size="sm">
                            C{s.col_no}
                          </Badge>
                        </Table.Td>
                        <Table.Td fw={600}>{s.student_roll}</Table.Td>
                        <Table.Td>{s.student_name}</Table.Td>
                        <Table.Td>
                          <Badge color="indigo" variant="light">
                            {s.course_code}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{s.course_name}</Text>
                        </Table.Td>
                        <Table.Td>
                          {s.is_excluded ? (
                            <Badge color="red" variant="filled" size="xs">
                              Excluded
                            </Badge>
                          ) : (
                            <Badge color="green" variant="light" size="xs">
                              Active
                            </Badge>
                          )}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Tooltip
                            label={
                              s.is_excluded
                                ? "Include Student"
                                : "Exclude Student"
                            }
                          >
                            <ActionIcon
                              color={s.is_excluded ? "red" : "gray"}
                              variant={s.is_excluded ? "filled" : "subtle"}
                              loading={toggling === s.id}
                              onClick={() => toggleExclude(s)}
                            >
                              <X size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Paper>
          )}
        </Stack>
      )}
      <Modal
        opened={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Evaluation Seating Arrangement Table (B&W)"
        size="90%"
      >
        <Stack gap="md">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #evaluation-print-area, #evaluation-print-area * {
                visibility: visible;
              }
              #evaluation-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 10mm;
                background: #ffffff !important;
              }
              .no-print {
                display: none !important;
              }
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
            }
          `}</style>

          <Group justify="space-between" align="center" className="no-print">
            <Text size="sm" c="dimmed">
              Format: Black & White Evaluation Table (3 rooms per section)
            </Text>
            <Button
              leftSection={<Printer size={16} />}
              color="dark"
              size="sm"
              onClick={() => window.print()}
            >
              Print Evaluation Sheet
            </Button>
          </Group>

          <ScrollArea>
            <div id="evaluation-print-area">
              <Box style={{ textAlign: "center", marginBottom: 20 }}>
                <Text
                  fw={800}
                  size="xl"
                  style={{
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#000000",
                  }}
                >
                  OPTIMIZING EXAM SEATING ARRANGEMENT
                </Text>
                <Text
                  fw={700}
                  size="md"
                  style={{
                    letterSpacing: "1px",
                    color: "#1e293b",
                    marginTop: 2,
                  }}
                >
                  TABLE FOR EFFICIENT EVALUATION
                </Text>
                <Text size="xs" mt={4} style={{ color: "#475569" }}>
                  {filters.exam_title
                    ? filters.exam_title.toUpperCase()
                    : "EXAMINATION"}{" "}
                  • DATE: {filters.exam_date || "ALL"} • SHIFT:{" "}
                  {filters.shift ? filters.shift.toUpperCase() : "ALL"}
                </Text>
              </Box>

              {(() => {
                const roomKeys = Object.keys(byRoom);
                const roomChunks = [];
                for (let i = 0; i < roomKeys.length; i += 3) {
                  roomChunks.push(roomKeys.slice(i, i + 3));
                }

                return (
                  <Stack gap="xl">
                    {roomChunks.map((chunk, chunkIdx) => {
                      const maxSeatsInChunk = Math.max(
                        ...chunk.map((r) => byRoom[r].length),
                        0,
                      );

                      return (
                        <table
                          key={chunkIdx}
                          style={{
                            borderCollapse: "collapse",
                            border: "2px solid #000000",
                            width: "100%",
                            background: "#ffffff",
                            tableLayout: "fixed",
                            pageBreakInside: "avoid",
                            marginBottom:
                              chunkIdx < roomChunks.length - 1 ? 24 : 0,
                          }}
                        >
                          <thead>
                            <tr>
                              {chunk.map((room) => (
                                <th
                                  key={room}
                                  style={{
                                    border: "2px solid #000000",
                                    padding: "10px 8px",
                                    textAlign: "center",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    background: "#ffffff",
                                    color: "#000000",
                                    width: `${100 / chunk.length}%`,
                                  }}
                                >
                                  Room: {room}
                                </th>
                              ))}
                            </tr>
                            <tr>
                              {chunk.map((room) => (
                                <th
                                  key={`seat-hdr-${room}`}
                                  style={{
                                    border: "2px solid #000000",
                                    padding: "8px 6px",
                                    textAlign: "center",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    background: "#ffffff",
                                    color: "#000000",
                                  }}
                                >
                                  Seat Number
                                </th>
                              ))}
                            </tr>
                            {/* Empty spacer row matching Image 3 */}
                            <tr>
                              {chunk.map((room) => (
                                <td
                                  key={`spacer-${room}`}
                                  style={{
                                    border: "1px solid #000000",
                                    height: 18,
                                    background: "#ffffff",
                                  }}
                                >
                                  &nbsp;
                                </td>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from(
                              { length: maxSeatsInChunk },
                              (_, idx) => (
                                <tr key={idx}>
                                  {chunk.map((room) => {
                                    const s = byRoom[room][idx];
                                    return (
                                      <td
                                        key={`${room}-${idx}`}
                                        style={{
                                          border: "1px solid #000000",
                                          padding: "6px 8px",
                                          textAlign: "center",
                                          fontSize: 12.5,
                                          fontWeight: 600,
                                          color: "#000000",
                                          background: "#ffffff",
                                          fontFamily: "monospace, sans-serif",
                                        }}
                                      >
                                        {s ? (
                                          <span>
                                            #{s.seat_no} - {s.student_roll}
                                          </span>
                                        ) : (
                                          <span style={{ color: "#94a3b8" }}>
                                            —
                                          </span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      );
                    })}
                  </Stack>
                );
              })()}
            </div>
          </ScrollArea>
        </Stack>
      </Modal>

      {/* ─── Clear Seating Confirmation Modal ──────────────────────── */}
      <Modal
        opened={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title={
          <Group gap="xs">
            <Trash size={20} color="#dc2626" />
            <Text fw={700} c="red">
              Delete Seating Arrangements
            </Text>
          </Group>
        }
        centered
      >
        <Stack gap="md">
          <Alert color="red" variant="light">
            <Text size="sm">
              You can remove previously generated seating arrangements from here. Please select an option below:
            </Text>
          </Alert>

          {filters.exam_date && (
            <Paper withBorder p="sm" radius="md">
              <Text size="sm" fw={600} mb={4}>
                Option 1: Delete Current Selection Only
              </Text>
              <Text size="xs" c="dimmed" mb="xs">
                Date: <b>{filters.exam_date}</b>
                {filters.shift ? ` | Shift: ${filters.shift}` : " | All Shifts"}
                {filters.room_no ? ` | Room: ${filters.room_no}` : " | All Rooms"}
                {seats.length > 0 && ` (${seats.length} students currently loaded)`}
              </Text>
              <Button
                fullWidth
                color="orange"
                variant="filled"
                loading={clearing}
                onClick={() => handleClearSeating(false)}
              >
                Delete Seating for {filters.exam_date} ({filters.shift || "All Shifts"})
              </Button>
            </Paper>
          )}

          <Paper withBorder p="sm" radius="md" style={{ borderColor: "#fca5a5" }}>
            <Text size="sm" fw={600} c="red" mb={4}>
              Option 2: Delete All Generated Seating (Clear All)
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              All generated seating arrangements across all dates, shifts, and rooms will be permanently deleted from the system.
            </Text>
            <Button
              fullWidth
              color="red"
              variant="filled"
              loading={clearing}
              onClick={() => {
                if (
                  window.confirm(
                    "Please confirm: Are you sure you want to permanently delete ALL seating arrangements from the system?"
                  )
                ) {
                  handleClearSeating(true);
                }
              }}
            >
              Clear ALL Generated Seating
            </Button>
          </Paper>

          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={() => setClearModalOpen(false)}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── Main SeatingArrangement Component ────────────────────────────────────────
export default function SeatingArrangement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [viewFilters, setViewFilters] = useState(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(ROOMS_URL, { headers: authHeaders() });
      setRooms(res.data);
    } catch {
      showNotification({
        title: "Error",
        message: "Could not load rooms list",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleGeneratedSwitchToView = (genForm) => {
    setViewFilters({
      exam_date: formatLocalDate(genForm.exam_date),
      shift: genForm.shift,
      exam_title: genForm.exam_title,
      room_no: "",
    });
    setActiveTab("view");
  };

  return (
    <Stack gap="md">
      <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab
            value="generate"
            leftSection={<ArrowsClockwise size={16} />}
          >
            Generate Seating
          </Tabs.Tab>
          <Tabs.Tab value="view" leftSection={<Eye size={16} />}>
            View &amp; Manage Seating
          </Tabs.Tab>
          <Tabs.Tab value="rooms" leftSection={<Door size={16} />}>
            Room Management
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="generate" pt="md">
          <GenerateSeating
            rooms={rooms}
            onGeneratedSwitchToView={handleGeneratedSwitchToView}
          />
        </Tabs.Panel>

        <Tabs.Panel value="view" pt="md">
          <ViewSeating rooms={rooms} initialFilters={viewFilters} />
        </Tabs.Panel>

        <Tabs.Panel value="rooms" pt="md">
          <RoomManagement
            rooms={rooms}
            fetchRooms={fetchRooms}
            loading={loading}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

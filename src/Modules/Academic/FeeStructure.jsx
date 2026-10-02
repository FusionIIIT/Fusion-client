import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  Bank,
  Copy,
  Info,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";

import {
  demandLetterBankAccountsRoute,
  feeStructureDetailRoute,
  feeStructureReplicateRoute,
  feeStructureTemplateRoute,
  feeStructuresRoute,
} from "../../routes/academicRoutes";

const authConfig = () => ({
  headers: { Authorization: `Token ${localStorage.getItem("authToken")}` },
});

const message = (error, fallback) =>
  error?.response?.data?.error || error?.response?.data?.detail || fallback;

const SECTIONS = [
  {
    key: "one_time_heads",
    title: "A. One-time payment at the time of admission",
    total: "Total One Time Fees (A) in Rs.",
  },
  {
    key: "semester_heads",
    title: "B. Semester Fees (Academic fee) – Per semester",
    total: "Total Semester Fees (Academic fee) (B) in Rs.",
  },
  {
    key: "tuition_hostel_heads",
    title: "C. Semester Fees (Tuition fee and hostel fee) – Per semester",
    total: "Total Semester Fees (Tuition fee & hostel fee) (C) in Rs.",
    perSemester: true,
  },
];

const CATEGORIES = [
  { value: "UG", label: "UG", tab: "UG: Undergraduate" },
  { value: "PG", label: "PG", tab: "PG: Post Graduate" },
  { value: "PHD", label: "Ph.D.", tab: "PhD: Doctor of Philosophy" },
];

const academicYear = (year) =>
  year ? `${year}-${String(Number(year) + 1).slice(-2)}` : "";

// "NIL" is what the circular prints where a category pays nothing.
const amountOf = (value, semester) => {
  const raw = Array.isArray(value)
    ? value[Math.min(semester - 1, value.length - 1)]
    : value;
  const text = String(raw ?? "").trim();
  if (!text || ["NIL", "-"].includes(text.toUpperCase())) return 0;
  const parsed = Number(text.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const sumSection = (rows, column, semester) =>
  (rows ?? []).reduce(
    (total, row) => total + amountOf(row[column], semester),
    0,
  );

const indian = (value) => {
  const [whole, fraction] = Number(value || 0)
    .toFixed(2)
    .split(".");
  const head = whole.slice(0, -3);
  const tail = whole.slice(-3);
  const grouped = head
    ? `${head.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${tail}`
    : tail;
  return `${grouped}.${fraction}`;
};

export default function FeeStructure() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [replicating, setReplicating] = useState(null);
  const [category, setCategory] = useState("UG");
  const [preview, setPreview] = useState(null);
  const [bankDraft, setBankDraft] = useState(null);
  const [bankSaving, setBankSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(feeStructuresRoute, authConfig());
      setRows(data.results ?? []);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Could not load fee structures",
        message: message(error, "Please try again."),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startNew = async (forCategory) => {
    try {
      const { data } = await axios.get(feeStructureTemplateRoute, {
        ...authConfig(),
        params: { programme_category: forCategory },
      });
      setDraft({ ...data, start_year: new Date().getFullYear() });
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Could not start a new structure",
        message: message(error, "Please try again."),
      });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (draft.id) {
        await axios.put(feeStructureDetailRoute(draft.id), draft, authConfig());
      } else {
        await axios.post(feeStructuresRoute, draft, authConfig());
      }
      notifications.show({ color: "green", message: "Fee structure saved." });
      setDraft(null);
      load();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Not saved",
        message: message(error, "Please check the figures and try again."),
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    try {
      await axios.delete(feeStructureDetailRoute(row.id), authConfig());
      load();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Not removed",
        message: message(error, "Please try again."),
      });
    }
  };

  const replicate = async () => {
    try {
      await axios.post(
        feeStructureReplicateRoute(replicating.row.id),
        { start_year: replicating.year },
        authConfig(),
      );
      notifications.show({
        color: "green",
        message: `Copied into ${academicYear(replicating.year)}.`,
      });
      setReplicating(null);
      load();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Not copied",
        message: message(error, "Please try again."),
      });
    }
  };

  const openBankDetails = async () => {
    try {
      const { data } = await axios.get(
        demandLetterBankAccountsRoute,
        authConfig(),
      );
      setBankDraft(data);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Could not load bank account details",
        message: message(error, "Please try again."),
      });
    }
  };

  const saveBankDetails = async () => {
    setBankSaving(true);
    try {
      await axios.put(demandLetterBankAccountsRoute, bankDraft, authConfig());
      notifications.show({
        color: "green",
        message: "Bank account details saved.",
      });
      setBankDraft(null);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Not saved",
        message: message(error, "Please try again."),
      });
    } finally {
      setBankSaving(false);
    }
  };

  const visible = useMemo(
    () => rows.filter((row) => row.programme_category === category),
    [rows, category],
  );

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <Group gap="xs">
          {CATEGORIES.map((entry) => (
            <Button
              key={entry.value}
              variant={category === entry.value ? "filled" : "outline"}
              onClick={() => setCategory(entry.value)}
            >
              {entry.tab}
            </Button>
          ))}
        </Group>
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<Bank size={16} />}
            onClick={openBankDetails}
          >
            Bank Account Details
          </Button>
          <Button
            leftSection={<Plus size={16} />}
            onClick={() => startNew(category)}
          >
            Add Fee Structure
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md" p={0}>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Academic Year</Table.Th>
              <Table.Th>Actions</Table.Th>
              <Table.Th>Edit</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading && (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Group justify="center" p="md">
                    <Loader size="sm" />
                  </Group>
                </Table.Td>
              </Table.Tr>
            )}
            {!loading && !visible.length && (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c="dimmed" ta="center" p="md">
                    No fee structure for {category} yet.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {visible.map((row) => (
              <Table.Tr
                key={row.id}
                style={{ cursor: "pointer" }}
                onClick={() => setPreview(row)}
              >
                <Table.Td ta="center">{row.name}</Table.Td>
                <Table.Td ta="center">{row.academic_year}</Table.Td>
                <Table.Td
                  ta="center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    size="xs"
                    color="green"
                    leftSection={<Copy size={14} />}
                    onClick={() =>
                      setReplicating({ row, year: row.start_year + 1 })
                    }
                  >
                    Replicate
                  </Button>
                </Table.Td>
                <Table.Td onClick={(event) => event.stopPropagation()}>
                  <Group gap="xs" justify="center">
                    <ActionIcon
                      variant="light"
                      aria-label="Edit fee structure"
                      onClick={() => setDraft({ ...row })}
                    >
                      <PencilSimple size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      aria-label="Remove fee structure"
                      onClick={() => remove(row)}
                    >
                      <Trash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={Boolean(replicating)}
        onClose={() => setReplicating(null)}
        title="Replicate into a new session"
        centered
      >
        <Stack>
          <NumberInput
            label="Starting year of the new session"
            value={replicating?.year}
            onChange={(value) =>
              setReplicating((current) => ({ ...current, year: value }))
            }
            min={2000}
            max={2100}
          />
          <Text size="sm" c="dimmed">
            Every head is copied, so only what changed needs editing.
          </Text>
          <Button onClick={replicate}>
            Copy into {academicYear(replicating?.year)}
          </Button>
        </Stack>
      </Modal>

      {preview && (
        <FeeStructurePreview
          structure={preview}
          onClose={() => setPreview(null)}
        />
      )}

      {draft && (
        <FeeStructureEditor
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          saving={saving}
          onClose={() => setDraft(null)}
        />
      )}

      {bankDraft && (
        <Modal
          opened
          onClose={() => setBankDraft(null)}
          title="Bank Account Details for the Demand Letter"
          size="lg"
          centered
        >
          <Stack gap="md">
            <Text size="xs" c="dimmed">
              One shared record -- printed on every Demand Letter, for every
              programme and every academic year.
            </Text>
            <Group grow align="flex-start">
              <BankAccountFields
                heading="Academic Fee"
                account={bankDraft.academic_fee_account ?? {}}
                onChange={(field, value) =>
                  setBankDraft((current) => ({
                    ...current,
                    academic_fee_account: {
                      ...current.academic_fee_account,
                      [field]: value,
                    },
                  }))
                }
              />
              <BankAccountFields
                heading="Mess Fee"
                account={bankDraft.mess_fee_account ?? {}}
                onChange={(field, value) =>
                  setBankDraft((current) => ({
                    ...current,
                    mess_fee_account: {
                      ...current.mess_fee_account,
                      [field]: value,
                    },
                  }))
                }
              />
            </Group>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setBankDraft(null)}>
                Cancel
              </Button>
              <Button onClick={saveBankDetails} loading={bankSaving}>
                Save
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </Stack>
  );
}

function FeeStructurePreview({ structure, onClose }) {
  const columns = [
    { key: "general", label: structure.general_label },
    { key: "concession", label: structure.concession_label },
  ];

  return (
    <Modal
      opened
      onClose={onClose}
      size="80%"
      centered
      title={`Fee Structure for Session ${structure.academic_year} — ${structure.long_name}`}
    >
      <Stack gap="md">
        {SECTIONS.map((section) => (
          <Paper key={section.key} withBorder radius="sm" p="sm">
            <Text fw={700} ta="center" mb="xs">
              {section.title}
            </Text>
            <Table withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={70}>S.No.</Table.Th>
                  <Table.Th>Head</Table.Th>
                  {columns.map((column) => (
                    <Table.Th key={column.key} ta="right">
                      {column.label}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(structure[section.key] ?? []).map((row, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Table.Tr key={index}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{row.head}</Table.Td>
                    {columns.map((column) => (
                      <Table.Td key={column.key} ta="right">
                        {Array.isArray(row[column.key])
                          ? row[column.key].join(" / ")
                          : row[column.key] || "—"}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
                <Table.Tr>
                  <Table.Td />
                  <Table.Td>
                    <Text fw={700}>{section.total}</Text>
                  </Table.Td>
                  {columns.map((column) => (
                    <Table.Td key={column.key} ta="right">
                      <Text fw={700}>
                        {indian(
                          sumSection(structure[section.key], column.key, 1),
                        )}
                      </Text>
                    </Table.Td>
                  ))}
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Paper>
        ))}

        <Paper withBorder radius="sm" p="sm">
          <Text fw={700} ta="center" mb="xs">
            Grand Total (A+B+C) in Rs.
          </Text>
          <Table withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Category</Table.Th>
                {(structure.grand_total ?? []).map((entry) => (
                  <Table.Th key={entry.semester} ta="right">
                    Sem-{entry.semester}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {columns.map((column) => (
                <Table.Tr key={column.key}>
                  <Table.Td>{column.label}</Table.Td>
                  {(structure.grand_total ?? []).map((entry) => (
                    <Table.Td key={entry.semester} ta="right">
                      {indian(entry[column.key])}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <Paper withBorder radius="sm" p="sm">
          <Text fw={700} ta="center" mb="xs">
            D. Semester Fees (Mess) – Per semester
          </Text>
          <Text ta="center">
            Mess Advance: {indian(structure.mess_advance_per_semester)}
          </Text>
        </Paper>

        {Boolean(structure.notes?.length) && (
          <Stack gap={4}>
            {structure.notes.map((note) => (
              <Text key={note} size="sm">
                • {note}
              </Text>
            ))}
          </Stack>
        )}

        <Text size="xs" c="dimmed" ta="center">
          Read only. Use the edit icon on the row to change these figures.
        </Text>
      </Stack>
    </Modal>
  );
}

function FeeStructureEditor({ draft, setDraft, onSave, saving, onClose }) {
  const semesters = Number(draft.semester_count) || 1;
  const columns = [
    { key: "general", label: draft.general_label || "Gen/OBC/EWS" },
    { key: "concession", label: draft.concession_label || "PWD/SC/ST" },
  ];

  const set = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const setHead = (section, index, patch) =>
    setDraft((current) => ({
      ...current,
      [section]: current[section].map((row, position) =>
        position === index ? { ...row, ...patch } : row,
      ),
    }));

  const addHead = (section) =>
    setDraft((current) => ({
      ...current,
      [section]: [
        ...current[section],
        { head: "", general: "", concession: "" },
      ],
    }));

  const removeHead = (section, index) =>
    setDraft((current) => ({
      ...current,
      [section]: current[section].filter((_, position) => position !== index),
    }));

  const grandTotal = useMemo(
    () =>
      Array.from({ length: semesters }, (_, offset) => {
        const semester = offset + 1;
        const of = (column) =>
          sumSection(draft.semester_heads, column, semester) +
          sumSection(draft.tuition_hostel_heads, column, semester) +
          (semester === 1 ? sumSection(draft.one_time_heads, column, 1) : 0);
        return {
          semester,
          general: of("general"),
          concession: of("concession"),
        };
      }),
    [draft, semesters],
  );

  return (
    <Modal
      opened
      onClose={onClose}
      title={`Fee Structure for Session ${academicYear(draft.start_year)}`}
      size="90%"
      centered
    >
      <Stack gap="lg">
        <Group grow align="flex-start">
          <Select
            label="Name"
            data={CATEGORIES}
            value={draft.programme_category}
            onChange={(value) => set({ programme_category: value })}
          />
          <NumberInput
            label="Academic year starts"
            value={draft.start_year}
            onChange={(value) => set({ start_year: value })}
            min={2000}
            max={2100}
          />
          <NumberInput
            label="Semesters"
            value={draft.semester_count}
            onChange={(value) => set({ semester_count: value })}
            min={1}
            max={20}
          />
          <TextInput
            label="Mess advance (per semester)"
            value={draft.mess_advance_per_semester ?? ""}
            onChange={(event) =>
              set({ mess_advance_per_semester: event.currentTarget.value })
            }
          />
        </Group>

        <Group grow>
          <TextInput
            label="First column heading"
            value={draft.general_label ?? ""}
            onChange={(event) =>
              set({ general_label: event.currentTarget.value })
            }
          />
          <TextInput
            label="Second column heading"
            value={draft.concession_label ?? ""}
            onChange={(event) =>
              set({ concession_label: event.currentTarget.value })
            }
          />
        </Group>

        {SECTIONS.map((section) => (
          <SectionEditor
            key={section.key}
            section={section}
            rows={draft[section.key] ?? []}
            columns={columns}
            semesters={semesters}
            onChange={(index, patch) => setHead(section.key, index, patch)}
            onAdd={() => addHead(section.key)}
            onRemove={(index) => removeHead(section.key, index)}
          />
        ))}

        <Paper withBorder radius="sm" p="sm">
          <Text fw={700} ta="center" mb="xs">
            Grand Total (A+B+C) in Rs.
          </Text>
          <Table withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Category</Table.Th>
                {grandTotal.map((entry) => (
                  <Table.Th key={entry.semester}>Sem-{entry.semester}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {columns.map((column) => (
                <Table.Tr key={column.key}>
                  <Table.Td>{column.label}</Table.Td>
                  {grandTotal.map((entry) => (
                    <Table.Td key={entry.semester}>
                      {indian(entry[column.key])}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Text size="xs" c="dimmed" mt="xs">
            Calculated from the heads above. Mess is added separately on the
            certificate.
          </Text>
        </Paper>

        <NotesEditor
          notes={draft.notes ?? []}
          onChange={(notes) => set({ notes })}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} loading={saving}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function SectionEditor({
  section,
  rows,
  columns,
  semesters,
  onChange,
  onAdd,
  onRemove,
}) {
  return (
    <Paper withBorder radius="sm" p="sm">
      <Group justify="space-between" mb="xs">
        <Text fw={700}>{section.title}</Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<Plus size={14} />}
          onClick={onAdd}
        >
          Add head
        </Button>
      </Group>
      <Table withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={60}>S.No.</Table.Th>
            <Table.Th>Head</Table.Th>
            {columns.map((column) => (
              <Table.Th key={column.key}>{column.label}</Table.Th>
            ))}
            <Table.Th w={60} aria-label="Remove head" />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Table.Tr key={index}>
              <Table.Td>{index + 1}</Table.Td>
              <Table.Td>
                <TextInput
                  value={row.head ?? ""}
                  placeholder="Head"
                  onChange={(event) =>
                    onChange(index, { head: event.currentTarget.value })
                  }
                />
              </Table.Td>
              {columns.map((column) => (
                <Table.Td key={column.key}>
                  <AmountField
                    value={row[column.key]}
                    semesters={semesters}
                    allowPerSemester={Boolean(section.perSemester)}
                    onChange={(value) =>
                      onChange(index, { [column.key]: value })
                    }
                  />
                </Table.Td>
              ))}
              <Table.Td>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label="Remove head"
                  onClick={() => onRemove(index)}
                >
                  <Trash size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
          <Table.Tr>
            <Table.Td />
            <Table.Td>
              <Text fw={700}>{section.total}</Text>
            </Table.Td>
            {columns.map((column) => (
              <Table.Td key={column.key}>
                <Text fw={700}>
                  {indian(sumSection(rows, column.key, 1))}
                  {section.perSemester && semesters > 1 && (
                    <Text span size="xs" c="dimmed">
                      {" "}
                      (Sem-1)
                    </Text>
                  )}
                </Text>
              </Table.Td>
            ))}
            <Table.Td />
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

function AmountField({ value, semesters, allowPerSemester, onChange }) {
  const perSemester = Array.isArray(value);

  const toggle = (checked) => {
    if (checked) {
      onChange(Array.from({ length: semesters }, () => String(value ?? "")));
    } else {
      onChange(String(value?.[0] ?? ""));
    }
  };

  if (!perSemester) {
    return (
      <Stack gap={4}>
        <TextInput
          value={value ?? ""}
          placeholder="Amount or NIL"
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        {allowPerSemester && semesters > 1 && (
          <Switch
            size="xs"
            label="Varies by semester"
            checked={false}
            onChange={(event) => toggle(event.currentTarget.checked)}
          />
        )}
      </Stack>
    );
  }

  return (
    <Stack gap={4}>
      <Group gap={4} wrap="wrap">
        {Array.from({ length: semesters }, (_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <TextInput
            key={index}
            w={90}
            size="xs"
            label={`Sem-${index + 1}`}
            value={value[index] ?? ""}
            onChange={(event) => {
              const next = [...value];
              next[index] = event.currentTarget.value;
              onChange(next);
            }}
          />
        ))}
      </Group>
      <Switch
        size="xs"
        label="Varies by semester"
        checked
        onChange={(event) => toggle(event.currentTarget.checked)}
      />
    </Stack>
  );
}

function BankAccountFields({ heading, account, onChange }) {
  return (
    <Stack gap="xs">
      <Text fw={600} size="sm">
        {heading}
      </Text>
      <TextInput
        label="Account Name"
        value={account.name ?? ""}
        onChange={(event) => onChange("name", event.currentTarget.value)}
      />
      <TextInput
        label="Account Number"
        value={account.number ?? ""}
        onChange={(event) => onChange("number", event.currentTarget.value)}
      />
      <TextInput
        label="IFSC"
        value={account.ifsc ?? ""}
        onChange={(event) => onChange("ifsc", event.currentTarget.value)}
      />
      <TextInput
        label="Bank & Branch"
        value={account.bank_branch ?? ""}
        onChange={(event) => onChange("bank_branch", event.currentTarget.value)}
      />
      <TextInput
        label="Account Type"
        value={account.account_type ?? ""}
        onChange={(event) =>
          onChange("account_type", event.currentTarget.value)
        }
      />
    </Stack>
  );
}

BankAccountFields.propTypes = {
  heading: PropTypes.string.isRequired,
  account: PropTypes.shape({
    name: PropTypes.string,
    number: PropTypes.string,
    ifsc: PropTypes.string,
    bank_branch: PropTypes.string,
    account_type: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

function NotesEditor({ notes, onChange }) {
  return (
    <Paper withBorder radius="sm" p="sm">
      <Group justify="space-between" mb="xs">
        <Text fw={700}>Notes printed on the certificate</Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<Plus size={14} />}
          onClick={() => onChange([...notes, ""])}
        >
          Add note
        </Button>
      </Group>
      <Stack gap="xs">
        {!notes.length && (
          <Alert color="blue" icon={<Info size={16} />} p="xs">
            No notes. The certificate will show none.
          </Alert>
        )}
        {notes.map((note, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Group key={index} gap="xs" wrap="nowrap">
            <TextInput
              style={{ flex: 1 }}
              value={note}
              onChange={(event) => {
                const next = [...notes];
                next[index] = event.currentTarget.value;
                onChange(next);
              }}
            />
            <ActionIcon
              variant="subtle"
              color="red"
              aria-label="Remove note"
              onClick={() => onChange(notes.filter((_, at) => at !== index))}
            >
              <Trash size={16} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}

const headShape = PropTypes.shape({
  head: PropTypes.string,
  general: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  concession: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
});

const columnShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

FeeStructureEditor.propTypes = {
  draft: PropTypes.shape({
    id: PropTypes.number,
    programme_category: PropTypes.string,
    start_year: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    semester_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    general_label: PropTypes.string,
    concession_label: PropTypes.string,
    mess_advance_per_semester: PropTypes.string,
    notes: PropTypes.arrayOf(PropTypes.string),
    one_time_heads: PropTypes.arrayOf(headShape),
    semester_heads: PropTypes.arrayOf(headShape),
    tuition_hostel_heads: PropTypes.arrayOf(headShape),
  }).isRequired,
  setDraft: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

SectionEditor.propTypes = {
  section: PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    total: PropTypes.string.isRequired,
    perSemester: PropTypes.bool,
  }).isRequired,
  rows: PropTypes.arrayOf(headShape).isRequired,
  columns: PropTypes.arrayOf(columnShape).isRequired,
  semesters: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

AmountField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  semesters: PropTypes.number.isRequired,
  allowPerSemester: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

AmountField.defaultProps = {
  value: "",
  allowPerSemester: false,
};

FeeStructurePreview.propTypes = {
  structure: PropTypes.shape({
    long_name: PropTypes.string,
    academic_year: PropTypes.string,
    general_label: PropTypes.string,
    concession_label: PropTypes.string,
    semester_count: PropTypes.number,
    mess_advance_per_semester: PropTypes.string,
    notes: PropTypes.arrayOf(PropTypes.string),
    grand_total: PropTypes.arrayOf(
      PropTypes.shape({
        semester: PropTypes.number,
        general: PropTypes.string,
        concession: PropTypes.string,
      }),
    ),
    one_time_heads: PropTypes.arrayOf(headShape),
    semester_heads: PropTypes.arrayOf(headShape),
    tuition_hostel_heads: PropTypes.arrayOf(headShape),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

NotesEditor.propTypes = {
  notes: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Badge,
  Button,
  Group,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconDownload,
  IconSearch,
  IconSelector,
} from "@tabler/icons-react";

// Every report shows a serial number, searches across all its columns and
// exports what is on screen, so that behaviour lives here rather than in each.
const SERIAL_LABEL = "S. No.";
const HEADER_FILL = "FF366092";

// A column may give `format` for how a value reads on screen and `numFmt` for
// the same in Excel, so a number can show as "7.0" yet export as a number.
const shown = (column, row) =>
  column.format ? column.format(row[column.key]) : row[column.key];

// Sorting compares the stored value, not the text on screen, so 10 comes after
// 9 and 7.25 before 7.5. A number kept as text ("148") sorts as a number; any
// other text sorts by letters, with digit runs in order ("Summer 2" before
// "Summer 10"). Empty cells and "-" go last in either direction.
const NUMBER = /^-?\d+(\.\d+)?$/;
const asNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && NUMBER.test(value.trim())) {
    return Number(value);
  }
  return null;
};
const isEmpty = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && ["", "-"].includes(value.trim()));

export function compareValues(a, b) {
  const x = asNumber(a);
  const y = asNumber(b);
  if (x !== null && y !== null) return x - y;
  if (x !== null) return -1; // numbers before text, e.g. 4 before "Summer 2"
  if (y !== null) return 1;
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function sortRows(rows, key, direction) {
  const sign = direction === "desc" ? -1 : 1;
  // Array.prototype.sort is stable, so ties keep the order the server sent.
  return [...rows].sort((p, q) => {
    const a = p[key];
    const b = q[key];
    if (isEmpty(a) || isEmpty(b)) return isEmpty(a) - isEmpty(b);
    return sign * compareValues(a, b);
  });
}

// Each click on a header goes ascending, then descending, then back to the
// order the report came in.
const NEXT = { none: "asc", asc: "desc", desc: "none" };
const ARIA = { asc: "ascending", desc: "descending", none: "none" };
const SORT_ICON = {
  asc: IconChevronUp,
  desc: IconChevronDown,
  none: IconSelector,
};

// A workbook rather than a csv, so the export carries the ruled grid and
// header the office's other exports have. exceljs is lazy-loaded.
async function writeWorkbook(columns, rows, filename, sheetName) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31) || "Report");

  sheet.columns = [
    { header: SERIAL_LABEL, key: "__serial__", width: 8 },
    ...columns.map((column) => ({
      header: column.label,
      key: column.key,
      width: Math.max(12, Math.min(45, column.label.length + 6)),
      ...(column.numFmt ? { style: { numFmt: column.numFmt } } : {}),
    })),
  ];

  rows.forEach((row, index) => {
    sheet.addRow({
      __serial__: index + 1,
      ...Object.fromEntries(
        columns.map((column) => [column.key, row[column.key] ?? ""]),
      ),
    });
  });

  const thin = { style: "thin", color: { argb: "FF9AA5B1" } };
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = { top: thin, left: thin, bottom: thin, right: thin };
      cell.alignment = { vertical: "middle", wrapText: true };
      if (rowNumber === 1) {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: HEADER_FILL },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      }
    });
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ReportTable({ columns, rows, filename, badges = [] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: null, direction: "none" });

  // A sort on a column the report no longer shows (e.g. Semester after one
  // semester is fetched) is ignored rather than applied to hidden data.
  const sortKey = columns.some((column) => column.key === sort.key)
    ? sort.key
    : null;
  const directionOf = (key) => (key === sortKey ? sort.direction : "none");

  const toggleSort = (key) => {
    const direction = NEXT[directionOf(key)];
    setSort({ key: direction === "none" ? null : key, direction });
  };

  // Search first, then sort; S. No. and the Excel file follow what is shown.
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const found = needle
      ? rows.filter((row) =>
          columns.some((column) =>
            String(shown(column, row) ?? "")
              .toLowerCase()
              .includes(needle),
          ),
        )
      : rows;
    return sortKey ? sortRows(found, sortKey, sort.direction) : found;
  }, [columns, rows, query, sortKey, sort.direction]);

  const [exporting, setExporting] = useState(false);

  const download = async () => {
    setExporting(true);
    try {
      await writeWorkbook(columns, visible, `${filename}.xlsx`, filename);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Search these rows"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          style={{ flex: 1, minWidth: 220, maxWidth: 420 }}
        />
        <Button
          variant="light"
          leftSection={<IconDownload size={16} />}
          onClick={download}
          loading={exporting}
          disabled={!visible.length}
          style={{ flexShrink: 0 }}
        >
          Download Excel
        </Button>
      </Group>

      <Group gap="xs">
        <Badge color="blue">
          {query.trim()
            ? `${visible.length} of ${rows.length} rows`
            : `${rows.length} rows`}
        </Badge>
        {badges?.map((badge) => (
          <Badge key={badge.label} color={badge.color}>
            {badge.label}
          </Badge>
        ))}
      </Group>

      {visible.length === 0 ? (
        <Text size="sm" c="dimmed">
          {rows.length ? "Nothing matches that search." : "No rows to show."}
        </Text>
      ) : (
        <ScrollArea.Autosize mah="58vh" type="auto">
          <Table striped highlightOnHover withTableBorder miw={1100}>
            <Table.Thead
              style={{ position: "sticky", top: 0, background: "#f8fafc" }}
            >
              <Table.Tr>
                <Table.Th w={70}>{SERIAL_LABEL}</Table.Th>
                {columns.map((column) => {
                  const direction = directionOf(column.key);
                  const Icon = SORT_ICON[direction];
                  return (
                    <Table.Th key={column.key} aria-sort={ARIA[direction]}>
                      <UnstyledButton
                        onClick={() => toggleSort(column.key)}
                        title={`Sort by ${column.label}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          font: "inherit",
                          color: "inherit",
                        }}
                      >
                        {column.label}
                        <Icon
                          size={14}
                          aria-hidden
                          style={{
                            flexShrink: 0,
                            opacity: direction === "none" ? 0.45 : 1,
                          }}
                        />
                      </UnstyledButton>
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visible.map((row, index) => (
                <Table.Tr
                  key={`${index}-${columns.map((c) => row[c.key]).join("|")}`}
                >
                  <Table.Td>{index + 1}</Table.Td>
                  {columns.map((column) => (
                    <Table.Td key={column.key}>{shown(column, row)}</Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
      )}
    </Stack>
  );
}

ReportTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      format: PropTypes.func,
      numFmt: PropTypes.string,
    }),
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  filename: PropTypes.string.isRequired,
  badges: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, color: PropTypes.string }),
  ),
};

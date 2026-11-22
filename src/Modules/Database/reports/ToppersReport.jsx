import { useState } from "react";
import { Group, Select, Stack, Text } from "@mantine/core";
import ReportTable from "../ReportTable";
import { fileName } from "./batchFilters";
import {
  fetchButton,
  filtersShape,
  spiCpiColumns,
  useSpiCpi,
} from "./SpiCpiReport";

const TOP_OPTIONS = ["5", "10", "15", "20"].map((n) => ({
  value: n,
  label: `Top ${n}`,
}));
const RANK_BY = [
  { value: "cpi", label: "CPI" },
  { value: "spi", label: "SPI" },
];
const WITHIN = [
  { value: "discipline", label: "Each discipline" },
  { value: "all", label: "Whole selection" },
];

// The top ``top`` students by ``by`` (cpi or spi), in each discipline or
// across all the rows. Students without grades, and withdrawn students, are
// left out. Equal values
// share a rank and the next rank skips (1, 1, 3), so everyone tied at the
// last place is kept and a list can be longer than ``top``. Disciplines come
// in name order, each best first, ties by roll number.
export function rankToppers(rows, { by, top, within }) {
  const groups = new Map();
  rows
    // Withdrawn students are not ranked with their batch.
    .filter((row) => typeof row[by] === "number" && row.status !== "Withdrawn")
    .forEach((row) => {
      const key = within === "discipline" ? (row.discipline ?? "") : "";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    });

  return [...groups.keys()]
    .sort((a, b) => a.localeCompare(b))
    .flatMap((key) => {
      const sorted = groups
        .get(key)
        .sort(
          (a, b) =>
            b[by] - a[by] || String(a.roll_no).localeCompare(String(b.roll_no)),
        );
      let rank = 0;
      return sorted
        .map((row, index) => {
          if (index === 0 || row[by] !== sorted[index - 1][by])
            rank = index + 1;
          return { ...row, rank };
        })
        .filter((row) => row.rank <= top);
    });
}

export default function ToppersReport({ filters }) {
  const spiCpi = useSpiCpi(filters);
  const [top, setTop] = useState("10");
  const [by, setBy] = useState("cpi");
  const [within, setWithin] = useState("discipline");
  const { result } = spiCpi;

  const rows = result
    ? rankToppers(result.rows, {
        by: result.by,
        top: Number(result.top),
        within: result.within,
      })
    : [];
  // Ties at the last place make a group longer than asked for.
  const perGroup = {};
  rows.forEach((row) => {
    const key = result.within === "discipline" ? (row.discipline ?? "") : "";
    perGroup[key] = (perGroup[key] || 0) + 1;
  });
  const longer =
    result && Object.values(perGroup).some((n) => n > Number(result.top));
  const byLabel = result && RANK_BY.find((o) => o.value === result.by).label;

  return (
    <Stack gap="md">
      <Group align="flex-end" gap="md">
        {spiCpi.fields}
      </Group>
      <Group align="flex-end" gap="md">
        <Select
          label="Show"
          data={TOP_OPTIONS}
          value={top}
          onChange={(v) => v && setTop(v)}
          allowDeselect={false}
          style={{ flex: 1, minWidth: 120 }}
        />
        <Select
          label="Rank by"
          data={RANK_BY}
          value={by}
          onChange={(v) => v && setBy(v)}
          allowDeselect={false}
          style={{ flex: 1, minWidth: 120 }}
        />
        <Select
          label="Rank within"
          data={WITHIN}
          value={within}
          onChange={(v) => v && setWithin(v)}
          allowDeselect={false}
          style={{ flex: 1, minWidth: 160 }}
        />
        {fetchButton(
          () => spiCpi.run({ top, by, within }),
          spiCpi.loading,
          !spiCpi.batch,
        )}
      </Group>

      {result ? (
        <ReportTable
          columns={[{ key: "rank", label: "Rank" }, ...spiCpiColumns(result)]}
          rows={rows}
          filename={fileName(
            "toppers",
            result,
            result.semester ? `sem${result.semester}` : "latest",
            `top${result.top}`,
            result.by,
            result.within === "all" ? "overall" : "",
          )}
          badges={[
            {
              label: `Top ${result.top} by ${byLabel} ${
                result.within === "all"
                  ? "across the selection"
                  : "in each discipline"
              }`,
              color: "grape",
            },
            {
              label: result.semester
                ? `Semester ${result.semester}`
                : "Latest graded term",
              color: "teal",
            },
            ...(longer
              ? [{ label: "Ties share a rank", color: "yellow" }]
              : []),
          ]}
        />
      ) : (
        <Text size="sm" c="dimmed">
          Choose a batch and how many toppers to show, and a programme,
          discipline or semester if you want one, then fetch. Students are
          ranked by CPI (or SPI) in each discipline, or across everything
          chosen. Students with the same value share a rank, so a list can be
          longer than asked for. Without a semester, each student&apos;s latest
          term with grades is used, as on the SPI and CPI report.
        </Text>
      )}
    </Stack>
  );
}

ToppersReport.propTypes = { filters: filtersShape.isRequired };

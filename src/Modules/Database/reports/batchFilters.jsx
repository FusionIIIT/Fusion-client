import { useMemo, useState } from "react";
import { Select, Text } from "@mantine/core";

// The batch, programme and discipline pickers that the SPI and CPI, toppers
// and category reports share. Batch is required; the other two narrow it.

export const PROGRAMME_LABELS = { UG: "UG", PG: "PG", PHD: "PhD" };

export const asOptions = (values) =>
  (values || []).map((v) => ({ value: String(v), label: String(v) }));

export const optional = (text) => (
  <>
    {text}{" "}
    <Text component="span" size="xs" c="dimmed" fw={400}>
      (optional)
    </Text>
  </>
);

export function useBatchFilters(filters) {
  const [batch, setBatch] = useState(null);
  const [programme, setProgramme] = useState(null);
  const [batchId, setBatchId] = useState(null);

  const disciplines = useMemo(
    () =>
      (filters.discipline_batches || [])
        .filter(
          (b) =>
            String(b.year) === batch &&
            (!programme || b.category === programme),
        )
        .map((b) => ({ value: String(b.id), label: b.label })),
    [filters, batch, programme],
  );

  const programmes = (filters.programme_categories || []).map((c) => ({
    value: c,
    label: PROGRAMME_LABELS[c] || c,
  }));

  // A chosen discipline belongs to one batch and programme, so it is cleared
  // when either changes.
  const pickBatch = (value) => {
    setBatch(value);
    setBatchId(null);
  };

  const pickProgramme = (value) => {
    setProgramme(value);
    setBatchId(null);
  };

  const fields = (
    <>
      <Select
        label="Batch"
        placeholder="Select batch"
        data={asOptions(filters.batches)}
        value={batch}
        onChange={pickBatch}
        style={{ flex: 1, minWidth: 130 }}
      />
      <Select
        label={optional("Programme")}
        placeholder="All programmes"
        data={programmes}
        value={programme}
        onChange={pickProgramme}
        clearable
        style={{ flex: 1, minWidth: 140 }}
      />
      <Select
        label={optional("Discipline")}
        placeholder={batch ? "All disciplines" : "Select a batch first"}
        data={disciplines}
        value={batchId}
        onChange={setBatchId}
        disabled={!batch}
        clearable
        style={{ flex: 1, minWidth: 160 }}
      />
    </>
  );

  return {
    batch,
    programme,
    fields,
    // The query parameters for what is chosen, and what was chosen, so a
    // fetched report can keep its own copy.
    params: {
      batch,
      ...(programme ? { programme_type: programme } : {}),
      ...(batchId ? { batch_id: batchId } : {}),
    },
    chosen: {
      batch,
      programme,
      discipline: disciplines.find((d) => d.value === batchId)?.label,
    },
  };
}

// "spi_cpi_2024_UG_B_Tech_CSE": a file name from the report and what it was
// fetched for, leaving out what was not chosen.
export const fileName = (prefix, chosen, ...extra) =>
  [
    prefix,
    chosen.batch,
    chosen.programme && PROGRAMME_LABELS[chosen.programme],
    chosen.discipline?.replace(/\W+/g, "_"),
    ...extra,
  ]
    .filter(Boolean)
    .join("_");

export const authHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Token ${token}` } : {};
};

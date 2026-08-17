import {
  Center,
  Checkbox,
  Loader,
  Table,
  Text,
  ThemeIcon,
} from "@mantine/core";
import PropTypes from "prop-types";
import { Tray } from "@phosphor-icons/react";

import { resolveIcon } from "../icons";

export function DataTable({
  rows,
  columns,
  loading = false,
  minWidth = 760,
  rowKey,
  empty,
  selection = undefined,
}) {
  if (loading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!rows.length) {
    const Icon = empty.icon ? resolveIcon(empty.icon) : Tray;
    return (
      <Center py={48}>
        <div style={{ textAlign: "center" }}>
          <ThemeIcon size={48} radius="xl" variant="light" color="gray">
            <Icon size={20} />
          </ThemeIcon>
          <Text fw={600} mt="md">
            {empty.title}
          </Text>
          {empty.description && (
            <Text c="dimmed" size="sm" mt={4}>
              {empty.description}
            </Text>
          )}
        </div>
      </Center>
    );
  }

  const selectable = selection
    ? rows.filter((r) => selection.isSelectable?.(r) ?? true)
    : [];
  const selectedHere = selection
    ? selectable.filter((r) => selection.selected.has(rowKey(r))).length
    : 0;
  const allSelected =
    selectable.length > 0 && selectedHere === selectable.length;

  const toggleAll = () => {
    if (!selection) return;
    const next = new Set(selection.selected);
    selectable.forEach((row) => {
      if (allSelected) next.delete(rowKey(row));
      else next.add(rowKey(row));
    });
    selection.onChange(next);
  };

  const toggleOne = (key) => {
    if (!selection) return;
    const next = new Set(selection.selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    selection.onChange(next);
  };

  return (
    <Table.ScrollContainer minWidth={minWidth}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            {selection && (
              <Table.Th w={40}>
                <Checkbox
                  aria-label="Select all on this page"
                  checked={allSelected}
                  indeterminate={selectedHere > 0 && !allSelected}
                  onChange={toggleAll}
                  disabled={!selectable.length}
                />
              </Table.Th>
            )}
            {columns.map((c) => (
              <Table.Th key={c.key} ta={c.align ?? "left"}>
                {c.header}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            const canSelect = selection?.isSelectable?.(row) ?? true;
            return (
              <Table.Tr
                key={key}
                bg={
                  selection?.selected.has(key)
                    ? "var(--mantine-color-blue-0)"
                    : undefined
                }
              >
                {selection && (
                  <Table.Td>
                    <Checkbox
                      aria-label="Select row"
                      checked={selection.selected.has(key)}
                      onChange={() => toggleOne(key)}
                      disabled={!canSelect}
                    />
                  </Table.Td>
                )}
                {columns.map((c) => (
                  <Table.Td key={c.key} ta={c.align ?? "left"}>
                    {c.render ? c.render(row) : (row[c.key] ?? "—")}
                  </Table.Td>
                ))}
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

DataTable.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.node.isRequired,
      align: PropTypes.oneOf(["left", "right", "center"]),
      render: PropTypes.func,
    }),
  ).isRequired,
  loading: PropTypes.bool,
  minWidth: PropTypes.number,
  rowKey: PropTypes.func.isRequired,
  empty: PropTypes.shape({
    icon: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  selection: PropTypes.shape({
    selected: PropTypes.instanceOf(Set).isRequired,
    onChange: PropTypes.func.isRequired,
    isSelectable: PropTypes.func,
  }),
};

export default DataTable;

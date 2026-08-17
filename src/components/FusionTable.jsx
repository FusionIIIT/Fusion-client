import { memo } from "react";
import { Box, Table, Text } from "@mantine/core";
import PropTypes from "prop-types";

import classes from "./FusionTable.module.css";

const minWidthFor = (columns) => Math.max(560, columns * 140);

function groupRows(elements, groupBy) {
  const groups = new Map();
  elements.forEach((row) => {
    const key = String(row[groupBy] ?? "");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return [...groups.entries()].map(([key, rows]) => ({ key, rows }));
}

const FusionTable = memo(function FusionTable({
  caption = "",
  columnNames,
  elements,
  minWidth,
  width = "100%",
  ariaLabel,
  emptyMessage = "No data available",
  groupBy,
}) {
  if (!Array.isArray(columnNames) || columnNames.length === 0) {
    return <Text c="dimmed">No columns defined</Text>;
  }

  if (!Array.isArray(elements) || elements.length === 0) {
    return (
      <Text c="dimmed" ta="center" p="md">
        {emptyMessage}
      </Text>
    );
  }

  const cell = (row, columnName) => row[columnName] ?? "—";

  const grouping = groupBy && columnNames.includes(groupBy) ? groupBy : null;
  const columns = grouping
    ? [grouping, ...columnNames.filter((name) => name !== grouping)]
    : columnNames;
  const rest = grouping ? columns.slice(1) : columns;
  const groups = grouping ? groupRows(elements, grouping) : [];

  return (
    <>
      <Box visibleFrom="sm">
        <Table.ScrollContainer
          className={classes.scroll}
          type="native"
          minWidth={minWidth ?? minWidthFor(columnNames.length)}
          w={width}
        >
          <Table
            striped
            highlightOnHover
            withTableBorder={false}
            aria-label={ariaLabel || caption || "Data table"}
          >
            <Table.Thead>
              <Table.Tr>
                {columns.map((columnName) => (
                  <Table.Th key={columnName} scope="col">
                    {columnName}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {grouping
                ? groups.map((group) =>
                    group.rows.map((row, rowIndex) => (
                      <Table.Tr key={row.id ?? `${group.key}-${rowIndex}`}>
                        {rowIndex === 0 && (
                          <Table.Td
                            rowSpan={group.rows.length}
                            className={classes.groupCell}
                          >
                            {group.key || "—"}
                          </Table.Td>
                        )}
                        {rest.map((columnName) => (
                          <Table.Td key={columnName}>
                            {cell(row, columnName)}
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    )),
                  )
                : elements.map((row, index) => (
                    <Table.Tr key={row.id ?? index}>
                      {columns.map((columnName) => (
                        <Table.Td key={columnName}>
                          {cell(row, columnName)}
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
            </Table.Tbody>
            {caption && <Table.Caption>{caption}</Table.Caption>}
          </Table>
        </Table.ScrollContainer>
      </Box>

      <Box hiddenFrom="sm">
        <div
          className={classes.cards}
          data-testid="fusion-table-cards"
          aria-label={ariaLabel || caption || undefined}
        >
          {grouping
            ? groups.map((group) => (
                <div key={group.key}>
                  <div className={classes.groupHeading}>
                    {grouping}: {group.key || "—"}
                  </div>
                  {group.rows.map((row, index) => (
                    <div className={classes.card} key={row.id ?? index}>
                      {rest.map((columnName) => (
                        <div className={classes.row} key={columnName}>
                          <span className={classes.label}>{columnName}</span>
                          <span className={classes.value}>
                            {cell(row, columnName)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))
            : elements.map((row, index) => (
                <div className={classes.card} key={row.id ?? index}>
                  {columns.map((columnName) => (
                    <div className={classes.row} key={columnName}>
                      <span className={classes.label}>{columnName}</span>
                      <span className={classes.value}>
                        {cell(row, columnName)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
          {caption && <div className={classes.caption}>{caption}</div>}
        </div>
      </Box>
    </>
  );
});

FusionTable.displayName = "FusionTable";

FusionTable.propTypes = {
  caption: PropTypes.string,
  columnNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  elements: PropTypes.arrayOf(
    PropTypes.objectOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.element,
        PropTypes.node,
      ]),
    ),
  ).isRequired,
  minWidth: PropTypes.number,
  width: PropTypes.string,
  ariaLabel: PropTypes.string,
  emptyMessage: PropTypes.string,
  groupBy: PropTypes.string,
};

export default FusionTable;

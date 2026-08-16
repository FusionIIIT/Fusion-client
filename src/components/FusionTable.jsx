import { memo } from "react";
import { Box, Table, Text } from "@mantine/core";
import PropTypes from "prop-types";

import classes from "./FusionTable.module.css";

const minWidthFor = (columns) => Math.max(560, columns * 140);

const FusionTable = memo(function FusionTable({
  caption = "",
  columnNames,
  elements,
  minWidth,
  width = "100%",
  ariaLabel,
  emptyMessage = "No data available",
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
            className={classes.table}
            aria-label={ariaLabel || caption || "Data table"}
          >
            <Table.Thead>
              <Table.Tr>
                {columnNames.map((columnName) => (
                  <Table.Th key={columnName} scope="col">
                    {columnName}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {elements.map((row, index) => (
                <Table.Tr key={row.id ?? index}>
                  {columnNames.map((columnName) => (
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
          {elements.map((row, index) => (
            <div className={classes.card} key={row.id ?? index}>
              {columnNames.map((columnName) => (
                <div className={classes.row} key={columnName}>
                  <span className={classes.label}>{columnName}</span>
                  <span className={classes.value}>{cell(row, columnName)}</span>
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
};

export default FusionTable;

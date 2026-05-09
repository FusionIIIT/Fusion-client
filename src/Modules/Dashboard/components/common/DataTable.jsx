import PropTypes from "prop-types";
import { Table } from "@mantine/core";
import EmptyState from "./EmptyState";

export default function DataTable({ columns, rows, emptyMessage }) {
  if (!rows.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          {columns.map((column) => (
            <Table.Th key={column.key} style={{ textAlign: "center" }}>
              {column.label}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => (
          <Table.Tr key={row.key}>
            {row.cells.map((cell) => (
              <Table.Td key={cell.key} style={{ textAlign: "center" }}>
                {cell.content}
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      cells: PropTypes.arrayOf(
        PropTypes.shape({
          key: PropTypes.string.isRequired,
          content: PropTypes.node,
        }),
      ).isRequired,
    }),
  ).isRequired,
  emptyMessage: PropTypes.string,
};

DataTable.defaultProps = {
  emptyMessage: "No data found!",
};

import React from "react";
import PropTypes from "prop-types";
import { Table, Box, Text, Group, Badge, ActionIcon } from "@mantine/core";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";

export default function TableComponent({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  onView,
  striped = true,
  highlightOnHover = true,
  isLoading = false,
}) {
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!data || data.length === 0) {
    return (
      <Box
        style={{
          textAlign: "center",
          padding: "2rem",
          color: "#999",
        }}
      >
        <Text>No data available</Text>
      </Box>
    );
  }

  // Helper function to render cell content based on type
  const renderCell = (value, column) => {
    if (!column.render) {
      return value || "-";
    }
    return column.render(value);
  };

  // Helper function to render status badge
  const renderStatus = (status) => {
    const statusColors = {
      approved: "green",
      pending: "yellow",
      rejected: "red",
      completed: "green",
      active: "green",
      inactive: "gray",
    };
    return (
      <Badge
        color={statusColors[status?.toLowerCase()] || "gray"}
        variant="light"
      >
        {status}
      </Badge>
    );
  };

  return (
    <Box style={{ overflowX: "auto" }}>
      <Table striped={striped} highlightOnHover={highlightOnHover}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ minWidth: column.width || "auto" }}>
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete || onView) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((column) => (
                <td key={`${row.id}-${column.key}`}>
                  {column.type === "status"
                    ? renderStatus(row[column.key])
                    : renderCell(row[column.key], column)}
                </td>
              ))}
              {(onEdit || onDelete || onView) && (
                <td>
                  <Group spacing={4}>
                    {onView && (
                      <ActionIcon
                        color="blue"
                        variant="light"
                        onClick={() => onView(row)}
                        title="View"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    )}
                    {onEdit && (
                      <ActionIcon
                        color="yellow"
                        variant="light"
                        onClick={() => onEdit(row)}
                        title="Edit"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    )}
                    {onDelete && (
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => onDelete(row)}
                        title="Delete"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}

TableComponent.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  striped: PropTypes.bool,
  highlightOnHover: PropTypes.bool,
  isLoading: PropTypes.bool,
};

TableComponent.defaultProps = {
  columns: [],
  data: [],
  onEdit: null,
  onDelete: null,
  onView: null,
  striped: true,
  highlightOnHover: true,
  isLoading: false,
};

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Table, Text } from '@mantine/core';

const FusionTable = memo(function FusionTable({ columnNames, elements, width = '100%', ariaLabel }) {
  if (!Array.isArray(columnNames) || columnNames.length === 0) {
    return <Text color="dimmed">No columns defined</Text>;
  }

  if (!Array.isArray(elements) || elements.length === 0) {
    return <Text color="dimmed" ta="center" p="md">No data available</Text>;
  }

  return (
    <div style={{ overflowX: 'auto', width }} role="region" aria-label={ariaLabel || "Data table"}>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            {columnNames.map(col => (
              <th key={col} scope="col">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {elements.map((row, idx) => (
            <tr key={row.id || idx}>
              {columnNames.map(col => (
                <td key={col}>
                  {row[col] != null ? row[col] : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
});

FusionTable.propTypes = {
  columnNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  elements: PropTypes.arrayOf(
    PropTypes.objectOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node,
      ])
    )
  ).isRequired,
  width: PropTypes.string,
  ariaLabel: PropTypes.string,
};

FusionTable.displayName = 'FusionTable';

export default FusionTable;

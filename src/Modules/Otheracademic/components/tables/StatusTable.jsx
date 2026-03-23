/**
 * Reusable Status Table Component.
 * Used for displaying status of requests (Leave, Bonafide, Assistantship).
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Table, Paper, Loader } from '@mantine/core';
import '../styles/StatusTable.css';

function StatusTable({
  title,
  fetchData,
  columns,
  statusField = 'status',
  emptyMessage = 'No records found.',
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchData();
        setData(Array.isArray(result) ? result : []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchData]);

  const getStatusClass = (status) => {
    const statusLower = String(status).toLowerCase();
    if (statusLower === 'approved') return 'status-approved';
    if (statusLower === 'rejected') return 'status-rejected';
    return 'status-pending';
  };

  if (loading) {
    return (
      <div className="loader-container">
        <Loader color="blue" size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <Paper className="status-table-container">
      {title && <h2 className="status-table-title">{title}</h2>}
      <div className="table-wrapper">
        {data.length === 0 ? (
          <p className="empty-message">{emptyMessage}</p>
        ) : (
          <Table striped highlightOnHover className="status-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  {columns.map((col, idx) => {
                    const value = col.render ? col.render(item) : item[col.field];
                    const isStatusColumn = col.field === statusField;

                    return (
                      <td
                        key={idx}
                        className={isStatusColumn ? getStatusClass(value) : ''}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Paper>
  );
}

StatusTable.propTypes = {
  title: PropTypes.string,
  fetchData: PropTypes.func.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
    })
  ).isRequired,
  statusField: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default StatusTable;

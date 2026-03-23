/**
 * Reusable Approval Table Component.
 * Used across all admin approval pages (Leave, Assistantship, etc.)
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Table, Paper, Switch, Button, Modal, Text, Loader } from '@mantine/core';
import '../styles/ApprovalTable.css';

function ApprovalTable({
  title,
  fetchData,
  updateStatus,
  columns,
  renderModalContent,
  idField = 'id',
  nameField = 'name',
  rollNoField = 'roll_no',
}) {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchData();
      if (Array.isArray(data)) {
        setRequests(data);
        setStatus(data.map(() => ({
          approveCheck: false,
          rejectCheck: false,
          submitted: false,
        })));
      }
      setError(null);
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = (index, stat) => {
    setStatus((prevStatus) =>
      prevStatus.map((item, i) => {
        if (i === index) {
          if (stat.type === 'approve') {
            if (stat.value && item.rejectCheck) {
              return { ...item, approveCheck: true, rejectCheck: false };
            }
            return { ...item, approveCheck: stat.value };
          }
          if (stat.value && item.approveCheck) {
            return { ...item, approveCheck: false, rejectCheck: true };
          }
          return { ...item, rejectCheck: stat.value };
        }
        return item;
      })
    );
  };

  const handleViewForm = (index) => {
    setSelectedItem(requests[index]);
    setModalOpened(true);
  };

  const handleSubmit = async () => {
    const updatedStatus = status.map((entry) => {
      if (entry.approveCheck || entry.rejectCheck) {
        return { ...entry, submitted: true };
      }
      return entry;
    });

    setStatus(updatedStatus);

    const approvedIds = requests
      .filter((_, index) => status[index]?.approveCheck)
      .map((item) => item[idField]);

    const rejectedIds = requests
      .filter((_, index) => status[index]?.rejectCheck)
      .map((item) => item[idField]);

    try {
      await updateStatus(approvedIds, rejectedIds);
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (index) => {
    if (status[index]?.approveCheck) return 'green';
    if (status[index]?.rejectCheck) return 'red';
    return 'orange';
  };

  const getStatusText = (index) => {
    if (status[index]?.approveCheck) return 'Approved';
    if (status[index]?.rejectCheck) return 'Rejected';
    return 'Pending';
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
    <>
      <Paper className="approval-table-container">
        {title && <h2 className="approval-table-title">{title}</h2>}
        <div className="table-wrapper">
          <Table striped highlightOnHover className="approval-table">
            <thead>
              <tr>
                <th>Roll No</th>
                {columns.map((col, idx) => (
                  <th key={idx}>{col.label}</th>
                ))}
                <th>Approve/Reject</th>
                <th>View Form</th>
                <th>Current Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item, index) => (
                <tr key={index}>
                  <td>{item[rollNoField]}</td>
                  {columns.map((col, idx) => (
                    <td key={idx}>{col.render ? col.render(item) : item[col.field]}</td>
                  ))}
                  <td>
                    {!status[index]?.submitted ? (
                      <div className="toggle-container">
                        <Switch
                          label="Approve"
                          checked={status[index]?.approveCheck}
                          onChange={(event) =>
                            handleToggle(index, {
                              type: 'approve',
                              value: event.currentTarget.checked,
                            })
                          }
                        />
                        <Switch
                          label="Reject"
                          checked={status[index]?.rejectCheck}
                          onChange={(event) =>
                            handleToggle(index, {
                              type: 'reject',
                              value: event.currentTarget.checked,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <Text>{getStatusText(index)}</Text>
                    )}
                  </td>
                  <td>
                    <button
                      className="view-form-btn"
                      onClick={() => handleViewForm(index)}
                    >
                      View Form
                    </button>
                  </td>
                  <td style={{ color: getStatusColor(index) }}>
                    {getStatusText(index)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <center>
          <Button onClick={handleSubmit} mt="md">
            Submit
          </Button>
        </center>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={<Text style={{ fontSize: '25px' }}>Form Details</Text>}
        centered
        size="lg"
      >
        {selectedItem && renderModalContent && renderModalContent(selectedItem)}
      </Modal>
    </>
  );
}

ApprovalTable.propTypes = {
  title: PropTypes.string,
  fetchData: PropTypes.func.isRequired,
  updateStatus: PropTypes.func.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
    })
  ).isRequired,
  renderModalContent: PropTypes.func,
  idField: PropTypes.string,
  nameField: PropTypes.string,
  rollNoField: PropTypes.string,
};

export default ApprovalTable;

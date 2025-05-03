import React, { useEffect, useState } from 'react';
import { Table, Badge, Text, Loader, Alert } from '@mantine/core';
import axios from 'axios';

import { studentListRequestsRoute } from '../../routes/academicRoutes';

export default function ReplacementRequestStudent() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No auth token');
      setLoading(false);
      return;
    }

    axios.get(studentListRequestsRoute, {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => setRequests(res.data))
    .catch(err => setError(err.response?.data?.detail || err.message))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error)   return <Alert title="Error" color="red">{error}</Alert>;

  if (!requests.length) {
    return <Alert color='yellow'>You have not submitted any replacement requests.</Alert>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Old Course</th>
          <th>New Course</th>
          <th>Status</th>
          <th>Academic Year</th>
          <th>Semester Type</th>
          <th>Requested At</th>
        </tr>
      </thead>
      <tbody>
        {requests.map(r => (
          <tr key={r.id}>
            <td>{r.old_course}</td>
            <td>{r.new_course}</td>
            <td>
              <Badge color={
                r.status === 'Approved' ? 'green' :
                r.status === 'Rejected' ? 'red' : 'yellow'
              }>
                {r.status}
              </Badge>
            </td>
            <td>{r.academic_year}</td>
            <td>{r.semester_type}</td>
            <td>{new Date(r.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

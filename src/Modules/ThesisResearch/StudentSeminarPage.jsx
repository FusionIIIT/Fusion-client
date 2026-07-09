import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Loader,
  Center,
  Title,
  Space,
  Stack,
  Group,
  Alert,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';

import {
  studentThesisRoute,
  studentSeminarListRoute,
} from '../../routes/academicRoutes';
import StudentSeminarForm from './StudentSeminarForm';
import StudentSeminarView from './StudentSeminarView';

export default function StudentSeminarPage() {
  const [thesis, setThesis]         = useState(null);
  const [reports, setReports]       = useState(null);
  const [error, setError]           = useState('');
  const [mode, setMode]             = useState('list'); // 'list' | 'new' | 'view'
  const [selectedId, setSelectedId] = useState(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      setError('Please log in.');
      return;
    }

    setError('');
    // fetch thesis info
    axios
      .get(studentThesisRoute, { headers: { Authorization: `Token ${token}` } })
      .then(res => {
        const t = res.data;
        setThesis(t);
        if (!t.id) {
          const msg = 'You must submit a thesis topic first.';
          setError(msg);
          setReports([]);
          return Promise.resolve(null);
        }
        return axios.get(studentSeminarListRoute, { headers: { Authorization: `Token ${token}` } });
      })
      .then(res => {
        if (res && res.data) {
          setReports(res.data);
        }
      })
      .catch(err => {
        const msg = err.response?.data?.error || 'Failed to load data.';
        setError(msg);
        showNotification({ title: 'Load Error', message: msg, color: 'red' });
        setThesis({});
        setReports([]);
      });
  }, [token]);

  // show loader until first fetch completes or error occurs
  if ((thesis === null || reports === null) && !error) {
    return (
      <Center style={{ height: 200 }}>
        <Loader />
      </Center>
    );
  }

  // allow new only when thesis is Dean-approved
  const canCreate = thesis?.status === 'dean_approved';
  const openNewForm = () => setMode('new');
  const openDetail  = id => { setSelectedId(id); setMode('view'); };
  const backToList  = () => { setMode('list'); setSelectedId(null); };

  return (
    <Card shadow="sm" padding="lg">
      <Stack spacing="md">
        <Title order={3}>My Seminar Reports</Title>

        {error && (
          <Alert color="red">
            {error}
          </Alert>
        )}

        {mode === 'list' && !error && (
          <>
            <Group position="apart">
              <Button onClick={openNewForm} disabled={!canCreate}>
                New Seminar
              </Button>
            </Group>
            <Space h="md" />
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Ver</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td>{r.version}</td>
                    <td>{r.status.replace('_', ' ')}</td>
                    <td>
                      <Button size="xs" onClick={() => openDetail(r.id)}>
                        {r.status === 'draft' ? 'Fill' : 'View'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {mode === 'new' && (
          <>
            <Button variant="outline" onClick={backToList}>
              ← Back to List
            </Button>
            <StudentSeminarForm
              thesisId={thesis.id}
              onSuccess={newId => {
                axios
                  .get(studentSeminarListRoute, { headers: { Authorization: `Token ${token}` } })
                  .then(res => {
                    setReports(res.data);
                    openDetail(newId);
                  })
                  .catch(() =>
                    showNotification({
                      title: 'Reload Failed',
                      message: 'Could not refresh seminars.',
                      color: 'red',
                    })
                  );
              }}
            />
          </>
        )}

        {mode === 'view' && selectedId && (
          <>
            <Button variant="outline" onClick={backToList}>
              ← Back to List
            </Button>
            <StudentSeminarView id={selectedId} />
          </>
        )}
      </Stack>
    </Card>
  );
}
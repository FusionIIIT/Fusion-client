// src/components/thesis/SupervisorDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Card,
  Title,
  Tabs,
  Center,
  Loader,
  Notification,
  Table,
  Button,
} from '@mantine/core';
import axios from 'axios';
import SupervisorAssignmentPanel from './SupervisorAssignmentPanel';
import { supervisorDashboardRouteThesisSubmission } from '../../../routes/academicRoutes';
export default function SupervisorDashboardSub() {
  const [data, setData]           = useState({ pending: [], forwarded: [] });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(supervisorDashboardRouteThesisSubmission, {
        headers: { Authorization: `Token ${token}` },
      });
      setData({
        pending: res.data.pending.map((s) => ({ ...s, status: 'submitted' })),
        forwarded: res.data.forwarded.map((s) => ({ ...s, status: 'supervisor_approved' })),
      });
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return <Notification color="red">Error: {error.message}</Notification>;
  }

  const list = activeTab === 'pending' ? data.pending : data.forwarded;
  const rows = list.map((t) => (
    <tr key={t.id}>
      <td>{t.title}</td>
      <td>
        {new Date(
          activeTab === 'pending'
            ? t.submitted_at
            : t.supervisor_approved_at
        ).toLocaleDateString()}
      </td>
      <td>
        <Button size="xs" onClick={() => setSelected(t)}>
          {activeTab === 'pending' ? 'Assign' : 'View Details'}
        </Button>
      </td>
    </tr>
  ));

  return (
    <Container size="xl" mt="xl">
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={3} align="center" mb="md">
          Supervisor Dashboard
        </Title>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="pending">
              Pending ({data.pending.length})
            </Tabs.Tab>
            <Tabs.Tab value="forwarded">
              Forwarded ({data.forwarded.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="pending" pt="xs">
            <Table highlightOnHover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </Table>
          </Tabs.Panel>

          <Tabs.Panel value="forwarded" pt="xs">
            <Table highlightOnHover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assigned</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </Table>
          </Tabs.Panel>
        </Tabs>

        {selected && (
          <SupervisorAssignmentPanel
            submission={selected}
            readOnly={selected.status !== 'submitted'}
            onClose={() => {
              setSelected(null);
              fetchData();
            }}
          />
        )}
      </Card>
    </Container>
  );
}

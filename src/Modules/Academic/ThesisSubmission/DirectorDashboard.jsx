import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import axios from 'axios';
import DirectorPrioritiesPanel from './DirectorPrioritiesPanel';
import { directorDashboardRoute } from '../../../routes/academicRoutes';

export default function DirectorDashboard() {
  const [data, setData]           = useState({ pending: [], in_review: [] });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error("Authentication required");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await axios.get(directorDashboardRoute, {
        headers: { Authorization: `Token ${token}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setData(res.data || { pending: [], in_review: [] });
    } catch (e) {
      if (axios.isCancel(e)) {
        setError(new Error("Request timeout. Please try again."));
      } else {
        setError(new Error(e.response?.data?.detail || e.message || "Failed to load dashboard"));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderRows = useCallback((list) =>
    list.map((t) => (
      <tr key={t.id}>
        <td>{t.title || 'N/A'}</td>
        <td>
          {t.supervisor_approved_at || t.director_approved_at
            ? new Date(
                activeTab === 'pending'
                  ? t.supervisor_approved_at
                  : t.director_approved_at
              ).toLocaleDateString()
            : 'N/A'}
        </td>
        <td>
          <Button
            size="xs"
            onClick={() => setSelected(t)}
            aria-label={`${activeTab === 'pending' ? 'Prioritize' : 'View details for'} ${t.title}`}
          >
            {activeTab === 'pending' ? 'Prioritize' : 'View Details'}
          </Button>
        </td>
      </tr>
    )), [activeTab]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" aria-label="Loading dashboard data" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="xl" mt="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error.message}
          <Button size="xs" variant="outline" onClick={fetchData} mt="sm">
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  const list = data[activeTab] || [];

  return (
    <Container size="xl" mt="xl">
      <Card shadow="sm" p="lg" withBorder>
        <Title order={3} align="center" mb="md">
          Director Dashboard
        </Title>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="pending">Pending ({data.pending.length})</Tabs.Tab>
            <Tabs.Tab value="in_review">In Review ({data.in_review.length})</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="pending" pt="xs">
            <Table highlightOnHover aria-label="Pending submissions">
              <thead>
                <tr><th scope="col">Title</th><th scope="col">Approved</th><th scope="col">Action</th></tr>
              </thead>
              <tbody>{renderRows(list)}</tbody>
            </Table>
          </Tabs.Panel>

          <Tabs.Panel value="in_review" pt="xs">
            <Table highlightOnHover aria-label="In review submissions">
              <thead>
                <tr><th scope="col">Title</th><th scope="col">Started</th><th scope="col">Action</th></tr>
              </thead>
              <tbody>{renderRows(list)}</tbody>
            </Table>
          </Tabs.Panel>
        </Tabs>

        {selected && (
          <DirectorPrioritiesPanel
            submission={selected}
            readOnly={activeTab !== 'pending'}
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

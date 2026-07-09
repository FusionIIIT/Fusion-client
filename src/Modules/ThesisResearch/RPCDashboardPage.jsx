import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Center,
  Loader,
  Title,
  Space,
  Alert,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import axios from 'axios';

import { rpcSeminarListRoute } from '../../routes/academicRoutes';
import RPCReviewModal from './RPCReviewModal';

export default function RPCDashboardPage() {
  const [pending, setPending]   = useState([]);
  const [approved, setApproved] = useState([]);
  const [reviewId, setReviewId] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const token = localStorage.getItem('authToken');
  const config = useMemo(() => ({ 
    headers: { Authorization: `Token ${token}` } 
  }), [token]);

  const fetchData = useCallback(async () => {
    if (!token) {
      setError(new Error("Authentication required. Please log in."));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await axios.get(rpcSeminarListRoute, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setPending(res.data.pending || []);
      setApproved(res.data.approved || []);
      setError(null);
    } catch (e) {
      const errorMsg = e.response?.data?.detail || e.message || 'Failed to load seminar data';
      setError(new Error(errorMsg));
      showNotification({
        title: 'Error',
        message: errorMsg,
        color: 'red',
        icon: <IconAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  }, [config, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openReview = useCallback((id) => setReviewId(id), []);
  
  const closeReview = useCallback(() => {
    setReviewId(null);
    fetchData();
  }, [fetchData]);

  const renderRows = useCallback((list, isPending) =>
    list.map(s => (
      <tr key={s.id}>
        <td>{s.version || 'N/A'}</td>
        <td>{s.thesis || 'N/A'}</td>
        <td>{s.student || 'N/A'}</td>
        <td>
          <Button 
            size="xs" 
            onClick={() => openReview(s.id)}
            aria-label={`${isPending ? 'Review' : 'View'} seminar for ${s.student}`}
          >
            {isPending ? 'Review' : 'View'}
          </Button>
        </td>
      </tr>
    )), [openReview]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader aria-label="Loading seminar data" />
      </Center>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <Card shadow="sm" padding="lg">
      <Title order={3}>RPC Seminar Dashboard</Title>
      <Space h="md" />

      <Tabs defaultValue="pending">
        <Tabs.List>
          <Tabs.Tab value="pending">
            Pending ({pending.length})
          </Tabs.Tab>
          <Tabs.Tab value="approved">
            Approved ({approved.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pending" pt="xs">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Ver</th>
                <th>Thesis</th>
                <th>Student</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{renderRows(pending, true)}</tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="approved" pt="xs">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Ver</th>
                <th>Thesis</th>
                <th>Student</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{renderRows(approved, false)}</tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      {reviewId && (
        <RPCReviewModal seminarId={reviewId} onClose={closeReview} />
      )}
    </Card>
  );
}

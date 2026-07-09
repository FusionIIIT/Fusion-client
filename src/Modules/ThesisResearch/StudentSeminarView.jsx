import React, { useState, useEffect } from 'react';
import {
  Card, Title, Table, Center, Loader, Space, Anchor, Text, Alert
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import axios from 'axios';
import { studentSeminarDetailRoute } from '../../routes/academicRoutes';
import PropTypes from 'prop-types';

export default function StudentSeminarView({ id }) {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError(new Error("Invalid seminar ID"));
      setLoading(false);
      return;
    }

    const fetchSeminar = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error("Authentication required");
        }

        const config = {
          headers: { Authorization: `Token ${token}` },
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const res = await axios.get(studentSeminarDetailRoute(id), {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        setD(res.data);
        setError(null);
      } catch (e) {
        const message = e.response?.data?.error || e.message || 'Failed to load seminar details';
        setError(new Error(message));
        showNotification({ 
          title: 'Error', 
          message, 
          color: 'red',
          icon: <IconAlertCircle />,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSeminar();
  }, [id]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader aria-label="Loading seminar details" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error"
        color="red"
      >
        {error.message}
      </Alert>
    );
  }

  if (!d) {
    return (
      <Text color="dimmed" ta="center" p="md">
        No seminar data available
      </Text>
    );
  }

  return (
    <Card shadow="sm" padding="lg">
      <Title order={3}>Seminar {d.version} (Read-Only)</Title>
      <Space h="md" />

      <Table striped>
        <tbody>
          <tr><td><Text fw={500}>Date</Text></td><td>{d.date}</td></tr>
          <tr><td><Text fw={500}>Time</Text></td><td>{d.time}</td></tr>
          <tr><td><Text fw={500}>Venue</Text></td><td>{d.venue}</td></tr>
          <tr><td><Text fw={500}>Previous Work</Text></td><td>{d.prev}</td></tr>
          <tr><td><Text fw={500}>Current Contribution</Text></td><td>{d.curr}</td></tr>
          <tr><td><Text fw={500}>Future Plan</Text></td><td>{d.future}</td></tr>
        </tbody>
      </Table>

      <Space h="md" />

      {d.doc_url && (
        <>
          <Title order={5}>PDF Document</Title>
          <Anchor
            href={d.doc_url.startsWith('http') ? d.doc_url : `${window.location.origin}/${d.doc_url}`}
            target="_blank"
            rel="noopener noreferrer"
            download
            aria-label="Download seminar PDF document"
          >
            Download PDF
          </Anchor>
        </>
      )}

      <Space h="lg" />
      <Title order={5}>Publications</Title>
      <Table striped highlightOnHover aria-label="Publications data">
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Submitted</th>
            <th scope="col">Accepted</th>
            <th scope="col">Published</th>
          </tr>
        </thead>
        <tbody>
          {(d.publications || []).map(p => (
            <tr key={p.category}>
              <td>{p.category}</td>
              <td>{p.submitted || 0}</td>
              <td>{p.accepted || 0}</td>
              <td>{p.published || 0}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

StudentSeminarView.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

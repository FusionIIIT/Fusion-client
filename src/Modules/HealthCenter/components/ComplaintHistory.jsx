/**
 * Complaint History Component
 * ============================
 * View own complaints with status tracking
 * Shows complaint timeline and compounder responses
 * 
 * PHC-UC-03: Track Complaint Status
 */

import { useEffect, useState } from 'react';
import {
  Card,
  Stack,
  Title,
  Text,
  Badge,
  Loader,
  Group,
  Alert,
  Paper,
  Timeline,
  ThemeIcon,
  Button,
  Modal,
  SimpleGrid,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconMessageCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import * as api from '../api';

export default function ComplaintHistory() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [responseModal, setResponseModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.getComplaints();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setComplaints(data);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load complaints',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'green';
      case 'in_progress':
        return 'blue';
      case 'pending':
        return 'yellow';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <IconCheck size={16} />;
      case 'in_progress':
        return <IconClock size={16} />;
      case 'pending':
        return <IconClock size={16} />;
      case 'rejected':
        return <IconAlertCircle size={16} />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return 'red';
      case 'HIGH':
        return 'orange';
      case 'MEDIUM':
        return 'yellow';
      case 'LOW':
        return 'green';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Paper p="xl" ta="center">
        <Loader size="lg" />
      </Paper>
    );
  }

  if (complaints.length === 0) {
    return (
      <Alert color="blue" title="No Complaints" icon={<IconAlertCircle />}>
        You haven't filed any complaints yet.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" color="dimmed">
          Total Complaints: {complaints.length}
        </Text>
      </div>

      {complaints.map((complaint) => (
        <Card
          key={complaint.id}
          withBorder
          p="md"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            setExpandedId(expandedId === complaint.id ? null : complaint.id)
          }
        >
          <Stack gap="md">
            {/* Complaint Header */}
            <Group position="apart">
              <div style={{ flex: 1 }}>
                <Group gap="xs" mb="xs">
                  <Text weight={700}>{complaint.title}</Text>
                  <Badge color={getPriorityColor(complaint.priority)} size="sm">
                    {complaint.priority || 'MEDIUM'}
                  </Badge>
                </Group>
                <Text size="sm" color="dimmed">
                  Category: {complaint.category || 'N/A'} • Filed:{' '}
                  {new Date(complaint.created_at).toLocaleDateString()}
                </Text>
              </div>
              <Badge
                leftSection={getStatusIcon(complaint.status)}
                color={getStatusColor(complaint.status)}
              >
                {complaint.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
              </Badge>
            </Group>

            {/* Complaint Details - Expandable */}
            {expandedId === complaint.id && (
              <>
                <div>
                  <Text size="sm" weight={600} mb="xs">
                    Description
                  </Text>
                  <Text size="sm">{complaint.description}</Text>
                </div>

                {complaint.response_note && (
                  <Paper p="md" bg="gray.1" radius="md">
                    <Group gap="xs" mb="xs">
                      <IconMessageCircle size={16} />
                      <Text weight={600} size="sm">
                        Compounder Response
                      </Text>
                    </Group>
                    <Text size="sm">{complaint.response_note}</Text>
                    {complaint.responded_at && (
                      <Text size="xs" color="dimmed" mt="xs">
                        Responded on:{' '}
                        {new Date(complaint.responded_at).toLocaleDateString()}
                      </Text>
                    )}
                  </Paper>
                )}

                {complaint.status?.toLowerCase() === 'resolved' && (
                  <Alert color="green" icon={<IconCheck />} title="Resolved">
                    This complaint has been successfully resolved.
                  </Alert>
                )}

                {complaint.status?.toLowerCase() === 'pending' && (
                  <Alert color="yellow" icon={<IconClock />} title="Pending">
                    Your complaint is being reviewed. We will respond shortly.
                  </Alert>
                )}

                <Group>
                  {complaint.status?.toLowerCase() === 'resolved' && (
                    <Button
                      variant="light"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComplaint(complaint);
                        setResponseModal(true);
                      }}
                    >
                      View Full Details
                    </Button>
                  )}
                </Group>
              </>
            )}

            {/* Summary Row */}
            <Text size="xs" color="dimmed">
              Click to {expandedId === complaint.id ? 'collapse' : 'expand'}{' '}
              details
            </Text>
          </Stack>
        </Card>
      ))}

      {/* Detail Modal */}
      <Modal
        opened={responseModal}
        onClose={() => {
          setResponseModal(false);
          setSelectedComplaint(null);
        }}
        title="Complaint Details"
        size="lg"
      >
        {selectedComplaint && (
          <Stack gap="md">
            <div>
              <Text weight={600} size="sm" color="dimmed">
                STATUS
              </Text>
              <Badge
                color={getStatusColor(selectedComplaint.status)}
                size="lg"
              >
                {selectedComplaint.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <SimpleGrid cols={2}>
              <div>
                <Text weight={600} size="sm" color="dimmed">
                  CATEGORY
                </Text>
                <Text>{selectedComplaint.category || 'N/A'}</Text>
              </div>
              <div>
                <Text weight={600} size="sm" color="dimmed">
                  PRIORITY
                </Text>
                <Badge color={getPriorityColor(selectedComplaint.priority)}>
                  {selectedComplaint.priority || 'MEDIUM'}
                </Badge>
              </div>
              <div>
                <Text weight={600} size="sm" color="dimmed">
                  FILED ON
                </Text>
                <Text>
                  {new Date(selectedComplaint.created_at).toLocaleDateString()}
                </Text>
              </div>
              {selectedComplaint.responded_at && (
                <div>
                  <Text weight={600} size="sm" color="dimmed">
                    RESOLVED ON
                  </Text>
                  <Text>
                    {new Date(
                      selectedComplaint.responded_at
                    ).toLocaleDateString()}
                  </Text>
                </div>
              )}
            </SimpleGrid>

            <div>
              <Text weight={600} size="sm" color="dimmed">
                DESCRIPTION
              </Text>
              <Text>{selectedComplaint.description}</Text>
            </div>

            {selectedComplaint.response_note && (
              <Paper p="md" bg="gray.1" radius="md">
                <Text weight={600} size="sm" mb="xs">
                  COMPOUNDER RESPONSE
                </Text>
                <Text>{selectedComplaint.response_note}</Text>
              </Paper>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

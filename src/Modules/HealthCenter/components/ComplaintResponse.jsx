/**
 * Complaint Response Component
 * ===========================
 * Compounder responds to patient complaints
 * View and manage complaint status updates
 */

import { useState, useEffect } from 'react';
import {
  Button,
  Stack,
  Group,
  Card,
  Table,
  Text,
  Modal,
  Badge,
  ActionIcon,
  Textarea,
  Paper,
  Select,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMessageReply, IconCheck } from '@tabler/icons-react';
import * as api from '../api';

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function ComplaintResponse() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseData, setResponseData] = useState({
    status: '',
    resolution_notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.getComplaints();
      setComplaints(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load complaints',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!responseData.status) newErrors.status = 'Status is required';
    if (responseData.status === 'RESOLVED' && !responseData.resolution_notes.trim()) {
      newErrors.resolution_notes = 'Resolution notes required when closing complaint';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        status: responseData.status,
        resolution_notes: responseData.resolution_notes,
      };

      await api.respondToComplaint(selectedComplaint.id, payload);
      notifications.show({
        message: 'Complaint response recorded successfully',
        color: 'green',
      });
      setModalOpened(false);
      resetForm();
      await fetchComplaints();
    } catch (error) {
      
      notifications.show({
        message: error.response?.data?.detail || 'Failed to respond',
        color: 'red',
      });
    }
  };

  const resetForm = () => {
    setResponseData({ status: '', resolution_notes: '' });
    setErrors({});
    setSelectedComplaint(null);
  };

  const handleRespond = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseData({
      status: complaint.status,
      resolution_notes: complaint.resolution_notes || '',
    });
    setModalOpened(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'yellow',
      IN_PROGRESS: 'blue',
      RESOLVED: 'green',
      REJECTED: 'red',
    };
    return colors[status] || 'gray';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Medical Care': 'red',
      'Facility': 'blue',
      'Staff': 'purple',
      'Hygiene': 'orange',
      'Billing': 'green',
      'Other': 'gray',
    };
    return colors[category] || 'gray';
  };

  return (
    <Stack gap="lg">
      <Text size="lg" weight={600}>
        Complaint Management
      </Text>

      <Card withBorder p="lg">
        {complaints.length === 0 ? (
          <Text color="dimmed" align="center" py="xl">
            No complaints
          </Text>
        ) : (
          <Stack gap="md">
            {complaints.map((complaint) => (
              <Paper key={complaint.id} withBorder p="md">
                <Group justify="space-between" mb="sm">
                  <div>
                    <Text weight={600}>{complaint.title}</Text>
                    <Text size="sm" color="dimmed">
                      From: {complaint.patient_name}
                    </Text>
                  </div>
                  <Group gap="xs">
                    <Badge color={getCategoryColor(complaint.category)}>
                      {complaint.category}
                    </Badge>
                    <Badge color={getStatusColor(complaint.status)}>
                      {complaint.status}
                    </Badge>
                  </Group>
                </Group>

                <Text size="sm" mb="sm">
                  {complaint.description}
                </Text>

                {complaint.resolution_notes && (
                  <Paper bg="blue.0" p="sm" mb="sm">
                    <Text size="xs" color="dimmed" weight={500}>
                      Resolution Notes:
                    </Text>
                    <Text size="sm">{complaint.resolution_notes}</Text>
                  </Paper>
                )}

                <Group justify="space-between">
                  <Text size="xs" color="dimmed">
                    Submitted: {new Date(complaint.created_at).toLocaleString()}
                  </Text>
                  <Button
                    size="xs"
                    leftSection={<IconMessageReply size={14} />}
                    onClick={() => handleRespond(complaint)}
                  >
                    Respond
                  </Button>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Card>

      <Modal
        opened={modalOpened}
        onClose={() => {
          resetForm();
          setModalOpened(false);
        }}
        title={`Update Complaint: ${selectedComplaint?.title}`}
        size="md"
      >
        <Stack gap="md">
          <Paper bg="gray.0" p="sm">
            <Text size="sm" color="dimmed" weight={500}>
              Complaint Details
            </Text>
            <Text size="sm">{selectedComplaint?.description}</Text>
          </Paper>

          <Select
            label="Status *"
            placeholder="Update status"
            data={statusOptions}
            value={responseData.status}
            onChange={(value) =>
              setResponseData({ ...responseData, status: value })
            }
            error={errors.status}
          />

          <Textarea
            label={responseData.status === 'RESOLVED' ? 'Resolution Notes *' : 'Response Notes'}
            placeholder="Enter your response or resolution details"
            value={responseData.resolution_notes}
            onChange={(e) =>
              setResponseData({
                ...responseData,
                resolution_notes: e.currentTarget.value,
              })
            }
            error={errors.resolution_notes}
            minRows={4}
          />

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                resetForm();
                setModalOpened(false);
              }}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconCheck size={16} />}
              onClick={handleSubmit}
            >
              Update Complaint
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

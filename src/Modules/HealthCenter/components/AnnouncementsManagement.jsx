/**
 * AnnouncementsManagement — Compounder Dashboard
 * ===============================================
 * PHC-UC-12: Broadcast Health Announcements
 * PHC-UC-17: Portal notifications triggered server-side on create
 * PHC-BR-09: Audit trail written via create_announcement() service
 *
 * Compounders create / deactivate announcements here.
 * Patients see them read-only via AnnouncementsView.jsx.
 */

import { useState, useEffect } from 'react';
import {
  Stack, Group, Card, Text, Title, Badge, Button, Modal,
  TextInput, Textarea, Select, NumberInput, ActionIcon,
  Table,
  ScrollArea, Loader, Center, Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import {
  IconPlus, IconTrash, IconAlertCircle, IconBell, IconSpeakerphone,
} from '@tabler/icons-react';
import * as api from '../api';

const CATEGORY_OPTIONS = [
  { value: 'GENERAL',         label: 'General' },
  { value: 'HEALTH_ADVISORY', label: 'Health Advisory' },
  { value: 'SCHEDULE_CHANGE', label: 'Schedule Change' },
  { value: 'EMERGENCY',       label: 'Emergency' },
  { value: 'VACCINATION',     label: 'Vaccination Drive' },
];

const CATEGORY_COLORS = {
  GENERAL:         'blue',
  HEALTH_ADVISORY: 'orange',
  SCHEDULE_CHANGE: 'violet',
  EMERGENCY:       'red',
  VACCINATION:     'teal',
};

const emptyForm = {
  title:      '',
  content:    '',
  category:   'GENERAL',
  priority:   0,
  expires_at: '',
};

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [modalOpen, setModalOpen]         = useState(false);
  const [formData, setFormData]           = useState(emptyForm);
  const [submitting, setSubmitting]       = useState(false);
  const [errors, setErrors]              = useState({});

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.getAnnouncements();
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch {
      notifications.show({ message: 'Failed to load announcements', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim() || formData.title.trim().length < 5)
      errs.title = 'Title must be at least 5 characters';
    if (!formData.content.trim() || formData.content.trim().length < 10)
      errs.content = 'Content must be at least 10 characters';
    if (formData.expires_at) {
      const exp = new Date(formData.expires_at);
      if (isNaN(exp) || exp <= new Date())
        errs.expires_at = 'Expiry must be a future date/time';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const payload = {
      title:    formData.title.trim(),
      content:  formData.content.trim(),
      category: formData.category,
      priority: formData.priority ?? 0,
    };
    if (formData.expires_at) payload.expires_at = new Date(formData.expires_at).toISOString();

    // Close the modal immediately to unblock the user
    setModalOpen(false);
    
    // Show a loading notification
    notifications.show({
      id: 'broadcast-announcement',
      loading: true,
      title: 'Broadcasting Announcement',
      message: 'Saving and safely notifying all portal users. This may take a moment...',
      autoClose: false,
      withCloseButton: false,
    });

    // Run the API request asynchronously
    api.createAnnouncement(payload)
      .then(() => {
        notifications.update({
          id: 'broadcast-announcement',
          color: 'green',
          title: 'Announcement Posted!',
          message: 'All portal users have been notified successfully.',
          loading: false,
          autoClose: 5000,
        });
        setFormData(emptyForm);
        setErrors({});
        fetchAnnouncements();
      })
      .catch((err) => {
        notifications.update({
          id: 'broadcast-announcement',
          color: 'red',
          title: 'Broadcast Failed',
          message: err.response?.data?.detail || 'Failed to post announcement',
          loading: false,
          autoClose: 8000,
        });
        // We do not clear the form data here so the user can re-open and try again if needed
      });
  };

  const handleDeactivate = (id, title) => {
    modals.openConfirmModal({
      title: 'Confirm Deactivation',
      children: `Deactivate announcement "${title}"? It will no longer be visible to users.`,
      labels: { confirm: 'Deactivate', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.deleteAnnouncement(id);
          notifications.show({ message: 'Announcement deactivated', color: 'green' });
          fetchAnnouncements();
        } catch {
          notifications.show({ message: 'Failed to deactivate announcement', color: 'red' });
        }
      }
    });
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <Stack gap={2}>
          <Title order={3}>Health Announcements</Title>
          <Text size="sm" c="dimmed">
            Post health advisories and notices to all portal users. Each post triggers a portal notification broadcast.
          </Text>
        </Stack>
        <Button
          leftSection={<IconSpeakerphone size={16} />}
          onClick={() => { setFormData(emptyForm); setErrors({}); setModalOpen(true); }}
        >
          New Announcement
        </Button>
      </Group>

      {/* Info Box */}
      <Alert icon={<IconBell size={16} />} color="blue" variant="light">
        When you post an announcement, all active portal users instantly receive a portal notification.
        Announcements remain visible until deactivated or until their expiry date passes.
      </Alert>

      {/* Table */}
      <Card withBorder p="lg">
        {loading ? (
          <Center py="xl"><Loader /></Center>
        ) : announcements.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">No active announcements. Create one above.</Text>
        ) : (
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Priority</Table.Th>
                <Table.Th>Posted By</Table.Th>
                <Table.Th>Posted At</Table.Th>
                <Table.Th>Expires</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {announcements.map((a) => (
                <Table.Tr key={a.id}>
                  <Table.Td fw={500}>{a.title}</Table.Td>
                  <Table.Td>
                    <Badge color={CATEGORY_COLORS[a.category] || 'gray'} variant="light">
                      {a.category.replace('_', ' ')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{a.priority}</Table.Td>
                  <Table.Td>{a.created_by_name || '—'}</Table.Td>
                  <Table.Td>{new Date(a.created_at).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    {a.expires_at
                      ? <Text size="sm" c={a.is_expired ? 'red' : 'dimmed'}>
                          {new Date(a.expires_at).toLocaleDateString()}
                          {a.is_expired ? ' (expired)' : ''}
                        </Text>
                      : <Text size="sm" c="dimmed">Never</Text>
                    }
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      title="Deactivate"
                      onClick={() => handleDeactivate(a.id, a.title)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table></ScrollArea>
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => { setModalOpen(false); setFormData(emptyForm); setErrors({}); }}
        title="Post New Health Announcement"
        size="lg"
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light">
            This will immediately send a portal notification to <strong>all</strong> active users.
          </Alert>

          <TextInput
            label="Title *"
            placeholder="e.g., Flu Vaccination Camp on 25th April"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
            error={errors.title}
          />

          <Textarea
            label="Content *"
            placeholder="Detailed message for users..."
            minRows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
            error={errors.content}
          />

          <Group grow>
            <Select
              label="Category"
              data={CATEGORY_OPTIONS}
              value={formData.category}
              onChange={(v) => setFormData({ ...formData, category: v })}
            />
            <NumberInput
              label="Priority (0 = normal, 10 = urgent)"
              min={0}
              max={10}
              value={formData.priority}
              onChange={(v) => setFormData({ ...formData, priority: v })}
            />
          </Group>

          <TextInput
            label="Expires At (optional)"
            description="Leave empty to keep active indefinitely"
            type="datetime-local"
            value={formData.expires_at}
            onChange={(e) => setFormData({ ...formData, expires_at: e.currentTarget.value })}
            error={errors.expires_at}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => { setModalOpen(false); setFormData(emptyForm); setErrors({}); }}>
              Cancel
            </Button>
            <Button
              leftSection={<IconSpeakerphone size={16} />}
              onClick={handleSubmit}
              loading={submitting}
            >
              Post & Notify All Users
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

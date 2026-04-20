/**
 * AnnouncementsView — Patient Dashboard
 * ======================================
 * PHC-UC-12: Read-only board for patients/employees to view health announcements.
 * Auto-refreshes every 60 seconds to surface new broadcasts.
 */

import { useState, useEffect } from 'react';
import {
  Stack, Card, Text, Title, Badge, Group, Loader, Center,
  Alert, ThemeIcon,
} from '@mantine/core';
import { IconBell, IconAlertTriangle, IconInfoCircle, IconCalendar } from '@tabler/icons-react';
import * as api from '../api';

const CATEGORY_META = {
  GENERAL:         { color: 'blue',   label: 'General' },
  HEALTH_ADVISORY: { color: 'orange', label: 'Health Advisory' },
  SCHEDULE_CHANGE: { color: 'violet', label: 'Schedule Change' },
  EMERGENCY:       { color: 'red',    label: 'Emergency' },
  VACCINATION:     { color: 'teal',   label: 'Vaccination Drive' },
};

function daysUntilExpiry(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function AnnouncementsView() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setError(null);
      const res = await api.getAnnouncements();
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Unable to load announcements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchAnnouncements, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Center py="xl"><Loader /></Center>;

  if (error) return (
    <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
      {error}
    </Alert>
  );

  const emergencies = announcements.filter(a => a.category === 'EMERGENCY');
  const others      = announcements.filter(a => a.category !== 'EMERGENCY');

  return (
    <Stack gap="lg">
      <Group gap="xs">
        <ThemeIcon variant="light" color="blue" size="lg">
          <IconBell size={18} />
        </ThemeIcon>
        <Stack gap={0}>
          <Title order={3}>Health Center Announcements</Title>
          <Text size="sm" c="dimmed">
            Notices and advisories from the PHC staff
          </Text>
        </Stack>
      </Group>

      {announcements.length === 0 ? (
        <Card withBorder p="xl" ta="center">
          <Stack align="center" gap="xs">
            <ThemeIcon variant="light" color="gray" size="xl">
              <IconBell size={24} />
            </ThemeIcon>
            <Text c="dimmed">No active announcements at this time.</Text>
          </Stack>
        </Card>
      ) : (
        <Stack gap="md">
          {/* Emergency notices first */}
          {emergencies.map(a => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
          {others.map(a => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function AnnouncementCard({ announcement: a }) {
  const meta = CATEGORY_META[a.category] || { color: 'gray', label: a.category };
  const daysLeft = daysUntilExpiry(a.expires_at);
  const isUrgent = a.category === 'EMERGENCY' || a.priority >= 8;

  return (
    <Card
      withBorder
      p="lg"
      radius="md"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: `var(--mantine-color-${meta.color}-6)`,
        background: isUrgent ? 'var(--mantine-color-red-0)' : undefined,
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="xs" style={{ flex: 1 }}>
            {isUrgent && (
              <ThemeIcon color="red" variant="light" size="sm">
                <IconAlertTriangle size={14} />
              </ThemeIcon>
            )}
            <Text fw={600} size="md" style={{ flex: 1 }}>{a.title}</Text>
          </Group>
          <Badge color={meta.color} variant="light" style={{ flexShrink: 0 }}>
            {meta.label}
          </Badge>
        </Group>

        <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {a.content}
        </Text>

        <Group gap="lg" mt="xs">
          <Group gap={4}>
            <IconCalendar size={13} color="gray" />
            <Text size="xs" c="dimmed">
              {new Date(a.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Text>
          </Group>
          <Text size="xs" c="dimmed">Posted by: {a.created_by_name}</Text>
          {a.expires_at && (
            <Text size="xs" c={daysLeft <= 3 ? 'orange' : 'dimmed'}>
              {daysLeft === 0
                ? 'Expires today'
                : daysLeft === 1
                ? 'Expires tomorrow'
                : `Expires in ${daysLeft} days`}
            </Text>
          )}
        </Group>
      </Stack>
    </Card>
  );
}

import React, { useState } from 'react';
import { Paper, Button, ScrollArea, Box, Group } from '@mantine/core';
import { Bell, Megaphone } from 'phosphor-react';

// Dummy data
const dummyNotifications = [
  { id: 1, content: "Notification 1" },
  { id: 2, content: "Notification 2" },
  { id: 3, content: "Notification 3" },
  { id: 4, content: "Notification 4" },
  { id: 5, content: "Notification 5" },
  { id: 6, content: "Notification 6" },
  { id: 7, content: "Notification 7" },
  { id: 8, content: "Notification 8" },
  { id: 9, content: "Notification 9" },
  { id: 10, content: "Notification 10" },
  { id: 11, content: "Notification 11" },
  { id: 12, content: "Notification 12" },
  { id: 13, content: "Notification 13" },
  { id: 14, content: "Notification 14" },
  { id: 15, content: "Notification 15" },
];

const dummyAnnouncements = [
  { id: 1, content: "Announcement 1" },
  { id: 2, content: "Announcement 2" },
  { id: 3, content: "Announcement 3" },
  { id: 4, content: "Announcement 4" },
  { id: 5, content: "Announcement 5" },
  { id: 6, content: "Announcement 6" },
  { id: 7, content: "Announcement 7" },
  { id: 8, content: "Announcement 8" },
  { id: 9, content: "Announcement 9" },
  { id: 10, content: "Announcement 10" },
];

function SideNotifications() {
  const [activeTab, setActiveTab] = useState('notifications');

  const renderItems = (items) => (
    items.map((item) => (
      <Paper key={item.id} withBorder p="xs" mb="xs" radius="sm">
        {item.content}
      </Paper>
    ))
  );

  return (
    <Paper shadow="md" radius="md" sx={(theme) => ({
      position: 'fixed',
      right: '32px',
      top: '32px',
      width: '1000px',
      height: '600px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: `1px solid ${theme.colors.gray[3]}`,
      borderRadius: theme.radius.md,
    })}>
      <Box px="md" py="xs" sx={(theme) => ({
        backgroundColor: theme.colors.gray[1],
        borderBottom: `1px solid ${theme.colors.gray[3]}`,
      })}>
        <Group position="center" grow sx={{ width: '100%' }} px="md" py="xs" style={{ gap: '10px' }}>
          <Button
            variant={activeTab === 'notifications' ? 'filled' : 'subtle'}
            onClick={() => setActiveTab('notifications')}
            size="md"
            style={{ flex: 1 }}  // Makes this button take up 50% of the width
          >
            Notifications
          </Button>
          <Button
            variant={activeTab === 'announcements' ? 'filled' : 'subtle'}
            onClick={() => setActiveTab('announcements')}
            size="md"
            style={{ flex: 1 }}  // Makes this button take up 50% of the width
          >
            Announcements
          </Button>
        </Group>
      </Box>

      <ScrollArea style={{ flex: 1, height: 'calc(600px - 56px)' }} offsetScrollbars>
        <Box p="md">
          {activeTab === 'notifications'
            ? renderItems(dummyNotifications)
            : renderItems(dummyAnnouncements)
          }
        </Box>
      </ScrollArea>
    </Paper>
  );
}

export default SideNotifications;
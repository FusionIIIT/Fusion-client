import React, { useState, useEffect } from 'react';
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Paper,
  Notification,
  Select,
} from '@mantine/core';

const CreateNotice = ({ onSubmit, existingAnnouncement }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ opened: false, message: '', color: '' });

  useEffect(() => {
    if (existingAnnouncement) {
      setTitle(existingAnnouncement.title);
      setDescription(existingAnnouncement.description);
      setDate(existingAnnouncement.date);
      setScope(existingAnnouncement.scope);
    } else {
      resetForm();
    }
  }, [existingAnnouncement]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const announcement = { title, description, date, scope };
      await onSubmit(announcement);
      setNotification({ opened: true, message: 'Announcement submitted successfully!', color: 'green' });
      resetForm();
    } catch (error) {
      setNotification({ opened: true, message: 'Submission failed. Please try again.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setScope('');
  };

  return (
    <Paper
      shadow="md"
      p="md"
      withBorder
      sx={(theme) => ({
        position: 'fixed',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.white,
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
      })}
    >
      <Stack spacing="lg">
        <Text 
          align="left" 
          mb="xl" 
          size="24px" 
          style={{ color: '#757575', fontWeight: 'bold' }}
        >
          {existingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label={<Text component="label" size="lg" fw={500}>Title:</Text>}
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              required
              styles={{ root: { marginTop: 5 } }}
            />

            <Textarea
              label={<Text component="label" size="lg" fw={500}>Description:</Text>}
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              required
              styles={{ root: { marginTop: 5 } }}
            />

            <TextInput
              label={<Text component="label" size="lg" fw={500}>Date:</Text>}
              type="date"
              value={date}
              onChange={(e) => setDate(e.currentTarget.value)}
              required
              styles={{ root: { marginTop: 5 } }}
            />

            <Select
              label={<Text component="label" size="lg" fw={500}>Announcement Scope:</Text>}
              placeholder="Select scope"
              value={scope}
              onChange={setScope}
              data={[
                { value: 'global', label: 'Global' },
                { value: 'local', label: 'Local' },
              ]}
              required
              styles={{ root: { marginTop: 5 } }}
            />

            <Group position="right" spacing="sm" mt="xl">
              <Button type="button" variant="outline" onClick={resetForm}>
                Clear
              </Button>
              <Button type="submit" variant="filled" loading={loading}>
                {existingAnnouncement ? 'Update' : 'Submit'}
              </Button>
            </Group>
          </Stack>
        </form>

        {notification.opened && (
          <Notification
            title="Notification"
            color={notification.color}
            onClose={() => setNotification({ ...notification, opened: false })}
            style={{ marginTop: '10px' }}
          >
            {notification.message}
          </Notification>
        )}
      </Stack>
    </Paper>
  );
};

export default CreateNotice;
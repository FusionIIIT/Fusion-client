import React, { useState, useEffect } from 'react';
import {
  TextInput,
  Textarea,
  Button,
  FileInput,
  Group,
  Box,
  Title,
  Notification,
} from '@mantine/core';

const CreateNotice = ({ onSubmit, existingAnnouncement }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ opened: false, message: '', color: '' });

  useEffect(() => {
    if (existingAnnouncement) {
      setTitle(existingAnnouncement.title);
      setDescription(existingAnnouncement.description);
      setFile(existingAnnouncement.file);
      setDate(existingAnnouncement.date);
    } else {
      resetForm();
    }
  }, [existingAnnouncement]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const announcement = { title, description, file, date };
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
    setFile(null);
    setDate('');
  };

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <Title order={3} mb="md">
        {existingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
      </Title>
      <form onSubmit={handleSubmit}>
        <TextInput label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required mb="md" />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.currentTarget.value)} required mb="md" />
        <FileInput label="Attach File" value={file} onChange={(file) => setFile(file)} accept="application/pdf,image/*" mb="md" />
        <TextInput label="Date" type="date" value={date} onChange={(e) => setDate(e.currentTarget.value)} required mb="md" />
        <Group position="right">
          <Button type="submit" variant="filled" color="blue" loading={loading}>
            {existingAnnouncement ? 'Update' : 'Submit'}
          </Button>
          <Button type="button" variant="outline" color="gray" onClick={resetForm}>Clear</Button>
        </Group>
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
    </Box>
  );
};

export default CreateNotice;

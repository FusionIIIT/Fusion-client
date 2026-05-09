/**
 * Complaint Form Component
 * ========================
 * Submit new complaint form for patients
 * File grievances, medical issues, or facility concerns
 * 
 * PHC-UC-03: File Complaint
 */

import { useState } from 'react';
import {
  Card,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Alert,
  Title,
  Text,
  Select,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import * as api from '../api';

const COMPLAINT_CATEGORIES = [
  { value: 'medical', label: 'Medical Care' },
  { value: 'facility', label: 'Facility Issue' },
  { value: 'staff', label: 'Staff Conduct' },
  { value: 'hygiene', label: 'Hygiene/Cleanliness' },
  { value: 'billing', label: 'Billing/Charges' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export default function ComplaintForm() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'other',
    description: '',
    priority: 'MEDIUM',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      notifications.show({
        message: 'Please enter a title for your complaint',
        color: 'orange',
      });
      return;
    }

    if (!formData.description.trim()) {
      notifications.show({
        message: 'Please describe your complaint',
        color: 'orange',
      });
      return;
    }

    try {
      setLoading(true);
      await api.createComplaint({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
      });

      notifications.show({
        message: 'Complaint submitted successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      // Reset form and show success message
      setFormData({
        title: '',
        category: 'other',
        description: '',
        priority: 'MEDIUM',
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      
      notifications.show({
        message:
          error.response?.data?.message ||
          'Failed to submit complaint. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card withBorder p="lg">
      <Stack gap="md">
        <div>
          <Title order={4}>File a Complaint</Title>
          <Text size="sm" color="dimmed">
            We value your feedback. Please share any concerns or issues you've
            experienced.
          </Text>
        </div>

        {submitted && (
          <Alert color="green" icon={<IconCheck />} title="Complaint Submitted">
            Your complaint has been recorded. We will review it shortly and get
            back to you.
          </Alert>
        )}

        <TextInput
          label="Complaint Title"
          placeholder="Brief title of your complaint"
          value={formData.title}
          onChange={(e) => handleChange('title', e.currentTarget.value)}
          required
          disabled={loading}
        />

        <Select
          label="Category"
          placeholder="Select complaint category"
          value={formData.category}
          onChange={(value) => handleChange('category', value)}
          data={COMPLAINT_CATEGORIES}
          required
          disabled={loading}
        />

        <Select
          label="Priority"
          placeholder="Select priority level"
          value={formData.priority}
          onChange={(value) => handleChange('priority', value)}
          data={PRIORITY_LEVELS}
          required
          disabled={loading}
        />

        <Textarea
          label="Description"
          placeholder="Please describe your complaint in detail"
          value={formData.description}
          onChange={(e) => handleChange('description', e.currentTarget.value)}
          minRows={4}
          required
          disabled={loading}
        />

        <Group position="right">
          <Button
            variant="default"
            onClick={() => {
              setFormData({
                title: '',
                category: 'other',
                description: '',
                priority: 'MEDIUM',
              });
            }}
            disabled={loading}
          >
            Clear
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Submit Complaint
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}

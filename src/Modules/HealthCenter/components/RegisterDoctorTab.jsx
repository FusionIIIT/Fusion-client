import React from 'react';
import { Card, Stack, TextInput, Button, Title, Text } from '@mantine/core';

export default function RegisterDoctorTab({
  doctorForm,
  setDoctorForm,
  onRegister,
  loading,
}) {
  return (
    <Card withBorder p="lg">
      <Stack gap="md">
        <div>
          <Title order={4}>Register New Doctor</Title>
          <Text size="sm" color="dimmed">
            Add a new doctor to the health center system
          </Text>
        </div>
        <TextInput
          label="Doctor Name"
          placeholder="Enter doctor's full name"
          value={doctorForm.name}
          onChange={(e) =>
            setDoctorForm({ ...doctorForm, name: e.currentTarget.value })
          }
          required
        />
        <TextInput
          label="Specialization"
          placeholder="e.g., General Medicine, Pathology"
          value={doctorForm.specialization}
          onChange={(e) =>
            setDoctorForm({
              ...doctorForm,
              specialization: e.currentTarget.value,
            })
          }
          required
        />
        <TextInput
          label="Phone Number"
          placeholder="e.g., +91-9876543210"
          value={doctorForm.phone}
          onChange={(e) =>
            setDoctorForm({ ...doctorForm, phone: e.currentTarget.value })
          }
        />
        <Button variant="filled" onClick={onRegister} loading={loading}>
          Register Doctor
        </Button>
      </Stack>
    </Card>
  );
}

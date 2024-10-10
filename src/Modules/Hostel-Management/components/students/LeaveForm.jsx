import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';

export default function LeaveForm() {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    phoneNumber: '',
    reason: '',
    startDate: null,
    endDate: null
  });

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
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
          Leave Form
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Box>
              <Text component="label" size="lg" fw={500}>
                Student Name:
              </Text>
              <TextInput
                placeholder="Enter your full name"
                value={formData.studentName}
                onChange={(event) => handleChange('studentName', event.currentTarget.value)}
                required
                styles={{ root: { marginTop: 5 } }}
              />
            </Box>

            <Box>
              <Text component="label" size="lg" fw={500}>
                Roll Number:
              </Text>
              <TextInput
                placeholder="Enter your roll number"
                value={formData.rollNumber}
                onChange={(event) => handleChange('rollNumber', event.currentTarget.value)}
                required
                styles={{ root: { marginTop: 5 } }}
              />
            </Box>

            <Box>
              <Text component="label" size="lg" fw={500}>
                Phone Number:
              </Text>
              <TextInput
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={(event) => handleChange('phoneNumber', event.currentTarget.value)}
                required
                styles={{ root: { marginTop: 5 } }}
              />
            </Box>

            <Box>
              <Text component="label" size="lg" fw={500}>
                Reason:
              </Text>
              <Textarea
                placeholder="Please provide a detailed reason for your leave"
                value={formData.reason}
                onChange={(event) => handleChange('reason', event.currentTarget.value)}
                minRows={5}
                required
                styles={{ root: { marginTop: 5 } }}
              />
            </Box>

            <Grid>
            <Grid.Col span={6}>
              <Text component="label" size="lg" fw={500}>
                Start Date:
              </Text>
              <TextInput
                type="date"
                value={formData.startDate}
                onChange={(e) => setDate(e.currentTarget.value)}
                required
                styles={{ root: { marginTop: 5 } }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Text component="label" size="lg" fw={500}>
                End Date:
              </Text>
              <TextInput
                type="date"
                value={formData.endDate}
                onChange={(e) => setDate(e.currentTarget.value)}
                required
                styles={{ root: { marginTop: 5 } }}
              />
            </Grid.Col>
          </Grid>

            <Group position="right" spacing="sm" mt="xl">
              <Button type="submit" variant="filled">
                Submit
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
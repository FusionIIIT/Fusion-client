import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';

export default function GuestRoomBooking() {
  const [formData, setFormData] = useState({
    hall: '',
    arrivalDate: null,
    arrivalTime: '',
    departureDate: null,
    departureTime: '',
    numberOfGuests: 1,
    nationality: '',
    numberOfRooms: 1,
    roomType: '',
    guestName: '',
    guestAddress: '',
    guestEmail: '',
    guestPhone: '',
    purpose: '',
  });

  const handleChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <Paper
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
          Book a Guest Room
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Box>
              <Text component="label" size="lg" fw={500}>
                Select Hall:
              </Text>
              <Select
                placeholder="Choose a Hall"
                data={[
                  { value: 'hall1', label: 'Grand Ballroom' },
                  { value: 'hall2', label: 'Royal Suite' },
                  { value: 'hall3', label: 'Executive Lounge' },
                ]}
                value={formData.hall}
                onChange={(value) => handleChange('hall', value)}
                styles={{ root: { marginTop: 5 } }}
              />
            </Box>

            <Grid>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Arrival Date:
                </Text>
                <DatePickerInput
                  placeholder="Pick date"
                  value={formData.arrivalDate}
                  onChange={(value) => handleChange('arrivalDate', value)}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Departure Date:
                </Text>
                <DatePickerInput
                  placeholder="Pick date"
                  value={formData.departureDate}
                  onChange={(value) => handleChange('departureDate', value)}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Arrival Time:
                </Text>
                <TimeInput
                  value={formData.arrivalTime}
                  onChange={(value) => handleChange('arrivalTime', value)}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Departure Time:
                </Text>
                <TimeInput
                  value={formData.departureTime}
                  onChange={(value) => handleChange('departureTime', value)}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Number of Guests:
                </Text>
                <NumberInput
                  value={formData.numberOfGuests}
                  onChange={(value) => handleChange('numberOfGuests', value)}
                  min={1}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Nationality:
                </Text>
                <TextInput
                  value={formData.nationality}
                  onChange={(event) => handleChange('nationality', event.currentTarget.value)}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Number of Rooms:
                </Text>
                <NumberInput
                  value={formData.numberOfRooms}
                  onChange={(value) => handleChange('numberOfRooms', value)}
                  min={1}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Room Type:
                </Text>
                <Select
                  placeholder="Select Room Type"
                  data={[
                    { value: 'single', label: 'Deluxe Single' },
                    { value: 'double', label: 'Luxury Double' },
                    { value: 'suite', label: 'Executive Suite' },
                  ]}
                  value={formData.roomType}
                  onChange={(value) => handleChange('roomType', value)}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
            </Grid>

            <Box>
              <Text size="lg" fw={500} mb={4}>
                Available Rooms
              </Text>
              <Paper p="sm" withBorder>
                <Text align="center" color="dimmed">
                  Room availability will be displayed here
                </Text>
              </Paper>
            </Box>

            <Grid>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Guest Name:
                </Text>
                <TextInput
                  placeholder="Full Name"
                  value={formData.guestName}
                  onChange={(event) => handleChange('guestName', event.currentTarget.value)}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Guest Address:
                </Text>
                <TextInput
                  placeholder="Street Address"
                  value={formData.guestAddress}
                  onChange={(event) => handleChange('guestAddress', event.currentTarget.value)}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Guest Email:
                </Text>
                <TextInput
                  placeholder="email@example.com"
                  value={formData.guestEmail}
                  onChange={(event) => handleChange('guestEmail', event.currentTarget.value)}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text component="label" size="lg" fw={500}>
                  Guest Phone Number:
                </Text>
                <TextInput
                  placeholder="Phone Number"
                  value={formData.guestPhone}
                  onChange={(event) => handleChange('guestPhone', event.currentTarget.value)}
                  styles={{ root: { marginTop: 5 } }}
                />
              </Grid.Col>
            </Grid>

            <Box>
              <Text component="label" size="lg" fw={500}>
                Purpose of Stay:
              </Text>
              <Textarea
                placeholder="Purpose of stay"
                value={formData.purpose}
                onChange={(event) => handleChange('purpose', event.currentTarget.value)}
                minRows={4}
                styles={{ root: { marginTop: 5 } }}
              />
            </Box>

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
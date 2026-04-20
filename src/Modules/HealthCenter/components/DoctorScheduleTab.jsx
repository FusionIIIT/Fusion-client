import React from 'react';
import { Card, Stack, Select, TextInput, Button, Title, Text, Table } from '@mantine/core';

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
];

export default function DoctorScheduleTab({
  scheduleForm,
  setScheduleForm,
  doctors,
  doctorSchedules,
  onAddSchedule,
  loading,
}) {
  return (
    <Stack gap="md">
      <Card withBorder p="lg">
        <Stack gap="md">
          <div>
            <Title order={4}>Add Doctor Schedule</Title>
            <Text size="sm" color="dimmed">
              Set weekly schedules for doctors
            </Text>
          </div>
          <Select
            label="Select Doctor"
            placeholder="Choose a doctor"
            value={scheduleForm.doctor_id}
            onChange={(value) =>
              setScheduleForm({ ...scheduleForm, doctor_id: value })
            }
            data={
              Array.isArray(doctors)
                ? doctors.map((doc) => ({
                    value: doc.id.toString(),
                    label: doc.doctor_name,
                  }))
                : []
            }
            required
          />
          <Select
            label="Day of Week"
            placeholder="Select day"
            value={scheduleForm.day_of_week}
            onChange={(value) =>
              setScheduleForm({ ...scheduleForm, day_of_week: value })
            }
            data={DAYS_OF_WEEK}
            required
          />
          <TextInput
            label="Start Time"
            type="time"
            value={scheduleForm.start_time}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                start_time: e.currentTarget.value,
              })
            }
          />
          <TextInput
            label="End Time"
            type="time"
            value={scheduleForm.end_time}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                end_time: e.currentTarget.value,
              })
            }
          />
          <TextInput
            label="Room Number"
            placeholder="e.g., Room 101"
            value={scheduleForm.room_number}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                room_number: e.currentTarget.value,
              })
            }
          />
          <Button variant="filled" onClick={onAddSchedule} loading={loading}>
            Add Schedule
          </Button>
        </Stack>
      </Card>

      {/* Current Schedules */}
      {Array.isArray(doctorSchedules) && doctorSchedules.length > 0 ? (
        <Card withBorder p="lg">
          <Title order={5} mb="md">
            Current Schedules
          </Title>
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Doctor</Table.Th>
                <Table.Th>Day</Table.Th>
                <Table.Th>Time</Table.Th>
                <Table.Th>Room</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {doctorSchedules.map((schedule) => (
                <Table.Tr key={`schedule-${schedule.id}`}>
                  <Table.Td>{schedule.doctor_name}</Table.Td>
                  <Table.Td>{schedule.day_of_week}</Table.Td>
                  <Table.Td>
                    {schedule.start_time} - {schedule.end_time}
                  </Table.Td>
                  <Table.Td>{schedule.room_number}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table></ScrollArea>
        </Card>
      ) : null}
    </Stack>
  );
}

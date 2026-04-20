import React, { useState } from 'react';
import { Card, Alert, Table,
  ScrollArea, Title, Badge, Stack, Text, Group, Button } from '@mantine/core';
import { IconClock, IconUserCheck } from '@tabler/icons-react';

export default function TodaysScheduleTab({ todaysSchedule, allDoctors = [] }) {
  const [viewMode, setViewMode] = useState('fixed');

  const getStatusColor = (status) => {
    const colorMap = {
      AVAILABLE: 'green',
      ON_BREAK: 'yellow',
      SCHEDULED: 'blue',
      DEPARTED: 'red',
    };
    return colorMap[status] || 'gray';
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not recorded';
    try {
      const date = new Date(dateTimeString);
      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return time;
    } catch {
      return dateTimeString;
    }
  };

  // For attendance view: combine scheduled doctors with any additional doctors with attendance records
  const getAttendanceList = () => {
    const attendanceMap = new Map();
    
    // First, add all scheduled doctors
    todaysSchedule.forEach(schedule => {
      const key = `${schedule.doctor_id}`;
      if (!attendanceMap.has(key)) {
        attendanceMap.set(key, {
          doctor_id: schedule.doctor_id,
          doctor_name: schedule.doctor_name,
          specialization: schedule.specialization,
          todays_status: schedule.todays_status,
          in_fixed_schedule: true,
        });
      }
    });
    
    // Then, add any additional doctors with attendance records (not in fixed schedule)
    allDoctors.forEach(doctorItem => {
      const doctorData = doctorItem.doctor || doctorItem;
      const key = `${doctorData.id}`;
      const hasAttendance = doctorItem.todays_status && (
        doctorItem.todays_status.status_label || 
        doctorItem.todays_status.marked_at
      );
      
      // Only add if has attendance and not already added
      if (hasAttendance && !attendanceMap.has(key)) {
        attendanceMap.set(key, {
          doctor_id: doctorData.id,
          doctor_name: doctorData.doctor_name,
          specialization: doctorData.specialization,
          todays_status: doctorItem.todays_status,
          in_fixed_schedule: false,
        });
      }
    });
    
    return Array.from(attendanceMap.values());
  };

  return (
    <Stack gap="md">
      {Array.isArray(todaysSchedule) && todaysSchedule.length > 0 ? (
        <>
          {/* View Toggle Buttons */}
          <Group grow>
            <Button
              leftSection={<IconClock size={16} />}
              variant={viewMode === 'fixed' ? 'filled' : 'light'}
              onClick={() => setViewMode('fixed')}
            >
              Fixed Schedule
            </Button>
            <Button
              leftSection={<IconUserCheck size={16} />}
              variant={viewMode === 'attendance' ? 'filled' : 'light'}
              onClick={() => setViewMode('attendance')}
            >
              Today's Attendance
            </Button>
          </Group>

          {/* ═══════════════════════════════════════════ */}
          {/* VIEW 1: Fixed Schedule                     */}
          {/* ═══════════════════════════════════════════ */}
          {viewMode === 'fixed' && (
            <Card withBorder p="lg">
              <Title order={5} mb="md">
                Today's Doctor Schedule ({todaysSchedule.length} doctor{todaysSchedule.length !== 1 ? 's' : ''})
              </Title>
              <ScrollArea><Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Doctor</Table.Th>
                    <Table.Th>Specialization</Table.Th>
                    <Table.Th>Time Slot</Table.Th>
                    <Table.Th>Room</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {todaysSchedule.map((schedule) => (
                    <Table.Tr key={`today-schedule-${schedule.id}-${schedule.doctor_id}`}>
                      <Table.Td>
                        <Text weight={500}>Dr. {schedule.doctor_name}</Text>
                      </Table.Td>
                      <Table.Td>{schedule.specialization || 'N/A'}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconClock size={16} />
                          <Text size="sm">
                            {schedule.start_time} - {schedule.end_time}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light">
                          {schedule.room_number || 'N/A'}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table></ScrollArea>
            </Card>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* VIEW 2: Today's Attendance                */}
          {/* ═══════════════════════════════════════════ */}
          {viewMode === 'attendance' && (
            <Card withBorder p="lg">
              <Stack gap="md">
                <Title order={5}>
                  Today's Doctor Attendance
                </Title>
                {getAttendanceList().length > 0 ? (
                  <ScrollArea><Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Doctor</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Time Recorded</Table.Th>
                        <Table.Th>Notes</Table.Th>
                        <Table.Th>Type</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {getAttendanceList().map((doctor) => {
                        const attendance = doctor.todays_status;
                        return (
                          <Table.Tr key={`today-attendance-${doctor.doctor_id}`}>
                            <Table.Td>
                              <Text weight={500}>Dr. {doctor.doctor_name}</Text>
                              <Text size="xs" c="dimmed">{doctor.specialization || 'N/A'}</Text>
                            </Table.Td>
                            <Table.Td>
                              {attendance && attendance.status_label ? (
                                <Badge color={getStatusColor(attendance.status)}>
                                  {attendance.status_label}
                                </Badge>
                              ) : (
                                <Badge color="gray">Not Recorded</Badge>
                              )}
                            </Table.Td>
                            <Table.Td>
                              {attendance && attendance.marked_at ? (
                                <Text size="sm">{formatDateTime(attendance.marked_at)}</Text>
                              ) : (
                                <Text size="sm" c="dimmed">N/A</Text>
                              )}
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm" c="dimmed">
                                {attendance && attendance.notes ? attendance.notes : '-'}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge 
                                variant="outline" 
                                color={doctor.in_fixed_schedule ? 'blue' : 'orange'}
                              >
                                {doctor.in_fixed_schedule ? 'Scheduled' : 'Extra'}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table></ScrollArea>
                ) : (
                  <Alert color="blue" title="No Attendance Records">
                    No doctor attendance has been recorded today.
                  </Alert>
                )}
              </Stack>
            </Card>
          )}
        </>
      ) : (
        <Alert color="blue" title="No Schedule Today">
          No doctors are scheduled to work today. Check back tomorrow!
        </Alert>
      )}
    </Stack>
  );
}

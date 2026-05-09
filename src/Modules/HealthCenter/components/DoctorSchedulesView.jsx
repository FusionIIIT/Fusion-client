/**
 * Doctor Schedules View Component
 * ===============================
 * Display all doctor schedules in a read-only table format
 * Patient-facing view without any action buttons
 * 
 * PHC-UC-01: View Doctor Schedules
 */

import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  ScrollArea,
  Text,
  Loader,
  Stack,
  Group,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import * as api from '../api';

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function DoctorSchedulesView() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Use patient-accessible endpoint getDoctorAvailability instead of compounder endpoint
      const response = await api.getDoctorAvailability();
      
      const doctorsList = normalizeArray(response.data);
      
      // Extract schedules from all doctors
      const allSchedules = [];
      const doctorsMap = {};
      
      doctorsList.forEach(item => {
        const doctorData = item.doctor || item;
        const schedules = item.schedule || item.schedules || [];
        
        // Store doctor info for lookup
        doctorsMap[doctorData.id] = doctorData;
        
        // Add each schedule with doctor info
        schedules.forEach(schedule => {
          allSchedules.push({
            ...schedule,
            doctor: doctorData.id,
            doctor_name: doctorData.doctor_name,
            specialization: doctorData.specialization
          });
        });
      });
      
      setSchedules(allSchedules);
      setDoctors(Object.values(doctorsMap));
    } catch (error) {
      
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to load schedules';
      
      
      
      // Show warning but don't break the UI
      notifications.show({
        message: 'Could not load doctor schedules',
        color: 'yellow',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDoctorName = (schedule) => {
    return schedule.doctor_name ? `Dr. ${schedule.doctor_name}` : 'N/A';
  };

  const getDoctorSpecialization = (schedule) => {
    return schedule.specialization || 'N/A';
  };

  if (loading) {
    return (
      <Group position="center" py="xl">
        <Loader size="lg" />
      </Group>
    );
  }

  return (
    <Stack gap="lg">
      <div>
        <Text size="lg" weight={600}>
          Doctor Schedules
        </Text>
        <Text size="sm" color="dimmed">
          View all doctor schedules at the health center
        </Text>
      </div>

      <Card withBorder p="lg">
        {schedules.length === 0 ? (
          <Alert color="blue" title="No Schedules" icon={<IconAlertCircle />}>
            No doctor schedules are available at the moment.
          </Alert>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <ScrollArea><Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Doctor</Table.Th>
                  <Table.Th>Specialization</Table.Th>
                  <Table.Th>Day</Table.Th>
                  <Table.Th>Time</Table.Th>
                  <Table.Th>Room</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {schedules.map((schedule) => (
                  <Table.Tr key={`${schedule.id}-${schedule.day_of_week}`}>
                    <Table.Td weight={500}>
                      {getDoctorName(schedule)}
                    </Table.Td>
                    <Table.Td>
                      {getDoctorSpecialization(schedule)}
                    </Table.Td>
                    <Table.Td>{schedule.day_of_week}</Table.Td>
                    <Table.Td>
                      {schedule.start_time} - {schedule.end_time}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{schedule.room_number}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table></ScrollArea>
          </div>
        )}
      </Card>
    </Stack>
  );
}

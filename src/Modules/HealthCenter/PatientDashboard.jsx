/**
 * Patient Dashboard
 * =================
 * THIN VIEW: Composes patient-related components
 * 
 * Responsibility: Layout and component composition only
 * Business logic: Delegated to individual components
 * 
 * Composed Components:
 * - ScheduleViewer: View doctor schedules
 * - TodaysScheduleTab: View today's doctor schedule
 * - PrescriptionList: View prescriptions
 */

import { useState, useEffect } from 'react';
import { Container, Title, Text, Tabs, Stack, Loader, Group } from '@mantine/core';
import {
  IconCalendar,
  IconFileText,
  IconClock,
  IconCurrencyDollar,
  IconBell,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

// Import micro-components
import DoctorSchedulesView from './components/DoctorSchedulesView';
import TodaysScheduleTab from './components/TodaysScheduleTab';
import PrescriptionList from './components/PrescriptionList';
import ReimbursementSection from './components/ReimbursementSection';
import AnnouncementsView from './components/AnnouncementsView';
import * as api from './api';

export default function PatientDashboard() {
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);

  // Fetch today's schedule and check employee status on component mount
  useEffect(() => {
    fetchTodaysSchedule();
    
    // Check if user has employee privileges by verifying access to claims
    api.getReimbursementClaims()
      .then(() => setIsEmployee(true))
      .catch(err => {
        // If error is 403, they are a student. Otherwise, show tab so they can see the actual error
        if (err.response?.status !== 403) {
          setIsEmployee(true);
        }
      });
  }, []);

  const fetchTodaysSchedule = async () => {
    try {
      setLoadingSchedule(true);
      // Use patient-accessible endpoint: getDoctorAvailability
      // This returns doctor details with their schedules
      const response = await api.getDoctorAvailability();
      const doctors = Array.isArray(response.data) ? response.data : [];
      
      // Store all doctors for attendance view
      setAllDoctors(doctors);
      
      // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = dayNames[dayOfWeek];
      
      // Extract schedules from all doctors and filter for today
      const todaySchedules = [];
      doctors.forEach(doctorItem => {
        const schedules = doctorItem.schedule || doctorItem.schedules || [];
        const doctorData = doctorItem.doctor || doctorItem;
        
        schedules.forEach(schedule => {
          if (schedule.day_of_week?.toLowerCase() === todayName || schedule.day_of_week === dayOfWeek) {
            todaySchedules.push({
              ...schedule,
              doctor_name: doctorData.doctor_name,
              doctor_id: doctorData.id,
              specialization: doctorData.specialization,
              todays_status: doctorItem.todays_status,
            });
          }
        });
      });
      
      setTodaysSchedule(todaySchedules);
    } catch (error) {
      
      
      // Show empty state instead of error - no prescriptions might be normal
      setTodaysSchedule([]);
      setAllDoctors([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Stack mb="xl">
        <Title order={1}>Health Center</Title>
        <Text color="dimmed">
          View doctor schedules, prescriptions, and manage reimbursement claims
        </Text>
      </Stack>

      {/* Tabbed Interface */}
      <Tabs defaultValue="announcements">
        <Tabs.List>
          <Tabs.Tab value="announcements" leftSection={<IconBell size={14} />}>
            Announcements
          </Tabs.Tab>
          <Tabs.Tab value="schedules" leftSection={<IconCalendar size={14} />}>
            Doctor Schedules
          </Tabs.Tab>
          <Tabs.Tab value="today" leftSection={<IconClock size={14} />}>
            Today's Schedule
          </Tabs.Tab>
          <Tabs.Tab value="prescriptions" leftSection={<IconFileText size={14} />}>
            Prescriptions
          </Tabs.Tab>
          {isEmployee && (
            <Tabs.Tab value="reimbursement" leftSection={<IconCurrencyDollar size={14} />}>
              Reimbursement
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="announcements" pt="xl">
          <AnnouncementsView />
        </Tabs.Panel>

        {/* Tab 1: Doctor Schedules */}
        <Tabs.Panel value="schedules" pt="xl">
          <DoctorSchedulesView />
        </Tabs.Panel>

        {/* Tab 2: Today's Schedule */}
        <Tabs.Panel value="today" pt="xl">
          {loadingSchedule ? (
            <Stack align="center" py="xl">
              <Loader />
            </Stack>
          ) : (
            <TodaysScheduleTab todaysSchedule={todaysSchedule} allDoctors={allDoctors} />
          )}
        </Tabs.Panel>

        {/* Tab 3: Prescriptions */}
        <Tabs.Panel value="prescriptions" pt="xl">
          <PrescriptionList />
        </Tabs.Panel>

        {/* Tab 4: Reimbursement (Employees Only) */}
        {isEmployee && (
          <Tabs.Panel value="reimbursement" pt="xl">
            <ReimbursementSection />
          </Tabs.Panel>
        )}
      </Tabs>
    </Container>
  );
}

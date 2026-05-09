/**
 * Compounder Dashboard
 * ====================
 * THIN VIEW: Composes compounder operational components
 * 
 * Responsibility: Layout and component composition only
 * Business logic: Delegated to individual components
 * 
 * Composed Components (10 modules):
 * - DoctorForm: Doctor CRUD management
 * - ScheduleForm: Doctor schedule management
 * - AttendanceForm: Daily attendance tracking
 * - StockForm: Medicine inventory management
 * - ExpiryBatchReturn: Batch return tracking
 * - PrescriptionCreation: Prescription creation with FIFO
 * - ComplaintResponse: Complaint response management
 * - HospitalAdmissionForm: Patient admission/discharge
 * - AmbulanceManagement: Ambulance CRUD
 * - ReimbursementReview: Staff claim review
 */

import { Suspense, useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Tabs,
  Loader,
  Center,
  ActionIcon,
  Group,
  ScrollArea,
  Button,
} from '@mantine/core';
import {
  IconUser,
  IconClock,
  IconCalendar,
  IconPill,
  IconRefresh,
  IconFileText,
  IconAlertCircle,
  IconBed,
  IconAmbulance,
  IconCurrencyDollar,
  IconChevronLeft,
  IconChevronRight,
  IconSend,
  IconSpeakerphone,
  IconReportAnalytics,
} from '@tabler/icons-react';

// Import all 10 compounder components
import DoctorForm from './components/DoctorForm';
import ScheduleForm from './components/ScheduleForm';
import AttendanceForm from './components/AttendanceForm';
import StockForm from './components/StockForm';
import ExpiryBatchReturn from './components/ExpiryBatchReturn';
import ConsultationForm from './components/ConsultationForm';
import PrescriptionCreation from './components/PrescriptionCreation';
// import ComplaintResponse from './components/ComplaintResponse';
// import HospitalAdmissionForm from './components/HospitalAdmissionForm';
import AmbulanceManagement from './components/AmbulanceManagement';
import ReimbursementReview from './components/ReimbursementReview';
import InventoryRequisitions from './components/InventoryRequisitions';
import AnnouncementsManagement from './components/AnnouncementsManagement';
import ReportsTab from './components/ReportsTab';


// Loading component
const TabLoader = () => (
  <Center py="xl">
    <Loader />
  </Center>
);

export default function CompoundDashboard() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const tabIds = [
    'doctors',
    'schedules',
    'attendance',
    'stock',
    'requisitions',
    'expiry',
    'consultations',
    'prescriptions',
    // 'complaints', // Complaint Response - Commented Out
    // 'admissions', // Hospital Admissions - Commented Out
    'ambulances',
    'reimbursement',
    'announcements',
    'reports',
  ];

  const handleTabNavigation = (direction) => {
    const currentIndex = tabIds.indexOf(activeTab);
    let nextIndex;

    if (direction === 'left') {
      nextIndex = currentIndex === 0 ? tabIds.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex === tabIds.length - 1 ? 0 : currentIndex + 1;
    }

    setActiveTab(tabIds[nextIndex]);
  };

  const handleCreatePrescriptionFromConsultation = (consultation) => {
    // Store consultation and switch to prescriptions tab
    setSelectedConsultation(consultation);
    setActiveTab('prescriptions');
  };

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb="xl">
        <Stack gap="xs">
          <Title order={1}>Compounder Dashboard</Title>
          <Text size="sm" color="dimmed">
            Manage hospital operations, prescriptions, and patient care
          </Text>
        </Stack>
      </Group>

      {/* Tabbed Interface with Direction Buttons */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        {/* Navbar with Direction Buttons */}
        <Group gap={0} mb="lg">
          <ActionIcon
            variant="light"
            onClick={() => handleTabNavigation('left')}
            size="lg"
            aria-label="Previous tab"
          >
            <IconChevronLeft size={18} />
          </ActionIcon>

          <ScrollArea
            type="never"
            style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden' }}
          >
            <Tabs.List 
              style={{ 
                display: 'flex', 
                minWidth: 'fit-content',
                whiteSpace: 'nowrap',
                flexWrap: 'nowrap',
              }}
            >
              <Tabs.Tab value="doctors" leftSection={<IconUser size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Doctor Management
              </Tabs.Tab>
              <Tabs.Tab value="schedules" leftSection={<IconClock size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Doctor Schedules
              </Tabs.Tab>
              <Tabs.Tab value="attendance" leftSection={<IconCalendar size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Attendance Tracking
              </Tabs.Tab>
              <Tabs.Tab value="stock" leftSection={<IconPill size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Medicine Stock
              </Tabs.Tab>
              <Tabs.Tab value="requisitions" leftSection={<IconSend size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Inventory Requisitions
              </Tabs.Tab>
              <Tabs.Tab value="expiry" leftSection={<IconRefresh size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Batch Returns & Expiry
              </Tabs.Tab>
              <Tabs.Tab value="consultations" leftSection={<IconUser size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                New Consultation
              </Tabs.Tab>
              <Tabs.Tab value="prescriptions" leftSection={<IconFileText size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Create Prescriptions
              </Tabs.Tab>
              {/* <Tabs.Tab value="complaints" leftSection={<IconAlertCircle size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Complaint Response
              </Tabs.Tab> */}
              {/* <Tabs.Tab value="admissions" leftSection={<IconBed size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Hospital Admissions
              </Tabs.Tab> */}
              <Tabs.Tab value="ambulances" leftSection={<IconAmbulance size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Ambulance Management
              </Tabs.Tab>
              <Tabs.Tab value="reimbursement" leftSection={<IconCurrencyDollar size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Staff Reimbursement
              </Tabs.Tab>
              <Tabs.Tab value="announcements" leftSection={<IconSpeakerphone size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                Announcements
              </Tabs.Tab>
              <Tabs.Tab value="reports" leftSection={<IconReportAnalytics size={14} />} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                System Reports
              </Tabs.Tab>
            </Tabs.List>
          </ScrollArea>

          <ActionIcon
            variant="light"
            onClick={() => handleTabNavigation('right')}
            size="lg"
            aria-label="Next tab"
          >
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>

        {/* Tab 1: Doctor Management */}
        <Tabs.Panel value="doctors" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <DoctorForm />
          </Suspense>
        </Tabs.Panel>

        {/* Tab 2: Doctor Schedules */}
        <Tabs.Panel value="schedules" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <ScheduleForm />
          </Suspense>
        </Tabs.Panel>

        {/* Tab 3: Attendance Tracking */}
        <Tabs.Panel value="attendance" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <AttendanceForm />
          </Suspense>
        </Tabs.Panel>

        {/* Tab 4: Medicine Stock */}
        <Tabs.Panel value="stock" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <StockForm />
          </Suspense>
        </Tabs.Panel>

        {/* Tab 4.5: Inventory Requisitions */}
        <Tabs.Panel value="requisitions" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <InventoryRequisitions />
          </Suspense>
        </Tabs.Panel>

        {/* Tab 5: Batch Returns & Expiry */}
        <Tabs.Panel value="expiry" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <ExpiryBatchReturn />
          </Suspense>
        </Tabs.Panel>

        {/* Tab 6: New Consultation */}
        <Tabs.Panel value="consultations" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <ConsultationForm onCreatePrescription={handleCreatePrescriptionFromConsultation} />
          </Suspense>
        </Tabs.Panel>

        {/* Tab 7: Create Prescriptions */}
        <Tabs.Panel value="prescriptions" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <PrescriptionCreation selectedConsultation={selectedConsultation} onPrescriptionCreated={() => setSelectedConsultation(null)} />
          </Suspense>
        </Tabs.Panel>

        {/* Tab 8: Complaint Response - COMMENTED OUT */}
        {/* <Tabs.Panel value="complaints" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <ComplaintResponse />
          </Suspense>
        </Tabs.Panel> */}

        {/* Tab 9: Hospital Admissions - COMMENTED OUT */}
        {/* <Tabs.Panel value="admissions" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <HospitalAdmissionForm />
          </Suspense>
        </Tabs.Panel> */}

        {/* Tab 10: Ambulance Management */}
        <Tabs.Panel value="ambulances" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <AmbulanceManagement />
          </Suspense>
        </Tabs.Panel>

        {/* Tab 11: Staff Reimbursement */}
        <Tabs.Panel value="reimbursement" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <ReimbursementReview />
          </Suspense>
        </Tabs.Panel>

        {/* Tab 12: Announcements — PHC-UC-12 */}
        <Tabs.Panel value="announcements" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <AnnouncementsManagement />
          </Suspense>
        </Tabs.Panel>

        {/* Tab 13: System Reports — PHC-UC-13 */}
        <Tabs.Panel value="reports" pt="xl">
          <Suspense fallback={<TabLoader />}>
            <ReportsTab />
          </Suspense>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

/**
 * Medical History Page
 * =====================
 * Displays patient's medical records including:
 * - Consultations/visits
 * - Prescriptions
 * - Clinical notes
 * 
 * PHC-UC-02: View Medical History
 */

import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Loader,
  Card,
  Stack,
  Group,
  Badge,
  Tabs,
  Timeline,
  ThemeIcon,
  Button,
  Modal,
  SimpleGrid,
  Table,
  ScrollArea,
} from '@mantine/core';
import {
  IconCalendar,
  IconFileText,
  IconPill,
  IconClock,
  IconUserMd,
  IconClipboard,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import * as api from '../api';

export default function MedicalHistory() {
  const [medicalData, setMedicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [consultationModal, setConsultationModal] = useState(false);

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      const response = await api.getMedicalHistory();
      setMedicalData(response.data);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load medical history',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Group position="center" style={{ height: '100vh' }}>
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  const consultations = medicalData?.consultations || [];
  const prescriptions = medicalData?.prescriptions || [];

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Stack mb="xl">
        <Title order={1}>Medical History</Title>
        <Text color="dimmed">Your complete medical records and prescriptions</Text>
      </Stack>

      {/* Tabs */}
      <Tabs defaultValue="consultations">
        <Tabs.List>
          <Tabs.Tab
            value="consultations"
            leftSection={<IconClipboard size={14} />}
          >
            Consultations ({consultations.length})
          </Tabs.Tab>
          <Tabs.Tab value="prescriptions" leftSection={<IconPill size={14} />}>
            Prescriptions ({prescriptions.length})
          </Tabs.Tab>
        </Tabs.List>

        {/* Consultations Tab */}
        <Tabs.Panel value="consultations" pt="xl">
          {consultations.length > 0 ? (
            <Timeline active={-1} bulletSize={24} lineWidth={2}>
              {consultations.map((consultation, idx) => (
                <Timeline.Item
                  key={consultation.id}
                  bullet={<IconUserMd size={12} />}
                  title={`Dr. ${consultation.doctor_name}`}
                >
                  <Card withBorder p="md" mt="md">
                    <Stack gap="md">
                      {/* Date and Time */}
                      <Group spacing="sm">
                        <Text weight={500} size="sm">
                          📅 {consultation.consultation_date}
                        </Text>
                        {consultation.consultation_time && (
                          <Text weight={500} size="sm">
                            🕐 {consultation.consultation_time}
                          </Text>
                        )}
                      </Group>

                      {/* Vitals */}
                      {(consultation.blood_pressure ||
                        consultation.pulse ||
                        consultation.temperature) && (
                        <div>
                          <Text weight={500} size="sm" mb="xs">
                            Vitals
                          </Text>
                          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
                            {consultation.blood_pressure && (
                              <div>
                                <Text size="xs" color="dimmed">
                                  BP
                                </Text>
                                <Text size="sm" weight={500}>
                                  {consultation.blood_pressure}
                                </Text>
                              </div>
                            )}
                            {consultation.pulse && (
                              <div>
                                <Text size="xs" color="dimmed">
                                  Pulse
                                </Text>
                                <Text size="sm" weight={500}>
                                  {consultation.pulse} bpm
                                </Text>
                              </div>
                            )}
                            {consultation.temperature && (
                              <div>
                                <Text size="xs" color="dimmed">
                                  Temp
                                </Text>
                                <Text size="sm" weight={500}>
                                  {consultation.temperature}°C
                                </Text>
                              </div>
                            )}
                            {consultation.oxygen_saturation && (
                              <div>
                                <Text size="xs" color="dimmed">
                                  O₂
                                </Text>
                                <Text size="sm" weight={500}>
                                  {consultation.oxygen_saturation}%
                                </Text>
                              </div>
                            )}
                          </SimpleGrid>
                        </div>
                      )}

                      {/* Clinical Notes */}
                      {consultation.clinical_notes && (
                        <div>
                          <Text weight={500} size="sm" mb="xs">
                            Clinical Notes
                          </Text>
                          <Text size="sm">{consultation.clinical_notes}</Text>
                        </div>
                      )}

                      {/* Diagnosis */}
                      {consultation.diagnosis && (
                        <div>
                          <Text weight={500} size="sm" mb="xs">
                            Diagnosis
                          </Text>
                          <Text size="sm">{consultation.diagnosis}</Text>
                        </div>
                      )}

                      {/* Action Button */}
                      {consultation.prescription_id && (
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => {
                            const prescription = prescriptions.find(
                              (p) => p.id === consultation.prescription_id
                            );
                            if (prescription) {
                              setSelectedConsultation(prescription);
                              setConsultationModal(true);
                            }
                          }}
                        >
                          View Prescription
                        </Button>
                      )}
                    </Stack>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Text color="dimmed">No consultations recorded yet</Text>
          )}
        </Tabs.Panel>

        {/* Prescriptions Tab */}
        <Tabs.Panel value="prescriptions" pt="xl">
          {prescriptions.length > 0 ? (
            <Stack gap="md">
              {prescriptions.map((prescription) => (
                <Card key={prescription.id} withBorder p="md">
                  <Stack gap="md">
                    {/* Header */}
                    <Group position="apart">
                      <div>
                        <Text weight={700}>Prescription #{prescription.id}</Text>
                        <Text size="sm" color="dimmed">
                          Date: {prescription.prescription_date}
                        </Text>
                      </div>
                      <Badge>{prescription.status || 'Active'}</Badge>
                    </Group>

                    {/* Medicines Table */}
                    <div>
                      <Text weight={500} size="sm" mb="xs">
                        Medicines
                      </Text>
                      <ScrollArea><Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Medicine</Table.Th>
                            <Table.Th>Dosage</Table.Th>
                            <Table.Th>Duration</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {prescription.medicines?.map((medicine, idx) => (
                            <Table.Tr key={idx}>
                              <Table.Td>{medicine.medicine_name}</Table.Td>
                              <Table.Td>
                                {medicine.quantity} {medicine.unit} ×{' '}
                                {medicine.times_per_day}
                                times/day
                              </Table.Td>
                              <Table.Td>{medicine.days} days</Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table></ScrollArea>
                    </div>

                    {/* Instructions */}
                    {prescription.follow_up_instructions && (
                      <div>
                        <Text weight={500} size="sm" mb="xs">
                          Follow-up Instructions
                        </Text>
                        <Text size="sm">{prescription.follow_up_instructions}</Text>
                      </div>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          ) : (
            <Text color="dimmed">No prescriptions on record</Text>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Prescription Modal */}
      <Modal
        opened={consultationModal}
        onClose={() => {
          setConsultationModal(false);
          setSelectedConsultation(null);
        }}
        title="Prescription Details"
        size="lg"
      >
        {selectedConsultation && (
          <Stack gap="md">
            <div>
              <Text weight={500} size="sm" mb="xs">
                Medicines
              </Text>
              <ScrollArea><Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Medicine</Table.Th>
                    <Table.Th>Dosage</Table.Th>
                    <Table.Th>Duration</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {selectedConsultation.medicines?.map((medicine, idx) => (
                    <Table.Tr key={idx}>
                      <Table.Td>{medicine.medicine_name}</Table.Td>
                      <Table.Td>
                        {medicine.quantity} {medicine.unit} ×{' '}
                        {medicine.times_per_day}
                        times/day
                      </Table.Td>
                      <Table.Td>{medicine.days} days</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table></ScrollArea>
            </div>

            {selectedConsultation.follow_up_instructions && (
              <div>
                <Text weight={500} size="sm" mb="xs">
                  Follow-up Instructions
                </Text>
                <Text size="sm">
                  {selectedConsultation.follow_up_instructions}
                </Text>
              </div>
            )}
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

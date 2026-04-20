/**
 * Consultation Form Component
 * ============================
 * Create new consultations for patients with doctors
 * Record chief complaints, vitals, and clinical findings
 */

import { useState, useEffect } from 'react';
import {
  Button,
  Stack,
  Group,
  Card,
  Table,
  ScrollArea,
  Text,
  Modal,
  Badge,
  ActionIcon,
  Textarea,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  TextInput,
  Loader,
  Center,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconPlus, IconCheck, IconTrash, IconPill, IconEye } from '@tabler/icons-react';
import * as api from '../api';

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function ConsultationForm({ onCreatePrescription }) {
  const [consultations, setConsultations] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consultationsLoading, setConsultationsLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    doctor_id: '',
    chief_complaint: '',
    history_of_present_illness: '',
    examination_findings: '',
    provisional_diagnosis: '',
    final_diagnosis: '',
    treatment_plan: '',
    advice: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    pulse_rate: '',
    temperature: '',
    oxygen_saturation: '',
    weight: '',
    follow_up_date: '',
    ambulance_requested: 'no',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, usersRes, consultationsRes] = await Promise.all([
        api.getDoctorsFiltered({ active_only: true }),
        api.getUsers(),
        api.getConsultationsList(),
      ]);

      // Load doctors
      const doctorList = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];
      const doctorOptions = doctorList.map((doc) => ({
        value: doc.id.toString(),
        label: `Dr. ${doc.doctor_name} - ${doc.specialization || 'General'}`,
        ...doc,
      }));
      setDoctors(doctorOptions);

      // Load users
      const userList = normalizeArray(usersRes.data);
      setUsers(
        userList.map((user) => ({
          value: user.value || user.id.toString(),
          label: user.label || `${user.username} - ${user.full_name}`,
          ...user,
        }))
      );

      // Load consultations
      const consultationList = normalizeArray(consultationsRes.data);
      setConsultations(consultationList);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load data: ' + (error?.response?.data?.detail || error.message),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_id) newErrors.user_id = 'Patient (User) is required';
    if (!formData.doctor_id) newErrors.doctor_id = 'Doctor is required';
    if (!formData.chief_complaint) newErrors.chief_complaint = 'Chief complaint is required';

    // Validate vitals if provided
    if (formData.blood_pressure_systolic && (formData.blood_pressure_systolic < 0 || formData.blood_pressure_systolic > 300)) {
      newErrors.blood_pressure_systolic = 'Systolic BP should be 0-300';
    }
    if (formData.blood_pressure_diastolic && (formData.blood_pressure_diastolic < 0 || formData.blood_pressure_diastolic > 300)) {
      newErrors.blood_pressure_diastolic = 'Diastolic BP should be 0-300';
    }
    if (formData.pulse_rate && (formData.pulse_rate < 0 || formData.pulse_rate > 300)) {
      newErrors.pulse_rate = 'Pulse rate should be 0-300';
    }
    if (formData.temperature && (formData.temperature < 30 || formData.temperature > 45)) {
      newErrors.temperature = 'Temperature should be 30-45°C';
    }
    if (formData.oxygen_saturation && (formData.oxygen_saturation < 0 || formData.oxygen_saturation > 100)) {
      newErrors.oxygen_saturation = 'O2 saturation should be 0-100%';
    }
    if (formData.weight && (formData.weight < 0 || formData.weight > 300)) {
      newErrors.weight = 'Weight should be 0-300 kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        user_id: parseInt(formData.user_id),
        doctor_id: parseInt(formData.doctor_id),
        chief_complaint: formData.chief_complaint,
        history_of_present_illness: formData.history_of_present_illness,
        examination_findings: formData.examination_findings,
        provisional_diagnosis: formData.provisional_diagnosis,
        final_diagnosis: formData.final_diagnosis,
        treatment_plan: formData.treatment_plan,
        advice: formData.advice,
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null,
        pulse_rate: formData.pulse_rate ? parseInt(formData.pulse_rate) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        oxygen_saturation: formData.oxygen_saturation ? parseInt(formData.oxygen_saturation) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        follow_up_date: formData.follow_up_date || null,
        ambulance_requested: formData.ambulance_requested,
      };

      // Remove null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === '') {
          delete payload[key];
        }
      });

      await api.createConsultation(payload);
      notifications.show({
        message: 'Consultation created successfully',
        color: 'green',
      });
      resetForm();
      setModalOpened(false);
      await fetchInitialData();
    } catch (error) {
      
      

      const errorData = error.response?.data;
      let errorMessage = 'Failed to create consultation';

      if (errorData) {
        errorMessage = 
          errorData.detail || 
          errorData.error || 
          JSON.stringify(errorData) ||
          error.message ||
          'Failed to create consultation';
      }

      notifications.show({
        message: errorMessage,
        color: 'red',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      doctor_id: '',
      chief_complaint: '',
      history_of_present_illness: '',
      examination_findings: '',
      provisional_diagnosis: '',
      final_diagnosis: '',
      treatment_plan: '',
      advice: '',
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      pulse_rate: '',
      temperature: '',
      oxygen_saturation: '',
      weight: '',
      follow_up_date: '',
      ambulance_requested: 'no',
    });
    setErrors({});
  };

  const handleDeleteConsultation = (consultationId) => {
    modals.openConfirmModal({
      title: 'Confirm Deletion',
      children: 'Are you sure you want to delete this consultation?',
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.deleteConsultation(consultationId);
          notifications.show({
            message: 'Consultation deleted successfully',
            color: 'green',
          });
          setConsultations(consultations.filter(c => c.id !== consultationId));
        } catch (error) {
          notifications.show({
            message: 'Failed to delete consultation: ' + (error?.response?.data?.detail || error.message),
            color: 'red',
          });
        }
      }
    });
  };

  const handleCreatePrescription = (consultation) => {
    if (onCreatePrescription) {
      onCreatePrescription(consultation);
    }
  };

  const handleViewDetails = (consultation) => {
    setSelectedConsultation(consultation);
    setDetailsModalOpened(true);
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Text size="lg" weight={600}>
          Create New Consultation
        </Text>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setModalOpened(true)}
        >
          New Consultation
        </Button>
      </Group>

      {/* Consultations Table */}
      <Card withBorder>
        <Stack gap="md">
          <Text size="md" weight={600}>Recent Consultations</Text>
          {consultations.length === 0 ? (
            <Center py="lg">
              <Text c="dimmed">No consultations yet</Text>
            </Center>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <ScrollArea><Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Doctor</Table.Th>
                    <Table.Th>Chief Complaint</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {consultations.map((consultation) => (
                    <Table.Tr key={consultation.id}>
                      <Table.Td>
                        <Text size="sm">{consultation.patient_username || 'N/A'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{consultation.doctor_name || 'N/A'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" truncate>
                          {consultation.chief_complaint || 'N/A'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {consultation.consultation_date
                            ? new Date(consultation.consultation_date).toLocaleDateString()
                            : 'N/A'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="gray"
                            title="View Details"
                            onClick={() => handleViewDetails(consultation)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="blue"
                            title="Create Prescription"
                            onClick={() => handleCreatePrescription(consultation)}
                          >
                            <IconPill size={16} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="red"
                            title="Delete"
                            onClick={() => handleDeleteConsultation(consultation.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table></ScrollArea>
            </div>
          )}
        </Stack>
      </Card>

      {/* Consultation Details Modal */}
      <Modal
        opened={detailsModalOpened}
        onClose={() => {
          setSelectedConsultation(null);
          setDetailsModalOpened(false);
        }}
        title="Consultation Details"
        size="xl"
        scrollAreaComponent={Paper}
      >
        {selectedConsultation && (
          <Stack gap="lg">
            {/* Header: Patient, Doctor, Date */}
            <Card withBorder p="md" bg="blue.0">
              <SimpleGrid cols={3} spacing="md">
                <div>
                  <Text size="sm" c="dimmed">Patient</Text>
                  <Text weight={600}>{selectedConsultation.patient_username || 'N/A'}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Doctor</Text>
                  <Text weight={600}>{selectedConsultation.doctor_name || 'N/A'}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Consultation Date</Text>
                  <Text weight={600}>
                    {selectedConsultation.consultation_date
                      ? new Date(selectedConsultation.consultation_date).toLocaleDateString()
                      : 'N/A'}
                  </Text>
                </div>
              </SimpleGrid>
            </Card>

            {/* Section 1: Chief Complaint (Always show) */}
            <div>
              <Text weight={600} size="sm" mb="xs">Chief Complaint *</Text>
              <Card withBorder p="sm" bg="gray.0">
                <Text size="sm">{selectedConsultation.chief_complaint || 'N/A'}</Text>
              </Card>
            </div>

            {/* Section 2: Clinical Information */}
            <div>
              <Text weight={600} size="md" mb="md" c="blue">Clinical Information</Text>
              <Stack gap="md">
                <div>
                  <Text size="sm" c="dimmed">History of Present Illness</Text>
                  <Card withBorder p="sm" bg="gray.0">
                    <Text size="sm">{selectedConsultation.history_of_present_illness || 'N/A'}</Text>
                  </Card>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Examination Findings</Text>
                  <Card withBorder p="sm" bg="gray.0">
                    <Text size="sm">{selectedConsultation.examination_findings || 'N/A'}</Text>
                  </Card>
                </div>
              </Stack>
            </div>

            {/* Section 3: Vitals */}
            <div>
              <Text weight={600} size="md" mb="md" c="green">Vitals</Text>
              <Card withBorder p="md" bg="green.0">
                <SimpleGrid cols={3} spacing="md">
                  <div>
                    <Text size="xs" c="dimmed">Blood Pressure (Systolic)</Text>
                    <Text size="sm" weight={500}>
                      {selectedConsultation.blood_pressure_systolic || 'N/A'} mmHg
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Blood Pressure (Diastolic)</Text>
                    <Text size="sm" weight={500}>
                      {selectedConsultation.blood_pressure_diastolic || 'N/A'} mmHg
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Pulse Rate</Text>
                    <Text size="sm" weight={500}>
                      {selectedConsultation.pulse_rate || 'N/A'} bpm
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Temperature</Text>
                    <Text size="sm" weight={500}>
                      {selectedConsultation.temperature || 'N/A'}°C
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">O2 Saturation</Text>
                    <Text size="sm" weight={500}>
                      {selectedConsultation.oxygen_saturation || 'N/A'}%
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Weight</Text>
                    <Text size="sm" weight={500}>
                      {selectedConsultation.weight || 'N/A'} kg
                    </Text>
                  </div>
                </SimpleGrid>
              </Card>
            </div>

            {/* Section 4: Diagnosis */}
            <div>
              <Text weight={600} size="md" mb="md" c="orange">Diagnosis</Text>
              <SimpleGrid cols={2} spacing="md">
                <div>
                  <Text size="sm" c="dimmed">Provisional Diagnosis</Text>
                  <Card withBorder p="sm" bg="gray.0">
                    <Text size="sm">{selectedConsultation.provisional_diagnosis || 'N/A'}</Text>
                  </Card>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Final Diagnosis</Text>
                  <Card withBorder p="sm" bg="gray.0">
                    <Text size="sm">{selectedConsultation.final_diagnosis || 'N/A'}</Text>
                  </Card>
                </div>
              </SimpleGrid>
            </div>

            {/* Section 5: Treatment and Advice */}
            <div>
              <Text weight={600} size="md" mb="md" c="cyan">Treatment & Advice</Text>
              <Stack gap="md">
                <div>
                  <Text size="sm" c="dimmed">Treatment Plan</Text>
                  <Card withBorder p="sm" bg="gray.0">
                    <Text size="sm">{selectedConsultation.treatment_plan || 'N/A'}</Text>
                  </Card>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Advice for Patient</Text>
                  <Card withBorder p="sm" bg="gray.0">
                    <Text size="sm">{selectedConsultation.advice || 'N/A'}</Text>
                  </Card>
                </div>
              </Stack>
            </div>

            {/* Section 6: Follow-up */}
            <div>
              <Text weight={600} size="md" mb="md" c="red">Follow-up</Text>
              <Card withBorder p="sm" bg="gray.0">
                <Text size="sm" c="dimmed" mb="xs">Follow-up Date</Text>
                <Text size="sm" weight={500}>
                  {selectedConsultation.follow_up_date
                    ? new Date(selectedConsultation.follow_up_date).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </Card>
            </div>

            {/* Section 7: Ambulance Requested */}
            <div>
              <Text weight={600} size="md" mb="md" c="blue">Ambulance</Text>
              <Card withBorder p="sm" bg="gray.0">
                <Text size="sm" c="dimmed" mb="xs">Ambulance Requested</Text>
                <Badge 
                  size="lg" 
                  color={
                    selectedConsultation.ambulance_requested === 'yes' || 
                    selectedConsultation.ambulance_requested === true 
                      ? 'red' 
                      : 'green'
                  }
                >
                  {selectedConsultation.ambulance_requested === 'yes' || 
                   selectedConsultation.ambulance_requested === true 
                    ? 'Yes' 
                    : 'No'}
                </Badge>
              </Card>
            </div>

            {/* Close Button */}
            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => {
                  setSelectedConsultation(null);
                  setDetailsModalOpened(false);
                }}
              >
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal
        opened={modalOpened}
        onClose={() => {
          resetForm();
          setModalOpened(false);
        }}
        title="Create Consultation"
        size="xl"
        scrollAreaComponent={Paper}
      >
        <Stack gap="md">
          {/* Patient and Doctor Selection */}
          <SimpleGrid cols={2} spacing="sm">
            <Select
              label="Patient (User) *"
              placeholder="Select patient"
              data={users}
              value={formData.user_id}
              onChange={(value) =>
                setFormData({ ...formData, user_id: value })
              }
              error={errors.user_id}
              searchable
            />
            <Select
              label="Doctor *"
              placeholder="Select doctor"
              data={doctors}
              value={formData.doctor_id}
              onChange={(value) =>
                setFormData({ ...formData, doctor_id: value })
              }
              error={errors.doctor_id}
              searchable
            />
          </SimpleGrid>

          {/* Chief Complaint */}
          <Textarea
            label="Chief Complaint *"
            placeholder="Main reason for visit"
            value={formData.chief_complaint}
            onChange={(e) =>
              setFormData({ ...formData, chief_complaint: e.currentTarget.value })
            }
            error={errors.chief_complaint}
            minRows={2}
            required
          />

          {/* Clinical Information */}
          <Textarea
            label="History of Present Illness"
            placeholder="Details about current illness"
            value={formData.history_of_present_illness}
            onChange={(e) =>
              setFormData({ ...formData, history_of_present_illness: e.currentTarget.value })
            }
            minRows={2}
          />

          <Textarea
            label="Examination Findings"
            placeholder="Physical examination results"
            value={formData.examination_findings}
            onChange={(e) =>
              setFormData({ ...formData, examination_findings: e.currentTarget.value })
            }
            minRows={2}
          />

          {/* Vitals Section */}
          <Card withBorder p="md" bg="gray.0">
            <Stack gap="md">
              <Text weight={600} size="sm">Vitals (Optional)</Text>
              
              <SimpleGrid cols={2} spacing="sm">
                <SimpleGrid cols={2} spacing="xs">
                  <NumberInput
                    label="Systolic BP (mmHg)"
                    placeholder="e.g., 120"
                    min={0}
                    max={300}
                    value={formData.blood_pressure_systolic}
                    onChange={(value) =>
                      setFormData({ ...formData, blood_pressure_systolic: value })
                    }
                    error={errors.blood_pressure_systolic}
                  />
                  <NumberInput
                    label="Diastolic BP (mmHg)"
                    placeholder="e.g., 80"
                    min={0}
                    max={300}
                    value={formData.blood_pressure_diastolic}
                    onChange={(value) =>
                      setFormData({ ...formData, blood_pressure_diastolic: value })
                    }
                    error={errors.blood_pressure_diastolic}
                  />
                </SimpleGrid>

                <SimpleGrid cols={2} spacing="xs">
                  <NumberInput
                    label="Pulse Rate (bpm)"
                    placeholder="e.g., 72"
                    min={0}
                    max={300}
                    value={formData.pulse_rate}
                    onChange={(value) =>
                      setFormData({ ...formData, pulse_rate: value })
                    }
                    error={errors.pulse_rate}
                  />
                  <NumberInput
                    label="Temperature (°C)"
                    placeholder="e.g., 37.2"
                    min={30}
                    max={45}
                    step={0.1}
                    value={formData.temperature}
                    onChange={(value) =>
                      setFormData({ ...formData, temperature: value })
                    }
                    error={errors.temperature}
                  />
                </SimpleGrid>
              </SimpleGrid>

              <SimpleGrid cols={2} spacing="sm">
                <NumberInput
                  label="O2 Saturation (%)"
                  placeholder="e.g., 98"
                  min={0}
                  max={100}
                  value={formData.oxygen_saturation}
                  onChange={(value) =>
                    setFormData({ ...formData, oxygen_saturation: value })
                  }
                  error={errors.oxygen_saturation}
                />
                <NumberInput
                  label="Weight (kg)"
                  placeholder="e.g., 70"
                  min={0}
                  max={300}
                  step={0.1}
                  value={formData.weight}
                  onChange={(value) =>
                    setFormData({ ...formData, weight: value })
                  }
                  error={errors.weight}
                />
              </SimpleGrid>
            </Stack>
          </Card>

          {/* Diagnosis Section */}
          <SimpleGrid cols={2} spacing="sm">
            <Textarea
              label="Provisional Diagnosis"
              placeholder="Initial diagnosis"
              value={formData.provisional_diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, provisional_diagnosis: e.currentTarget.value })
              }
              minRows={2}
            />
            <Textarea
              label="Final Diagnosis"
              placeholder="Confirmed diagnosis"
              value={formData.final_diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, final_diagnosis: e.currentTarget.value })
              }
              minRows={2}
            />
          </SimpleGrid>

          {/* Treatment and Follow-up */}
          <Textarea
            label="Treatment Plan"
            placeholder="Recommended treatment"
            value={formData.treatment_plan}
            onChange={(e) =>
              setFormData({ ...formData, treatment_plan: e.currentTarget.value })
            }
            minRows={2}
          />

          <Textarea
            label="Advice for Patient"
            placeholder="General advice and instructions"
            value={formData.advice}
            onChange={(e) =>
              setFormData({ ...formData, advice: e.currentTarget.value })
            }
            minRows={2}
          />

          <TextInput
            label="Follow-up Date"
            type="date"
            value={formData.follow_up_date}
            onChange={(e) =>
              setFormData({ ...formData, follow_up_date: e.currentTarget.value })
            }
          />

          {/* Ambulance Requested */}
          <Select
            label="Ambulance Requested"
            placeholder="Select option"
            data={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' },
            ]}
            value={formData.ambulance_requested}
            onChange={(value) =>
              setFormData({ ...formData, ambulance_requested: value })
            }
          />

          {/* Form Actions */}
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                resetForm();
                setModalOpened(false);
              }}
            >
              Cancel
            </Button>
            <Button leftSection={<IconCheck size={16} />} onClick={handleSubmit}>
              Create Consultation
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

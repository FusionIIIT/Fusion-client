/**
 * Hospital Admission Form Component
 * ================================
 * Manage patient hospital admissions and discharges
 * Track admission/discharge records
 */

import { useState, useEffect } from 'react';
import {
  TextInput,
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
  Select,
  Textarea,
  SimpleGrid,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconCheck, IconEye } from '@tabler/icons-react';
import * as api from '../api';

const admissionReasonOptions = [
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ICU', label: 'ICU Required' },
];

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function HospitalAdmissionForm() {
  const [admissions, setAdmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '',
    admission_date: new Date(),
    discharge_date: null,
    ward_number: '',
    bed_number: '',
    admission_reason: '',
    medical_notes: '',
    discharge_notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAdmissions();
    fetchUsers();
  }, []);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const response = await api.getAdmissions();
      setAdmissions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load admissions',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers();
      const userList = normalizeArray(response.data);
      setUsers(
        userList.map((user) => ({
          value: user.value || user.id.toString(),
          label: user.label || `${user.username} - ${user.full_name}`,
          ...user,
        }))
      );
    } catch (error) {
      
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patient_id)
      newErrors.patient_id = 'Patient is required';
    if (!formData.ward_number.trim())
      newErrors.ward_number = 'Ward number is required';
    if (!formData.bed_number.trim()) newErrors.bed_number = 'Bed number is required';
    if (!formData.admission_reason) newErrors.admission_reason = 'Reason is required';
    if (!formData.admission_date) newErrors.admission_date = 'Admission date is required';
    
    // Validate ward and bed numbers are numeric
    if (formData.ward_number && isNaN(parseInt(formData.ward_number))) {
      newErrors.ward_number = 'Ward number must be numeric';
    }
    if (formData.bed_number && isNaN(parseInt(formData.bed_number))) {
      newErrors.bed_number = 'Bed number must be numeric';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const wardNum = parseInt(formData.ward_number);
      const bedNum = parseInt(formData.bed_number);
      
      if (isNaN(wardNum) || isNaN(bedNum)) {
        notifications.show({
          message: 'Ward and bed numbers must be valid numbers',
          color: 'red',
        });
        return;
      }

      const admissionDate = formData.admission_date instanceof Date 
        ? formData.admission_date 
        : new Date(formData.admission_date);
      const dischargeDate = formData.discharge_date 
        ? (formData.discharge_date instanceof Date 
          ? formData.discharge_date 
          : new Date(formData.discharge_date))
        : null;

      const payload = {
        patient_id: parseInt(formData.patient_id),
        admission_date: admissionDate
          .toISOString()
          .split('T')[0],
        discharge_date: dischargeDate
          ? dischargeDate.toISOString().split('T')[0]
          : null,
        ward_number: wardNum,
        bed_number: bedNum,
        admission_reason: formData.admission_reason,
        medical_notes: formData.medical_notes,
        discharge_notes: formData.discharge_notes,
      };

      if (editingId) {
        await api.updateAdmission(editingId, payload);
        notifications.show({
          message: 'Admission updated successfully',
          color: 'green',
        });
      } else {
        await api.createAdmission(payload);
        notifications.show({
          message: 'Patient admitted successfully',
          color: 'green',
        });
      }
      setModalOpened(false);
      resetForm();
      await fetchAdmissions();
    } catch (error) {
      
      notifications.show({
        message: error.response?.data?.detail || 'Failed to save admission',
        color: 'red',
      });
    }
  };

  const handleEdit = (admission) => {
    setEditingId(admission.id);
    const admissionDate = admission.admission_date 
      ? (admission.admission_date instanceof Date ? admission.admission_date : new Date(admission.admission_date))
      : new Date();
    const dischargeDate = admission.discharge_date
      ? (admission.discharge_date instanceof Date ? admission.discharge_date : new Date(admission.discharge_date))
      : null;
    
    setFormData({
      patient_id: admission.patient_id?.toString() || '',
      patient_name: admission.patient_name,
      admission_date: admissionDate,
      discharge_date: dischargeDate,
      ward_number: admission.ward_number.toString(),
      bed_number: admission.bed_number.toString(),
      admission_reason: admission.admission_reason,
      medical_notes: admission.medical_notes || '',
      discharge_notes: admission.discharge_notes || '',
    });
    setModalOpened(true);
  };

  const resetForm = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setFormData({
      patient_id: '',
      patient_name: '',
      admission_date: today,
      discharge_date: null,
      ward_number: '',
      bed_number: '',
      admission_reason: '',
      medical_notes: '',
      discharge_notes: '',
    });
    setErrors({});
    setEditingId(null);
  };

  const getStatusBadge = (discharge_date) => {
    return discharge_date ? (
      <Badge color="gray">Discharged</Badge>
    ) : (
      <Badge color="blue">Admitted</Badge>
    );
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Text size="lg" weight={600}>
          Hospital Admissions
        </Text>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            resetForm();
            setModalOpened(true);
          }}
        >
          New Admission
        </Button>
      </Group>

      <Card withBorder p="lg">
        {admissions.length === 0 ? (
          <Text color="dimmed" align="center" py="xl">
            No admissions
          </Text>
        ) : (
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Ward/Bed</Table.Th>
                <Table.Th>Admission Date</Table.Th>
                <Table.Th>Discharge Date</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {admissions.map((admission) => (
                <Table.Tr key={admission.id}>
                  <Table.Td weight={500}>{admission.patient_name}</Table.Td>
                  <Table.Td>
                    Ward {admission.ward_number}, Bed {admission.bed_number}
                  </Table.Td>
                  <Table.Td>
                    {new Date(admission.admission_date).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    {admission.discharge_date
                      ? new Date(admission.discharge_date).toLocaleDateString()
                      : 'Active'}
                  </Table.Td>
                  <Table.Td>{getStatusBadge(admission.discharge_date)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        size="sm"
                        variant="light"
                        color="gray"
                        title="View Details"
                        onClick={() => {
                          setSelectedAdmission(admission);
                          setDetailsModalOpened(true);
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="light"
                        color="blue"
                        title="Edit"
                        onClick={() => handleEdit(admission)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table></ScrollArea>
        )}
      </Card>

      <Modal
        opened={modalOpened}
        onClose={() => {
          resetForm();
          setModalOpened(false);
        }}
        title={editingId ? 'Edit Admission' : 'New Hospital Admission'}
        size="lg"
      >
        <Stack gap="md">
          {/* Patient Selection */}
          <Select
            label="Patient *"
            placeholder="Select a patient"
            data={users}
            value={formData.patient_id}
            onChange={(value) => {
              const selectedUser = users.find(u => u.value === value);
              setFormData({
                ...formData,
                patient_id: value,
                patient_name: selectedUser ? selectedUser.label : '',
              });
            }}
            error={errors.patient_id}
            searchable
          />

          {/* Ward & Bed Selection - Side by Side */}
          <SimpleGrid cols={2} spacing="md">
            <TextInput
              label="Ward Number *"
              placeholder="Enter ward number"
              type="number"
              value={formData.ward_number}
              onChange={(e) =>
                setFormData({ ...formData, ward_number: e.currentTarget.value })
              }
              error={errors.ward_number}
            />
            <TextInput
              label="Bed Number *"
              placeholder="Enter bed number"
              type="number"
              value={formData.bed_number}
              onChange={(e) =>
                setFormData({ ...formData, bed_number: e.currentTarget.value })
              }
              error={errors.bed_number}
            />
          </SimpleGrid>

          {/* Admission Date - Full Width */}
          <TextInput
            label="Admission Date *"
            type="date"
            value={
              formData.admission_date instanceof Date
                ? formData.admission_date.toISOString().split('T')[0]
                : formData.admission_date
            }
            onChange={(e) => {
              const dateStr = e.currentTarget.value;
              setFormData({
                ...formData,
                admission_date: dateStr ? new Date(dateStr + 'T00:00:00') : new Date(),
              });
            }}
            error={errors.admission_date}
            placeholder="Select admission date"
          />

          {/* Discharge Date - Full Width */}
          <TextInput
            label="Discharge Date"
            type="date"
            value={
              formData.discharge_date instanceof Date
                ? formData.discharge_date.toISOString().split('T')[0]
                : formData.discharge_date || ''
            }
            onChange={(e) => {
              const dateStr = e.currentTarget.value;
              setFormData({
                ...formData,
                discharge_date: dateStr ? new Date(dateStr + 'T00:00:00') : null,
              });
            }}
            placeholder="Select discharge date (optional)"
            description="Optional - leave empty if still admitted"
          />

          {/* Admission Reason */}
          <Select
            label="Admission Reason *"
            placeholder="Select admission reason"
            data={admissionReasonOptions}
            value={formData.admission_reason}
            onChange={(value) =>
              setFormData({ ...formData, admission_reason: value })
            }
            error={errors.admission_reason}
            searchable
          />

          {/* Medical Notes - Full Width */}
          <Textarea
            label="Medical Notes"
            placeholder="Enter medical details during admission"
            value={formData.medical_notes}
            onChange={(e) =>
              setFormData({
                ...formData,
                medical_notes: e.currentTarget.value,
              })
            }
            minRows={3}
            description="Optional - clinical observations"
          />

          {/* Discharge Notes - Full Width */}
          <Textarea
            label="Discharge Notes"
            placeholder="Enter discharge details and instructions"
            value={formData.discharge_notes}
            onChange={(e) =>
              setFormData({
                ...formData,
                discharge_notes: e.currentTarget.value,
              })
            }
            minRows={3}
            description="Optional - discharge summary"
          />

          {/* Form Actions */}
          <Group justify="flex-end" mt="lg">
            <Button
              variant="default"
              onClick={() => {
                resetForm();
                setModalOpened(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} color="blue">
              {editingId ? 'Update Admission' : 'Admit Patient'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Details Modal */}
      <Modal
        opened={detailsModalOpened}
        onClose={() => {
          setDetailsModalOpened(false);
          setSelectedAdmission(null);
        }}
        title="Admission Details"
        size="lg"
      >
        {selectedAdmission && (
          <Stack gap="md">
            <Card withBorder p="md" bg="blue.0">
              <Stack gap="sm">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" color="dimmed">Patient Name</Text>
                    <Text weight={600} size="lg">{selectedAdmission.patient_name}</Text>
                  </div>
                  <div>
                    <Text size="sm" color="dimmed">Status</Text>
                    {getStatusBadge(selectedAdmission.discharge_date)}
                  </div>
                </Group>
              </Stack>
            </Card>

            <SimpleGrid cols={2} spacing="md">
              <Card withBorder p="md">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Ward/Bed</Text>
                  <Text weight={600}>Ward {selectedAdmission.ward_number}, Bed {selectedAdmission.bed_number}</Text>
                </Stack>
              </Card>
              <Card withBorder p="md">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Admission Reason</Text>
                  <Text weight={600}>{selectedAdmission.admission_reason}</Text>
                </Stack>
              </Card>
            </SimpleGrid>

            <SimpleGrid cols={2} spacing="md">
              <Card withBorder p="md">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Admission Date</Text>
                  <Text weight={600}>{new Date(selectedAdmission.admission_date).toLocaleDateString()}</Text>
                </Stack>
              </Card>
              <Card withBorder p="md">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Discharge Date</Text>
                  <Text weight={600}>
                    {selectedAdmission.discharge_date 
                      ? new Date(selectedAdmission.discharge_date).toLocaleDateString()
                      : 'Still Admitted'}
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>

            {selectedAdmission.medical_notes && (
              <Card withBorder p="md" bg="gray.0">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Medical Notes</Text>
                  <Text>{selectedAdmission.medical_notes}</Text>
                </Stack>
              </Card>
            )}

            {selectedAdmission.discharge_notes && (
              <Card withBorder p="md" bg="gray.1">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Discharge Notes</Text>
                  <Text>{selectedAdmission.discharge_notes}</Text>
                </Stack>
              </Card>
            )}

            <Group justify="flex-end">
              <Button onClick={() => setDetailsModalOpened(false)}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}


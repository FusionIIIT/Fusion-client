/**
 * Prescription Creation Component
 * ===============================
 * Create prescriptions with FIFO stock deduction preview
 * Add multiple medicines, check stock availability, preview batch deduction
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
  ActionIcon,
  Textarea,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  TextInput,
  Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconCheck, IconEye } from '@tabler/icons-react';
import * as api from '../api';

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function PrescriptionCreation({ selectedConsultation, onPrescriptionCreated }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [selectedDetailsPrescription, setSelectedDetailsPrescription] = useState(null);
  const [medicineLines, setMedicineLines] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    doctor_id: '',
    details: '',
    special_instructions: '',
    test_recommended: '',
    follow_up_suggestions: '',
    is_for_dependent: false,
    dependent_name: '',
    dependent_relation: '',
  });
  const [errors, setErrors] = useState({});
  const [fifoPreview, setFifoPreview] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedConsultation) {
      // Extract patient_id and doctor_id - ensure we get numeric IDs
      let patientId = selectedConsultation.patient_id;
      let doctorId = selectedConsultation.doctor_id;
      
      // If patient_id is an object, try to get the id property
      if (typeof patientId === 'object' && patientId !== null) {
        patientId = patientId.id || patientId.value;
      }
      
      // If doctor_id is an object, try to get the id property  
      if (typeof doctorId === 'object' && doctorId !== null) {
        doctorId = doctorId.id || doctorId.value;
      }
      
      // If patientId looks like a username (not numeric), try to find matching user
      if (patientId && isNaN(parseInt(patientId))) {
        
        // Search users array for matching username
        const matchingUser = users.find(u => u.label?.includes(patientId) || u.id === patientId);
        if (matchingUser) {
          patientId = matchingUser.value;
        }
      }
      
      // If doctorId looks like a username (not numeric), try to find matching doctor  
      if (doctorId && isNaN(parseInt(doctorId))) {
        
        const matchingDoctor = doctors.find(d => d.label?.includes(doctorId) || d.id === doctorId);
        if (matchingDoctor) {
          doctorId = matchingDoctor.value;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        user_id: patientId ? patientId.toString() : '',
        doctor_id: doctorId ? doctorId.toString() : '',
      }));
      setModalOpened(true);
    }
  }, [selectedConsultation, users, doctors]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [stockRes, doctorsRes, usersRes, prescriptionsRes] = await Promise.all([
        api.getStock(),
        api.getDoctorsFiltered({ active_only: true }),
        api.getUsers(),
        api.getCompounderPrescriptions(),
      ]);

      // Extract medicines from stock
      const stockArray = Array.isArray(stockRes.data) ? stockRes.data : [];
      setStock(stockArray);

      // Create medicines list from stock (unique medicines)
      const medicineMap = new Map();
      for (const item of stockArray) {
        if (item.medicine_detail && !medicineMap.has(item.medicine_detail.id)) {
          medicineMap.set(item.medicine_detail.id, {
            value: item.medicine_detail.id.toString(),
            label: `${item.medicine_detail.medicine_name} (${item.medicine_detail.strength || 'N/A'})`,
            ...item.medicine_detail,
          });
        }
      }
      setMedicines(Array.from(medicineMap.values()));

      // Load doctors with enhanced info
      const doctorList = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];
      const doctorOptions = doctorList.map((doc) => ({
        value: doc.id.toString(),
        label: `Dr. ${doc.doctor_name} - ${doc.specialization || 'General'}`,
        ...doc,
      }));
      setDoctors(doctorOptions);

      // Load users with enhanced info
      const userList = normalizeArray(usersRes.data);
      setUsers(
        userList.map((user) => ({
          value: user.value || user.id.toString(),
          label: user.label || `${user.username} - ${user.full_name}`,
          ...user,
        }))
      );

      // Load prescriptions
      const prescriptionList = normalizeArray(prescriptionsRes.data);
      setPrescriptions(prescriptionList);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load data: ' + (error?.response?.data?.detail || error.message),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFifoPreview = (medicineId, quantity) => {
    // Get all batches for this medicine from stock
    const medicineStock = [];
    
    for (const stockItem of stock) {
      if (stockItem.medicine_detail && stockItem.medicine_detail.id === parseInt(medicineId)) {
        // Get non-returned batches and sort by expiry date (FIFO)
        if (stockItem.expiry_batches) {
          const activeBatches = stockItem.expiry_batches
            .filter((batch) => !batch.is_returned)
            .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
          medicineStock.push(...activeBatches);
        }
      }
    }

    const preview = [];
    let remainingQty = quantity;

    for (const batch of medicineStock) {
      if (remainingQty <= 0) break;

      const availableQty = batch.qty - (batch.returned_qty || 0);
      const qtyToDeduct = Math.min(availableQty, remainingQty);
      
      preview.push({
        batch_no: batch.batch_no,
        expiry_date: batch.expiry_date,
        qty_available: availableQty,
        qty_deduct: qtyToDeduct,
      });

      remainingQty -= qtyToDeduct;
    }

    return {
      preview,
      canFulfill: remainingQty === 0,
      remainingUnfulfilled: Math.max(0, remainingQty),
      totalAvailable: medicineStock.reduce((sum, b) => sum + (b.qty - (b.returned_qty || 0)), 0),
    };
  };

  const addMedicineLine = () => {
    setMedicineLines([
      ...medicineLines,
      {
        id: Date.now(),
        medicine: '',
        qty_prescribed: 0,
        days: 0,
        times_per_day: 1,
        instructions: '',
        notes: '',
      },
    ]);
  };

  const removeMedicineLine = (lineId) => {
    setMedicineLines(medicineLines.filter((line) => line.id !== lineId));
    const newPreview = { ...fifoPreview };
    delete newPreview[lineId];
    setFifoPreview(newPreview);
  };

  const updateMedicineLine = (lineId, field, value) => {
    const updatedLines = medicineLines.map((line) => {
      if (line.id === lineId) {
        const updated = { ...line, [field]: value };

        // Calculate FIFO preview when quantity or medicine changes
        if ((field === 'qty_prescribed' || field === 'medicine') && updated.medicine && updated.qty_prescribed > 0) {
          const preview = calculateFifoPreview(updated.medicine, updated.qty_prescribed);
          setFifoPreview((prev) => ({ ...prev, [lineId]: preview }));
        }

        return updated;
      }
      return line;
    });
    setMedicineLines(updatedLines);
  };

  const validateForm = () => {
    const newErrors = {};

    // Ensure user_id and doctor_id are not empty strings
    if (!formData.user_id || formData.user_id.trim() === '') {
      newErrors.user_id = 'User is required';
    }
    if (!formData.doctor_id || formData.doctor_id.trim() === '') {
      newErrors.doctor_id = 'Doctor is required';
    }

    // Validate each medicine line if medicines are added
    medicineLines.forEach((line, idx) => {
      if (!line.medicine) newErrors[`medicine_${idx}`] = 'Medicine required';
      if (line.qty_prescribed <= 0) newErrors[`qty_${idx}`] = 'Quantity must be > 0';
      if (line.days <= 0) newErrors[`days_${idx}`] = 'Days must be > 0';
      if (line.times_per_day < 1 || line.times_per_day > 12) newErrors[`times_${idx}`] = 'Times per day 1-12';
    });

    // Check if all medicines can be fulfilled (only if medicines exist)
    if (medicineLines.length > 0) {
      let allFulfillable = true;
      medicineLines.forEach((line) => {
        const preview = fifoPreview[line.id];
        if (preview && !preview.canFulfill) {
          allFulfillable = false;
        }
      });

      if (!allFulfillable) {
        newErrors.stock = 'Insufficient stock for some medicines';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Ensure user_id and doctor_id are valid integers
      const userId = parseInt(formData.user_id);
      const doctorId = parseInt(formData.doctor_id);

      if (isNaN(userId)) {
        
        const availableUserValues = users.map(u => u.value).join(', ');
        notifications.show({
          message: `Invalid user selection: "${formData.user_id}". Expected numeric ID from: [${availableUserValues}]. Please select a user from the dropdown.`,
          color: 'red',
        });
        return;
      }

      if (isNaN(doctorId)) {
        
        const availableDoctorValues = doctors.map(d => d.value).join(', ');
        notifications.show({
          message: `Invalid doctor selection: "${formData.doctor_id}". Expected numeric ID from: [${availableDoctorValues}]. Please select a doctor from the dropdown.`,
          color: 'red',
        });
        return;
      }

      const payload = {
        user_id: userId,
        doctor_id: doctorId,
        medicines: medicineLines.map((line) => ({
          medicine: parseInt(line.medicine),
          qty_prescribed: parseInt(line.qty_prescribed),
          days: parseInt(line.days),
          times_per_day: parseInt(line.times_per_day),
          instructions: line.instructions,
          notes: line.notes,
        })),
        details: formData.details,
        special_instructions: formData.special_instructions,
        test_recommended: formData.test_recommended,
        follow_up_suggestions: formData.follow_up_suggestions,
        is_for_dependent: formData.is_for_dependent,
        dependent_name: formData.dependent_name,
        dependent_relation: formData.dependent_relation,
      };

      await api.createPrescription(payload);
      notifications.show({
        message: 'Prescription created successfully',
        color: 'green',
      });
      resetForm();
      setModalOpened(false);
      await fetchInitialData();
      
      // Invoke callback if prescription was created from consultation
      if (onPrescriptionCreated) {
        onPrescriptionCreated();
      }
    } catch (error) {
      
      
      
      // Show the most relevant error message
      const errorData = error.response?.data;
      let errorMessage = 'Failed to create prescription';
      
      if (errorData) {
        // Check various error response formats
        errorMessage = 
          errorData.detail || 
          errorData.error || 
          JSON.stringify(errorData) ||
          error.message ||
          'Failed to create prescription';
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
      details: '',
      special_instructions: '',
      test_recommended: '',
      follow_up_suggestions: '',
      is_for_dependent: false,
      dependent_name: '',
      dependent_relation: '',
    });
    setMedicineLines([]);
    setFifoPreview({});
    setErrors({});
  };

  const getMedicineName = (medicineId) => {
    const med = medicines.find((m) => m.value === medicineId);
    return med?.label || 'Unknown';
  };

  return (
    <Stack gap="lg">
      {selectedConsultation && (
        <Card withBorder p="md" bg="blue.0">
          <Text size="sm" c="dimmed">Selected Consultation:</Text>
          <Group grow>
            <div>
              <Text size="xs" c="dimmed">Patient</Text>
              <Text weight={600}>{selectedConsultation.patient_username || 'N/A'}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Doctor</Text>
              <Text weight={600}>{selectedConsultation.doctor_name || 'N/A'}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Chief Complaint</Text>
              <Text weight={600}>{selectedConsultation.chief_complaint || 'N/A'}</Text>
            </div>
          </Group>
        </Card>
      )}

      <Group justify="space-between">
        <Text size="lg" weight={600}>
          Prescriptions
        </Text>
        {/* Commented out: New Prescription button - functionality preserved in state */}
        {/* {!selectedConsultation && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setModalOpened(true)}
          >
            New Prescription
          </Button>
        )} */}
      </Group>

      <Card withBorder p="lg">
        {prescriptions.length === 0 ? (
          <Text color="dimmed" align="center" py="xl">
            No prescriptions yet
          </Text>
        ) : (
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
              {prescriptions.map((presc) => (
                <Table.Tr key={presc.id}>
                  <Table.Td weight={500}>
                    {presc.patient_name && presc.patient_name !== 'N/A' 
                      ? presc.patient_name 
                      : (presc.patient ? `Patient ${presc.patient}` : 'N/A')}
                  </Table.Td>
                  <Table.Td>{presc.doctor_name || 'N/A'}</Table.Td>
                  <Table.Td>
                    <Text size="sm" truncate>{presc.details || 'N/A'}</Text>
                  </Table.Td>
                  <Table.Td>
                    {presc.created_at ? new Date(presc.created_at).toLocaleDateString() : 'N/A'}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        size="sm"
                        variant="light"
                        color="gray"
                        title="View Details"
                        onClick={() => {
                          setSelectedDetailsPrescription(presc);
                          setDetailsModalOpened(true);
                        }}
                      >
                        <IconEye size={16} />
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
        title="Create Prescription"
        size="xl"
      >
        <Stack gap="md">
          {/* User and Doctor Selection */}
          <SimpleGrid cols={2} spacing="sm">
            <Select
              label="User *"
              placeholder="Select user"
              data={users}
              value={formData.user_id}
              onChange={(value) =>
                setFormData({ ...formData, user_id: value })
              }
              error={errors.user_id}
              searchable
              disabled={!!selectedConsultation}
              description={selectedConsultation ? 'Auto-selected from consultation' : ''}
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
              disabled={!!selectedConsultation}
              description={selectedConsultation ? 'Auto-selected from consultation' : ''}
            />
          </SimpleGrid>

          {/* Medicines Section */}
          <div>
            <Group justify="space-between" mb="xs">
              <Text weight={600}>Medicines <span style={{ color: '#888', fontSize: '0.85em' }}>(Optional)</span></Text>
              <Button
                size="xs"
                variant="default"
                leftSection={<IconPlus size={14} />}
                onClick={addMedicineLine}
              >
                Add Medicine
              </Button>
            </Group>

            {errors.stock && (
              <Text color="red" size="sm" mb="xs">
                {errors.stock}
              </Text>
            )}

            <Stack gap="md">
              {medicineLines.map((line, idx) => (
                <Card key={line.id} withBorder p="md" bg="gray.0">
                  <Stack gap="md">
                    {/* Medicine Line Header */}
                    <Group justify="space-between">
                      <Text size="sm" weight={600}>
                        Medicine {idx + 1}
                      </Text>
                      <ActionIcon
                        color="red"
                        size="sm"
                        onClick={() => removeMedicineLine(line.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>

                    {/* Medicine Selection & Quantity */}
                    <SimpleGrid cols={2} spacing="sm">
                      <Select
                        label="Medicine *"
                        placeholder="Select medicine"
                        data={medicines}
                        value={line.medicine}
                        onChange={(value) =>
                          updateMedicineLine(line.id, 'medicine', value)
                        }
                        error={errors[`medicine_${idx}`]}
                        searchable
                      />
                      <NumberInput
                        label="Qty Prescribed (units) *"
                        placeholder="Enter quantity"
                        min={1}
                        value={line.qty_prescribed}
                        onChange={(value) =>
                          updateMedicineLine(line.id, 'qty_prescribed', value)
                        }
                        error={errors[`qty_${idx}`]}
                      />
                    </SimpleGrid>

                    {/* Days & Times Per Day */}
                    <SimpleGrid cols={2} spacing="sm">
                      <NumberInput
                        label="Days *"
                        placeholder="e.g., 7"
                        min={1}
                        max={365}
                        value={line.days}
                        onChange={(value) =>
                          updateMedicineLine(line.id, 'days', value)
                        }
                        error={errors[`days_${idx}`]}
                      />
                      <NumberInput
                        label="Times Per Day *"
                        placeholder="e.g., 2"
                        min={1}
                        max={12}
                        value={line.times_per_day}
                        onChange={(value) =>
                          updateMedicineLine(line.id, 'times_per_day', value)
                        }
                        error={errors[`times_${idx}`]}
                      />
                    </SimpleGrid>

                    {/* Instructions & Notes */}
                    <SimpleGrid cols={2} spacing="sm">
                      <Textarea
                        label="Instructions"
                        placeholder="e.g., Take after meals"
                        value={line.instructions}
                        onChange={(e) =>
                          updateMedicineLine(
                            line.id,
                            'instructions',
                            e.currentTarget.value
                          )
                        }
                        minRows={2}
                      />
                      <Textarea
                        label="Notes"
                        placeholder="Additional notes"
                        value={line.notes}
                        onChange={(e) =>
                          updateMedicineLine(line.id, 'notes', e.currentTarget.value)
                        }
                        minRows={2}
                      />
                    </SimpleGrid>

                    {/* FIFO Preview */}
                    {fifoPreview[line.id] && (
                      <Paper bg="blue.0" p="sm">
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" weight={600}>
                            Stock Preview (FIFO)
                          </Text>
                          {fifoPreview[line.id].canFulfill ? (
                            <Badge
                              color="green"
                              leftSection={<IconCheck size={12} />}
                            >
                              Can Fulfill
                            </Badge>
                          ) : (
                            <Badge color="red">
                              Insufficient (Need{' '}
                              {fifoPreview[line.id].remainingUnfulfilled} more)
                            </Badge>
                          )}
                        </Group>

                        <ScrollArea><Table size="sm">
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Batch No</Table.Th>
                              <Table.Th>Expiry</Table.Th>
                              <Table.Th>Qty Deduct</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {fifoPreview[line.id].preview.map((batch, i) => (
                              <Table.Tr key={i}>
                                <Table.Td>{batch.batch_no}</Table.Td>
                                <Table.Td>
                                  {new Date(batch.expiry_date).toLocaleDateString()}
                                </Table.Td>
                                <Table.Td weight={600}>
                                  {batch.qty_deduct} units
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table></ScrollArea>
                      </Paper>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          </div>

          {/* Prescription Details */}
          <Textarea
            label="Details"
            placeholder="Prescription details and description"
            value={formData.details}
            onChange={(e) =>
              setFormData({ ...formData, details: e.currentTarget.value })
            }
            minRows={2}
          />

          {/* Special Instructions */}
          <Textarea
            label="Special Instructions"
            placeholder="Any special instructions for patient"
            value={formData.special_instructions}
            onChange={(e) =>
              setFormData({ ...formData, special_instructions: e.currentTarget.value })
            }
            minRows={2}
          />

          {/* Test Recommended */}
          <TextInput
            label="Tests Recommended"
            placeholder="Any tests to be done"
            value={formData.test_recommended}
            onChange={(e) =>
              setFormData({ ...formData, test_recommended: e.currentTarget.value })
            }
          />

          {/* Follow Up Suggestions */}
          <Textarea
            label="Follow-up Suggestions"
            placeholder="Follow-up instructions"
            value={formData.follow_up_suggestions}
            onChange={(e) =>
              setFormData({ ...formData, follow_up_suggestions: e.currentTarget.value })
            }
            minRows={2}
          />

          {/* Dependent Information (Optional) */}
          <Card withBorder p="md" bg="gray.0">
            <Stack gap="md">
              <Group justify="space-between">
                <Text weight={600} size="sm">
                  Prescription for Dependent (Optional)
                </Text>
              </Group>

              <Group grow>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_for_dependent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_for_dependent: e.currentTarget.checked,
                        })
                      }
                    />
                    <span>Prescription is for a dependent</span>
                  </label>
                </div>
              </Group>

              {formData.is_for_dependent && (
                <SimpleGrid cols={2} spacing="sm">
                  <TextInput
                    label="Dependent Name"
                    placeholder="Enter dependent's name"
                    value={formData.dependent_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dependent_name: e.currentTarget.value,
                      })
                    }
                  />
                  <TextInput
                    label="Relation"
                    placeholder="e.g., Spouse, Child, Parent"
                    value={formData.dependent_relation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dependent_relation: e.currentTarget.value,
                      })
                    }
                  />
                </SimpleGrid>
              )}
            </Stack>
          </Card>

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
              Create Prescription
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Details Modal */}
      <Modal
        opened={detailsModalOpened}
        onClose={() => {
          setDetailsModalOpened(false);
          setSelectedDetailsPrescription(null);
        }}
        title="Prescription Details"
        size="lg"
      >
        {selectedDetailsPrescription && (
          <Stack gap="lg">
            {/* Header Info */}
            <Card withBorder p="md" bg="blue.0">
              <Stack gap="sm">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" color="dimmed">Prescription ID</Text>
                    <Text weight={600}>{selectedDetailsPrescription.id}</Text>
                  </div>
                  <div>
                    <Text size="sm" color="dimmed">Date</Text>
                    <Text weight={600}>
                      {selectedDetailsPrescription.created_at 
                        ? new Date(selectedDetailsPrescription.created_at).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Card>

            {/* Patient & Doctor Info */}
            <SimpleGrid cols={2} spacing="md">
              <Card withBorder p="md">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Patient</Text>
                  <Text size="lg" weight={600}>
                    {selectedDetailsPrescription.patient_name && selectedDetailsPrescription.patient_name !== 'N/A'
                      ? selectedDetailsPrescription.patient_name
                      : (selectedDetailsPrescription.patient ? `Patient ${selectedDetailsPrescription.patient}` : 'N/A')}
                  </Text>
                  {selectedDetailsPrescription.is_for_dependent && (
                    <>
                      <Text size="sm" color="dimmed">Dependent: {selectedDetailsPrescription.dependent_name}</Text>
                      <Text size="xs" color="dimmed">Relation: {selectedDetailsPrescription.dependent_relation}</Text>
                    </>
                  )}
                </Stack>
              </Card>
              <Card withBorder p="md">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Doctor</Text>
                  <Text size="lg" weight={600}>{selectedDetailsPrescription.doctor_name || 'N/A'}</Text>
                </Stack>
              </Card>
            </SimpleGrid>

            {/* Chief Complaint / Details */}
            {selectedDetailsPrescription.details && (
              <Card withBorder p="md" bg="gray.0">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Chief Complaint</Text>
                  <Text>{selectedDetailsPrescription.details}</Text>
                </Stack>
              </Card>
            )}

            {/* Special Instructions */}
            {selectedDetailsPrescription.special_instructions && (
              <Card withBorder p="md" bg="yellow.0">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Special Instructions</Text>
                  <Text>{selectedDetailsPrescription.special_instructions}</Text>
                </Stack>
              </Card>
            )}

            {/* Test Recommended */}
            {selectedDetailsPrescription.test_recommended && (
              <Card withBorder p="md" bg="orange.0">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Test Recommended</Text>
                  <Text>{selectedDetailsPrescription.test_recommended}</Text>
                </Stack>
              </Card>
            )}

            {/* Follow Up Suggestions */}
            {selectedDetailsPrescription.follow_up_suggestions && (
              <Card withBorder p="md" bg="green.0">
                <Stack gap="xs">
                  <Text size="sm" weight={600} color="dimmed">Follow-up Suggestions</Text>
                  <Text>{selectedDetailsPrescription.follow_up_suggestions}</Text>
                </Stack>
              </Card>
            )}

            {/* Prescribed Medicines */}
            {selectedDetailsPrescription.prescribed_medicines && selectedDetailsPrescription.prescribed_medicines.length > 0 && (
              <Card withBorder p="md">
                <Stack gap="md">
                  <Text weight={600}>Prescribed Medicines</Text>
                  <ScrollArea><Table striped size="sm">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Medicine</Table.Th>
                        <Table.Th align="right">Quantity</Table.Th>
                        <Table.Th align="right">Days</Table.Th>
                        <Table.Th align="right">Times/Day</Table.Th>
                        <Table.Th>Instructions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {selectedDetailsPrescription.prescribed_medicines.map((med, idx) => (
                        <Table.Tr key={idx}>
                          <Table.Td>{med.medicine_detail?.medicine_name || 'N/A'}</Table.Td>
                          <Table.Td align="right">{med.qty_prescribed}</Table.Td>
                          <Table.Td align="right">{med.days}</Table.Td>
                          <Table.Td align="right">{med.times_per_day}</Table.Td>
                          <Table.Td size="sm">{med.instructions || '-'}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table></ScrollArea>
                </Stack>
              </Card>
            )}

            {/* Status */}
            <Card withBorder p="md">
              <Stack gap="xs">
                <Text size="sm" weight={600} color="dimmed">Status</Text>
                <Text weight={600}>{selectedDetailsPrescription.status_display || selectedDetailsPrescription.status || 'Active'}</Text>
              </Stack>
            </Card>

            {/* Close Button */}
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

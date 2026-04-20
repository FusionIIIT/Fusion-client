/**
 * Prescription List Component
 * ============================
 * Display patient's prescriptions (read-only list)
 * Shows prescription details, medicines, and status
 * 
 * PHC-UC-02: View Prescriptions
 */

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Container,
  Card,
  Stack,
  Title,
  Text,
  Badge,
  Loader,
  Group,
  Table,
  ScrollArea,
  SimpleGrid,
  Alert,
  Paper,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconClock, IconDownload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import * as api from '../api';
import instiLogo from '../../../assets/iiitdmj_logo.png';

export default function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.getPrescriptions();
      
      
      
      
      
      
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        data = response.data.results;
      } else if (response.data) {
        // If it's an object but not an array, try to extract the data
        
        data = [];
      }
      
      
      
      
      setPrescriptions(data);
    } catch (error) {
      
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to load prescriptions';
      const statusCode = error.response?.status;
      const fullError = error.response?.data;
      
      
      
      // Log detailed error information if available
      if (fullError?.error_type) {
        
        
        
        if (fullError.traceback) {
          
        }
      }
      
      // Show error notification for user feedback
      if (statusCode === 400) {
        
        notifications.show({
          message: 'Please complete your profile setup to view prescriptions',
          color: 'yellow',
        });
        setPrescriptions([]);
      } else if (statusCode === 403) {
        notifications.show({
          message: 'You do not have permission to view prescriptions',
          color: 'red',
        });
        setPrescriptions([]);
      } else if (statusCode === 404) {
        
        setPrescriptions([]);
      } else {
        notifications.show({
          message: errorMessage,
          color: 'red',
        });
        setPrescriptions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <IconCheck size={16} />;
      case 'expired':
        return <IconAlertCircle size={16} />;
      case 'pending':
        return <IconClock size={16} />;
      default:
        return null;
    }
  };

  const downloadPDF = async (prescription, e) => {
    e.stopPropagation(); // prevent card expand/collapse

    const logoImg = new Image();
    logoImg.src = instiLogo;
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve; // Continue even if error
    });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 8; // Start Y position

    // ── Header bar ──────────────────────────────────────────────────────────
    if (logoImg.complete && logoImg.naturalHeight !== 0) {
      const aspect = logoImg.naturalWidth / logoImg.naturalHeight;
      const maxWidth = pageWidth - 28; // 14px padding on both left and right
      
      let imgHeight = 16;
      let imgWidth = imgHeight * aspect;

      // Safely bound the banner width to prevent it spilling outside margins
      if (imgWidth > maxWidth) {
        imgWidth = maxWidth;
        imgHeight = imgWidth / aspect;
      }

      // Center the image horizontally
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(logoImg, 'PNG', imgX, currentY, imgWidth, imgHeight);
      
      currentY += imgHeight + 6; // Move Y below the image
    } else {
      currentY = 20; 
    }
    
    // Sub-title text directly below the logo
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Health Center – Medical Prescription', pageWidth / 2, currentY, { align: 'center' });

    currentY += 4;

    // Header Divider
    doc.setDrawColor(30, 136, 229);
    doc.setLineWidth(0.5);
    doc.line(14, currentY, pageWidth - 14, currentY);

    let y = currentY + 8; // Update the y tracker for the rest of the document
    doc.setTextColor(30, 30, 30);

    // ── Prescription meta ────────────────────────────────────────────────────
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Prescription #${prescription.id}`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Date: ${new Date(prescription.issued_date).toLocaleDateString()}`,
      pageWidth - 14,
      y,
      { align: 'right' }
    );
    y += 7;
    doc.text(`Patient: ${prescription.patient_name || 'N/A'}`, 14, y);
    doc.text(
      `Roll No: ${prescription.patient_username || 'N/A'}`,
      pageWidth - 14,
      y,
      { align: 'right' }
    );
    y += 7;

    if (prescription.is_for_dependent) {
      doc.text(
        `Dependent: ${prescription.dependent_name || 'N/A'} (${prescription.dependent_relation || 'N/A'})`,
        14,
        y
      );
      y += 7;
    }

    doc.text(`Doctor: ${prescription.doctor_name || 'N/A'}`, 14, y);
    doc.text(
      `Status: ${prescription.status || 'PENDING'}`,
      pageWidth - 14,
      y,
      { align: 'right' }
    );
    y += 4;

    // ── Divider ──────────────────────────────────────────────────────────────
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    // ── Helper to add a labelled block ───────────────────────────────────────
    const addBlock = (label, value) => {
      if (!value) return;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(label, 14, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(String(value), pageWidth - 28);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 3;
    };

    addBlock('Diagnosis / Details:', prescription.details);
    addBlock("Doctor's Notes:", prescription.notes);
    addBlock('Special Instructions:', prescription.special_instructions);
    addBlock('Recommended Tests:', prescription.test_recommended);
    addBlock('Follow-up Suggestions:', prescription.follow_up_suggestions);

    // ── Medicines table ──────────────────────────────────────────────────────
    if (prescription.prescribed_medicines?.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Prescribed Medicines (${prescription.prescribed_medicines.length})`,
        14,
        y
      );
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions', 'Notes']],
        body: prescription.prescribed_medicines.map((m) => [
          m.medicine_name || 'N/A',
          m.dosage || 'N/A',
          m.frequency || 'N/A',
          m.duration || 'N/A',
          m.instructions || '-',
          m.notes || '-',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [30, 136, 229], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 6;
    }

    addBlock('Recommended Tests:', prescription.test_recommended);
    addBlock('Follow-up Suggestions:', prescription.follow_up_suggestions);
    addBlock('Additional Instructions:', prescription.instructions);

    // ── Footer ───────────────────────────────────────────────────────────────
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(200, 200, 200);
    doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('PDPM IIITDM Jabalpur Health Center – Confidential Medical Document', pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 7, { align: 'center' });

    doc.save(`Prescription_${prescription.id}_${prescription.doctor_name || 'Doctor'}.pdf`);

    notifications.show({
      title: 'PDF Downloaded',
      message: `Prescription #${prescription.id} saved as PDF.`,
      color: 'green',
    });
  };

  if (loading) {
    return (
      <Paper p="xl" ta="center">
        <Loader size="lg" />
      </Paper>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <Stack gap="md">
        <Alert color="blue" title="No Prescriptions" icon={<IconAlertCircle />}>
          <Stack gap="xs">
            <Text>
              You don't have any prescriptions yet. Consult with a doctor to get a prescription.
            </Text>
            <Text size="xs" c="dimmed">
              If you recently consulted a doctor, please refresh the page or try again shortly.
            </Text>
          </Stack>
        </Alert>
        <Text size="xs" color="dimmed">
          Prescriptions data loaded. Total: {prescriptions.length}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" color="dimmed">
          Total Prescriptions: {prescriptions.length}
        </Text>
      </div>

      {prescriptions.map((prescription) => (
        <Card
          key={prescription.id}
          withBorder
          p="md"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            setExpandedId(expandedId === prescription.id ? null : prescription.id)
          }
        >
          <Stack gap="md">
            {/* Prescription Header */}
            <Group position="apart">
              <div>
                <Text weight={700}>
                  Prescription #{prescription.id}
                </Text>
                <Text size="sm" weight={500} c="blue">
                  Doctor: {prescription.doctor_name || 'N/A'}
                </Text>
                <Text size="xs" color="dimmed">
                  Issued: {new Date(prescription.issued_date).toLocaleDateString()}
                </Text>
              </div>
              <Group gap="xs">
                <Badge
                  leftSection={getStatusIcon(prescription.status)}
                  color={getStatusColor(prescription.status)}
                >
                  {prescription.status || 'PENDING'}
                </Badge>
                <Tooltip label="Download PDF" withArrow>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="md"
                    onClick={(e) => downloadPDF(prescription, e)}
                    aria-label={`Download prescription ${prescription.id} as PDF`}
                  >
                    <IconDownload size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>

            {/* Prescription Details - Expandable */}
            {expandedId === prescription.id && (
              <>
                <SimpleGrid cols={2} spacing="md">
                  <div>
                    <Text size="sm" weight={600} mb="xs">
                      Prescription Date
                    </Text>
                    <Text size="sm">
                      {new Date(prescription.issued_date).toLocaleDateString()}
                    </Text>
                  </div>
                  
                  <div>
                    <Text size="sm" weight={600} mb="xs">
                      Doctor
                    </Text>
                    <Text size="sm" weight={500} c="blue">
                      {prescription.doctor_name || 'N/A'}
                    </Text>
                  </div>
                </SimpleGrid>

                {prescription.is_for_dependent && (
                  <SimpleGrid cols={2} spacing="md" mt="sm">
                    <div>
                      <Text size="sm" weight={600} mb="xs">
                        Dependent Patient
                      </Text>
                      <Text size="sm">
                        {prescription.dependent_name || 'N/A'}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" weight={600} mb="xs">
                        Relationship
                      </Text>
                      <Text size="sm">
                        {prescription.dependent_relation || 'N/A'}
                      </Text>
                    </div>
                  </SimpleGrid>
                )}

                {prescription.details && (
                  <div>
                    <Text size="sm" weight={600} mb="xs">
                      Diagnosis / Details
                    </Text>
                    <Text size="sm">{prescription.details}</Text>
                  </div>
                )}

                {prescription.notes && (
                  <div>
                    <Text size="sm" weight={600} mb="xs">
                      Doctor's Notes
                    </Text>
                    <Text size="sm">{prescription.notes}</Text>
                  </div>
                )}

                {prescription.special_instructions && (
                  <div>
                    <Text size="sm" weight={600} mb="xs">
                      Special Instructions
                    </Text>
                    <Text size="sm">{prescription.special_instructions}</Text>
                  </div>
                )}

                {/* Prescribed Medicines List */}
                {prescription.prescribed_medicines &&
                  prescription.prescribed_medicines.length > 0 && (
                    <div>
                      <Text size="sm" weight={600} mb="xs">
                        Prescribed Medicines ({prescription.total_medicines || prescription.prescribed_medicines.length})
                      </Text>
                      <ScrollArea><Table size="sm" striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Medicine</Table.Th>
                            <Table.Th>Dosage</Table.Th>
                            <Table.Th>Frequency</Table.Th>
                            <Table.Th>Duration</Table.Th>
                            <Table.Th>Instructions</Table.Th>
                            <Table.Th>Notes</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {prescription.prescribed_medicines.map((med, idx) => (
                            <Table.Tr key={idx}>
                              <Table.Td>{med.medicine_name}</Table.Td>
                              <Table.Td>{med.dosage || 'N/A'}</Table.Td>
                              <Table.Td>{med.frequency || 'N/A'}</Table.Td>
                              <Table.Td>{med.duration || 'N/A'}</Table.Td>
                              <Table.Td>{med.instructions || '-'}</Table.Td>
                              <Table.Td>{med.notes || '-'}</Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table></ScrollArea>
                    </div>
                  )}

                {prescription.test_recommended && (
                  <div>
                    <Text size="sm" weight={600} mb="xs">
                      Recommended Tests
                    </Text>
                    <Text size="sm">{prescription.test_recommended}</Text>
                  </div>
                )}

                {prescription.follow_up_suggestions && (
                  <div>
                    <Text size="sm" weight={600} mb="xs">
                      Follow-up Suggestions
                    </Text>
                    <Text size="sm">{prescription.follow_up_suggestions}</Text>
                  </div>
                )}

                {prescription.instructions && (
                  <div>
                    <Text size="sm" weight={600} mb="xs">
                      Additional Instructions
                    </Text>
                    <Text size="sm">{prescription.instructions}</Text>
                  </div>
                )}
              </>
            )}

            {/* Summary Row */}
            <Text size="xs" color="dimmed">
              Click to {expandedId === prescription.id ? 'collapse' : 'expand'} details
            </Text>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

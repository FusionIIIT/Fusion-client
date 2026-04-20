/**
 * Reimbursement Dashboard Page
 * =============================
 * Allows employees to:
 * - Submit medical expense claims
 * - Upload supporting documents
 * - Track claim status
 * - View approval history
 * 
 * PHC-UC-04: Apply for Reimbursement
 * PHC-UC-05: Track Reimbursement Status
 * PHC-WF-01: Multi-stage claim approval workflow
 */

import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Title,
  Text,
  Loader,
  Card,
  Stack,
  Group,
  Badge,
  Button,
  Modal,
  Textarea,
  NumberInput,
  FileInput,
  Tabs,
  Timeline,
  ThemeIcon,
  SimpleGrid,
  TextInput,
  Select,
  ActionIcon,
  Table,
} from '@mantine/core';
import {
  IconCalendar,
  IconCurrencyDollar,
  IconFileText,
  IconTrash,
  IconCheck,
  IconX,
  IconClock,
  IconUpload,
  IconEye,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import * as api from '../api';

const STATUSES = {
  SUBMITTED: { label: 'Submitted', color: 'blue' },
  ACCOUNTS_VERIFICATION: { label: 'Accounts Review', color: 'yellow' },
  SANCTION_REVIEW: { label: 'Sanction Review', color: 'orange' },
  FINAL_PAYMENT: { label: 'Final Payment', color: 'teal' },
  REIMBURSED: { label: 'Reimbursed', color: 'green' },
  REJECTED: { label: 'Rejected', color: 'red' },
};

export default function ReimbursementDashboard() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(false);
  const [claimDetailModal, setClaimDetailModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Form state
  const [reason, setReason] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentFile, setSelectedDocumentFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch prescriptions when modal opens
  useEffect(() => {
    if (submitModal) {
      fetchPrescriptions();
    }
  }, [submitModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const claimsRes = await api.getReimbursementClaims();
      const data = claimsRes.data;
      setClaims(Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []);
    } catch (error) {
      
      notifications.show({
        message: 'Failed to load claims data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setClaimAmount('');
    setExpenseDate('');
    setRemarks('');
    setDocuments([]);
    setSelectedDocumentFile(null);
    setDocumentType('');
    setSelectedPrescription(null);
  };

  const fetchPrescriptions = async () => {
    try {
      setPrescriptionsLoading(true);
      
      
      
      const response = await api.getPrescriptions();
      
      
      const prescriptionOptions = (response.data || []).map((prescription) => ({
        value: prescription.id.toString(),
        label: `Prescription #${prescription.id} - ${prescription.doctor_name || 'Unknown Doctor'} (${prescription.issued_date || 'N/A'})`,
      }));
      
      
      setPrescriptions(prescriptionOptions);
      
      if (prescriptionOptions.length === 0) {
        
        notifications.show({
          message: 'No prescriptions found. A valid prescription is required to submit a claim.',
          color: 'blue',
          autoClose: 3000,
        });
      }
    } catch (error) {
      
      
      
      // Show specific error messages
      if (error.response?.status === 401 || error.response?.status === 403) {
        
        notifications.show({
          message: '⚠️ Not authenticated for prescriptions. Please login again.',
          color: 'orange',
          autoClose: false,
        });
      } else {
        notifications.show({
          message: 'Failed to load prescriptions. A valid prescription is required to submit a claim.',
          color: 'red',
          autoClose: 3000,
        });
      }
    } finally {
      setPrescriptionsLoading(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!reason || !claimAmount || !expenseDate || !selectedPrescription) {
      notifications.show({
        message: 'Please fill all required fields, including selecting a prescription',
        color: 'yellow',
      });
      return;
    }

    try {
      setSubmittingClaim(true);
      const claimPayload = {
        description: reason,
        claim_amount: parseFloat(claimAmount),
        expense_date: expenseDate,
        prescription: parseInt(selectedPrescription),
      };
      
      

      const response = await api.submitReimbursementClaim(claimPayload);
      const newClaim = response.data;
      
      // Upload attached documents (if any were added by the user)
      if (documents.length > 0) {
        for (const doc of documents) {
          await api.uploadClaimDocument(newClaim.id, doc.file, doc.type);
        }
      }

      notifications.show({
        message: documents.length > 0
          ? 'Claim and documents submitted successfully'
          : 'Claim submitted successfully',
        color: 'green',
      });

      // Reset form and close modal
      resetForm();
      setSubmitModal(false);
      
      // Refresh claims list
      await fetchData();
    } catch (error) {
      
      
      
      
      // Log detailed error information
      if (error.response?.data) {
        const errorData = error.response.data;
        
        
        
        
        // For validation errors, show specific field errors
        if (typeof errorData === 'object' && !errorData.detail) {
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          
          notifications.show({
            message: 'Validation Error:\n' + fieldErrors,
            color: 'red',
          });
          return;
        }
      }
      
      // Specific message if document upload failed due to storage
      if (error.response?.status === 503) {
        notifications.show({
          title: 'Document upload failed',
          message: error.response.data?.detail || 'File storage is currently unavailable. Please try submitting without attachments or contact the administrator.',
          color: 'red',
          autoClose: 8000,
        });
        return;
      }

      notifications.show({
        message: error.response?.data?.detail || 'Failed to submit claim',
        color: 'red',
      });
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleUploadDocument = async (claimId) => {
    if (!selectedDocumentFile || !documentType) {
      notifications.show({
        message: 'Please select document and type',
        color: 'yellow',
      });
      return;
    }

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('file', selectedDocumentFile);
      formData.append('document_type', documentType);

      await api.uploadClaimDocument(claimId, selectedDocumentFile, documentType);

      notifications.show({
        message: 'Document uploaded successfully',
        color: 'green',
      });

      setSelectedDocumentFile(null);
      setDocumentType('');
      await fetchData();
    } catch (error) {
      
      const statusCode = error.response?.status;
      const detail = error.response?.data?.detail;
      
      if (statusCode === 503) {
        // Storage unavailable
        notifications.show({
          title: 'Storage Unavailable',
          message: detail || 'File storage is not configured. Please contact the administrator.',
          color: 'orange',
          autoClose: 8000,
        });
      } else {
        notifications.show({
          message: detail || 'Failed to upload document',
          color: 'red',
        });
      }
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleAddDocument = () => {
    if (selectedDocumentFile && documentType) {
      setDocuments([
        ...documents,
        {
          file: selectedDocumentFile,
          type: documentType,
        },
      ]);
      setSelectedDocumentFile(null);
      setDocumentType('');
    }
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
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

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Stack mb="xl">
        <Group position="apart">
          <div>
            <Title order={1}>Reimbursement Claims</Title>
            <Text color="dimmed">
              Submit and track your medical expense claims
            </Text>
          </div>
          <Button
            variant="filled"
            onClick={() => setSubmitModal(true)}
          >
            Submit New Claim
          </Button>
        </Group>
      </Stack>

      {/* Claims Summary */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <Card withBorder p="lg">
          <Group position="apart">
            <div>
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                Total Claims
              </Text>
              <Text weight={700} size="lg">
                {claims.length}
              </Text>
            </div>
            <IconFileText size={32} color="blue" />
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group position="apart">
            <div>
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                Pending Claims
              </Text>
              <Text weight={700} size="lg">
                {claims.filter((c) => ['DRAFT', 'SUBMITTED', 'PHC_REVIEW', 'ACCOUNTS_VERIFICATION', 'SANCTION_REVIEW'].includes(c.status))
                  .length}
              </Text>
            </div>
            <IconClock size={32} color="orange" />
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group position="apart">
            <div>
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                Total Reimbursed
              </Text>
              <Text weight={700} size="lg">
                ₹{claims
                  .filter((c) => c.status === 'REIMBURSED')
                  .reduce((sum, c) => sum + (c.claim_amount || 0), 0)
                  .toFixed(2)}
              </Text>
            </div>
            <IconCurrencyDollar size={32} color="green" />
          </Group>
        </Card>
      </SimpleGrid>

      {/* Claims List */}
      <Tabs defaultValue="all">
        <Tabs.List>
          <Tabs.Tab value="all">All Claims</Tabs.Tab>
          <Tabs.Tab value="pending">Pending</Tabs.Tab>
          <Tabs.Tab value="approved">Approved</Tabs.Tab>
          <Tabs.Tab value="rejected">Rejected</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="all" pt="xl">
          <ClaimsList
            claims={claims}
            onViewDetail={(claim) => {
              setSelectedClaim(claim);
              setClaimDetailModal(true);
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="pending" pt="xl">
          <ClaimsList
            claims={claims.filter(
              (c) => ['DRAFT', 'SUBMITTED', 'PHC_REVIEW', 'ACCOUNTS_VERIFICATION', 'SANCTION_REVIEW'].includes(c.status)
            )}
            onViewDetail={(claim) => {
              setSelectedClaim(claim);
              setClaimDetailModal(true);
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="approved" pt="xl">
          <ClaimsList
            claims={claims.filter((c) => ['SANCTION_APPROVED', 'FINAL_PAYMENT', 'REIMBURSED'].includes(c.status))}
            onViewDetail={(claim) => {
              setSelectedClaim(claim);
              setClaimDetailModal(true);
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="rejected" pt="xl">
          <ClaimsList
            claims={claims.filter((c) => c.status === 'REJECTED')}
            onViewDetail={(claim) => {
              setSelectedClaim(claim);
              setClaimDetailModal(true);
            }}
          />
        </Tabs.Panel>
      </Tabs>

      {/* Submit Claim Modal */}
      <Modal
        opened={submitModal}
        onClose={() => {
          setSubmitModal(false);
          resetForm();
        }}
        title="Submit Reimbursement Claim"
        size="lg"
      >
        <Stack gap="md">
          {/* Reason for Claim */}
          <Textarea
            label="Reason *"
            placeholder="Describe the reason for your reimbursement claim (e.g., Medical consultation, Medicine purchase, Lab test, etc.)"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            minRows={3}
            required
          />

          {/* Prescription Selection */}
          <Select
            label="Prescription *"
            placeholder={prescriptionsLoading ? "Loading prescriptions..." : "Select a prescription"}
            data={prescriptions}
            value={selectedPrescription}
            onChange={setSelectedPrescription}
            searchable
            clearable={false}
            disabled={prescriptionsLoading}
            required
          />

          {/* Claim Amount */}
          <NumberInput
            label="Claim Amount (₹) *"
            placeholder="Enter amount"
            value={claimAmount}
            onChange={setClaimAmount}
            min={0}
            precision={2}
            step={100}
          />

          {/* Expense Date */}
          <TextInput
            label="Expense Date *"
            placeholder="YYYY-MM-DD"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.currentTarget.value)}
            type="date"
          />

          {/* Remarks */}
          <Textarea
            label="Additional Remarks"
            placeholder="Add any notes about your claim"
            value={remarks}
            onChange={(e) => setRemarks(e.currentTarget.value)}
            minRows={3}
          />

          {/* Document Attachment */}
          <div>
            <Text weight={500} size="sm" mb={2}>
              Supporting Documents (Optional)
            </Text>
            <Text size="xs" color="dimmed" mb="xs">
              Upload PDF bills, receipts, or prescriptions. Documents can also be uploaded later.
            </Text>
            <Group gap="xs" mb="md">
              <FileInput
                placeholder="Choose PDF or image"
                accept=".pdf,image/*"
                value={selectedDocumentFile}
                onChange={setSelectedDocumentFile}
              />
              <Select
                placeholder="Doc type"
                value={documentType}
                onChange={setDocumentType}
                data={[
                  { value: 'PRESCRIPTION', label: 'Prescription' },
                  { value: 'INVOICE', label: 'Invoice' },
                  { value: 'RECEIPT', label: 'Receipt' },
                  { value: 'BILL', label: 'Medical Bill' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
              <Button
                variant="subtle"
                onClick={handleAddDocument}
                disabled={!selectedDocumentFile || !documentType}
              >
                Add
              </Button>
            </Group>

            {/* Documents List */}
            {documents.length > 0 && (
              <Stack gap="xs">
                {documents.map((doc, idx) => (
                  <Group key={idx} position="apart" p="xs" bg="gray.0">
                    <Text size="sm">{doc.file.name}</Text>
                    <ActionIcon
                      size="xs"
                      color="red"
                      onClick={() => removeDocument(idx)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            )}
          </div>

          {/* Action Buttons */}
          <Group position="right">
            <Button
              variant="default"
              onClick={() => {
                setSubmitModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              onClick={handleSubmitClaim}
              loading={submittingClaim}
            >
              Submit Claim
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Claim Detail Modal */}
      <Modal
        opened={claimDetailModal}
        onClose={() => {
          setClaimDetailModal(false);
          setSelectedClaim(null);
        }}
        title={selectedClaim ? `Claim #${selectedClaim.id}` : 'Claim Details'}
        size="lg"
      >
        {selectedClaim && (
          <Stack gap="md">
            {/* Claim Status */}
            <div>
              <Text weight={500} size="sm" mb="xs">
                Status
              </Text>
              <Badge
                color={
                  STATUSES[selectedClaim.status]?.color || 'gray'
                }
              >
                {STATUSES[selectedClaim.status]?.label || selectedClaim.status}
              </Badge>
            </div>

            {/* Claim Info */}
            <SimpleGrid cols={2} spacing="sm">
              <div>
                <Text size="xs" color="dimmed">
                  Amount
                </Text>
                <Text weight={700}>₹{selectedClaim.claim_amount}</Text>
              </div>
              <div>
                <Text size="xs" color="dimmed">
                  Submission Date
                </Text>
                <Text weight={700}>{selectedClaim.submission_date}</Text>
              </div>
            </SimpleGrid>

            {/* Uploaded Documents */}
            {selectedClaim.documents && selectedClaim.documents.length > 0 ? (
              <div>
                <Text weight={500} size="sm" mb="xs">
                  Uploaded Documents
                </Text>
                <Stack gap="xs">
                  {selectedClaim.documents.map((doc) => (
                    <Group
                      key={doc.id}
                      p="xs"
                      bg="gray.0"
                      style={{ borderRadius: 4 }}
                      justify="space-between"
                    >
                      <Group gap="sm">
                        <IconFileText size={18} color="blue" />
                        <div>
                          <Text size="sm" weight={500}>{doc.document_name || 'Document'}</Text>
                          <Text size="xs" color="dimmed">{doc.document_type} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</Text>
                        </div>
                      </Group>
                      <Group gap="xs">
                        {doc.verified && (
                          <Badge size="sm" color="green" variant="light">
                            Verified
                          </Badge>
                        )}
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconEye size={14} />}
                          onClick={() => window.open(doc.document_file, '_blank')}
                        >
                          View
                        </Button>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </div>
            ) : (
              <div>
                <Text weight={500} size="sm" mb="xs">
                  Documents
                </Text>
                <Text size="sm" color="dimmed">No documents attached to this claim.</Text>
              </div>
            )}

            {/* Approval History */}
            {selectedClaim.approval_history && (
              <div>
                <Text weight={500} size="sm" mb="xs">
                  Approval History
                </Text>
                <Timeline active={-1} bulletSize={24} lineWidth={2}>
                  {selectedClaim.approval_history.map((history, idx) => (
                    <Timeline.Item
                      key={idx}
                      bullet={
                        history.action === 'APPROVED' ? (
                          <IconCheck size={12} />
                        ) : (
                          <IconX size={12} />
                        )
                      }
                      title={`${history.reviewed_by} - ${history.action}`}
                    >
                      <Text size="sm" mt="xs">
                        {history.remarks}
                      </Text>
                      <Text size="xs" color="dimmed" mt={4}>
                        {history.review_date}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            )}
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

/**
 * Claims List Component
 */
function ClaimsList({ claims, onViewDetail }) {
  if (claims.length === 0) {
    return (
      <Text color="dimmed" align="center" py="xl">
        No claims to display
      </Text>
    );
  }

  return (
    <Stack gap="md">
      {claims.map((claim) => (
        <Card key={claim.id} withBorder p="md">
          <Group position="apart">
            <div>
              <Group>
                <Text weight={700}>Claim #{claim.id}</Text>
                <Badge
                  color={
                    STATUSES[claim.status]?.color || 'gray'
                  }
                >
                  {STATUSES[claim.status]?.label || claim.status}
                </Badge>
              </Group>
              <Text size="sm" color="dimmed">
                Amount: ₹{claim.claim_amount} | Submitted:{' '}
                {claim.submission_date}
              </Text>
            </div>
            <Button
              variant="subtle"
              onClick={() => onViewDetail(claim)}
            >
              View Details
            </Button>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

/**
 * Claims Processing Page
 * =======================
 * Allows PHC and Accounts staff to:
 * - Review pending claims
 * - Approve or reject claims
 * - Add remarks and verification notes
 * - Track approval workflow
 * 
 * PHC-UC-15: Staff process claims
 * PHC-WF-01: Multi-stage claim approval workflow
 * PHC-BR-08: Approval threshold logic
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
  Button,
  Modal,
  Textarea,
  Table,
  ScrollArea,
  Tabs,
  SimpleGrid,
  Timeline,
  ThemeIcon,
  ActionIcon,
} from '@mantine/core';
import { IconCheck, IconX, IconEye } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import * as api from '../api';

const STATUS_COLORS = {
  SUBMITTED: 'blue',
  ACCOUNTS_VERIFICATION: 'yellow',
  SANCTION_REVIEW: 'orange',
  FINAL_PAYMENT: 'teal',
  REIMBURSED: 'green',
  REJECTED: 'red',
};

/**
 * Normalize API response to always return an array
 * Handles various response formats: array, object with .data, object with .results
 */
const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function ClaimsProcessing() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [claimDetailModal, setClaimDetailModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [decision, setDecision] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchPendingClaims();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPendingClaims, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingClaims = async () => {
    try {
      setLoading(true);
      const response = await api.getStaffClaims();
      // Normalize response to always be an array
      const claimsData = normalizeArray(response.data);
      setClaims(claimsData);
    } catch (error) {
      
      setClaims([]); // Set to empty array on error
      notifications.show({
        message: 'Failed to load claims',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessClaim = async () => {
    if (!decision || !remarks) {
      notifications.show({
        message: 'Please select decision and add remarks',
        color: 'yellow',
      });
      return;
    }

    try {
      setProcessing(true);
      await api.processStaffClaim(selectedClaim.id, decision, remarks);

      notifications.show({
        message: `Claim ${decision === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
        color: 'green',
      });

      setClaimDetailModal(false);
      setDecision('');
      setRemarks('');
      setSelectedClaim(null);
      await fetchPendingClaims();
    } catch (error) {
      
      notifications.show({
        message: 'Failed to process claim',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading && claims.length === 0) {
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
        <Title order={1}>Claims Processing</Title>
        <Text color="dimmed">Review and process pending reimbursement claims</Text>
      </Stack>

      {/* Statistics */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <Card withBorder p="lg">
          <Group position="apart">
            <div>
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                Total Pending
              </Text>
              <Text weight={700} size="lg">
                {claims.length}
              </Text>
            </div>
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group position="apart">
            <div>
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                Active Claims
              </Text>
              <Text weight={700} size="lg">
                {claims.filter((c) => c.status !== 'REJECTED' && c.status !== 'REIMBURSED').length}
              </Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Claims Table */}
      {claims.length > 0 ? (
        <Tabs defaultValue="all">
          <Tabs.List>
            <Tabs.Tab value="all">All ({claims.length})</Tabs.Tab>
            <Tabs.Tab
              value="submitted"
              label={`Submitted (${claims.filter((c) => c.status === 'SUBMITTED').length})`}
            >
              Submitted
            </Tabs.Tab>
            <Tabs.Tab
              value="accounts"
              label={`Accounts Review (${claims.filter((c) => c.status === 'ACCOUNTS_VERIFICATION').length})`}
            >
              Accounts Review
            </Tabs.Tab>
            <Tabs.Tab
              value="sanction"
              label={`Sanction Review (${claims.filter((c) => c.status === 'SANCTION_REVIEW').length})`}
            >
              Sanction Review
            </Tabs.Tab>
            <Tabs.Tab
              value="approved"
              label={`Approved (${claims.filter((c) => c.status === 'REIMBURSED').length})`}
            >
              Approved
            </Tabs.Tab>
            <Tabs.Tab
              value="rejected"
              label={`Rejected (${claims.filter((c) => c.status === 'REJECTED').length})`}
            >
              Rejected
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all" pt="xl">
            <ClaimsTable
              claims={claims}
              onViewClaim={(claim) => {
                setSelectedClaim(claim);
                setClaimDetailModal(true);
              }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="submitted" pt="xl">
            <ClaimsTable
              claims={claims.filter((c) => c.status === 'SUBMITTED')}
              onViewClaim={(claim) => {
                setSelectedClaim(claim);
                setClaimDetailModal(true);
              }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="accounts" pt="xl">
            <ClaimsTable
              claims={claims.filter(
                (c) => c.status === 'ACCOUNTS_VERIFICATION'
              )}
              onViewClaim={(claim) => {
                setSelectedClaim(claim);
                setClaimDetailModal(true);
              }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="sanction" pt="xl">
            <ClaimsTable
              claims={claims.filter((c) => c.status === 'SANCTION_REVIEW')}
              onViewClaim={(claim) => {
                setSelectedClaim(claim);
                setClaimDetailModal(true);
              }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="approved" pt="xl">
            <ClaimsTable
              claims={claims.filter((c) => c.status === 'REIMBURSED')}
              onViewClaim={(claim) => {
                setSelectedClaim(claim);
                setClaimDetailModal(true);
              }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="rejected" pt="xl">
            <ClaimsTable
              claims={claims.filter((c) => c.status === 'REJECTED')}
              onViewClaim={(claim) => {
                setSelectedClaim(claim);
                setClaimDetailModal(true);
              }}
            />
          </Tabs.Panel>
        </Tabs>
      ) : (
        <Card withBorder p="xl">
          <Text color="dimmed" align="center">
            No pending claims to process
          </Text>
        </Card>
      )}

      {/* Claim Detail Modal */}
      <Modal
        opened={claimDetailModal}
        onClose={() => {
          setClaimDetailModal(false);
          setSelectedClaim(null);
          setDecision('');
          setRemarks('');
        }}
        title={selectedClaim ? `Claim #${selectedClaim.id} - Review & Process` : 'Claim Details'}
        size="lg"
      >
        {selectedClaim && (
          <Stack gap="md">
            {/* Claim Info */}
            <SimpleGrid cols={2} spacing="md">
              <div>
                <Text size="xs" color="dimmed">
                  Amount
                </Text>
                <Text weight={700} size="lg">
                  ₹{selectedClaim.claim_amount}
                </Text>
              </div>
              <div>
                <Text size="xs" color="dimmed">
                  Status
                </Text>
                <Badge color={STATUS_COLORS[selectedClaim.status]}>
                  {selectedClaim.status}
                </Badge>
              </div>
              <div>
                <Text size="xs" color="dimmed">
                  Submitted
                </Text>
                <Text weight={700}>{selectedClaim.submission_date}</Text>
              </div>
              <div>
                <Text size="xs" color="dimmed">
                  Expense Date
                </Text>
                <Text weight={700}>{selectedClaim.expense_date}</Text>
              </div>
            </SimpleGrid>

            {/* Documents */}
            {selectedClaim.documents && selectedClaim.documents.length > 0 && (
              <div>
                <Text weight={500} size="sm" mb="xs">
                  Supporting Documents
                </Text>
                <ScrollArea><Table striped highlightOnHover size="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Verified</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {selectedClaim.documents.map((doc) => (
                      <Table.Tr key={doc.id}>
                        <Table.Td>{doc.document_type}</Table.Td>
                        <Table.Td>
                          {doc.verified ? (
                            <Badge color="green" size="sm">
                              Verified
                            </Badge>
                          ) : (
                            <Badge color="gray" size="sm">
                              Pending
                            </Badge>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table></ScrollArea>
              </div>
            )}

            {/* Approval History */}
            {selectedClaim.approval_history &&
              selectedClaim.approval_history.length > 0 && (
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

            {/* Processing Section */}
            {selectedClaim.status === 'SUBMITTED' && (
              <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '1rem' }}>
                <Text weight={500} size="sm" mb="md">
                  Your Review
                </Text>

                {/* Decision Selection */}
                <Group mb="md">
                  <Text size="sm" weight={500}>
                    Decision:
                  </Text>
                  <Button
                    variant={decision === 'APPROVE' ? 'filled' : 'light'}
                    color="green"
                    size="sm"
                    onClick={() => setDecision('APPROVE')}
                    leftSection={<IconCheck size={14} />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant={decision === 'REJECT' ? 'filled' : 'light'}
                    color="red"
                    size="sm"
                    onClick={() => setDecision('REJECT')}
                    leftSection={<IconX size={14} />}
                  >
                    Reject
                  </Button>
                </Group>

                {/* Remarks */}
                <Textarea
                  label="Remarks"
                  placeholder="Add your comments about this claim"
                  value={remarks}
                  onChange={(e) => setRemarks(e.currentTarget.value)}
                  minRows={3}
                  mb="md"
                />

                {/* Submit Button */}
                <Group position="right">
                  <Button
                    variant="default"
                    onClick={() => {
                      setClaimDetailModal(false);
                      setSelectedClaim(null);
                      setDecision('');
                      setRemarks('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="filled"
                    color={decision === 'APPROVE' ? 'green' : 'red'}
                    onClick={handleProcessClaim}
                    loading={processing}
                    disabled={!decision}
                  >
                    Submit Decision
                  </Button>
                </Group>
              </div>
            )}
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

/**
 * Claims Table Component
 */
function ClaimsTable({ claims, onViewClaim }) {
  if (claims.length === 0) {
    return (
      <Card withBorder p="xl">
        <Text color="dimmed" align="center">
          No claims in this status
        </Text>
      </Card>
    );
  }

  return (
    <ScrollArea><Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Claim ID</Table.Th>
          <Table.Th>Patient</Table.Th>
          <Table.Th>Amount</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Submitted</Table.Th>
          <Table.Th>Action</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {claims.map((claim) => (
          <Table.Tr key={claim.id}>
            <Table.Td weight={700}>#{claim.id}</Table.Td>
            <Table.Td>
              <Text size="sm" weight={500}>{claim.patient_name}</Text>
              <Text size="xs" color="dimmed">{claim.patient_id}</Text>
            </Table.Td>
            <Table.Td>₹{claim.claim_amount}</Table.Td>
            <Table.Td>
              <Badge color={STATUS_COLORS[claim.status]}>
                {claim.status}
              </Badge>
            </Table.Td>
            <Table.Td>{claim.submission_date}</Table.Td>
            <Table.Td>
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => onViewClaim(claim)}
              >
                <IconEye size={16} />
              </ActionIcon>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table></ScrollArea>
  );
}

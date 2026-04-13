import PropTypes from "prop-types";
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  Badge,
  Card,
  Divider,
  Grid,
  List,
} from "@mantine/core";

const STATUS_LABELS = new Map([
  [0, "Pending"],
  [1, "In Progress"],
  [2, "Resolved"],
  [3, "Closed"],
  [4, "Escalated"],
  [5, "Reopened"],
]);

const STATUS_COLORS = new Map([
  [0, "gray"],
  [1, "yellow"],
  [2, "green"],
  [3, "blue"],
  [4, "orange"],
  [5, "teal"],
]);

const ACTION_LABELS = new Map([
  ["created", "Created"],
  ["status_updated", "Status Updated"],
  ["escalated", "Escalated"],
  ["auto_escalated", "Auto Escalated"],
  ["caretaker_progress_update", "Progress Updated"],
  ["reopen_requested", "Reopen Requested"],
  ["reopen_approved", "Reopen Approved"],
  ["verified_and_closed", "Verified and Closed"],
  ["verification_rejected", "Verification Rejected"],
]);

const getStatusLabel = (status) =>
  STATUS_LABELS.get(Number(status)) || status || "-";

const getSlaStatus = (deadline) => {
  if (!deadline) {
    return { label: "Unknown", color: "gray" };
  }

  const diffHours =
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
  if (diffHours < 0) return { label: "Breached", color: "red" };
  if (diffHours <= 2) return { label: "Approaching", color: "orange" };
  return { label: "Safe", color: "green" };
};

const complaintDetailsShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  complaint_ref: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  complaint_type: PropTypes.string,
  status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  is_escalated: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  escalation_reason: PropTypes.string,
  escalated_date: PropTypes.string,
  location: PropTypes.string,
  specific_location: PropTypes.string,
  priority: PropTypes.string,
  sla_deadline: PropTypes.string,
  verification_source: PropTypes.string,
  verification_status_label: PropTypes.string,
  verification_status: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  resolved_at: PropTypes.string,
  closed_at: PropTypes.string,
  reopen_requested: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  reopen_reason: PropTypes.string,
  reopen_allowed_until: PropTypes.string,
  reopen_window_open: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  details: PropTypes.string,
  remarks: PropTypes.string,
  feedback: PropTypes.string,
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      action: PropTypes.string,
      actor_name: PropTypes.string,
      created_at: PropTypes.string,
      from_status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      to_status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      note: PropTypes.string,
      metadata: PropTypes.shape({
        source: PropTypes.string,
      }),
    }),
  ),
});

export default function ComplaintDetailModal({
  opened,
  onClose,
  detail,
  canResolve = false,
  canVerify = false,
  canRequestReopen = false,
  onResolve = () => {},
  onEscalate = () => {},
  onVerifyApprove = () => {},
  onVerifyReject = () => {},
  onRequestReopen = () => {},
}) {
  const handleResolveClick = () => {
    onResolve(detail?.complaint_details);
  };

  const handleEscalateClick = () => {
    onEscalate(detail?.complaint_details);
  };

  const status = Number(detail?.complaint_details?.status);
  const statusLabel = STATUS_LABELS.get(status) || "Unknown";
  const statusColor = STATUS_COLORS.get(status) || "gray";
  const sla = getSlaStatus(detail?.complaint_details?.sla_deadline);
  const assignedWorker =
    detail?.assigned_worker_details?.name ||
    detail?.worker_details?.name ||
    "Not assigned";
  const timeline =
    detail?.status_timeline || detail?.complaint_details?.events || [];
  const reopenDeadline = detail?.complaint_details?.reopen_allowed_until;
  const verificationStatus =
    detail?.complaint_details?.verification_status_label ||
    detail?.complaint_details?.verification_status;
  const canShowVerificationActions = canVerify && status === 2;
  const canShowReopenAction =
    canRequestReopen &&
    [2, 3].includes(status) &&
    detail?.complaint_details?.reopen_window_open;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Complaint Details"
      centered
      size="lg"
    >
      {!detail ? (
        <Text c="dimmed">No detail loaded.</Text>
      ) : (
        <Stack gap="lg">
          {/* Header Card with Status */}
          <Card withBorder p="md" radius="md" bg="blue.0">
            <Group justify="space-between" mb="xs">
              <div>
                <Text fw={600} size="lg">
                  Complaint{" "}
                  {detail.complaint_details?.complaint_ref ||
                    `#${detail.complaint_details?.id}`}
                </Text>
                <Text size="sm" c="dimmed">
                  {detail.complaint_details?.complaint_type}
                </Text>
              </div>
              <Badge size="lg" color={statusColor} variant="filled">
                {statusLabel}
              </Badge>
            </Group>
          </Card>

          {/* Escalation Status Card */}
          {detail.complaint_details?.is_escalated === 1 && (
            <Card
              withBorder
              p="md"
              radius="md"
              bg="orange.1"
              style={{ borderColor: "#ff922b" }}
            >
              <Group>
                <Badge color="orange" variant="filled">
                  Escalated to Supervisor
                </Badge>
              </Group>
              {detail.complaint_details?.escalation_reason && (
                <Text size="sm" mt="xs" c="dimmed">
                  <strong>Reason:</strong>{" "}
                  {detail.complaint_details?.escalation_reason}
                </Text>
              )}
              {detail.complaint_details?.escalated_date && (
                <Text size="sm" c="dimmed">
                  <strong>Escalated on:</strong>{" "}
                  {new Date(
                    detail.complaint_details?.escalated_date,
                  ).toLocaleString()}
                </Text>
              )}
            </Card>
          )}

          {/* Main Details Grid */}
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card withBorder p="md" radius="md">
                <Stack gap="xs">
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      Location
                    </Text>
                    <Text fw={600}>{detail.complaint_details?.location}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      Priority
                    </Text>
                    <Text fw={600}>
                      {detail.complaint_details?.priority || "Standard"}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      SLA
                    </Text>
                    <Group gap="xs">
                      <Text fw={600}>
                        {detail.complaint_details?.sla_deadline
                          ? new Date(
                              detail.complaint_details.sla_deadline,
                            ).toLocaleString()
                          : "Not set"}
                      </Text>
                      <Badge size="sm" color={sla.color} variant="filled">
                        {sla.label}
                      </Badge>
                    </Group>
                  </div>
                  {detail.complaint_details?.specific_location && (
                    <div>
                      <Text size="sm" c="dimmed" fw={500}>
                        Specific Location
                      </Text>
                      <Text fw={600}>
                        {detail.complaint_details?.specific_location}
                      </Text>
                    </div>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card withBorder p="md" radius="md">
                <Stack gap="xs">
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      Complainer
                    </Text>
                    <Text fw={600}>{detail.complainer?.username}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      Assigned Worker
                    </Text>
                    <Text fw={600}>{assignedWorker}</Text>
                  </div>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          <Card withBorder p="md" radius="md">
            <Stack gap="xs">
              <Text size="sm" c="dimmed" fw={500}>
                Complaint Reference
              </Text>
              <Text fw={600}>
                {detail.complaint_details?.complaint_ref ||
                  detail.complaint_details?.id}
              </Text>
              {detail.complaint_details?.verification_source && (
                <Text size="sm" c="dimmed">
                  Verified by: {detail.complaint_details.verification_source}
                </Text>
              )}
              {verificationStatus && (
                <Text size="sm" c="dimmed">
                  Verification status: {verificationStatus}
                </Text>
              )}
              {detail.complaint_details?.resolved_at && (
                <Text size="sm" c="dimmed">
                  Resolved on:{" "}
                  {new Date(
                    detail.complaint_details.resolved_at,
                  ).toLocaleString()}
                </Text>
              )}
              {detail.complaint_details?.closed_at && (
                <Text size="sm" c="dimmed">
                  Closed on:{" "}
                  {new Date(
                    detail.complaint_details.closed_at,
                  ).toLocaleString()}
                </Text>
              )}
              {detail.complaint_details?.reopen_requested && (
                <Text size="sm" c="dimmed">
                  Reopen requested:{" "}
                  {detail.complaint_details.reopen_reason || "Yes"}
                </Text>
              )}
              {reopenDeadline && (
                <Text size="sm" c="dimmed">
                  Reopen window until:{" "}
                  {new Date(reopenDeadline).toLocaleString()}
                </Text>
              )}
            </Stack>
          </Card>

          {/* Description */}
          <Card withBorder p="md" radius="md">
            <Stack gap="xs">
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Issue Description
                </Text>
                <Text>{detail.complaint_details?.details}</Text>
              </div>

              <Divider />

              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Current Remarks
                </Text>
                <Text
                  c={detail.complaint_details?.remarks ? "black" : "dimmed"}
                >
                  {detail.complaint_details?.remarks || "No remarks yet"}
                </Text>
              </div>

              {detail.complaint_details?.feedback && (
                <>
                  <Divider />
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      Feedback
                    </Text>
                    <Text>{detail.complaint_details?.feedback}</Text>
                  </div>
                </>
              )}
            </Stack>
          </Card>

          <Card withBorder p="md" radius="md">
            <Stack gap="xs">
              <Text fw={600}>Status Timeline</Text>
              {timeline.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No history recorded yet.
                </Text>
              ) : (
                <List spacing="xs" size="sm">
                  {timeline.map((event) => (
                    <List.Item key={event.id}>
                      <Text fw={500}>
                        {ACTION_LABELS.get(event.action) || event.action}
                      </Text>
                      <Text size="xs" c="dimmed">
                        By: {event.actor_name || "System"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {event.created_at
                          ? new Date(event.created_at).toLocaleString()
                          : "Unknown time"}
                      </Text>
                      <Text size="sm">
                        {getStatusLabel(event.from_status)} →{" "}
                        {getStatusLabel(event.to_status)}
                      </Text>
                      {event.note && (
                        <Text size="sm" c="dimmed">
                          {event.note}
                        </Text>
                      )}
                      {event.metadata?.source && (
                        <Text size="xs" c="dimmed">
                          Source: {event.metadata.source}
                        </Text>
                      )}
                    </List.Item>
                  ))}
                </List>
              )}
            </Stack>
          </Card>

          {/* Action Buttons */}
          {canResolve && (
            <Group
              justify="flex-end"
              mt="md"
              pt="md"
              style={{ borderTop: "1px solid #e0e0e0" }}
            >
              <Button variant="default" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="outline"
                color="blue"
                onClick={handleEscalateClick}
              >
                Escalate Issue
              </Button>
              <Button color="blue" onClick={handleResolveClick}>
                Update Status
              </Button>
            </Group>
          )}

          {canShowVerificationActions && (
            <Group
              justify="flex-end"
              mt="md"
              pt="md"
              style={{ borderTop: "1px solid #e0e0e0" }}
            >
              <Button variant="default" onClick={onClose}>
                Close
              </Button>
              <Button variant="outline" color="red" onClick={onVerifyReject}>
                Reject Resolution
              </Button>
              <Button color="green" onClick={onVerifyApprove}>
                Verify and Close
              </Button>
            </Group>
          )}

          {canShowReopenAction && (
            <Group
              justify="flex-end"
              mt="md"
              pt="md"
              style={{ borderTop: "1px solid #e0e0e0" }}
            >
              <Button variant="default" onClick={onClose}>
                Close
              </Button>
              <Button color="orange" onClick={onRequestReopen}>
                Request Reopen
              </Button>
            </Group>
          )}
        </Stack>
      )}
    </Modal>
  );
}

ComplaintDetailModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  detail: PropTypes.shape({
    complaint_details: complaintDetailsShape,
    complainer: PropTypes.shape({
      username: PropTypes.string,
    }),
    assigned_worker_details: PropTypes.shape({
      name: PropTypes.string,
    }),
    worker_details: PropTypes.shape({
      name: PropTypes.string,
    }),
    status_timeline: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        action: PropTypes.string,
        actor_name: PropTypes.string,
        created_at: PropTypes.string,
        from_status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        to_status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        note: PropTypes.string,
        metadata: PropTypes.shape({
          source: PropTypes.string,
        }),
      }),
    ),
  }),
  canResolve: PropTypes.bool,
  canVerify: PropTypes.bool,
  canRequestReopen: PropTypes.bool,
  onResolve: PropTypes.func,
  onEscalate: PropTypes.func,
  onVerifyApprove: PropTypes.func,
  onVerifyReject: PropTypes.func,
  onRequestReopen: PropTypes.func,
};

ComplaintDetailModal.defaultProps = {
  detail: null,
  canResolve: false,
  canVerify: false,
  canRequestReopen: false,
  onResolve: () => {},
  onEscalate: () => {},
  onVerifyApprove: () => {},
  onVerifyReject: () => {},
  onRequestReopen: () => {},
};

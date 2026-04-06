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
} from "@mantine/core";

const STATUS_LABELS = new Map([
  [0, "Pending"],
  [1, "In Progress"],
  [2, "Completed"],
]);

const STATUS_COLORS = new Map([
  [0, "gray"],
  [1, "yellow"],
  [2, "green"],
]);

const complaintDetailsShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  complaint_type: PropTypes.string,
  status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  is_escalated: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  escalation_reason: PropTypes.string,
  escalated_date: PropTypes.string,
  location: PropTypes.string,
  specific_location: PropTypes.string,
  details: PropTypes.string,
  remarks: PropTypes.string,
  feedback: PropTypes.string,
});

export default function ComplaintDetailModal({
  opened,
  onClose,
  detail,
  canResolve = false,
  onResolve = () => {},
  onEscalate = () => {},
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
                  Complaint #{detail.complaint_details?.id}
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
                    <Text fw={600}>
                      {detail.worker_details?.name || "Not assigned"}
                    </Text>
                  </div>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

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
    worker_details: PropTypes.shape({
      name: PropTypes.string,
    }),
  }),
  canResolve: PropTypes.bool,
  onResolve: PropTypes.func,
  onEscalate: PropTypes.func,
};

ComplaintDetailModal.defaultProps = {
  detail: null,
  canResolve: false,
  onResolve: () => {},
  onEscalate: () => {},
};

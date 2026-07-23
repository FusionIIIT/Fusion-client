import React, { useState } from "react";
import {
  Card,
  Title,
  Text,
  Table,
  Button,
  Group,
  Badge,
  Textarea,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  deanPanelApproveRoute,
  deanSendInvitationsRoute,
} from "../../../routes/academicRoutes";

const STATUS_COLOR = {
  pending: "gray",
  accepted: "teal",
  rejected: "red",
  completed: "blue",
  expired: "orange",
};

const CATEGORY_COLOR = {
  indian: "grape",
  foreign: "cyan",
};

function ExaminerTable({ title, category, examiners }) {
  const color = CATEGORY_COLOR[category];
  return (
    <Card withBorder radius="md" p="sm" mt="md" bg={`${color}.0`}>
      <Group gap="xs" mb="xs">
        <Badge color={color} size="lg">
          {title}
        </Badge>
        <Text size="sm" c="dimmed">
          {examiners.length} nominated
        </Text>
      </Group>
      <Table striped={false} withBorder bg="white">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Position</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {examiners.map((e) => (
            <tr key={e.token}>
              <td>{e.priority}</td>
              <td>{e.name}</td>
              <td>{e.position}</td>
              <td>{e.email}</td>
              <td>
                <Badge color={STATUS_COLOR[e.status] || "gray"}>
                  {e.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

const examinerShape = PropTypes.shape({
  token: PropTypes.string,
  name: PropTypes.string,
  position: PropTypes.string,
  email: PropTypes.string,
  priority: PropTypes.number,
  status: PropTypes.string,
});

ExaminerTable.propTypes = {
  title: PropTypes.string.isRequired,
  category: PropTypes.oneOf(["indian", "foreign"]).isRequired,
  examiners: PropTypes.arrayOf(examinerShape).isRequired,
};

export default function DeanPanelReviewPanel({ submission, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [remarks, setRemarks] = useState("");
  const authToken = () => localStorage.getItem("authToken");

  const handlePanelAction = async (action) => {
    if (action === "reject" && !remarks.trim()) {
      showNotification({
        title: "Remarks required",
        message: "Enter a remark explaining why the panel is being sent back.",
        color: "yellow",
      });
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        deanPanelApproveRoute,
        {
          submission_id: submission.id,
          action,
          ...(action === "reject" ? { remarks } : {}),
        },
        { headers: { Authorization: `Token ${authToken()}` } },
      );
      showNotification({
        title: "Success",
        message:
          action === "approve" ? "Panel forwarded" : "Sent back to supervisor",
        color: "teal",
        icon: <IconCheck />,
      });
      onClose();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || e.message,
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendInvitations = async () => {
    setSubmitting(true);
    try {
      await axios.post(
        deanSendInvitationsRoute,
        { submission_id: submission.id },
        { headers: { Authorization: `Token ${authToken()}` } },
      );
      showNotification({
        title: "Success",
        message:
          "Invitations sent to Rank 1 Indian and Rank 1 Foreign examiners",
        color: "teal",
        icon: <IconCheck />,
      });
      onClose();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || e.message,
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card shadow="xs" p="md" mt="lg" withBorder>
      <Title order={4} mb={4}>
        {submission.title}
      </Title>
      <Text size="sm" c="dimmed" mb="sm">
        {submission.student_name || "N/A"} &middot; Roll No:{" "}
        {submission.student_roll || "N/A"}
      </Text>

      <ExaminerTable
        title="Indian Examiners"
        category="indian"
        examiners={submission.indian_examiners || []}
      />
      <ExaminerTable
        title="Foreign Examiners"
        category="foreign"
        examiners={submission.foreign_examiners || []}
      />

      {submission.dean_panel_remarks && (
        <Text
          size="sm"
          mt="md"
          p="sm"
          style={{ backgroundColor: "#ffe6e6", borderRadius: 4 }}
        >
          <Text component="span" fw={500}>
            Previous remarks (sent back to supervisor):{" "}
          </Text>
          {submission.dean_panel_remarks}
        </Text>
      )}

      {submission.director_remarks && (
        <Text
          size="sm"
          mt="md"
          p="sm"
          style={{ backgroundColor: "#fff3cd", borderRadius: 4 }}
        >
          <Text component="span" fw={500}>
            Remarks from Director:{" "}
          </Text>
          {submission.director_remarks}
        </Text>
      )}

      {submission.status === "dean_panel_review" && (
        <Textarea
          label="Remarks (required to send back to supervisor)"
          placeholder="Enter your remarks here"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          minRows={2}
          mt="md"
        />
      )}

      <Group position="right" mt="md">
        <Button variant="default" onClick={onClose} disabled={submitting}>
          Close
        </Button>
        {submission.status === "dean_panel_review" && (
          <>
            <Button
              color="red"
              onClick={() => handlePanelAction("reject")}
              loading={submitting}
            >
              Send Back to Supervisor
            </Button>
            <Button
              color="teal"
              onClick={() => handlePanelAction("approve")}
              loading={submitting}
            >
              Forward Panel
            </Button>
          </>
        )}
        {submission.status === "dean_invite_pending" && (
          <Button
            color="teal"
            onClick={handleSendInvitations}
            loading={submitting}
          >
            Send Invitations to Rank 1 Examiners
          </Button>
        )}
      </Group>
    </Card>
  );
}

DeanPanelReviewPanel.propTypes = {
  submission: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    student_name: PropTypes.string,
    student_roll: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    dean_panel_remarks: PropTypes.string,
    director_remarks: PropTypes.string,
    indian_examiners: PropTypes.arrayOf(examinerShape),
    foreign_examiners: PropTypes.arrayOf(examinerShape),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

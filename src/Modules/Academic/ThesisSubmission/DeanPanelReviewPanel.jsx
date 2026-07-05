import React, { useState } from "react";
import { Card, Title, Table, Button, Group, Badge } from "@mantine/core";
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

function ExaminerTable({ title, examiners }) {
  return (
    <>
      <Title order={5} mt="md">
        {title}
      </Title>
      <Table>
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
    </>
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
  examiners: PropTypes.arrayOf(examinerShape).isRequired,
};

export default function DeanPanelReviewPanel({ submission, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const authToken = () => localStorage.getItem("authToken");

  const handlePanelAction = async (action) => {
    setSubmitting(true);
    try {
      await axios.post(
        deanPanelApproveRoute,
        { submission_id: submission.id, action },
        { headers: { Authorization: `Token ${authToken()}` } },
      );
      showNotification({
        title: "Success",
        message: action === "approve" ? "Panel approved" : "Panel rejected",
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
      <Title order={4} mb="sm">
        {submission.title}
      </Title>

      <ExaminerTable
        title="Indian Examiners"
        examiners={submission.indian_examiners || []}
      />
      <ExaminerTable
        title="Foreign Examiners"
        examiners={submission.foreign_examiners || []}
      />

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
              Reject Panel
            </Button>
            <Button
              color="teal"
              onClick={() => handlePanelAction("approve")}
              loading={submitting}
            >
              Approve Panel
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
    status: PropTypes.string,
    indian_examiners: PropTypes.arrayOf(examinerShape),
    foreign_examiners: PropTypes.arrayOf(examinerShape),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

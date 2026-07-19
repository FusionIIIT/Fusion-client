import React, { useState } from "react";
import {
  Modal,
  Text,
  Table,
  Checkbox,
  Textarea,
  Button,
  Stack,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import { academicOfficeVerifyComprehensiveExamRoute } from "../../../routes/academicRoutes";
import {
  ENTRY_QUALIFICATION_LABEL,
  authHeaders,
  EXAM_SHAPE,
} from "./comprehensiveExamShared";

export default function AcademicOfficeVerifyModal({ exam, onClose, refresh }) {
  const [creditsVerified, setCreditsVerified] = useState(
    exam.credits_completed >= exam.required_credits,
  );
  const [cpiVerified, setCpiVerified] = useState(
    Number(exam.current_cpi) >= 7.0,
  );
  const [rmVerified, setRmVerified] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (approve) => {
    if (approve && !(creditsVerified && cpiVerified && rmVerified)) {
      showNotification({
        title: "Cannot approve yet",
        message: "Check all three eligibility boxes before approving.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        academicOfficeVerifyComprehensiveExamRoute(exam.id),
        {
          approve,
          credits_verified: creditsVerified,
          cpi_verified: cpiVerified,
          research_methodology_verified: rmVerified,
          remarks,
        },
        { headers: authHeaders() },
      );
      showNotification({
        title: approve ? "Verified" : "Rejected",
        message: approve
          ? "Forwarded to Convener for committee approval."
          : "Sent back to supervisor.",
        color: approve ? "green" : "yellow",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Action failed",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened onClose={onClose} title="Verify Eligibility" size="70%">
      <Stack spacing="md">
        <Table striped highlightOnHover>
          <tbody>
            <tr>
              <td>
                <Text fw={500}>Student</Text>
              </td>
              <td>
                {exam.student_name} ({exam.student_roll})
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Entry Qualification</Text>
              </td>
              <td>{ENTRY_QUALIFICATION_LABEL[exam.entry_qualification]}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Credits Completed</Text>
              </td>
              <td>
                {exam.credits_completed} / {exam.required_credits} required
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Current CPI</Text>
              </td>
              <td>{exam.current_cpi ?? "—"} (min 7.0 required)</td>
            </tr>
          </tbody>
        </Table>

        <Checkbox
          label="Credits requirement fulfilled"
          checked={creditsVerified}
          onChange={(e) => setCreditsVerified(e.target.checked)}
        />
        <Checkbox
          label="Minimum CPI of 7.0 fulfilled"
          checked={cpiVerified}
          onChange={(e) => setCpiVerified(e.target.checked)}
        />
        <Checkbox
          label="Research Methodology completed"
          checked={rmVerified}
          onChange={(e) => setRmVerified(e.target.checked)}
        />
        <Textarea
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <Group grow>
          <Button onClick={() => handle(true)} loading={loading}>
            Approve &amp; Forward to Convener
          </Button>
          <Button color="red" onClick={() => handle(false)} loading={loading}>
            Reject
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

AcademicOfficeVerifyModal.propTypes = {
  exam: EXAM_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};

import React, { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Text,
  Table,
  Textarea,
  TextInput,
  Select,
  Button,
  Center,
  Loader,
  Space,
  Checkbox,
  Divider,
  Modal,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import {
  rpcOpenSeminarDetailRoute,
  rpcOpenSeminarConsentRoute,
  rpcOpenSeminarFinalizeRoute,
} from "../../../routes/academicRoutes";
import { authHeaders } from "./openSeminarShared";

/**
 * Embeddable RPC consent panel for an open seminar attempt -- rendered
 * inline inside the Manage modal, mirroring RPCReviewPanel (Comprehensive
 * Exam). Renders nothing if the viewer isn't on this attempt's committee.
 */
export default function RPCOpenSeminarReviewPanel({ attemptId, onUpdate }) {
  const [data, setData] = useState(null);
  const [notOnCommittee, setNotOnCommittee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);

  const load = useCallback(
    () =>
      axios
        .get(rpcOpenSeminarDetailRoute(attemptId), {
          headers: authHeaders(),
        })
        .then((r) => setData(r.data))
        .catch((e) => {
          if (e.response?.status === 403 || e.response?.status === 404) {
            setNotOnCommittee(true);
          } else {
            showNotification({
              title: "Error",
              message: "Failed to load RPC review panel",
              color: "red",
            });
          }
        })
        .finally(() => setLoading(false)),
    [attemptId],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Center style={{ height: 100 }}>
        <Loader size="sm" />
      </Center>
    );
  }
  if (notOnCommittee || !data) {
    return null;
  }

  const {
    seminar_date,
    result,
    committee_comments,
    committee,
    committee_size,
    consented_count,
    comments,
    my_comment,
    is_consented,
    status,
  } = data;

  const closed = status !== "rpc_pending";
  const locked = closed || is_consented;

  const updateField = (field, value) => {
    setData((d) => ({ ...d, [field]: value, is_consented: false }));
  };

  const saveConsent = () => {
    if (!result) {
      showNotification({
        title: "Result required",
        message: "Select Satisfactory or Not Satisfactory before saving.",
        color: "yellow",
      });
      return;
    }
    setSaving(true);
    axios
      .post(
        rpcOpenSeminarConsentRoute(attemptId),
        {
          result,
          committee_comments: committee_comments || "",
          seminar_date: seminar_date || undefined,
          comment: my_comment || "",
        },
        { headers: authHeaders() },
      )
      .then(() => load())
      .then(() => {
        showNotification({
          title: "Saved",
          message: "Consent recorded",
          color: "green",
        });
        if (onUpdate) onUpdate();
      })
      .catch((e) => {
        showNotification({
          title: "Error",
          message: e.response?.data?.error || "Consent failed",
          color: "red",
        });
      })
      .finally(() => setSaving(false));
  };

  const finalize = () => {
    axios
      .post(
        rpcOpenSeminarFinalizeRoute(attemptId),
        {},
        { headers: authHeaders() },
      )
      .then(() => {
        showNotification({
          title: "Finalized",
          message: "Forwarded to Convener (DPGC).",
          color: "green",
        });
        setConfirmFinalizeOpen(false);
        if (onUpdate) onUpdate();
      })
      .catch((e) => {
        showNotification({
          title: "Error",
          message: e.response?.data?.error || "Finalize failed",
          color: "red",
        });
      });
  };

  return (
    <Stack gap="md">
      <Divider label="RPC Review" />

      <Text fw={500}>
        Committee Consent ({consented_count}/{committee_size})
      </Text>
      <Table striped>
        <thead>
          <tr>
            <th>Name</th>
            <th>Discipline</th>
            <th>Consented?</th>
          </tr>
        </thead>
        <tbody>
          {committee.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.discipline}</td>
              <td>
                <Checkbox checked={m.consented} readOnly />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Space h="md" />

      <TextInput
        label="Date of Seminar"
        type="date"
        value={seminar_date || ""}
        onChange={(e) => updateField("seminar_date", e.target.value)}
        disabled={locked}
      />
      <Select
        label="Candidate's Performance in the Open Seminar"
        data={[
          { value: "satisfactory", label: "Satisfactory" },
          { value: "not_satisfactory", label: "Not Satisfactory" },
        ]}
        value={result || ""}
        onChange={(v) => updateField("result", v)}
        disabled={locked}
        required
      />
      <Textarea
        label="Committee's Collective Feedback (shown to the student)"
        placeholder="Enter the committee's overall verdict/feedback"
        value={committee_comments || ""}
        onChange={(e) => updateField("committee_comments", e.target.value)}
        disabled={locked}
      />
      <Space h="md" />

      <Text fw={500}>Committee Comments</Text>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Member</th>
            <th>Timestamp</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((c, idx) => (
            <tr key={idx}>
              <td>{c.member}</td>
              <td>{new Date(c.timestamp).toLocaleString()}</td>
              <td>{c.text}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Space h="md" />

      <Textarea
        label="Your Comment"
        placeholder="Enter your suggestions"
        value={my_comment || ""}
        onChange={(e) => updateField("my_comment", e.target.value)}
        disabled={locked}
      />
      <Space h="md" />

      {!closed && (
        <Button
          fullWidth
          onClick={saveConsent}
          loading={saving}
          disabled={is_consented}
        >
          {is_consented ? "Already Consented" : "Save & Consent"}
        </Button>
      )}

      {!closed && consented_count >= committee_size && committee_size > 0 && (
        <Button
          color="green"
          fullWidth
          onClick={() => setConfirmFinalizeOpen(true)}
        >
          Finalize &amp; Forward to Convener (DPGC)
        </Button>
      )}

      <Modal
        opened={confirmFinalizeOpen}
        onClose={() => setConfirmFinalizeOpen(false)}
        title="Confirm Finalize"
        size="md"
      >
        <Stack gap="md">
          <Text>
            Finalize the committee&apos;s collective verdict and forward it to
            the Convener (DPGC)? This locks the result — the committee will no
            longer be able to change their consent.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setConfirmFinalizeOpen(false)}
            >
              Back
            </Button>
            <Button color="green" onClick={finalize}>
              Confirm &amp; Forward
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

RPCOpenSeminarReviewPanel.propTypes = {
  attemptId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onUpdate: PropTypes.func,
};

RPCOpenSeminarReviewPanel.defaultProps = {
  onUpdate: undefined,
};

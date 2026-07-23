import React, { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Text,
  Table,
  Textarea,
  TextInput,
  FileInput,
  Select,
  Button,
  Center,
  Loader,
  Space,
  Checkbox,
  Anchor,
  Divider,
  Modal,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import {
  rpcComprehensiveExamDetailRoute,
  rpcComprehensiveExamConsentRoute,
  rpcComprehensiveExamFinalizeRoute,
} from "../../../routes/academicRoutes";
import { authHeaders } from "./comprehensiveExamShared";
import { host } from "../../../routes/globalRoutes";

/**
 * Embeddable RPC consent panel for a comprehensive exam attempt -- rendered
 * inline inside the Manage modal rather than a separate screen, since a
 * viewer's Supervisor and RPC-member roles both concern the same exam.
 * Renders nothing (not an error) if the viewer isn't on this attempt's
 * committee, so it's safe to always mount alongside the Manage modal.
 */
export default function RPCReviewPanel({ attemptId, onUpdate }) {
  const [data, setData] = useState(null);
  const [notOnCommittee, setNotOnCommittee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [milestoneFile, setMilestoneFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);

  const load = useCallback(
    () =>
      axios
        .get(rpcComprehensiveExamDetailRoute(attemptId), {
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
    exam_date,
    result,
    fundamentals_comment,
    problem_identification_comment,
    plan_of_work_comment,
    suggestions_comment,
    additional_literature_comment,
    milestone_plan_url,
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
        message: "Select Passed or Failed before saving.",
        color: "yellow",
      });
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append("result", result);
    fd.append("fundamentals_comment", fundamentals_comment || "");
    fd.append(
      "problem_identification_comment",
      problem_identification_comment || "",
    );
    fd.append("plan_of_work_comment", plan_of_work_comment || "");
    fd.append("suggestions_comment", suggestions_comment || "");
    fd.append(
      "additional_literature_comment",
      additional_literature_comment || "",
    );
    if (exam_date) fd.append("exam_date", exam_date);
    fd.append("comment", my_comment || "");
    if (milestoneFile) fd.append("milestone_plan", milestoneFile);

    axios
      .post(rpcComprehensiveExamConsentRoute(attemptId), fd, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      })
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
        rpcComprehensiveExamFinalizeRoute(attemptId),
        {},
        { headers: authHeaders() },
      )
      .then(() => {
        showNotification({
          title: "Finalized",
          message: "Forwarded to Convener (PGCS).",
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
        label="Date of Examination"
        type="date"
        value={exam_date || ""}
        onChange={(e) => updateField("exam_date", e.target.value)}
        disabled={locked}
      />
      <Select
        label="Candidate's Performance in Examination"
        data={[
          { value: "passed", label: "Passed" },
          { value: "failed", label: "Failed" },
        ]}
        value={result || ""}
        onChange={(v) => updateField("result", v)}
        disabled={locked}
        required
      />
      <Textarea
        label="Comment on Fundamentals"
        value={fundamentals_comment || ""}
        onChange={(e) => updateField("fundamentals_comment", e.target.value)}
        disabled={locked}
        minRows={2}
      />
      <Textarea
        label="Comment on Problem Identification"
        value={problem_identification_comment || ""}
        onChange={(e) =>
          updateField("problem_identification_comment", e.target.value)
        }
        disabled={locked}
        minRows={2}
      />
      <Textarea
        label="Comment on Plan of Work"
        value={plan_of_work_comment || ""}
        onChange={(e) => updateField("plan_of_work_comment", e.target.value)}
        disabled={locked}
        minRows={2}
      />
      <Textarea
        label="Other Suggestions for Improvement"
        value={suggestions_comment || ""}
        onChange={(e) => updateField("suggestions_comment", e.target.value)}
        disabled={locked}
        minRows={2}
      />
      <Textarea
        label="Additional Literature to be Studied"
        value={additional_literature_comment || ""}
        onChange={(e) =>
          updateField("additional_literature_comment", e.target.value)
        }
        disabled={locked}
        minRows={2}
      />
      <FileInput
        label="Plan of PhD with Milestones"
        value={milestoneFile}
        onChange={setMilestoneFile}
        accept="application/pdf,image/*"
        disabled={locked}
      />
      {milestone_plan_url && (
        <Anchor
          href={
            milestone_plan_url.startsWith("http")
              ? milestone_plan_url
              : `${host}${milestone_plan_url.startsWith("/") ? "" : "/"}${milestone_plan_url}`
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          View uploaded milestone plan
        </Anchor>
      )}
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
          Finalize &amp; Forward to Convener (PGCS)
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
            the Convener (PGCS)? This locks the result — the committee will no
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

RPCReviewPanel.propTypes = {
  attemptId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onUpdate: PropTypes.func,
};

RPCReviewPanel.defaultProps = {
  onUpdate: undefined,
};

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Text,
  Badge,
  Button,
  Center,
  Loader,
  Stack,
  Group,
  Textarea,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import RPCCommitteeTable from "./RPCCommitteeTable";
import {
  facultyListRoute,
  supervisorCommitteeChangeRequestsRoute,
  supervisorProposeCommitteeChangeRoute,
  supervisorResubmitCommitteeChangeRoute,
} from "../../routes/academicRoutes";

const STATUS_LABEL = {
  hod_pending: "Pending with HOD",
  hod_rejected: "Rejected by HOD",
  dean_pending: "Pending with Dean",
  dean_rejected: "Rejected by Dean",
  approved: "Approved",
};
const STATUS_COLOR = {
  hod_pending: "orange",
  hod_rejected: "red",
  dean_pending: "orange",
  dean_rejected: "red",
  approved: "green",
};

export default function ProposeCommitteeChangeModal({
  thesis,
  onClose,
  refresh,
}) {
  const [facOpts, setFacOpts] = useState([]);
  const [latest, setLatest] = useState(null);
  const [committee, setCommittee] = useState([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("authToken");
  const headers = { Authorization: `Token ${token}` };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, crRes] = await Promise.all([
        axios.get(facultyListRoute, { headers }),
        axios.get(supervisorCommitteeChangeRequestsRoute, { headers }),
      ]);
      setFacOpts(
        fRes.data.map((f) => ({
          value: f.id,
          label: f.name,
          discipline: f.discipline,
        })),
      );
      const mine = (crRes.data.requests || []).find(
        (cr) => cr.thesis_id === thesis.id,
      );
      setLatest(mine || null);

      const supId = thesis.supervisor?.id;
      const coId = thesis.co_supervisor?.id;
      const fixedCount = 1 + (coId ? 1 : 0);
      const numSelectables = 5 - fixedCount;
      const sourceMembers =
        mine && mine.status !== "approved"
          ? mine.proposed_committee.map((m) => m.id)
          : thesis.committee.map((m) => m.id);
      const extras = sourceMembers.filter((id) => id !== supId && id !== coId);
      const padded = extras.slice(0, numSelectables);
      while (padded.length < numSelectables) padded.push(null);
      setCommittee(padded);
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to load committee data.",
        color: "red",
      });
      onClose();
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thesis.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  const isActive =
    latest && ["hod_pending", "dean_pending"].includes(latest.status);
  const isRejected =
    latest && ["hod_rejected", "dean_rejected"].includes(latest.status);
  const readOnly = !!isActive;

  const handleSubmit = async () => {
    setSubmitting(true);
    const members = committee.filter((id) => id != null);
    try {
      if (isRejected) {
        await axios.post(
          supervisorResubmitCommitteeChangeRoute(latest.id),
          { members },
          { headers },
        );
      } else {
        await axios.post(
          supervisorProposeCommitteeChangeRoute(thesis.id),
          { members },
          { headers },
        );
      }
      showNotification({
        title: "Submitted",
        message: "Committee change request sent for HOD review.",
        color: "green",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Submission failed",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal opened onClose={onClose} title="Propose Committee Change" size="70%">
      <Stack gap="md">
        {latest && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Latest Request Status
            </Text>
            <Badge
              color={STATUS_COLOR[latest.status] || "gray"}
              variant="filled"
            >
              {STATUS_LABEL[latest.status] || latest.status}
            </Badge>
          </Group>
        )}

        {isRejected && (latest.hod_remarks || latest.dean_remarks) && (
          <Textarea
            label="Remarks"
            value={latest.hod_remarks || latest.dean_remarks}
            readOnly
            minRows={2}
            styles={{ root: { backgroundColor: "#ffe6e6" } }}
          />
        )}

        <Text fw={500}>
          {readOnly
            ? "Proposed Committee (awaiting review)"
            : "Select RPC Members (≥ 3 total)"}
        </Text>
        <RPCCommitteeTable
          supervisor={thesis.supervisor}
          coSupervisor={thesis.co_supervisor}
          facultyOptions={facOpts}
          committee={committee}
          onChange={setCommittee}
          readOnly={readOnly}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
          {!readOnly && (
            <Button onClick={handleSubmit} loading={submitting}>
              {isRejected ? "Resubmit" : "Submit Request"}
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}

ProposeCommitteeChangeModal.propTypes = {
  thesis: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    supervisor: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      discipline: PropTypes.string,
    }),
    co_supervisor: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      discipline: PropTypes.string,
    }),
    committee: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};

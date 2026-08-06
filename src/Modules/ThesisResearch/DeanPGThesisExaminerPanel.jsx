/**
 * DeanPGThesisExaminerPanel.jsx
 *
 * Dean Academic ranks the 4 HOD-nominated examiner candidates for each
 * specialization batch's decimal-mode thesis grading (PG's final thesis
 * semester) and sends the invitation to the top-ranked candidate. No
 * Director step for PG -- Dean both ranks and invites in one action. Panels
 * are grouped by discipline+year (e.g. "CSE 2025" covering both "AI & ML"
 * and "Data Science") purely so Dean can rank every specialization on one
 * screen -- each specialization is still its own independent panel with its
 * own ranking action and its own accepted examiner.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Card,
  Title,
  Text,
  Table,
  Badge,
  Loader,
  Center,
  Button,
  Alert,
  Select,
  Stack,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import axios from "axios";
import {
  deanThesisExaminerPanelDashboardRoute,
  deanRankAndInviteExaminerPanelRoute,
} from "../../routes/academicRoutes";

function authHeaders() {
  return { Authorization: `Token ${localStorage.getItem("authToken")}` };
}

const STATUS_LABEL = {
  dean_pending: "Awaiting Your Ranking",
  invited: "Invitations Sent",
  accepted: "Examiner Confirmed",
  all_declined: "All Candidates Declined",
};

function PanelCard({ panel, onRanked }) {
  const [ranks, setRanks] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const rankOptions = ["1", "2", "3", "4"];
  const usedRanks = Object.values(ranks).filter(Boolean);
  const isComplete =
    panel.candidates.length === 4 &&
    panel.candidates.every((c) => ranks[c.id]) &&
    new Set(usedRanks).size === 4;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const rankedCandidateIds = [...panel.candidates]
        .sort((a, b) => Number(ranks[a.id]) - Number(ranks[b.id]))
        .map((c) => c.id);
      await axios.post(
        deanRankAndInviteExaminerPanelRoute,
        { panel_id: panel.id, ranked_candidate_ids: rankedCandidateIds },
        { headers: authHeaders() },
      );
      showNotification({
        title: "Invitation sent",
        message: "The top-ranked candidate has been invited.",
        color: "green",
      });
      onRanked();
    } catch (err) {
      showNotification({
        title: "Submit failed",
        message: err.response?.data?.error || err.message,
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Text fw={600} mb="xs">
        {panel.batch_name}
      </Text>
      <Badge color="blue" variant="light" mb="sm">
        {STATUS_LABEL[panel.status] || panel.status}
      </Badge>

      <Table highlightOnHover withTableBorder>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Email</th>
            {panel.status === "dean_pending" && <th>Rank</th>}
            {panel.status !== "dean_pending" && <th>Status</th>}
          </tr>
        </thead>
        <tbody>
          {panel.candidates.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.position}</td>
              <td>{c.email}</td>
              {panel.status === "dean_pending" ? (
                <td style={{ minWidth: 100 }}>
                  <Select
                    placeholder="Rank"
                    data={rankOptions.filter(
                      (opt) =>
                        opt === ranks[c.id] ||
                        !Object.entries(ranks).some(
                          ([id, r]) => Number(id) !== c.id && r === opt,
                        ),
                    )}
                    value={ranks[c.id] || null}
                    onChange={(val) =>
                      setRanks((prev) => ({ ...prev, [c.id]: val }))
                    }
                  />
                </td>
              ) : (
                <td>
                  <Badge
                    color={
                      c.status === "accepted"
                        ? "green"
                        : c.status === "rejected"
                          ? "red"
                          : "gray"
                    }
                    variant="light"
                  >
                    {c.status}
                  </Badge>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {panel.status === "dean_pending" && (
        <Button
          mt="md"
          disabled={!isComplete}
          loading={submitting}
          onClick={handleSubmit}
        >
          Rank &amp; Send Invitation
        </Button>
      )}
    </div>
  );
}

PanelCard.propTypes = {
  panel: PropTypes.shape({
    id: PropTypes.number.isRequired,
    batch_name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    candidates: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string,
        position: PropTypes.string,
        email: PropTypes.string,
        status: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
  onRanked: PropTypes.func.isRequired,
};

export default function DeanPGThesisExaminerPanel() {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPanels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(deanThesisExaminerPanelDashboardRoute, {
        headers: authHeaders(),
      });
      setPanels(res.data.panels || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPanels();
  }, [fetchPanels]);

  const groups = useMemo(() => {
    const map = new Map();
    panels.forEach((panel) => {
      if (!map.has(panel.group_name)) map.set(panel.group_name, []);
      map.get(panel.group_name).push(panel);
    });
    return Array.from(map.entries());
  }, [panels]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" mt="md">
        {error}
      </Alert>
    );
  }

  return (
    <Stack mt="md">
      <Title order={5}>PG Thesis Examiner Panels</Title>
      {groups.length === 0 ? (
        <Text size="sm" c="dimmed">
          No examiner panels submitted by HOD yet.
        </Text>
      ) : (
        groups.map(([groupName, groupPanels]) => (
          <Card withBorder p="md" key={groupName}>
            <Title order={6} mb="sm">
              {groupName}
            </Title>
            <Stack gap="lg">
              {groupPanels.map((panel, idx) => (
                <React.Fragment key={panel.id}>
                  {idx > 0 && <Divider />}
                  <PanelCard panel={panel} onRanked={fetchPanels} />
                </React.Fragment>
              ))}
            </Stack>
          </Card>
        ))
      )}
    </Stack>
  );
}

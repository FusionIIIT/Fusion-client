/**
 * HODThesisExaminerPanel.jsx
 *
 * HOD nominates 4 Indian examiner candidates per specialization batch for
 * PG's decimal-mode final thesis semester -- mirrors the paper form, which
 * is one sheet of 4 examiners per specialization. A department can admit
 * several M.Tech specializations in the same year (e.g. CSE's "AI & ML" and
 * "Data Science"); the dashboard groups them by discipline+year purely for
 * convenience, and "Nominate Examiners" opens one screen with a stacked
 * section per specialization so HOD fills all of them and submits together
 * -- but each specialization still becomes its own independent panel with
 * its own Dean ranking and its own accepted examiner.
 */

import React, { useState, useEffect, useCallback } from "react";
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
  Modal,
  Stack,
  TextInput,
  Textarea,
  Group,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  hodThesisExaminerPanelDashboardRoute,
  hodSubmitThesisExaminerPanelRoute,
} from "../../routes/academicRoutes";

function authHeaders() {
  return { Authorization: `Token ${localStorage.getItem("authToken")}` };
}

const EMPTY_CANDIDATE = {
  name: "",
  position: "",
  address: "",
  phone: "",
  fax: "",
  email: "",
};

const EMPTY_FOUR = () => [
  { ...EMPTY_CANDIDATE },
  { ...EMPTY_CANDIDATE },
  { ...EMPTY_CANDIDATE },
  { ...EMPTY_CANDIDATE },
];

const PANEL_STATUS_LABEL = {
  dean_pending: "Awaiting Dean Ranking",
  invited: "Invitations Sent",
  accepted: "Examiner Confirmed",
  all_declined: "All Candidates Declined",
};

function ExaminerCard({ index, candidate, onChange }) {
  return (
    <Card withBorder p="sm" radius="md">
      <Text size="sm" fw={600} mb="xs">
        Examiner {index + 1}
      </Text>
      <Stack gap="xs">
        <Group grow>
          <TextInput
            label="Name"
            required
            value={candidate.name}
            onChange={(e) => onChange(index, "name", e.currentTarget.value)}
          />
          <TextInput
            label="Present Position"
            value={candidate.position}
            onChange={(e) => onChange(index, "position", e.currentTarget.value)}
          />
        </Group>
        <Textarea
          label="Postal Address"
          minRows={2}
          value={candidate.address}
          onChange={(e) => onChange(index, "address", e.currentTarget.value)}
        />
        <Group grow>
          <TextInput
            label="Phone"
            value={candidate.phone}
            onChange={(e) => onChange(index, "phone", e.currentTarget.value)}
          />
          <TextInput
            label="Fax"
            value={candidate.fax}
            onChange={(e) => onChange(index, "fax", e.currentTarget.value)}
          />
        </Group>
        <TextInput
          label="Email"
          type="email"
          required
          value={candidate.email}
          onChange={(e) => onChange(index, "email", e.currentTarget.value)}
        />
      </Stack>
    </Card>
  );
}

ExaminerCard.propTypes = {
  index: PropTypes.number.isRequired,
  candidate: PropTypes.shape({
    name: PropTypes.string,
    position: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    fax: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function HODThesisExaminerPanel() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalGroup, setModalGroup] = useState(null);
  const [candidatesByBatch, setCandidatesByBatch] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(hodThesisExaminerPanelDashboardRoute, {
        headers: authHeaders(),
      });
      setGroups(res.data.groups || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const nominableBatches = (group) =>
    group.batches.filter((b) => b.ready_for_panel && !b.panel_id);

  const openModal = (group) => {
    setModalGroup(group);
    const initial = {};
    nominableBatches(group).forEach((b) => {
      initial[b.batch_id] = EMPTY_FOUR();
    });
    setCandidatesByBatch(initial);
  };

  const updateCandidate = (batchId, idx, field, value) => {
    setCandidatesByBatch((prev) => ({
      ...prev,
      [batchId]: prev[batchId].map((c, i) =>
        i === idx ? { ...c, [field]: value } : c,
      ),
    }));
  };

  const isFormComplete =
    modalGroup &&
    nominableBatches(modalGroup).every((b) =>
      candidatesByBatch[b.batch_id]?.every((c) => c.name && c.email),
    );

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const batches = nominableBatches(modalGroup).map((b) => ({
        batch_id: b.batch_id,
        candidates: candidatesByBatch[b.batch_id],
      }));
      await axios.post(
        hodSubmitThesisExaminerPanelRoute,
        {
          discipline_id: modalGroup.discipline_id,
          year: modalGroup.year,
          batches,
        },
        { headers: authHeaders() },
      );
      showNotification({
        title: "Panels submitted",
        message: "The examiner panels have been forwarded to Dean Academic.",
        color: "green",
      });
      setModalGroup(null);
      fetchGroups();
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
    <Card withBorder p="md" mt="md">
      <Title order={5} mb="sm">
        Thesis Examiner Panels
      </Title>
      {groups.length === 0 ? (
        <Text size="sm" c="dimmed">
          No batches with decimal-mode thesis registrations in your discipline
          right now.
        </Text>
      ) : (
        <Table highlightOnHover withTableBorder>
          <thead>
            <tr>
              <th>Discipline / Year</th>
              <th>Specializations</th>
              <th>Supervisor-Forwarded</th>
              <th>Panel Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const toNominate = nominableBatches(g);
              const anyPending = g.batches.some(
                (b) => !b.ready_for_panel && !b.panel_id,
              );
              return (
                <tr key={`${g.discipline_id}-${g.year}`}>
                  <td>{g.group_name}</td>
                  <td>{g.batches.map((b) => b.batch_name).join(", ")}</td>
                  <td>
                    {g.batches.reduce((s, b) => s + b.forwarded, 0)} /{" "}
                    {g.batches.reduce((s, b) => s + b.total, 0)}
                  </td>
                  <td>
                    <Stack gap={4}>
                      {g.batches.map((b) => (
                        <Group key={b.batch_id} gap="xs" wrap="nowrap">
                          <Text size="xs" c="dimmed">
                            {b.batch_name}:
                          </Text>
                          {b.panel_status ? (
                            <Badge size="xs" color="blue" variant="light">
                              {PANEL_STATUS_LABEL[b.panel_status] ||
                                b.panel_status}
                            </Badge>
                          ) : (
                            <Text size="xs" c="dimmed">
                              Not started
                            </Text>
                          )}
                        </Group>
                      ))}
                    </Stack>
                  </td>
                  <td>
                    {toNominate.length > 0 && (
                      <Button size="xs" onClick={() => openModal(g)}>
                        Nominate Examiners ({toNominate.length})
                      </Button>
                    )}
                    {toNominate.length === 0 && anyPending && (
                      <Text size="xs" c="dimmed">
                        Waiting for all students
                      </Text>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <Modal
        opened={!!modalGroup}
        onClose={() => setModalGroup(null)}
        title={`Nominate Examiners — ${modalGroup?.group_name || ""}`}
        size="90%"
      >
        <Stack gap="lg">
          {modalGroup &&
            nominableBatches(modalGroup).map((b) => (
              <div key={b.batch_id}>
                <Title order={6} mb="sm">
                  {b.batch_name}
                </Title>

                <Table withTableBorder mb="lg">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name of the Student</th>
                      <th>Thesis Supervisor(s)</th>
                      <th>Title of Thesis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(b.students || []).map((s) => (
                      <tr key={s.roll_no}>
                        <td>{s.roll_no}</td>
                        <td>{s.name}</td>
                        <td>{s.supervisors || "—"}</td>
                        <td>{s.thesis_title || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <Stack gap="md">
                  {(candidatesByBatch[b.batch_id] || []).map((c, idx) => (
                    <ExaminerCard
                      // eslint-disable-next-line react/no-array-index-key
                      key={idx}
                      index={idx}
                      candidate={c}
                      onChange={(i, field, value) =>
                        updateCandidate(b.batch_id, i, field, value)
                      }
                    />
                  ))}
                </Stack>
                <Divider mt="lg" />
              </div>
            ))}
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setModalGroup(null)}>
              Cancel
            </Button>
            <Button
              disabled={!isFormComplete}
              loading={submitting}
              onClick={handleSubmit}
            >
              Submit to Dean
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}

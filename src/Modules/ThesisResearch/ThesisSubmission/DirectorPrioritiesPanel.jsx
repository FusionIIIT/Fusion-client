import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Title,
  Text,
  Table,
  Select,
  Button,
  Loader,
  Group,
  Badge,
  Alert,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import axios from "axios";
import PropTypes from "prop-types";
import { directorApproveRoute } from "../../../routes/academicRoutes";

const CATEGORY_COLOR = {
  indian: "grape",
  foreign: "cyan",
};

export default function DirectorPrioritiesPanel({
  submission,
  readOnly = false,
  onClose,
}) {
  const [prioMap, setPrioMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const indianInvites = useMemo(
    () =>
      (submission.invitations || []).filter(
        (inv) => inv.examiner_type === "indian",
      ),
    [submission.invitations],
  );
  const foreignInvites = useMemo(
    () =>
      (submission.invitations || []).filter(
        (inv) => inv.examiner_type === "foreign",
      ),
    [submission.invitations],
  );

  useEffect(() => {
    if (!submission || !submission.invitations) {
      setError("Invalid submission data");
      setLoading(false);
      return;
    }

    const init = {};
    submission.invitations.forEach((inv) => {
      init[inv.token] = inv.priority || 1;
    });
    setPrioMap(init);
    setLoading(false);
  }, [submission]);

  const handleChange = useCallback(
    (token, value) => {
      const newPriority = Number(value);
      const category = submission.invitations.find(
        (inv) => inv.token === token,
      )?.examiner_type;
      setPrioMap((m) => {
        const oldPriority = m[token];
        const next = { ...m, [token]: newPriority };
        // Swap with whichever other examiner in the same category currently
        // holds the target rank, so ranks always stay a valid 1..N
        // permutation instead of two examiners ending up with the same rank.
        const swapWith = submission.invitations.find(
          (inv) =>
            inv.examiner_type === category &&
            inv.token !== token &&
            m[inv.token] === newPriority,
        );
        if (swapWith) {
          next[swapWith.token] = oldPriority;
        }
        return next;
      });
    },
    [submission.invitations],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        submission_id: submission.id,
        priorities: submission.invitations.map((inv) => ({
          token: inv.token,
          priority: prioMap[inv.token],
        })),
      };

      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authentication required");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      await axios.post(directorApproveRoute, payload, {
        headers: { Authorization: `Token ${token}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      showNotification({
        title: "Success",
        message: "Priorities saved, sent back to Dean for invitations",
        color: "teal",
        icon: <IconCheck />,
      });
      onClose();
    } catch (e) {
      const errorMsg =
        e.response?.data?.error || e.message || "Failed to save priorities";
      setError(errorMsg);
      showNotification({
        title: "Error",
        message: errorMsg,
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setSaving(false);
    }
  }, [submission, prioMap, onClose]);

  if (loading) {
    return (
      <Card shadow="xs" p="md" mt="lg" withBorder>
        <Loader aria-label="Loading priorities" />
      </Card>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error" mt="lg">
        {error}
      </Alert>
    );
  }

  const renderCategory = (label, category, invites) => {
    const color = CATEGORY_COLOR[category];
    const rankOptions = invites.map((_, i) => ({
      value: String(i + 1),
      label: String(i + 1),
    }));

    return (
      <Card withBorder radius="md" p="sm" mt="md" bg={`${color}.0`}>
        <Group spacing="xs" mb="xs">
          <Badge color={color} size="lg">
            {label}
          </Badge>
          <Text size="sm" c="dimmed">
            {invites.length} nominated
          </Text>
        </Group>
        <Table aria-label={`${label} priorities`} withBorder bg="white">
          <thead>
            <tr>
              <th scope="col">Examiner</th>
              <th scope="col">Email</th>
              <th scope="col">Rank</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((inv) => (
              <tr key={inv.token}>
                <td>{inv.prof_name || "N/A"}</td>
                <td>{inv.prof_email || "N/A"}</td>
                <td>
                  <Select
                    data={rankOptions}
                    value={String(prioMap[inv.token] || 1)}
                    onChange={(v) => handleChange(inv.token, v)}
                    disabled={readOnly}
                    aria-label={`Rank for ${inv.prof_name}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    );
  };

  return (
    <Card shadow="xs" p="md" mt="lg" withBorder>
      <Title order={4} mb="md">
        {readOnly
          ? `Priorities for "${submission.title}"`
          : `Set Priorities for "${submission.title}"`}
      </Title>

      {renderCategory("Indian Examiners", "indian", indianInvites)}
      {renderCategory("Foreign Examiners", "foreign", foreignInvites)}

      <Group position="right" mt="md">
        <Button variant="default" onClick={onClose} disabled={saving}>
          {readOnly ? "Close" : "Cancel"}
        </Button>
        {!readOnly && (
          <Button onClick={handleSave} loading={saving}>
            Save Priorities
          </Button>
        )}
      </Group>
    </Card>
  );
}

DirectorPrioritiesPanel.propTypes = {
  submission: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    invitations: PropTypes.arrayOf(
      PropTypes.shape({
        token: PropTypes.string.isRequired,
        prof_name: PropTypes.string,
        prof_email: PropTypes.string,
        examiner_type: PropTypes.string,
        priority: PropTypes.number,
      }),
    ).isRequired,
  }).isRequired,
  readOnly: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

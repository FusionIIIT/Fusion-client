import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Title,
  Table,
  Select,
  Button,
  Loader,
  Group,
  Alert,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import axios from "axios";
import PropTypes from "prop-types";
import { directorApproveRoute } from "../../../routes/academicRoutes";

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

  const handleChange = useCallback((token, value) => {
    setPrioMap((m) => ({ ...m, [token]: Number(value) }));
  }, []);

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

  const renderCategory = (label, invites) => {
    const rankOptions = invites.map((_, i) => ({
      value: String(i + 1),
      label: String(i + 1),
    }));

    return (
      <>
        <Title order={5} mt="md">
          {label}
        </Title>
        <Table aria-label={`${label} priorities`}>
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
      </>
    );
  };

  return (
    <Card shadow="xs" p="md" mt="lg" withBorder>
      <Title order={4} mb="md">
        {readOnly
          ? `Priorities for "${submission.title}"`
          : `Set Priorities for "${submission.title}"`}
      </Title>

      {renderCategory("Indian Examiners", indianInvites)}
      {renderCategory("Foreign Examiners", foreignInvites)}

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

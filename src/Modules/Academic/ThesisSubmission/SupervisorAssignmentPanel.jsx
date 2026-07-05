// src/components/thesis/SupervisorAssignmentPanel.jsx

import React, { useState, useEffect } from "react";
import {
  Card,
  Title,
  Table,
  TextInput,
  Textarea,
  Button,
  ActionIcon,
  Group,
  Loader,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconPlus, IconMinus, IconCheck, IconX } from "@tabler/icons-react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  supervisorAssignRoute,
  supervisorSubmissionDetailRoute,
} from "../../../routes/academicRoutes";

export default function SupervisorAssignmentPanel({
  submission,
  readOnly = false,
  onClose,
}) {
  const emptyIndian = {
    name: "",
    position: "",
    address: "",
    phone: "",
    email: "",
  };
  const emptyForeign = { ...emptyIndian };

  const [indian, setIndian] = useState([emptyIndian]);
  const [foreign, setForeign] = useState([emptyForeign]);
  const [loading, setLoading] = useState(readOnly);
  const [submitting, setSubmitting] = useState(false);

  // If readOnly, fetch existing examiners
  useEffect(() => {
    if (!readOnly) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          supervisorSubmissionDetailRoute(submission.id),
          {
            headers: { Authorization: `Token ${token}` },
          },
        );
        setIndian(res.data.indian_examiners);
        setForeign(res.data.foreign_examiners);
      } catch (e) {
        showNotification({
          title: "Error",
          message: "Failed to load examiners",
          color: "red",
          icon: <IconX />,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [readOnly, submission.id]);

  // Form handlers
  const modify = (arr, fn, idx, field, val) => {
    const c = [...arr];
    c[idx][field] = val;
    fn(c);
  };
  const addRow = (arr, fn, empty) => fn([...arr, empty]);
  const removeRow = (arr, fn, idx) =>
    arr.length > 1 && fn(arr.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    // basic required fields
    if (
      indian.some((p) => !p.name || !p.email) ||
      foreign.some((p) => !p.name || !p.email)
    ) {
      showNotification({
        title: "Validation",
        message: "Name & Email required for all",
        color: "red",
        icon: <IconX />,
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        submission_id: submission.id,
        indian_examiners: indian,
        foreign_examiners: foreign,
      };
      const token = localStorage.getItem("authToken");
      await axios.post(supervisorAssignRoute, payload, {
        headers: { Authorization: `Token ${token}` },
      });
      showNotification({
        title: "Success",
        message: "Examiners assigned",
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

  if (loading) {
    return (
      <Card shadow="xs" p="md" mt="lg" withBorder>
        <Loader />
      </Card>
    );
  }

  return (
    <Card shadow="xs" p="md" mt="lg" withBorder>
      <Title order={4} mb="sm">
        {readOnly
          ? `Examiners for "${submission.title}"`
          : `Assign Examiners for "${submission.title}"`}
      </Title>

      {/* Indian Examiners */}
      <Title order={5}>Indian Examiners</Title>
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Position</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Email</th>
            {!readOnly && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {indian.map((p, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>
                <TextInput
                  value={p.name}
                  onChange={(e) =>
                    modify(indian, setIndian, i, "name", e.target.value)
                  }
                  disabled={readOnly}
                />
              </td>
              <td>
                <TextInput
                  value={p.position}
                  onChange={(e) =>
                    modify(indian, setIndian, i, "position", e.target.value)
                  }
                  disabled={readOnly}
                />
              </td>
              <td>
                <Textarea
                  value={p.address}
                  onChange={(e) =>
                    modify(indian, setIndian, i, "address", e.target.value)
                  }
                  disabled={readOnly}
                />
              </td>
              <td>
                <TextInput
                  value={p.phone}
                  onChange={(e) =>
                    modify(indian, setIndian, i, "phone", e.target.value)
                  }
                  disabled={readOnly}
                />
              </td>
              <td>
                <TextInput
                  value={p.email}
                  onChange={(e) =>
                    modify(indian, setIndian, i, "email", e.target.value)
                  }
                  disabled={readOnly}
                />
              </td>
              {!readOnly && (
                <td>
                  <Group spacing="xs">
                    <ActionIcon
                      aria-label="Remove Indian examiner"
                      color="red"
                      onClick={() => removeRow(indian, setIndian, i)}
                    >
                      <IconMinus />
                    </ActionIcon>
                    <ActionIcon
                      aria-label="Add Indian examiner"
                      color="green"
                      onClick={() => addRow(indian, setIndian, emptyIndian)}
                    >
                      <IconPlus />
                    </ActionIcon>
                  </Group>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Foreign Examiners */}
      <Title order={5} mt="md">
        Foreign Examiners
      </Title>
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Position</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Email</th>
            {!readOnly && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {foreign.map((p, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>
                <TextInput
                  value={p.name}
                  onChange={(e) =>
                    modify(foreign, setForeign, i, "name", e.target.value)
                  }
                  disabled={readOnly}
                />
              </td>
              <td>
                <TextInput
                  value={p.position}
                  onChange={(e) =>
                    modify(foreign, setForeign, i, "position", e.target.value)
                  }
                  disabled={readOnly}
                />
              </td>
              <td>
                <Textarea
                  value={p.address}
                  onChange={(e) =>
                    modify(foreign, setForeign, i, "address", e.target.value)
                  }
                  disabled={readOnly}
                />
              </td>
              <td>
                <TextInput
                  value={p.phone}
                  onChange={(e) =>
                    modify(foreign, setForeign, i, "phone", e.target.value)
                  }
                  disabled={readOnly}
                />
              </td>
              <td>
                <TextInput
                  value={p.email}
                  onChange={(e) =>
                    modify(foreign, setForeign, i, "email", e.target.value)
                  }
                  disabled={readOnly}
                />
              </td>
              {!readOnly && (
                <td>
                  <Group spacing="xs">
                    <ActionIcon
                      aria-label="Remove foreign examiner"
                      color="red"
                      onClick={() => removeRow(foreign, setForeign, i)}
                    >
                      <IconMinus />
                    </ActionIcon>
                    <ActionIcon
                      aria-label="Add foreign examiner"
                      color="green"
                      onClick={() => addRow(foreign, setForeign, emptyForeign)}
                    >
                      <IconPlus />
                    </ActionIcon>
                  </Group>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {!readOnly && (
        <Button fullWidth mt="md" onClick={handleSubmit} disabled={submitting}>
          Submit Examiners
        </Button>
      )}
      {readOnly && (
        <Button fullWidth mt="md" onClick={onClose}>
          Close
        </Button>
      )}
    </Card>
  );
}

SupervisorAssignmentPanel.propTypes = {
  submission: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
  }).isRequired,
  readOnly: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

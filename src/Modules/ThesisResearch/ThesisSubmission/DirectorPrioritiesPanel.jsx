import React, { useState } from "react";
import {
  Card,
  Title,
  Text,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  ActionIcon,
  Group,
  Stack,
  Tabs,
  Badge,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconPlus,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconCheck,
  IconX,
  IconPencil,
} from "@tabler/icons-react";
import axios from "axios";
import PropTypes from "prop-types";
import { directorApproveRoute } from "../../../routes/academicRoutes";

const EMPTY_EXAMINER = {
  name: "",
  position: "",
  address: "",
  phone: "",
  fax: "",
  email: "",
  time_ranking: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ExaminerCard({ examiner, index, total, category, readOnly, onChange, onRemove, onMove }) {
  const [isEditing, setIsEditing] = useState(false);
  const fieldsDisabled = readOnly || !isEditing;
  const isForeign = category === "foreign";
  const nameError = !fieldsDisabled && !examiner.name ? "Name is required" : null;
  const emailError = !fieldsDisabled && examiner.email && !EMAIL_RE.test(examiner.email)
    ? "Invalid email address"
    : null;

  return (
    <Card withBorder p="md" radius="md">
      <Group position="apart" mb="sm">
        <Badge size="lg" variant="light">Rank {index + 1}</Badge>
        {!readOnly && (
          <Group spacing="xs">
            <ActionIcon
              aria-label={isEditing ? `Done editing ${category} examiner ${index + 1}` : `Edit ${category} examiner ${index + 1}`}
              color={isEditing ? "teal" : "blue"}
              onClick={() => setIsEditing((v) => !v)}
            >
              {isEditing ? <IconCheck size={16} /> : <IconPencil size={16} />}
            </ActionIcon>
            <ActionIcon
              aria-label={`Move ${category} examiner ${index + 1} up`}
              disabled={index === 0}
              onClick={() => onMove(index, -1)}
            >
              <IconChevronUp size={16} />
            </ActionIcon>
            <ActionIcon
              aria-label={`Move ${category} examiner ${index + 1} down`}
              disabled={index === total - 1}
              onClick={() => onMove(index, 1)}
            >
              <IconChevronDown size={16} />
            </ActionIcon>
            <ActionIcon
              aria-label={`Remove ${category} examiner ${index + 1}`}
              color="red"
              disabled={total <= 1}
              onClick={() => onRemove(index)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        )}
      </Group>

      <Stack spacing="sm">
        <Group grow>
          <TextInput
            label="Name"
            required
            value={examiner.name}
            error={nameError}
            onChange={(e) => onChange(index, "name", e.target.value)}
            disabled={fieldsDisabled}
          />
          <TextInput
            label="Present Position"
            value={examiner.position}
            onChange={(e) => onChange(index, "position", e.target.value)}
            disabled={fieldsDisabled}
          />
        </Group>

        <Textarea
          label="Postal Address"
          minRows={2}
          value={examiner.address}
          onChange={(e) => onChange(index, "address", e.target.value)}
          disabled={fieldsDisabled}
        />

        {isForeign && (
          <NumberInput
            label="Time Ranking"
            description="Preference order for scheduling across time zones"
            min={1}
            value={examiner.time_ranking || ""}
            onChange={(v) => onChange(index, "time_ranking", v)}
            disabled={fieldsDisabled}
          />
        )}

        <Group grow>
          <TextInput
            label="Phone"
            value={examiner.phone}
            onChange={(e) => onChange(index, "phone", e.target.value)}
            disabled={fieldsDisabled}
          />
          <TextInput
            label="Fax"
            value={examiner.fax}
            onChange={(e) => onChange(index, "fax", e.target.value)}
            disabled={fieldsDisabled}
          />
        </Group>

        <TextInput
          label="E-mail"
          required
          type="email"
          value={examiner.email}
          error={emailError}
          onChange={(e) => onChange(index, "email", e.target.value)}
          disabled={fieldsDisabled}
        />
      </Stack>
    </Card>
  );
}

const examinerShape = PropTypes.shape({
  name: PropTypes.string,
  position: PropTypes.string,
  address: PropTypes.string,
  phone: PropTypes.string,
  fax: PropTypes.string,
  email: PropTypes.string,
  time_ranking: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

ExaminerCard.propTypes = {
  examiner: examinerShape.isRequired,
  index: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  category: PropTypes.oneOf(["indian", "foreign"]).isRequired,
  readOnly: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
};

function ExaminerList({ category, examiners, readOnly, onChange, onRemove, onMove, onAdd }) {
  const label = category === "indian" ? "Indian" : "Foreign";
  return (
    <Stack spacing="md" mt="md">
      {examiners.map((ex, i) => (
        <ExaminerCard
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          examiner={ex}
          index={i}
          total={examiners.length}
          category={category}
          readOnly={readOnly}
          onChange={onChange}
          onRemove={onRemove}
          onMove={onMove}
        />
      ))}
      {!readOnly && (
        <Button
          variant="outline"
          leftIcon={<IconPlus size={16} />}
          onClick={onAdd}
          fullWidth
          style={{ borderStyle: "dashed" }}
        >
          Add {label} Examiner
        </Button>
      )}
    </Stack>
  );
}

ExaminerList.propTypes = {
  category: PropTypes.oneOf(["indian", "foreign"]).isRequired,
  examiners: PropTypes.arrayOf(examinerShape).isRequired,
  readOnly: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default function DirectorPrioritiesPanel({ submission, readOnly = false, onClose }) {
  const [indian, setIndian] = useState(
    submission.indian_examiners?.length ? submission.indian_examiners : [{ ...EMPTY_EXAMINER }],
  );
  const [foreign, setForeign] = useState(
    submission.foreign_examiners?.length ? submission.foreign_examiners : [{ ...EMPTY_EXAMINER }],
  );
  const [remarks, setRemarks] = useState("");
  const [activeTab, setActiveTab] = useState("indian");
  const [submitting, setSubmitting] = useState(false);

  const updateExaminer = (setList) => (index, field, value) => {
    setList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeExaminer = (setList) => (index) => {
    setList((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const moveExaminer = (setList) => (index, direction) => {
    setList((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addExaminer = (setList) => () => {
    setList((prev) => [...prev, { ...EMPTY_EXAMINER }]);
  };

  const submit = async (action) => {
    const invalid = [...indian, ...foreign].some(
      (p) => !p.name || !p.email || !EMAIL_RE.test(p.email),
    );
    if (invalid) {
      showNotification({
        title: "Validation",
        message: "Every examiner needs a name and a valid email address",
        color: "red",
        icon: <IconX />,
      });
      return;
    }
    if (action === "send_back" && !remarks.trim()) {
      showNotification({
        title: "Validation",
        message: "Please add a remark explaining why the panel is being sent back to the Dean.",
        color: "red",
        icon: <IconX />,
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        directorApproveRoute,
        {
          submission_id: submission.id,
          action,
          indian_examiners: indian,
          foreign_examiners: foreign,
          remarks,
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      showNotification({
        title: "Success",
        message: action === "send_back" ? "Panel sent back to Dean" : "Priorities approved",
        color: "teal",
        icon: <IconCheck />,
      });
      onClose();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || e.message || "Failed to submit",
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card shadow="xs" p="md" mt="lg" withBorder>
      <Title order={4} mb="xs">
        {readOnly ? `Priorities for "${submission.title}"` : `Set Priorities for "${submission.title}"`}
      </Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="indian">Indian Examiners ({indian.length})</Tabs.Tab>
          <Tabs.Tab value="foreign">Foreign Examiners ({foreign.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="indian">
          <ExaminerList
            category="indian"
            examiners={indian}
            readOnly={readOnly}
            onChange={updateExaminer(setIndian)}
            onRemove={removeExaminer(setIndian)}
            onMove={moveExaminer(setIndian)}
            onAdd={addExaminer(setIndian)}
          />
        </Tabs.Panel>

        <Tabs.Panel value="foreign">
          <ExaminerList
            category="foreign"
            examiners={foreign}
            readOnly={readOnly}
            onChange={updateExaminer(setForeign)}
            onRemove={removeExaminer(setForeign)}
            onMove={moveExaminer(setForeign)}
            onAdd={addExaminer(setForeign)}
          />
        </Tabs.Panel>
      </Tabs>

      {!readOnly && (
        <Textarea
          label="Remarks (required if sending back to Dean)"
          placeholder="Explain what needs to change before you'll approve this panel"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          minRows={2}
          mt="md"
        />
      )}

      <Divider my="md" />

      <Group position="apart">
        <Text size="sm" color="dimmed">
          {indian.length} Indian &middot; {foreign.length} Foreign selected
        </Text>
        <Group>
          {readOnly ? (
            <Button variant="default" onClick={onClose} disabled={submitting}>
              Close
            </Button>
          ) : (
            <>
              <Button color="red" onClick={() => submit("send_back")} loading={submitting}>
                Send Back to Dean
              </Button>
              <Button color="teal" onClick={() => submit("approve")} loading={submitting}>
                Approve Examiners
              </Button>
            </>
          )}
        </Group>
      </Group>
    </Card>
  );
}

DirectorPrioritiesPanel.propTypes = {
  submission: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    indian_examiners: PropTypes.arrayOf(examinerShape),
    foreign_examiners: PropTypes.arrayOf(examinerShape),
  }).isRequired,
  readOnly: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

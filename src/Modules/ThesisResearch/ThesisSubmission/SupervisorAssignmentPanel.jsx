// src/components/thesis/SupervisorAssignmentPanel.jsx

import React, { useState, useEffect } from 'react';
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
  Loader,
  Divider,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
  IconPlus,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  supervisorAssignRoute,
  supervisorSubmissionDetailRoute,
} from '../../../routes/academicRoutes';

const EMPTY_EXAMINER = {
  name: '',
  position: '',
  address: '',
  phone: '',
  fax: '',
  email: '',
  time_ranking: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ExaminerCard({ examiner, index, total, category, readOnly, onChange, onRemove, onMove }) {
  const isForeign = category === 'foreign';
  const nameError = !readOnly && !examiner.name ? 'Name is required' : null;
  const emailError = !readOnly && examiner.email && !EMAIL_RE.test(examiner.email)
    ? 'Invalid email address'
    : null;

  return (
    <Card withBorder p="md" radius="md">
      <Group position="apart" mb="sm">
        <Badge size="lg" variant="light">Rank {index + 1}</Badge>
        {!readOnly && (
          <Group spacing="xs">
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
            onChange={(e) => onChange(index, 'name', e.target.value)}
            disabled={readOnly}
          />
          <TextInput
            label="Present Position"
            value={examiner.position}
            onChange={(e) => onChange(index, 'position', e.target.value)}
            disabled={readOnly}
          />
        </Group>

        <Textarea
          label="Postal Address"
          minRows={2}
          value={examiner.address}
          onChange={(e) => onChange(index, 'address', e.target.value)}
          disabled={readOnly}
        />

        {isForeign && (
          <NumberInput
            label="Time Ranking"
            description="Preference order for scheduling across time zones"
            min={1}
            value={examiner.time_ranking || ''}
            onChange={(v) => onChange(index, 'time_ranking', v)}
            disabled={readOnly}
          />
        )}

        <Group grow>
          <TextInput
            label="Phone"
            value={examiner.phone}
            onChange={(e) => onChange(index, 'phone', e.target.value)}
            disabled={readOnly}
          />
          <TextInput
            label="Fax"
            value={examiner.fax}
            onChange={(e) => onChange(index, 'fax', e.target.value)}
            disabled={readOnly}
          />
        </Group>

        <TextInput
          label="E-mail"
          required
          type="email"
          value={examiner.email}
          error={emailError}
          onChange={(e) => onChange(index, 'email', e.target.value)}
          disabled={readOnly}
        />
      </Stack>
    </Card>
  );
}

ExaminerCard.propTypes = {
  examiner: PropTypes.shape({
    name: PropTypes.string,
    position: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    fax: PropTypes.string,
    email: PropTypes.string,
    time_ranking: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  index: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  category: PropTypes.oneOf(['indian', 'foreign']).isRequired,
  readOnly: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
};

function ExaminerList({ category, examiners, readOnly, onChange, onRemove, onMove, onAdd }) {
  const label = category === 'indian' ? 'Indian' : 'Foreign';
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
          style={{ borderStyle: 'dashed' }}
        >
          Add {label} Examiner
        </Button>
      )}
    </Stack>
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

ExaminerList.propTypes = {
  category: PropTypes.oneOf(['indian', 'foreign']).isRequired,
  examiners: PropTypes.arrayOf(examinerShape).isRequired,
  readOnly: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default function SupervisorAssignmentPanel({ submission, readOnly = false, onClose }) {
  const [indian, setIndian] = useState([{ ...EMPTY_EXAMINER }]);
  const [foreign, setForeign] = useState([{ ...EMPTY_EXAMINER }]);
  const [activeTab, setActiveTab] = useState('indian');
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
        const token = localStorage.getItem('authToken');
        const res = await axios.get(supervisorSubmissionDetailRoute(submission.id), {
          headers: { Authorization: `Token ${token}` },
        });
        setIndian(res.data.indian_examiners?.length ? res.data.indian_examiners : [{ ...EMPTY_EXAMINER }]);
        setForeign(res.data.foreign_examiners?.length ? res.data.foreign_examiners : [{ ...EMPTY_EXAMINER }]);
      } catch (e) {
        showNotification({ title: 'Error', message: 'Failed to load examiners', color: 'red', icon: <IconX /> });
      } finally {
        setLoading(false);
      }
    })();
  }, [readOnly, submission.id]);

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

  const handleSubmit = async () => {
    const invalid = [...indian, ...foreign].some(
      (p) => !p.name || !p.email || !EMAIL_RE.test(p.email),
    );
    if (invalid) {
      showNotification({
        title: 'Validation',
        message: 'Every examiner needs a name and a valid email address',
        color: 'red',
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
      const token = localStorage.getItem('authToken');
      await axios.post(supervisorAssignRoute, payload, {
        headers: { Authorization: `Token ${token}` },
      });
      showNotification({ title: 'Success', message: 'Examiners assigned', color: 'teal', icon: <IconCheck /> });
      onClose();
    } catch (e) {
      showNotification({
        title: 'Error',
        message: e.response?.data?.error || e.message,
        color: 'red',
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
      <Title order={4} mb="xs">
        {readOnly
          ? `Examiners for "${submission.title}"`
          : `Assign Examiners for "${submission.title}"`}
      </Title>
      {!readOnly && (
        <Text size="sm" color="dimmed" mb="sm">
          Recommended: 5-6 examiners in each category.
        </Text>
      )}

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

      <Divider my="md" />

      <Group position="apart">
        <Text size="sm" color="dimmed">
          {indian.length} Indian &middot; {foreign.length} Foreign selected
        </Text>
        <Group>
          <Button variant="default" onClick={onClose} disabled={submitting}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly && (
            <Button onClick={handleSubmit} loading={submitting}>
              Submit Examiners
            </Button>
          )}
        </Group>
      </Group>
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

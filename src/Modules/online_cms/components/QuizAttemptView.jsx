/* eslint-disable */
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Group, Paper, Radio, Stack, Text } from "@mantine/core";

export default function QuizAttemptView({ quiz, onSubmit, onCancel }) {
  const [answers, setAnswers] = useState({});

  const questions = quiz?.questions || [];
  const canSubmit = useMemo(() => {
    if (!quiz) return false;
    if (!Array.isArray(questions) || questions.length === 0) return false;
    return questions.every((q) => answers[q.id]);
  }, [quiz, questions, answers]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = questions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id],
    }));
    onSubmit?.(payload);
  };

  return (
    <Paper p="md" shadow="xs">
      <Group justify="space-between" mb="md">
        <Text size="xl">{quiz?.title || "Quiz"}</Text>
        <Button variant="light" onClick={onCancel}>
          Back
        </Button>
      </Group>

      <Stack gap="lg">
        {questions.map((q, idx) => {
          const options = [
            ["1", q.option1],
            ["2", q.option2],
            ["3", q.option3],
            ["4", q.option4],
            ["5", q.option5],
          ].filter(
            ([, label]) =>
              label !== undefined &&
              label !== null &&
              String(label).trim() !== "",
          );

          return (
            <Paper key={q.id} p="sm" withBorder>
              <Text fw={600} mb="xs">
                {idx + 1}. {q.question}
              </Text>
              <Radio.Group
                value={answers[q.id] || ""}
                onChange={(val) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: val }))
                }
              >
                <Stack gap={6}>
                  {options.map(([val, label]) => (
                    <Radio key={val} value={val} label={label} />
                  ))}
                </Stack>
              </Radio.Group>
            </Paper>
          );
        })}

        <Group justify="flex-end">
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Submit
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

QuizAttemptView.propTypes = {
  quiz: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
};

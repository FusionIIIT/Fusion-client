/* eslint-disable */
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";

export default function AssignmentTable({
  courseCode,
  assignments = [],
  isFaculty,
  onDelete,
  onGrade,
}) {
  const [gradeDrafts, setGradeDrafts] = useState({});

  return (
    <Box p="md">
      <Text size="xl" mb="md">
        Assignments
      </Text>

      {!courseCode && (
        <Text c="dimmed">Select a course to view assignments.</Text>
      )}

      <Paper p="md" withBorder mb="md">
        <Stack gap="sm">
          {(assignments || []).map((a) => (
            <Paper key={a.id} p="sm" withBorder>
              <Group justify="space-between" mb={4}>
                <Text fw={600}>{a.title}</Text>
                {isFaculty && (
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    onClick={() => onDelete?.(a.id)}
                  >
                    Delete
                  </Button>
                )}
              </Group>
              <Text size="sm" c="dimmed">
                Deadline: {a.deadline || "—"}
              </Text>

              <Stack gap={8} mt="sm">
                {(a.submissions || []).length === 0 ? (
                  <Text c="dimmed" size="sm">
                    No submissions yet.
                  </Text>
                ) : (
                  (a.submissions || []).map((s) => {
                    const key = String(s.id);
                    const draft = gradeDrafts[key] || {
                      score: s.score ?? "",
                      feedback: s.feedback ?? "",
                    };
                    const isGraded = s.score !== null && s.score !== undefined;

                    return (
                      <Paper key={s.id} p="sm" withBorder>
                        <Group justify="space-between" align="flex-start">
                          <div>
                            <Text size="sm" fw={600}>
                              {s.studentId
                                ? `${s.studentId} — ${s.studentName || ""}`
                                : s.studentName || "Student"}
                            </Text>
                            <Text size="sm">
                              Link:{" "}
                              {s.submissionLink ? (
                                <a
                                  href={s.submissionLink}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  open
                                </a>
                              ) : (
                                "—"
                              )}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Submitted: {s.submittedAt || "—"}
                            </Text>
                            {!isFaculty && (
                              <Text size="sm" mt={6}>
                                Grade: {isGraded ? s.score : "Not graded"}
                                {s.feedback ? ` • ${s.feedback}` : ""}
                              </Text>
                            )}
                          </div>

                          {isFaculty && (
                            <Stack gap={6} style={{ minWidth: 220 }}>
                              <TextInput
                                label="Score"
                                value={draft.score}
                                onChange={(e) =>
                                  setGradeDrafts((p) => ({
                                    ...p,
                                    [key]: { ...draft, score: e.target.value },
                                  }))
                                }
                              />
                              <TextInput
                                label="Feedback"
                                value={draft.feedback}
                                onChange={(e) =>
                                  setGradeDrafts((p) => ({
                                    ...p,
                                    [key]: {
                                      ...draft,
                                      feedback: e.target.value,
                                    },
                                  }))
                                }
                              />
                              <Button
                                onClick={() =>
                                  onGrade?.({
                                    pk: s.id,
                                    score: Number(draft.score),
                                    feedback: draft.feedback,
                                  })
                                }
                              >
                                Save grade
                              </Button>
                            </Stack>
                          )}
                        </Group>
                      </Paper>
                    );
                  })
                )}
              </Stack>
            </Paper>
          ))}

          {(assignments || []).length === 0 && (
            <Text c="dimmed">No assignments yet.</Text>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

AssignmentTable.propTypes = {
  courseCode: PropTypes.string,
  assignments: PropTypes.array,
  isFaculty: PropTypes.bool,
  onDelete: PropTypes.func,
  onGrade: PropTypes.func,
};

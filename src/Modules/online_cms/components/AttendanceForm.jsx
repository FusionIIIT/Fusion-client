/* eslint-disable */
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Checkbox,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

export default function AttendanceForm({
  courseCode,
  isFaculty,
  roster = [],
  onSubmit,
}) {
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [presentMap, setPresentMap] = useState({});

  const dateStr = useMemo(() => {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [date]);

  if (!courseCode) {
    return (
      <Paper p="md" shadow="xs">
        <Text c="dimmed">Select a course to view attendance.</Text>
      </Paper>
    );
  }

  if (!isFaculty) {
    return (
      <Paper p="md" shadow="xs">
        <Text size="xl" mb="xs">
          Attendance
        </Text>
        <Text c="dimmed">Your attendance records are shown below.</Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" shadow="xs">
      <Text size="xl" mb="md">
        Mark Attendance
      </Text>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const attendance = (roster || []).map((s) => ({
            student_id: s.student_id,
            present: Boolean(presentMap[s.student_id]),
          }));
          onSubmit?.({
            date: dateStr,
            attendance,
            notes,
          });
        }}
      >
        <Group align="end" mb="sm">
          <DatePickerInput
            label="Day"
            value={date}
            onChange={setDate}
            placeholder="Select day"
            required
          />
          <TextInput
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
            style={{ flex: 1 }}
          />
        </Group>

        <Stack gap={6}>
          {(roster || []).map((s) => (
            <Checkbox
              key={s.student_id}
              label={`${s.student_id} — ${s.name}`}
              checked={Boolean(presentMap[s.student_id])}
              onChange={(e) =>
                setPresentMap((p) => ({
                  ...p,
                  [s.student_id]: e.currentTarget.checked,
                }))
              }
            />
          ))}
          {(!roster || roster.length === 0) && (
            <Text c="dimmed">No enrolled students found for this course.</Text>
          )}
        </Stack>

        <Group mt="md">
          <Button
            type="button"
            variant="light"
            onClick={() => {
              const allPresent = {};
              (roster || []).forEach((s) => {
                allPresent[s.student_id] = true;
              });
              setPresentMap(allPresent);
            }}
          >
            Mark all present
          </Button>
          <Button
            type="button"
            variant="light"
            onClick={() => setPresentMap({})}
          >
            Clear
          </Button>
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Paper>
  );
}

AttendanceForm.propTypes = {
  courseCode: PropTypes.string,
  isFaculty: PropTypes.bool,
  roster: PropTypes.array,
  onSubmit: PropTypes.func,
};

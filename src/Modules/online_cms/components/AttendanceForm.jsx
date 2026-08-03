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
  records = [],
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
    // For students, show a summary of their attendance (supports map or list response)
    let allRecords = [];
    if (Array.isArray(records)) {
      allRecords = records;
    } else if (records && typeof records === "object") {
      Object.keys(records).forEach((date) => {
        const entries = records[date] || [];
        entries.forEach((r) => {
          allRecords.push({ date, ...r });
        });
      });
    }

    const totalRecords = allRecords.length;
    const presentCount = allRecords.filter((r) => r.present).length;
    const absentCount = totalRecords - presentCount;

    return (
      <Paper p="md" shadow="xs">
        <Text size="xl" mb="xs">
          Attendance Summary
        </Text>
        <Text c="dimmed" mb="md">
          Your attendance records for this course.
        </Text>
        <Group gap="xl">
          <div>
            <Text size="lg" fw={500} c="green">
              {presentCount}
            </Text>
            <Text size="sm" c="dimmed">
              Present
            </Text>
          </div>
          <div>
            <Text size="lg" fw={500} c="red">
              {absentCount}
            </Text>
            <Text size="sm" c="dimmed">
              Absent
            </Text>
          </div>
          <div>
            <Text size="lg" fw={500}>
              {totalRecords}
            </Text>
            <Text size="sm" c="dimmed">
              Total Days
            </Text>
          </div>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper p="md" shadow="xs">
      <Text size="xl" mb="md">
        Mark Attendance
      </Text>
      {(!roster || roster.length === 0) && (
        <Text c="orange" mb="md">
          ⚠️ No students found in roster. Please check course enrollment.
        </Text>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!roster || roster.length === 0) {
            alert("No students available to mark attendance");
            return;
          }
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
          {(roster || []).length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No students to mark attendance
            </Text>
          ) : (
            (roster || []).map((s) => (
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
            ))
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
  records: PropTypes.object,
  onSubmit: PropTypes.func,
};

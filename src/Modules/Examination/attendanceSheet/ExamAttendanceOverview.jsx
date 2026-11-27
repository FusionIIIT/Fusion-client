import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Alert,
  Anchor,
  Badge,
  Box,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

import { attendanceSheetOverviewRoute } from "../routes/examinationRoutes";
import { formatDate, formatTime } from "./sheetModel";

const EXAM_LABELS = { MID: "Mid Sem", END: "End Sem" };

const count = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function CourseLink({ course, onOpen }) {
  return (
    <Anchor
      component="button"
      type="button"
      size="sm"
      ta="left"
      onClick={() => onOpen(course.id)}
    >
      {`${course.code} - ${course.name}`}
    </Anchor>
  );
}

CourseLink.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
};

// Every saved room of the term's exam, by date and time, and the courses
// still without a plan. Opening a course hands it to the room planner.
export default function ExamAttendanceOverview({
  academicYear,
  semesterType,
  exam,
  onOpen,
}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let live = true;
    setData(null);
    setError(null);
    axios
      .get(attendanceSheetOverviewRoute, {
        params: {
          academic_year: academicYear,
          semester_type: semesterType,
          exam,
        },
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      })
      .then((response) => {
        if (live) setData(response.data);
      })
      .catch((e) => {
        if (live) {
          setError(e.response?.data?.detail || "Could not load the overview.");
        }
      });
    return () => {
      live = false;
    };
  }, [academicYear, semesterType, exam]);

  if (error) return <Alert color="red">{error}</Alert>;
  if (!data) return <Loader size="sm" />;

  const label = EXAM_LABELS[exam];
  const shared = data.rooms.filter((r) => r.shares_with.length > 0).length;

  return (
    <Stack gap="md">
      <Group gap="xl">
        <Text fw={600}>{count(data.courses, "course")}</Text>
        <Text fw={600} c="green.8">
          {`${data.planned} planned`}
        </Text>
        <Text fw={600} c={data.unplanned.length ? "orange.8" : undefined}>
          {`${data.unplanned.length} not planned`}
        </Text>
        {shared > 0 && (
          <Text fw={600} c="red.7">
            {count(shared, "room shared", "rooms shared")}
          </Text>
        )}
      </Group>

      {data.rooms.length === 0 ? (
        <Text size="sm" c="dimmed">
          {`No rooms saved for ${label} in this term yet.`}
        </Text>
      ) : (
        <Box style={{ overflowX: "auto" }}>
          <Table striped miw={1000} verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Time</Table.Th>
                <Table.Th>Room</Table.Th>
                <Table.Th>Course</Table.Th>
                <Table.Th>S.No</Table.Th>
                <Table.Th>Students</Table.Th>
                <Table.Th>Instructor(s)</Table.Th>
                <Table.Th>Check</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.rooms.map((r) => (
                <Table.Tr
                  key={`${r.course.id}-${r.date}-${r.start_time}-${r.from_sno}`}
                >
                  <Table.Td>{formatDate(r.date)}</Table.Td>
                  <Table.Td style={{ whiteSpace: "nowrap" }}>
                    {`${formatTime(r.start_time)} - ${formatTime(r.end_time)}`}
                  </Table.Td>
                  <Table.Td fw={600}>{r.room}</Table.Td>
                  <Table.Td>
                    <CourseLink course={r.course} onOpen={onOpen} />
                  </Table.Td>
                  <Table.Td>{`${r.from_sno}-${r.to_sno}`}</Table.Td>
                  <Table.Td>{r.students}</Table.Td>
                  <Table.Td>{r.instructor_text}</Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {r.shares_with.length > 0 && (
                        <Badge color="red" variant="light" tt="none">
                          {`Also ${r.shares_with.join(", ")} at this time`}
                        </Badge>
                      )}
                      {r.roll_changed && (
                        <Badge color="yellow" variant="light" tt="none">
                          Roll list changed
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}

      <Stack gap={4}>
        <Title order={5}>{`Not planned for ${label}`}</Title>
        {data.unplanned.length === 0 ? (
          <Text size="sm" c="dimmed">
            {`Every course has a plan for ${label}.`}
          </Text>
        ) : (
          <Group gap="lg">
            {data.unplanned.map((c) => (
              <CourseLink key={c.id} course={c} onOpen={onOpen} />
            ))}
          </Group>
        )}
      </Stack>
    </Stack>
  );
}

ExamAttendanceOverview.propTypes = {
  academicYear: PropTypes.string.isRequired,
  semesterType: PropTypes.string.isRequired,
  exam: PropTypes.oneOf(["MID", "END"]).isRequired,
  onOpen: PropTypes.func.isRequired,
};

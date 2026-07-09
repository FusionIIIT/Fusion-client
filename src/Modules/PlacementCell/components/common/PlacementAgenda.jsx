import React from "react";
import PropTypes from "prop-types";
import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { differenceInCalendarDays, format } from "date-fns";
import { useNavigate } from "react-router-dom";

const parseValidDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// Relative countdown badge based on the drive / deadline date.
const countdownBadge = (date) => {
  const days = differenceInCalendarDays(date, new Date());
  if (days < 0) return { label: "Closed", color: "gray" };
  if (days === 0) return { label: "Today", color: "red" };
  if (days === 1) return { label: "1 day left", color: "orange" };
  if (days <= 7) return { label: `${days} days left`, color: "orange" };
  return { label: `in ${days} days`, color: "blue" };
};

const typeColor = (type) => {
  const value = (type || "").toUpperCase();
  if (value.includes("INTERN")) return "grape";
  if (value.includes("PBI")) return "indigo";
  if (value.includes("HIGHER")) return "teal";
  return "blue";
};

function AgendaRow({ event, isStudent, onOpen }) {
  const date = parseValidDate(event.placement_date);
  const countdown = date ? countdownBadge(date) : null;
  const eligible = event.eligible !== false;

  return (
    <Card
      withBorder
      radius="md"
      padding="sm"
      style={{ cursor: "pointer" }}
      onClick={() => onOpen(event.id)}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={2}>
          <Group gap="xs">
            <Text fw={600}>{event.company_name}</Text>
            <Badge size="sm" color={typeColor(event.placement_type)}>
              {event.placement_type || "Placement"}
            </Badge>
            {event.check && (
              <Badge size="sm" color="green" variant="light">
                Applied
              </Badge>
            )}
          </Group>
          <Text size="sm" c="dimmed">
            {[
              event.role_st,
              event.ctc ? `₹${event.ctc} LPA` : null,
              event.location,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </Stack>

        <Stack gap={4} align="flex-end">
          <Text size="sm">
            {date ? format(date, "EEE, dd MMM yyyy") : "Date TBA"}
            {event.time ? ` · ${event.time.slice(0, 5)}` : ""}
          </Text>
          <Group gap="xs">
            {isStudent && (
              <Badge
                size="sm"
                color={eligible ? "green" : "red"}
                variant="light"
              >
                {eligible ? "Eligible" : "Not eligible"}
              </Badge>
            )}
            {countdown && (
              <Badge size="sm" color={countdown.color}>
                {countdown.label}
              </Badge>
            )}
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}

AgendaRow.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,
    company_name: PropTypes.string,
    role_st: PropTypes.string,
    ctc: PropTypes.string,
    location: PropTypes.string,
    placement_type: PropTypes.string,
    placement_date: PropTypes.string,
    time: PropTypes.string,
    check: PropTypes.bool,
    eligible: PropTypes.bool,
  }).isRequired,
  isStudent: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
};

function Section({ title, events, isStudent, onOpen }) {
  if (events.length === 0) return null;
  return (
    <Stack gap="xs">
      <Title order={5} c="dimmed">
        {title} ({events.length})
      </Title>
      {events.map((event) => (
        <AgendaRow
          key={event.id}
          event={event}
          isStudent={isStudent}
          onOpen={onOpen}
        />
      ))}
    </Stack>
  );
}

Section.propTypes = {
  title: PropTypes.string.isRequired,
  events: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string }))
    .isRequired,
  isStudent: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
};

function PlacementAgenda({ data, isStudent }) {
  const navigate = useNavigate();
  const onOpen = (jobId) =>
    navigate(`/placement-cell/view?jobId=${encodeURIComponent(jobId)}`);

  const buckets = { today: [], week: [], upcoming: [], past: [] };
  const withDates = data
    .map((event) => ({ event, date: parseValidDate(event.placement_date) }))
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date - b.date;
    });

  withDates.forEach(({ event, date }) => {
    if (!date) {
      buckets.upcoming.push(event);
      return;
    }
    const days = differenceInCalendarDays(date, new Date());
    if (days < 0) buckets.past.push(event);
    else if (days === 0) buckets.today.push(event);
    else if (days <= 7) buckets.week.push(event);
    else buckets.upcoming.push(event);
  });

  // Most-recent first within the closed bucket.
  buckets.past.reverse();

  const isEmpty = data.length === 0;

  return (
    <Stack gap="lg" mt="md">
      {isEmpty ? (
        <Text ta="center" c="dimmed" mt="md">
          No placement events available.
        </Text>
      ) : (
        <>
          <Section
            title="Today"
            events={buckets.today}
            isStudent={isStudent}
            onOpen={onOpen}
          />
          <Section
            title="This Week"
            events={buckets.week}
            isStudent={isStudent}
            onOpen={onOpen}
          />
          <Section
            title="Upcoming"
            events={buckets.upcoming}
            isStudent={isStudent}
            onOpen={onOpen}
          />
          <Section
            title="Closed"
            events={buckets.past}
            isStudent={isStudent}
            onOpen={onOpen}
          />
        </>
      )}
    </Stack>
  );
}

PlacementAgenda.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })).isRequired,
  isStudent: PropTypes.bool.isRequired,
};

export default PlacementAgenda;

import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Alert,
  Badge,
  Button,
  Container,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { placementApi } from "../../services/api";
import {
  getAuthorizationErrorMessage,
  isForbiddenError,
  showApiError,
} from "../../utils/authorization";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Event categories drive the colour-coding and the legend below the calendar.
const CATEGORY = {
  drive: { label: "Drive", color: "#2f9e44" },
  test: { label: "Online Test", color: "#1c7ed6" },
  interview: { label: "Interview", color: "#7048e8" },
  deadline: { label: "Deadline", color: "#e03131" },
  other: { label: "Other", color: "#868e96" },
};

// Classify a round's free-text type into one of the legend categories.
const categorise = (type, round) => {
  const value = (type || "").toLowerCase();
  if (value.includes("interview")) return "interview";
  if (
    value.includes("test") ||
    value.includes("online") ||
    value.includes("written") ||
    value.includes("aptitude") ||
    value.includes("coding")
  ) {
    return "test";
  }
  if (!round) return "drive";
  return "other";
};

const parseValidDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

function PlacementCalendar() {
  const [events, setEvents] = useState([]);
  const [authorizationError, setAuthorizationError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        // Recruitment rounds (drives, tests, interviews) come from the calendar
        // endpoint; application deadlines come from the schedule list so the
        // calendar shows the whole placement timeline in one place.
        const [calendarRes, scheduleRes] = await Promise.all([
          placementApi.getCalendarEvents(),
          placementApi.getPlacementSchedule().catch(() => ({ data: [] })),
        ]);

        const rounds = Array.isArray(calendarRes.data?.schedule_data)
          ? calendarRes.data.schedule_data
          : [];

        const roundEvents = rounds
          .map((item) => {
            const start = parseValidDate(item.date);
            if (!start) return null;
            const end = parseValidDate(item.end_datetime) || start;
            const category = categorise(item.type, item.round);
            return {
              id: `round-${item.id}-${item.round}`,
              jobId: item.id,
              title: `${item.company_name} — ${
                item.round ? `Round ${item.round}` : "Drive"
              }`,
              start,
              end,
              category,
              company: item.company_name,
              round: item.round,
              type: item.type,
              mode: item.mode,
              locationLink: item.location_link,
              description: item.description,
            };
          })
          .filter(Boolean);

        const schedule = Array.isArray(scheduleRes.data)
          ? scheduleRes.data
          : [];
        const deadlineEvents = schedule
          .map((item) => {
            const start = parseValidDate(item.placement_date);
            if (!start) return null;
            return {
              id: `deadline-${item.id}`,
              jobId: item.id,
              title: `${item.company_name} — Apply by`,
              start,
              end: start,
              allDay: true,
              category: "deadline",
              company: item.company_name,
              type: "Application deadline",
              description: item.role_st || item.description,
            };
          })
          .filter(Boolean);

        setEvents([...roundEvents, ...deadlineEvents]);
      } catch (error) {
        if (isForbiddenError(error)) {
          setAuthorizationError(
            getAuthorizationErrorMessage(
              error,
              "You are not authorized to view the placement calendar.",
            ),
          );
        }
        showApiError({
          error,
          fallback: "Failed to fetch placement calendar.",
          authorizationFallback:
            "You are not authorized to view the placement calendar.",
        });
      }
    }

    fetchData();
  }, []);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: (CATEGORY[event.category] || CATEGORY.other).color,
      borderRadius: 4,
      border: "none",
      color: "#fff",
      fontSize: "0.8rem",
    },
  });

  return (
    <Container fluid mt={32}>
      <Group justify="space-between" mb={16}>
        <Title order={2}>Placement Calendar</Title>
        <Group gap="xs">
          {Object.values(CATEGORY).map((category) => (
            <Badge
              key={category.label}
              variant="filled"
              styles={{ root: { backgroundColor: category.color } }}
            >
              {category.label}
            </Badge>
          ))}
        </Group>
      </Group>

      {authorizationError ? (
        <Alert color="red" title="Authorization Error">
          {authorizationError}
        </Alert>
      ) : (
        <div style={{ height: "72vh" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
            defaultView={Views.MONTH}
            popup
            tooltipAccessor={(event) =>
              [event.type, event.mode].filter(Boolean).join(" · ") ||
              event.title
            }
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedEvent(event)}
          />
        </div>
      )}

      <Modal
        opened={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.company}
        centered
      >
        {selectedEvent && (
          <Stack gap="xs">
            <Group gap="xs">
              <Badge
                styles={{
                  root: {
                    backgroundColor: (
                      CATEGORY[selectedEvent.category] || CATEGORY.other
                    ).color,
                  },
                }}
              >
                {(CATEGORY[selectedEvent.category] || CATEGORY.other).label}
              </Badge>
              {selectedEvent.round ? (
                <Text size="sm">Round {selectedEvent.round}</Text>
              ) : null}
            </Group>
            {selectedEvent.type && (
              <Text size="sm">
                <strong>Type:</strong> {selectedEvent.type}
              </Text>
            )}
            <Text size="sm">
              <strong>When:</strong>{" "}
              {format(selectedEvent.start, "EEE, dd MMM yyyy")}
              {selectedEvent.allDay
                ? ""
                : ` · ${format(selectedEvent.start, "p")}`}
            </Text>
            {selectedEvent.mode && (
              <Text size="sm">
                <strong>Mode:</strong> {selectedEvent.mode}
              </Text>
            )}
            {selectedEvent.locationLink && (
              <Text size="sm" style={{ wordBreak: "break-all" }}>
                <strong>Venue / Link:</strong> {selectedEvent.locationLink}
              </Text>
            )}
            {selectedEvent.description && (
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {selectedEvent.description}
              </Text>
            )}
            <Group justify="flex-end" mt="sm">
              <Button
                variant="light"
                onClick={() => {
                  const { jobId } = selectedEvent;
                  setSelectedEvent(null);
                  navigate(
                    `/placement-cell/timeline?jobId=${encodeURIComponent(jobId)}`,
                  );
                }}
              >
                Open timeline
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

export default PlacementCalendar;

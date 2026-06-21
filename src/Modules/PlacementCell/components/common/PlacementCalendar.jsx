import React, { useState, useEffect, useCallback } from "react";
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
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
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

// Event categories drive the colour-coding and the legend.
const CATEGORY = {
  event: { label: "Event", color: "#0c8599" },
  drive: { label: "Drive", color: "#2f9e44" },
  test: { label: "Online Test", color: "#1c7ed6" },
  interview: { label: "Interview", color: "#7048e8" },
  deadline: { label: "Deadline", color: "#e03131" },
  other: { label: "Other", color: "#868e96" },
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const PLACEMENT_ADMIN_ROLES = ["placement officer", "placement chairman"];

// Classify a recruitment round's free-text type into a legend category.
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

const pad = (n) => String(n).padStart(2, "0");

// Date -> value for a datetime-local input (local time, no seconds).
const toLocalInput = (value) => {
  const date = value instanceof Date ? value : parseValidDate(value);
  if (!date) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const emptyForm = {
  id: null,
  title: "",
  start: "",
  end: "",
  allDay: false,
  category: "event",
  location: "",
  description: "",
};

function PlacementCalendar() {
  const role = useSelector((state) => state.user.role);
  const canManage = PLACEMENT_ADMIN_ROLES.includes(role);

  const [events, setEvents] = useState([]);
  const [authorizationError, setAuthorizationError] = useState("");
  const [detailEvent, setDetailEvent] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      // Recruitment rounds + application deadlines (derived, read-only) plus the
      // free-form calendar events the placement cell adds directly.
      const [calendarRes, scheduleRes, manualRes] = await Promise.all([
        placementApi.getCalendarEvents().catch(() => ({ data: {} })),
        placementApi.getPlacementSchedule().catch(() => ({ data: [] })),
        placementApi.listCalendarEvents().catch(() => ({ data: [] })),
      ]);

      const rounds = Array.isArray(calendarRes.data?.schedule_data)
        ? calendarRes.data.schedule_data
        : [];
      const roundEvents = rounds
        .map((item) => {
          const start = parseValidDate(item.date);
          if (!start) return null;
          return {
            id: `round-${item.id}-${item.round}`,
            jobId: item.id,
            title: `${item.company_name} — ${
              item.round ? `Round ${item.round}` : "Drive"
            }`,
            start,
            end: parseValidDate(item.end_datetime) || start,
            category: categorise(item.type, item.round),
            company: item.company_name,
            round: item.round,
            type: item.type,
            mode: item.mode,
            locationLink: item.location_link,
            description: item.description,
            manual: false,
          };
        })
        .filter(Boolean);

      const schedule = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];
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
            manual: false,
          };
        })
        .filter(Boolean);

      const manual = Array.isArray(manualRes.data) ? manualRes.data : [];
      const manualEvents = manual
        .map((item) => {
          const start = parseValidDate(item.start);
          if (!start) return null;
          return {
            id: `event-${item.id}`,
            eventId: item.id,
            title: item.title,
            start,
            end: parseValidDate(item.end) || start,
            allDay: item.all_day,
            category: item.category || "event",
            type: CATEGORY[item.category]?.label || "Event",
            locationLink: item.location,
            description: item.description,
            manual: true,
          };
        })
        .filter(Boolean);

      setEvents([...roundEvents, ...deadlineEvents, ...manualEvents]);
      setAuthorizationError("");
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: (CATEGORY[event.category] || CATEGORY.other).color,
      borderRadius: 4,
      border: "none",
      color: "#fff",
      fontSize: "0.8rem",
    },
  });

  const openCreate = (start, end) => {
    if (!canManage) return;
    setForm({
      ...emptyForm,
      start: toLocalInput(start),
      end: toLocalInput(end && end > start ? end : start),
    });
    setFormOpen(true);
  };

  const openEdit = (event) => {
    setForm({
      id: event.eventId,
      title: event.title,
      start: toLocalInput(event.start),
      end: toLocalInput(event.end),
      allDay: Boolean(event.allDay),
      category: event.category || "event",
      location: event.locationLink || "",
      description: event.description || "",
    });
    setFormOpen(true);
  };

  const handleSelectEvent = (event) => {
    if (event.manual && canManage) {
      openEdit(event);
    } else {
      setDetailEvent(event);
    }
  };

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.start) {
      notifications.show({
        title: "Missing fields",
        message: "A title and a start date/time are required.",
        color: "red",
      });
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      start: form.start,
      end: form.end || null,
      all_day: form.allDay,
      category: form.category,
      location: form.location.trim(),
    };
    setIsSaving(true);
    try {
      if (form.id) {
        await placementApi.updateCalendarEvent(form.id, payload);
      } else {
        await placementApi.createCalendarEvent(payload);
      }
      notifications.show({
        title: "Saved",
        message: "Calendar event saved successfully.",
        color: "green",
      });
      setFormOpen(false);
      setForm(emptyForm);
      await fetchData();
    } catch (error) {
      showApiError({
        error,
        fallback: "Failed to save the calendar event.",
        authorizationFallback:
          "Only placement officer and chairman users can manage calendar events.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setIsSaving(true);
    try {
      await placementApi.deleteCalendarEvent(form.id);
      notifications.show({
        title: "Deleted",
        message: "Calendar event removed.",
        color: "green",
      });
      setFormOpen(false);
      setForm(emptyForm);
      await fetchData();
    } catch (error) {
      showApiError({
        error,
        fallback: "Failed to delete the calendar event.",
        authorizationFallback:
          "Only placement officer and chairman users can manage calendar events.",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
          {canManage && (
            <Button size="xs" onClick={() => openCreate(new Date(), null)}>
              Add Event
            </Button>
          )}
        </Group>
      </Group>

      {canManage && (
        <Text size="xs" c="dimmed" mb="sm">
          Click any date or time slot to add an event. Click one of your events
          to edit or delete it.
        </Text>
      )}

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
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            defaultView={Views.MONTH}
            popup
            selectable={canManage}
            onSelectSlot={(slot) => openCreate(slot.start, slot.end)}
            tooltipAccessor={(event) =>
              [event.type, event.mode].filter(Boolean).join(" · ") ||
              event.title
            }
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      )}

      {/* Read-only detail for derived (drive/deadline) events */}
      <Modal
        opened={Boolean(detailEvent)}
        onClose={() => setDetailEvent(null)}
        title={detailEvent?.company || detailEvent?.title}
        centered
      >
        {detailEvent && (
          <Stack gap="xs">
            <Group gap="xs">
              <Badge
                styles={{
                  root: {
                    backgroundColor: (
                      CATEGORY[detailEvent.category] || CATEGORY.other
                    ).color,
                  },
                }}
              >
                {(CATEGORY[detailEvent.category] || CATEGORY.other).label}
              </Badge>
              {detailEvent.round ? (
                <Text size="sm">Round {detailEvent.round}</Text>
              ) : null}
            </Group>
            {detailEvent.type && (
              <Text size="sm">
                <strong>Type:</strong> {detailEvent.type}
              </Text>
            )}
            <Text size="sm">
              <strong>When:</strong>{" "}
              {format(detailEvent.start, "EEE, dd MMM yyyy")}
              {detailEvent.allDay ? "" : ` · ${format(detailEvent.start, "p")}`}
            </Text>
            {detailEvent.mode && (
              <Text size="sm">
                <strong>Mode:</strong> {detailEvent.mode}
              </Text>
            )}
            {detailEvent.locationLink && (
              <Text size="sm" style={{ wordBreak: "break-all" }}>
                <strong>Venue / Link:</strong> {detailEvent.locationLink}
              </Text>
            )}
            {detailEvent.description && (
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {detailEvent.description}
              </Text>
            )}
            {detailEvent.jobId && (
              <Group justify="flex-end" mt="sm">
                <Button
                  variant="light"
                  onClick={() => {
                    const { jobId } = detailEvent;
                    setDetailEvent(null);
                    navigate(
                      `/placement-cell/timeline?jobId=${encodeURIComponent(jobId)}`,
                    );
                  }}
                >
                  Open timeline
                </Button>
              </Group>
            )}
          </Stack>
        )}
      </Modal>

      {/* Create / edit form for free-form events (TPO only) */}
      <Modal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        title={form.id ? "Edit Event" : "Add Event"}
        centered
      >
        <Stack gap="sm">
          <TextInput
            label="Title"
            placeholder="e.g. Pre-placement talk"
            value={form.title}
            onChange={(e) => updateField("title", e.currentTarget.value)}
            required
          />
          <Select
            label="Category"
            data={CATEGORY_OPTIONS}
            value={form.category}
            onChange={(value) => updateField("category", value || "event")}
          />
          <TextInput
            type="datetime-local"
            label="Start"
            value={form.start}
            onChange={(e) => updateField("start", e.currentTarget.value)}
            required
          />
          <TextInput
            type="datetime-local"
            label="End"
            value={form.end}
            min={form.start || undefined}
            onChange={(e) => updateField("end", e.currentTarget.value)}
          />
          <Switch
            label="All-day event"
            checked={form.allDay}
            onChange={(e) => updateField("allDay", e.currentTarget.checked)}
          />
          <TextInput
            label="Venue / Link"
            placeholder="Optional"
            value={form.location}
            onChange={(e) => updateField("location", e.currentTarget.value)}
          />
          <Textarea
            label="Description"
            placeholder="Optional"
            value={form.description}
            onChange={(e) => updateField("description", e.currentTarget.value)}
            autosize
            minRows={2}
          />
          <Group justify="space-between" mt="xs">
            {form.id ? (
              <Button
                color="red"
                variant="light"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Group>
              <Button
                variant="default"
                onClick={() => setFormOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} loading={isSaving}>
                Save
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default PlacementCalendar;

/**
 * NotificationItem — single notification row.
 *
 * Features:
 *  - Unread indicator (blue left border + background)
 *  - Module badge + sender chip
 *  - Relative timestamp ("2 h ago")
 *  - Click verb/row → marks as read via openNotification() and follows deep link
 *  - Action buttons: mark read/unread, delete
 */

import PropTypes from "prop-types";
import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { Check, ArrowCounterClockwise, Archive, ArrowSquareOut } from "@phosphor-icons/react";
import { openNotification } from "../api";

/* ── helpers ────────────────────────────────────────────────────────────────── */

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return "just now";
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d} d ago`;
  return new Date(iso).toLocaleDateString();
}

const MODULE_COLORS = {
  "Leave Module":               "blue",
  "Central Mess":               "orange",
  "Visitor's Hostel":           "teal",
  "Healthcare Center":          "red",
  "File Tracking":              "grape",
  "Scholarship Portal":         "yellow",
  "Complaint System":           "pink",
  "Placement Cell":             "indigo",
  "Academic's Module":          "cyan",
  "Office of Dean PnD Module":  "lime",
  "Office Module":              "violet",
  "Gymkhana Module":            "green",
  "Assistantship Request":      "brown",
  "department":                 "gray",
  "Research Procedures":        "dark",
};

/* ── component ──────────────────────────────────────────────────────────────── */

export default function NotificationItem({
  notification,
  onMarkRead,
  onMarkUnread,
  onDelete,
}) {
  const { id, verb, description, timestamp, unread, module, url, sender } =
    notification;
  const [navigating, setNavigating] = useState(false);

  const moduleColor = MODULE_COLORS[module] || "gray";

  const handleOpen = async () => {
    if (navigating) return;
    setNavigating(true);
    try {
      const deepLink = await openNotification(id);
      // optimistically mark read in parent
      if (unread) onMarkRead(id);
      if (deepLink && deepLink !== "#") {
        window.location.href = deepLink;
      }
    } catch {
      // ignore navigation errors silently
    } finally {
      setNavigating(false);
    }
  };

  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      style={{
        background: unread ? "var(--mantine-color-blue-0)" : "var(--mantine-color-body)",
        borderLeft: unread
          ? "4px solid var(--mantine-color-blue-5)"
          : "4px solid transparent",
        transition: "background 0.2s",
      }}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start" gap="sm">
        {/* ── Left: content ── */}
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          {/* Module + sender row */}
          <Group gap={6} wrap="wrap">
            {module && (
              <Badge size="xs" color={moduleColor} variant="light">
                {module}
              </Badge>
            )}
            {unread && (
              <Badge size="xs" color="blue" variant="filled">
                New
              </Badge>
            )}
            {sender?.full_name && (
              <Text size="xs" c="dimmed">
                from <b>{sender.full_name}</b>
              </Text>
            )}
          </Group>

          {/* Verb — clickable to follow deep link */}
          <Box
            onClick={handleOpen}
            style={{ cursor: url && url !== "#" ? "pointer" : "default" }}
          >
            <Group gap={4} wrap="nowrap" align="flex-start">
              <Text
                fw={unread ? 600 : 400}
                size="sm"
                lineClamp={3}
                style={{ flex: 1 }}
              >
                {verb}
              </Text>
              {navigating ? (
                <Loader size={12} />
              ) : url && url !== "#" ? (
                <ArrowSquareOut
                  size={13}
                  color="var(--mantine-color-blue-5)"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
              ) : null}
            </Group>
          </Box>

          {/* Description */}
          {description && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {description}
            </Text>
          )}

          {/* Timestamp */}
          <Text size="xs" c="dimmed" title={new Date(timestamp).toLocaleString()}>
            {relativeTime(timestamp)}
          </Text>
        </Stack>

        {/* ── Right: action buttons ── */}
        <Group gap={2} wrap="nowrap" style={{ flexShrink: 0 }}>
          {unread ? (
            <Tooltip label="Mark as read" withArrow position="top">
              <ActionIcon
                variant="subtle"
                color="green"
                size="sm"
                onClick={() => onMarkRead(id)}
              >
                <Check size={14} weight="bold" />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Tooltip label="Mark as unread" withArrow position="top">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                onClick={() => onMarkUnread(id)}
              >
                <ArrowCounterClockwise size={14} weight="bold" />
              </ActionIcon>
            </Tooltip>
          )}
          {/* BR-NT-09: Archive instead of permanent delete */}
          <Tooltip label="Archive (retained 180 days)" withArrow position="top">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => onDelete(id)}
            >
              <Archive size={14} weight="bold" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id:          PropTypes.number.isRequired,
    verb:        PropTypes.string.isRequired,
    description: PropTypes.string,
    timestamp:   PropTypes.string.isRequired,
    unread:      PropTypes.bool.isRequired,
    module:      PropTypes.string,
    url:         PropTypes.string,
    sender:      PropTypes.shape({
      full_name: PropTypes.string,
      username:  PropTypes.string,
    }),
  }).isRequired,
  onMarkRead:   PropTypes.func.isRequired,
  onMarkUnread: PropTypes.func.isRequired,
  onDelete:     PropTypes.func.isRequired,
};

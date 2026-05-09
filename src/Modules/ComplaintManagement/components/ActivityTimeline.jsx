import React from "react";
import { Flex, Text, Badge, Timeline, ThemeIcon } from "@mantine/core";
import {
  ClockClockwise,
  ArrowUp,
  CheckCircle,
  XCircle,
  ArrowCounterClockwise,
  Warning,
  UserCircle,
} from "@phosphor-icons/react";
import PropTypes from "prop-types";

const ACTION_CONFIG = {
  COMPLAINT_SUBMITTED: { color: "blue", icon: ClockClockwise, label: "Submitted" },
  COMPLAINT_UPDATED: { color: "cyan", icon: ClockClockwise, label: "Updated" },
  PROGRESS_UPDATE: { color: "indigo", icon: ArrowUp, label: "Progress Update" },
  MANUAL_ESCALATION: { color: "orange", icon: Warning, label: "Escalated (Manual)" },
  AUTO_ESCALATION: { color: "red", icon: Warning, label: "Escalated (Auto)" },
  COMPLAINT_CLOSED: { color: "green", icon: CheckCircle, label: "Closed" },
  COMPLAINT_REOPENED: { color: "yellow", icon: ArrowCounterClockwise, label: "Reopened" },
  FEEDBACK_SUBMITTED: { color: "teal", icon: UserCircle, label: "Feedback" },
  SLA_REMINDER: { color: "orange", icon: Warning, label: "SLA Reminder" },
  ADMIN_ASSIGN: { color: "grape", icon: UserCircle, label: "Admin Reassigned" },
  REOPEN_REQUESTED: { color: "yellow", icon: ArrowCounterClockwise, label: "Reopen Requested" },
  REOPEN_DENIED: { color: "red", icon: XCircle, label: "Reopen Denied" },
  AUTO_ESCALATION_FAILED: { color: "red", icon: Warning, label: "Escalation Failed" },
};

const STATUS_MAP = {
  0: "Pending",
  1: "In Progress",
  2: "Resolved",
  3: "Declined",
  4: "Escalated",
  5: "Closed",
  6: "Reopened",
};

function formatTimestamp(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityTimeline({ activityLogs }) {
  if (!activityLogs || activityLogs.length === 0) {
    return (
      <Text size="sm" color="dimmed" align="center">
        No activity recorded yet.
      </Text>
    );
  }

  return (
    <Timeline active={activityLogs.length - 1} bulletSize={28} lineWidth={2}>
      {activityLogs.map((log) => {
        const config = ACTION_CONFIG[log.action] || {
          color: "gray",
          icon: ClockClockwise,
          label: log.action,
        };
        const IconComp = config.icon;

        return (
          <Timeline.Item
            key={log.id}
            bullet={
              <ThemeIcon size={28} variant="filled" color={config.color} radius="xl">
                <IconComp size={16} weight="bold" />
              </ThemeIcon>
            }
            title={
              <Flex gap="xs" align="center">
                <Text size="sm" weight={600}>
                  {config.label}
                </Text>
                {log.previous_status !== null && log.new_status !== null && (
                  <Badge size="xs" variant="outline">
                    {STATUS_MAP[log.previous_status] || log.previous_status} →{" "}
                    {STATUS_MAP[log.new_status] || log.new_status}
                  </Badge>
                )}
              </Flex>
            }
          >
            <Text color="dimmed" size="xs">
              {formatTimestamp(log.timestamp)}
            </Text>
            {log.details && (
              <Text size="sm" mt={4}>
                {log.details}
              </Text>
            )}
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
}

ActivityTimeline.propTypes = {
  activityLogs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      action: PropTypes.string,
      previous_status: PropTypes.number,
      new_status: PropTypes.number,
      details: PropTypes.string,
      timestamp: PropTypes.string,
    }),
  ),
};

export default ActivityTimeline;

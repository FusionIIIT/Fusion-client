/**
 * PreferenceToggle — one row in the preferences list.
 * Shows a coloured module badge, a short description, and an enable/disable Switch.
 */

import PropTypes from "prop-types";
import { Badge, Group, Stack, Switch, Text } from "@mantine/core";

/* Short descriptions per module */
const MODULE_META = {
  "Leave Module":               { color: "blue",   desc: "Leave applications, approvals & withdrawals" },
  "Central Mess":               { color: "orange", desc: "Menu changes, feedback & committee updates" },
  "Visitor's Hostel":           { color: "teal",   desc: "Booking confirmations & cancellations" },
  "Healthcare Center":          { color: "red",    desc: "Appointments, ambulance & prescriptions" },
  "File Tracking":              { color: "grape",  desc: "Inward file & document routing" },
  "Scholarship Portal":         { color: "yellow", desc: "Medal & MCM form status updates" },
  "Complaint System":           { color: "pink",   desc: "New complaints & status changes" },
  "Placement Cell":             { color: "indigo", desc: "Placement drives & announcements" },
  "Academic's Module":          { color: "cyan",   desc: "Academic notices & events" },
  "Office of Dean PnD Module":  { color: "lime",   desc: "Requisitions & project assignments" },
  "Office Module":              { color: "violet", desc: "Dean Students & RSPC office updates" },
  "Gymkhana Module":            { color: "green",  desc: "Voting, sessions & club events" },
  "Assistantship Request":      { color: "brown",  desc: "Assistantship claim approvals & routing" },
  "department":                 { color: "gray",   desc: "Department-level notices" },
  "Research Procedures":        { color: "dark",   desc: "Patent submissions & approvals" },
};

export default function PreferenceToggle({ module, isEnabled, onChange, loading }) {
  const meta = MODULE_META[module] ?? { color: "gray", desc: "" };

  return (
    <Group justify="space-between" py="sm" px="md" wrap="nowrap">
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Group gap={8}>
          <Badge size="xs" color={meta.color} variant="light">
            {module}
          </Badge>
        </Group>
        {meta.desc && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {meta.desc}
          </Text>
        )}
      </Stack>
      <Switch
        checked={isEnabled}
        onChange={(e) => onChange(module, e.currentTarget.checked)}
        disabled={loading}
        color="blue"
        size="sm"
      />
    </Group>
  );
}

PreferenceToggle.propTypes = {
  module:    PropTypes.string.isRequired,
  isEnabled: PropTypes.bool.isRequired,
  onChange:  PropTypes.func.isRequired,
  loading:   PropTypes.bool,
};

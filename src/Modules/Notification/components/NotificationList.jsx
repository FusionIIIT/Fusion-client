/**
 * NotificationList — wraps multiple NotificationItem rows.
 * Shows a contextual empty state depending on whether the inbox is
 * filtered by module/unread or simply empty overall.
 */

import PropTypes from "prop-types";
import { Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { BellSlash } from "@phosphor-icons/react";
import NotificationItem from "./NotificationItem";

export default function NotificationList({
  notifications,
  onMarkRead,
  onMarkUnread,
  onDelete,
  emptyMessage,
}) {
  if (!notifications.length) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <ThemeIcon size={56} radius="xl" variant="light" color="gray">
            <BellSlash size={28} weight="duotone" />
          </ThemeIcon>
          <Text c="dimmed" size="sm" ta="center">
            {emptyMessage ?? "No notifications"}
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="xs">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onMarkRead={onMarkRead}
          onMarkUnread={onMarkUnread}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}

NotificationList.propTypes = {
  notifications: PropTypes.array.isRequired,
  onMarkRead:    PropTypes.func.isRequired,
  onMarkUnread:  PropTypes.func.isRequired,
  onDelete:      PropTypes.func.isRequired,
  emptyMessage:  PropTypes.string,
};

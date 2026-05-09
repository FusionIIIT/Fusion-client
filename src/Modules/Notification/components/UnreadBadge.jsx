/**
 * UnreadBadge — shows the number of unread notifications.
 * Returns null when count is 0.
 */

import PropTypes from "prop-types";
import { Badge } from "@mantine/core";

export default function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <Badge color="red" size="sm" variant="filled" radius="xl">
      {count > 99 ? "99+" : count}
    </Badge>
  );
}

UnreadBadge.propTypes = {
  count: PropTypes.number.isRequired,
};

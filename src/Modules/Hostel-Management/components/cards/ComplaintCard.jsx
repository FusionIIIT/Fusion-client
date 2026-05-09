import React from "react";
import { Text, Paper, SimpleGrid, Badge } from "@mantine/core";
import PropTypes from "prop-types";

function ComplaintCard({
  complaint_id,
  hall_name,
  roll_number,
  category,
  description,
  contact_number,
  image_upload,
  status,
  created_at,
  updated_at,
}) {
  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const getStatusMeta = (value) => {
    if (!value) return null;
    const normalized = String(value).toLowerCase();
    if (normalized === "resolved" || normalized === "paid") {
      return { color: "teal", label: "Resolved" };
    }
    if (normalized === "in_progress" || normalized === "in progress") {
      return { color: "blue", label: "In Progress" };
    }
    if (normalized === "assigned") {
      return { color: "grape", label: "Assigned" };
    }
    if (normalized === "open") {
      return { color: "orange", label: "Open" };
    }
    return { color: "gray", label: String(value) };
  };

  const statusMeta = getStatusMeta(status);

  return (
    <Paper withBorder radius="md" p="sm">
      <SimpleGrid cols={7} spacing="md" verticalSpacing={6}>
        <Text size="sm">{complaint_id ?? "-"}</Text>
        <Text size="sm">{hall_name || "-"}</Text>
        <Text size="sm">{roll_number || "-"}</Text>
        <Text size="sm">{category || "-"}</Text>
        <Text size="sm" style={{ wordBreak: "break-word" }}>
          {description || "-"}
        </Text>
        <Text size="sm">{contact_number || "-"}</Text>

        <div>
          {statusMeta ? (
            <Badge color={statusMeta.color} variant="filled" size="sm">
              {statusMeta.label}
            </Badge>
          ) : (
            <Text size="sm">-</Text>
          )}
          <Text size="xs" color="dimmed" mt={6}>
            {formatDateTime(created_at)}
          </Text>
          {image_upload && (
            <Text
              size="xs"
              component="a"
              href={image_upload}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              Attachment
            </Text>
          )}
          {updated_at && updated_at !== created_at && (
            <Text size="xs" color="dimmed">
              Updated: {formatDateTime(updated_at)}
            </Text>
          )}
        </div>
      </SimpleGrid>
    </Paper>
  );
}

ComplaintCard.propTypes = {
  complaint_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  hall_name: PropTypes.string,
  roll_number: PropTypes.string,
  category: PropTypes.string,
  description: PropTypes.string,
  contact_number: PropTypes.string,
  image_upload: PropTypes.string,
  status: PropTypes.string,
  created_at: PropTypes.string,
  updated_at: PropTypes.string,
};

export default ComplaintCard;

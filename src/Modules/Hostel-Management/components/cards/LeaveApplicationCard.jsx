import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Text,
  Group,
  Badge,
  Flex,
  Stack,
  Button,
  Divider,
  useMantineTheme,
} from "@mantine/core";
import {
  CalendarBlank,
  Phone,
  Notepad,
  Paperclip,
} from "@phosphor-icons/react";

export default function LeaveApplicationCard({
  id = null,
  student_name = "",
  roll_num = "",
  reason = "",
  phone_number = "",
  start_date = "",
  end_date = "",
  status = "pending",
  remark = "",
  file_upload = null,
  onViewDocument = null,
  documentLoading = false,
} = {}) {
  const theme = useMantineTheme();
  const iconColor = theme.colors.blue[6];

  const getStatusColor = (currStatus) => {
    switch (currStatus.toLowerCase()) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "yellow";
    }
  };

  const getDuration = (start, end) => {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
      return "";
    const diffDays =
      Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const days = Math.max(1, diffDays);
    return `${days} day${days > 1 ? "s" : ""}`;
  };

  const fileName =
    typeof file_upload === "string" && file_upload
      ? file_upload.split("/").pop()
      : null;

  return (
    <Box p="md">
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        gap="md"
      >
        <Stack gap={6} style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="xs" wrap="wrap">
              <Text fw={600} size="sm">
                {student_name}
              </Text>
              <Badge size="xs" variant="light" color="blue">
                {roll_num}
              </Badge>
            </Group>

            <Badge
              color={getStatusColor(status)}
              variant="filled"
              size="sm"
              radius="sm"
            >
              {String(status || "").toUpperCase()}
            </Badge>
          </Group>

          <Group gap="lg" wrap="wrap">
            <Group gap={6}>
              <CalendarBlank size={14} color={iconColor} />
              <Text size="xs">
                {start_date} – {end_date}
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {getDuration(start_date, end_date)}
            </Text>
            {phone_number ? (
              <Group gap={6}>
                <Phone size={14} color={iconColor} />
                <Text size="xs">{phone_number}</Text>
              </Group>
            ) : null}
          </Group>

          <Divider my={4} />

          <Text size="xs" c="dimmed">
            Reason
          </Text>
          <Text size="sm">{reason}</Text>

          {remark ? (
            <Group gap={6} mt={4} align="flex-start" wrap="nowrap">
              <Notepad size={14} color={iconColor} />
              <Text size="xs" c="dimmed">
                Remark:{" "}
                <Text component="span" fw={500}>
                  {remark}
                </Text>
              </Text>
            </Group>
          ) : null}

          {fileName ? (
            <Group gap="xs" mt={6} justify="space-between" wrap="wrap">
              <Group gap={6}>
                <Paperclip size={14} color={iconColor} />
                <Text size="xs" c="dimmed">
                  Document:{" "}
                  <Text component="span" fw={500}>
                    {fileName}
                  </Text>
                </Text>
              </Group>
              <Button
                size="xs"
                variant="subtle"
                loading={documentLoading}
                disabled={!id || typeof onViewDocument !== "function"}
                onClick={() => onViewDocument?.(id)}
              >
                View document
              </Button>
            </Group>
          ) : null}
        </Stack>
      </Flex>
    </Box>
  );
}

LeaveApplicationCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  student_name: PropTypes.string,
  roll_num: PropTypes.string,
  reason: PropTypes.string,
  phone_number: PropTypes.string,
  start_date: PropTypes.string,
  end_date: PropTypes.string,
  status: PropTypes.string,
  remark: PropTypes.string,
  file_upload: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onViewDocument: PropTypes.func,
  documentLoading: PropTypes.bool,
};

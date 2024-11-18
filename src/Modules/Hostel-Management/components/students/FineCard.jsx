import React from "react";
import {
  Paper,
  Text,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  Flex,
  Divider,
} from "@mantine/core";
import {
  IconCurrencyRupee,
  IconUser,
  IconBuilding,
  IconFileDescription,
} from "@tabler/icons-react";

const defaultProps = {
  fine_id: "",
  student_name: "Unknown",
  hall: "Unknown Hall",
  amount: 0,
  status: "Pending",
  reason: "No reason provided",
  isPastFine: false,
};

export default function FineCard(props = defaultProps) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "green";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };
  const { student_name, hall, amount, status, reason, isPastFine } = {
    ...defaultProps,
    ...props,
  };
  return (
    <Paper
      radius="md"
      withBorder
      p="lg"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: theme.shadows.md,
        },
      })}
    >
      <Stack spacing="md">
        <Flex justify="space-between" align="center">
          <Group spacing="xs">
            <ThemeIcon color="red" size={40} radius="md">
              <IconCurrencyRupee size={24} />
            </ThemeIcon>
            <Text weight={700} size="xl" color="red">
              ₹{amount.toLocaleString()}
            </Text>
          </Group>
          <Badge
            color={getStatusColor(status)}
            size="lg"
            variant="filled"
            sx={{
              textTransform: "uppercase",
              minWidth: "80px",
              textAlign: "center",
            }}
          >
            {status}
          </Badge>
        </Flex>

        <Divider />

        <Group grow>
          <Flex align="center">
            <ThemeIcon color="blue" size={30} radius="md" mr="xs">
              <IconUser size={18} />
            </ThemeIcon>
            <Text size="sm" weight={500}>
              {student_name}
            </Text>
          </Flex>
          <Flex align="center">
            <ThemeIcon color="grape" size={30} radius="md" mr="xs">
              <IconBuilding size={18} />
            </ThemeIcon>
            <Text size="sm" weight={500}>
              {hall}
            </Text>
          </Flex>
        </Group>

        <Paper withBorder p="sm" radius="md" bg="gray.0">
          <Flex align="center" mb="xs">
            <ThemeIcon color="orange" size={30} radius="md" mr="xs">
              <IconFileDescription size={18} />
            </ThemeIcon>
            <Text weight={500} size="sm">
              Reason
            </Text>
          </Flex>
          <Text size="sm" color="dimmed" style={{ lineHeight: 1.6 }}>
            {reason}
          </Text>
        </Paper>

        {isPastFine && (
          <Badge color="red" variant="dot" size="sm">
            Past Fine
          </Badge>
        )}
      </Stack>
    </Paper>
  );
}

FineCard.defaultProps = defaultProps;

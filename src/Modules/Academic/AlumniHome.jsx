import { Badge, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { Book, Scroll } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { statusLabel } from "../../ui/nav/roles";

// The landing page of a locked student (alumni, withdrawn, ...): who they
// are, that the account is read-only, and the two pages they keep.
export default function AlumniHome() {
  const name = useSelector((state) => state.user.username);
  const rollNo = useSelector((state) => state.user.roll_no);
  const status = useSelector((state) => state.user.studentStatus);
  const info = useSelector((state) => state.user.studentInfo);

  return (
    <Card withBorder radius="md" p="lg" maw={640}>
      <Stack gap="xs">
        <Group gap="sm">
          <Title order={3}>{name}</Title>
          <Badge color="gray" variant="light">
            {statusLabel(status)}
          </Badge>
        </Group>
        <Text c="dimmed">{rollNo}</Text>
        {info && (
          <Text c="dimmed">{`${info.discipline}, batch ${info.batch}`}</Text>
        )}
        <Text mt="sm">
          Your account is read-only. You can view your registered courses and
          results.
        </Text>
        <Group mt="md">
          <Button
            component={Link}
            to="/academics/registered-courses"
            leftSection={<Book size={16} />}
          >
            Registered Courses
          </Button>
          <Button
            component={Link}
            to="/examination/result"
            variant="light"
            leftSection={<Scroll size={16} />}
          >
            Results
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}

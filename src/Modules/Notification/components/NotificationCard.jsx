import PropTypes from "prop-types";
import {
  Button,
  CloseButton,
  Divider,
  Flex,
  Grid,
  Paper,
  Text,
  Badge,
} from "@mantine/core";

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  onMarkAsUnread,
  loadingId,
}) {
  const { module } = notification.data || {};
  const isLoading = loadingId === notification.id;

  return (
    <Grid.Col span={{ base: 12, md: 6 }}>
      <Paper
        radius="md"
        px="lg"
        pt="sm"
        pb="xl"
        style={{ borderLeft: "0.6rem solid #15ABFF" }}
        withBorder
        maw="1240px"
      >
        <Flex justify="space-between" mb="md">
          <Flex direction="column" gap="xs" flex={1}>
            <Flex gap="md" align="center">
              <Text fw={600} size="1.2rem">
                {notification.verb}
              </Text>
              <Badge color="#15ABFF">{module || "N/A"}</Badge>
            </Flex>
            <Text c="#6B6B6B" size="0.7rem">
              {new Date(notification.timestamp).toLocaleDateString()}
            </Text>
            <Divider my="sm" w="10rem" />
          </Flex>
          <CloseButton
            variant="transparent"
            style={{ cursor: "pointer" }}
            onClick={() => onDelete(notification.id)}
          />
        </Flex>

        <Flex justify="space-between" align="flex-start" gap="md">
          <Text flex={1}>
            {notification.description || "No description available."}
          </Text>
          <Button
            variant="filled"
            color={notification.unread ? "blue" : "gray"}
            onClick={() =>
              notification.unread
                ? onMarkAsRead(notification.id)
                : onMarkAsUnread(notification.id)
            }
            loaderProps={{ type: "dots" }}
            loading={isLoading}
            style={{ cursor: "pointer" }}
            ml="sm"
            miw="120px"
          >
            {notification.unread ? "Mark as read" : "Unread"}
          </Button>
        </Flex>
      </Paper>
    </Grid.Col>
  );
}

NotificationCard.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.number.isRequired,
    verb: PropTypes.string.isRequired,
    description: PropTypes.string,
    timestamp: PropTypes.string.isRequired,
    data: PropTypes.shape({
      module: PropTypes.string,
    }),
    unread: PropTypes.bool.isRequired,
  }).isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMarkAsUnread: PropTypes.func.isRequired,
  loadingId: PropTypes.number.isRequired,
};

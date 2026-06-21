import React, { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Modal,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Trash } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { placementApi } from "../../services/api";
import { PLACEMENT_ADMIN_ROLES, showApiError } from "../../utils/authorization";

function AnnouncementsPanel() {
  const role = useSelector((state) => state.user.role);
  const canManage = PLACEMENT_ADMIN_ROLES.includes(role);

  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await placementApi.getAnnouncements();
      setAnnouncements(response.data);
    } catch (error) {
      showApiError({
        error,
        title: "Failed to fetch announcements",
        fallback: "Failed to fetch placement announcements.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setIsPinned(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      notifications.show({
        title: "Missing fields",
        message: "Both a title and a body are required.",
        color: "red",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await placementApi.createAnnouncement({
        title: title.trim(),
        body: body.trim(),
        is_pinned: isPinned,
      });
      setAnnouncements([response.data, ...announcements]);
      notifications.show({
        title: "Success",
        message: "Announcement posted successfully!",
        color: "green",
      });
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showApiError({
        error,
        fallback: "Failed to post announcement.",
        authorizationFallback:
          "Only placement officer users can post announcements.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (announcementId) => {
    try {
      await placementApi.deleteAnnouncement(announcementId);
      setAnnouncements(announcements.filter((a) => a.id !== announcementId));
      notifications.show({
        title: "Success",
        message: "Announcement deleted successfully!",
        color: "green",
      });
    } catch (error) {
      showApiError({
        error,
        fallback: "Failed to delete announcement.",
        authorizationFallback:
          "Only placement officer users can delete announcements.",
      });
    }
  };

  return (
    <Container fluid mt={32}>
      <Group justify="space-between" mb={16}>
        <Title order={2}>Announcements</Title>
        {canManage && (
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            New Announcement
          </Button>
        )}
      </Group>

      {!isLoading && announcements.length === 0 && (
        <Text c="dimmed">No announcements yet.</Text>
      )}

      <Stack gap="md">
        {announcements.map((announcement) => (
          <Card key={announcement.id} withBorder shadow="sm" radius="md">
            <Group justify="space-between" align="flex-start">
              <Group gap="xs">
                <Text fw={600}>{announcement.title}</Text>
                {announcement.is_pinned && <Badge color="yellow">Pinned</Badge>}
              </Group>
              {canManage && (
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => handleDelete(announcement.id)}
                  title="Delete announcement"
                >
                  <Trash size={18} />
                </ActionIcon>
              )}
            </Group>
            <Text mt={8} style={{ whiteSpace: "pre-wrap" }}>
              {announcement.body}
            </Text>
            <Text size="xs" c="dimmed" mt={8}>
              {announcement.posted_by_name
                ? `Posted by ${announcement.posted_by_name}`
                : "Posted"}
              {announcement.posted_at
                ? ` on ${new Date(announcement.posted_at).toLocaleString()}`
                : ""}
            </Text>
          </Card>
        ))}
      </Stack>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Announcement"
        centered
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Announcement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            label="Body"
            placeholder="Announcement details"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            minRows={4}
            autosize
            required
          />
          <Switch
            label="Pin this announcement"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.currentTarget.checked)}
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>
              Post
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default AnnouncementsPanel;

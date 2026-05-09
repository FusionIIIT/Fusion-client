import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Alert,
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { BellSimple, WarningCircle } from "@phosphor-icons/react";
import { announcementRoute } from "../routes";

const priorityMeta = {
  normal: { color: "blue", label: "Normal" },
  high: { color: "orange", label: "High" },
  urgent: { color: "red", label: "Urgent" },
};

function toIsoDate(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const parsedFromString = new Date(trimmed);
    if (Number.isNaN(parsedFromString.getTime())) {
      return "";
    }
    return [
      parsedFromString.getFullYear(),
      String(parsedFromString.getMonth() + 1).padStart(2, "0"),
      String(parsedFromString.getDate()).padStart(2, "0"),
    ].join("-");
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");
  }

  return "";
}

function formatDate(value) {
  if (!value) {
    return "No publish date";
  }
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PortalAnnouncements({
  canManage = false,
  title = "Portal Announcements",
  description = "Read the latest updates from the mess administration.",
}) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "normal",
    publishDate: new Date(),
    expiryDate: null,
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");
      const response = await axios.get(announcementRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      setAnnouncements(response.data.payload || []);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message ||
          "Unable to load mess announcements.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      setError("");
      const publishDate = toIsoDate(form.publishDate);
      const expiryDate = form.expiryDate ? toIsoDate(form.expiryDate) : null;
      if (!publishDate) {
        setError("Please select a valid publish date.");
        return;
      }

      const token = localStorage.getItem("authToken");
      await axios.post(
        announcementRoute,
        {
          title: form.title,
          message: form.message,
          priority: form.priority,
          publish_date: publishDate,
          expiry_date: expiryDate,
        },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      setForm({
        title: "",
        message: "",
        priority: "normal",
        publishDate: new Date(),
        expiryDate: null,
      });
      await fetchAnnouncements();
    } catch (submitError) {
      setError(
        submitError.response?.data?.message ||
          submitError.response?.data?.error ||
          "Unable to publish the announcement.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (announcement) => {
    try {
      setSubmitting(true);
      setError("");
      const token = localStorage.getItem("authToken");
      await axios.put(
        announcementRoute,
        {
          id: announcement.id,
          title: announcement.title,
          message: announcement.message,
          priority: announcement.priority,
          publish_date: announcement.publish_date,
          expiry_date: announcement.expiry_date,
          is_active: !announcement.is_active,
        },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      await fetchAnnouncements();
    } catch (toggleError) {
      setError(
        toggleError.response?.data?.message ||
          toggleError.response?.data?.error ||
          "Unable to update the announcement state.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card shadow="sm" radius="xl" p="xl" withBorder>
        <Flex justify="center" align="center" py="xl">
          <Loader />
        </Flex>
      </Card>
    );
  }

  return (
    <Stack gap="lg">
      {canManage ? (
        <Card shadow="sm" radius="xl" p="xl" withBorder>
          <Group justify="space-between" align="flex-start" mb="lg">
            <div>
              <Title order={3}>Publish Announcement</Title>
              <Text c="dimmed" size="sm" mt={4}>
                Share a portal-wide update that students and reviewers can read
                directly from the mess workspace.
              </Text>
            </div>
            <Badge color="cyan" variant="light" radius="xl">
              Staff tools
            </Badge>
          </Group>

          {error ? (
            <Alert color="red" icon={<WarningCircle size={18} />} mb="lg">
              {error}
            </Alert>
          ) : null}

          <Stack gap="md">
            <TextInput
              label="Title"
              placeholder="e.g. Dinner timing changed for today"
              value={form.title}
              onChange={(event) =>
                handleChange("title", event.currentTarget.value)
              }
            />
            <Textarea
              label="Message"
              placeholder="Write the announcement students should see."
              minRows={3}
              value={form.message}
              onChange={(event) =>
                handleChange("message", event.currentTarget.value)
              }
            />
            <Group grow align="flex-end">
              <Select
                label="Priority"
                data={[
                  { value: "normal", label: "Normal" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
                value={form.priority}
                onChange={(value) =>
                  handleChange("priority", value || "normal")
                }
              />
              <DateInput
                label="Publish Date"
                value={form.publishDate}
                onChange={(value) => handleChange("publishDate", value)}
                valueFormat="YYYY-MM-DD"
              />
              <DateInput
                label="Expiry Date"
                value={form.expiryDate}
                onChange={(value) => handleChange("expiryDate", value)}
                valueFormat="YYYY-MM-DD"
                clearable
              />
            </Group>
            <Group justify="flex-end">
              <Button loading={submitting} onClick={handleCreate}>
                Publish
              </Button>
            </Group>
          </Stack>
        </Card>
      ) : null}

      <Card shadow="sm" radius="xl" p="xl" withBorder>
        <Group justify="space-between" align="flex-start" mb="lg">
          <div>
            <Title order={3}>{title}</Title>
            <Text c="dimmed" size="sm" mt={4}>
              {description}
            </Text>
          </div>
          <Group gap="sm">
            <Badge color="indigo" variant="light" radius="xl">
              {announcements.length} {canManage ? "total" : "visible"}
            </Badge>
            <Button variant="light" onClick={fetchAnnouncements}>
              Refresh
            </Button>
          </Group>
        </Group>

        {!canManage && error ? (
          <Alert color="red" icon={<WarningCircle size={18} />} mb="lg">
            {error}
          </Alert>
        ) : null}

        <Stack gap="md">
          {announcements.length > 0 ? (
            announcements.map((announcement) => {
              const meta =
                priorityMeta[announcement.priority] || priorityMeta.normal;
              const publishDate = formatDate(announcement.publish_date);
              const expiryDate = announcement.expiry_date
                ? formatDate(announcement.expiry_date)
                : "No expiry";

              return (
                <Card key={announcement.id} radius="lg" p="lg" withBorder>
                  <Group justify="space-between" align="flex-start" mb="sm">
                    <div>
                      <Group gap="sm" mb="xs">
                        <Badge color={meta.color} variant="light">
                          {meta.label}
                        </Badge>
                        {canManage ? (
                          <Badge
                            color={announcement.is_active ? "green" : "gray"}
                            variant="outline"
                          >
                            {announcement.is_active ? "Active" : "Archived"}
                          </Badge>
                        ) : null}
                      </Group>
                      <Title order={4}>{announcement.title}</Title>
                    </div>
                    <BellSimple size={20} color="#1c7ed6" />
                  </Group>

                  <Text size="sm" mb="md">
                    {announcement.message}
                  </Text>

                  <Group gap="md">
                    <Text size="sm" c="dimmed">
                      Published: {publishDate}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Expires: {expiryDate}
                    </Text>
                    {announcement.created_by ? (
                      <Text size="sm" c="dimmed">
                        By: {announcement.created_by}
                      </Text>
                    ) : null}
                  </Group>

                  {canManage ? (
                    <Group justify="flex-end" mt="md">
                      <Button
                        size="xs"
                        variant="light"
                        color={announcement.is_active ? "red" : "green"}
                        loading={submitting}
                        onClick={() => handleToggleActive(announcement)}
                      >
                        {announcement.is_active ? "Archive" : "Restore"}
                      </Button>
                    </Group>
                  ) : null}
                </Card>
              );
            })
          ) : (
            <Text ta="center" c="dimmed" py="lg">
              No mess announcements are available right now.
            </Text>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

PortalAnnouncements.propTypes = {
  canManage: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
};

export default PortalAnnouncements;

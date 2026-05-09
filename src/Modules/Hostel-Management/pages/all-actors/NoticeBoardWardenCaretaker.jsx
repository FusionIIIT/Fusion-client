import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Text,
  Badge,
  Stack,
  ScrollArea,
  Loader,
  Container,
  Button,
  Modal,
  Group,
  Card,
  Box,
  ActionIcon,
  TextInput,
  Image,
  Anchor,
} from "@mantine/core";
import { IconPencil, IconX } from "@tabler/icons-react";
import CreateNotice from "../../components/forms/CreateNotice1";
import { commonService } from "../../services";
import { Empty } from "../../../../components/empty";
import { mediaRoute } from "../../../../routes/globalRoutes";

const getScopeType = (scope) => (scope === "1" ? "global" : "hall");
const isImageFile = (value) =>
  !!value && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(value));
const getAttachmentUrl = (notice) => {
  if (!notice?.content) {
    return "";
  }
  if (notice.content_url) {
    return notice.content_url;
  }
  const raw = String(notice.content);
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  return `${mediaRoute}${raw}`;
};
const getAttachmentName = (notice) => {
  if (!notice?.content) {
    return "";
  }
  if (notice.content_name) {
    return notice.content_name;
  }
  const raw = String(notice.content);
  const lastSlash = raw.lastIndexOf("/");
  return lastSlash >= 0 ? raw.slice(lastSlash + 1) : raw;
};

export default function NoticeBoard({ allowEdit = true }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateNoticeOpen, setIsCreateNoticeOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await commonService.getNotices();
      console.log(response);

      const transformedNotices = response.data
        .map((notice) => ({
          ...notice,
          hall: notice.hall_id ?? notice.hall,
          head_line: notice.head_line ?? notice.headline ?? notice.title,
          scope: getScopeType(notice.scope),
          posted_date: new Date().toLocaleDateString(),
        }))
        .sort((a, b) => b.id - a.id);

      setNotices(transformedNotices);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch notices. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDeleteNotice = async (noticeId) => {
    if (!allowEdit) {
      return;
    }
    try {
      const response = await commonService.deleteNotice({ id: noticeId });

      if (response.status === 200) {
        setNotices((prev) => prev.filter((notice) => notice.id !== noticeId));
        console.log("Notice deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting notice:", err);
      setError("Failed to delete notice. Please try again.");
    }
  };

  const handleCreateNoticeSubmit = async (announcement) => {
    if (!allowEdit) {
      return;
    }
    const formData = new FormData();
    formData.append("head_line", announcement.title || "");
    formData.append("description", announcement.description || "");
    if (announcement.file) {
      formData.append("content", announcement.file);
    }

    try {
      const response = editingNotice?.id
        ? await commonService.updateNotice(formData, editingNotice.id)
        : await commonService.createNotice(formData);
      if (response?.status === 200 || response?.status === 201) {
        await fetchNotices();
        setIsCreateNoticeOpen(false);
        setEditingNotice(null);
        setError(null);
      } else {
        setError("Failed to create notice. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create notice. Please try again.",
      );
    }
  };

  const handleEditNotice = (notice) => {
    if (!allowEdit) {
      return;
    }
    setEditingNotice({
      id: notice.id,
      title: notice.head_line || "",
      description: notice.description || "",
      file: null,
      date: "",
    });
    setIsCreateNoticeOpen(true);
  };

  const getNoticeDateValue = (notice) => {
    if (notice.created_at) {
      const created = new Date(notice.created_at);
      if (!Number.isNaN(created.getTime())) {
        return created.toISOString().slice(0, 10);
      }
    }
    if (notice.posted_date) {
      const posted = new Date(notice.posted_date);
      if (!Number.isNaN(posted.getTime())) {
        return posted.toISOString().slice(0, 10);
      }
    }
    return "";
  };

  const filteredNotices = notices.filter((notice) => {
    const text = searchText.trim().toLowerCase();
    const matchesText = text
      ? [notice.head_line, notice.description, notice.content, notice.posted_by]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(text))
      : true;

    const matchesDate = dateFilter
      ? getNoticeDateValue(notice) === dateFilter
      : true;

    return matchesText && matchesDate;
  });

  return (
    <Container size="md" px="md">
      <Card shadow="sm" p={0} radius="md" withBorder>
        <Box
          py="md"
          px="lg"
          sx={(theme) => ({
            backgroundColor: theme.colors.gray[0],
            borderBottom: `1px solid ${theme.colors.gray[3]}`,
          })}
        >
          <Group position="apart" align="flex-end" spacing="lg" wrap="wrap">
            {allowEdit ? (
              <Button
                size="sm"
                color="blue"
                onClick={() => setIsCreateNoticeOpen(true)}
              >
                Create Notice
              </Button>
            ) : null}
            <Group spacing="md" grow>
              <TextInput
                placeholder="Search notices"
                value={searchText}
                onChange={(event) => setSearchText(event.currentTarget.value)}
                sx={{ minWidth: 220 }}
              />
              <TextInput
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.currentTarget.value)}
                sx={{ minWidth: 160 }}
              />
            </Group>
          </Group>
        </Box>

        <Box p="md" sx={{ height: "70vh" }}>
          <ScrollArea style={{ height: "100%" }}>
            {loading ? (
              <Container
                py="xl"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Loader size="lg" />
              </Container>
            ) : error ? (
              <Text align="center" color="red" size="lg">
                {error}
              </Text>
            ) : filteredNotices.length === 0 ? (
              <Empty />
            ) : (
              <Stack spacing="md">
                {filteredNotices.map((notice) => (
                  <Card
                    key={notice.id}
                    p="md"
                    withBorder
                    radius="sm"
                    sx={(theme) => ({
                      backgroundColor:
                        notice.scope === "global"
                          ? theme.fn.rgba(theme.colors.yellow[1], 0.5)
                          : theme.white,
                      borderColor:
                        notice.scope === "global"
                          ? theme.colors.yellow[4]
                          : theme.colors.gray[3],
                      position: "relative",
                    })}
                  >
                    <Group position="apart" mb="xs" align="flex-start">
                      <Text
                        size="lg"
                        weight={600}
                        color={notice.scope === "global" ? "dark" : "dimmed"}
                        style={{ flex: 1 }}
                      >
                        {notice.head_line}
                      </Text>
                      {allowEdit ? (
                        <Group spacing="xs">
                          <ActionIcon
                            color="blue"
                            variant="subtle"
                            onClick={() => handleEditNotice(notice)}
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                          <ActionIcon
                            color="gray"
                            variant="subtle"
                            onClick={() => handleDeleteNotice(notice.id)}
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        </Group>
                      ) : null}
                    </Group>

                    {notice.content ? (
                      <Box mb="xs">
                        {isImageFile(getAttachmentUrl(notice)) ? (
                          <Image
                            src={getAttachmentUrl(notice)}
                            alt={
                              getAttachmentName(notice) || "Notice attachment"
                            }
                            height={220}
                            fit="contain"
                            withPlaceholder
                            radius="sm"
                            mb="xs"
                          />
                        ) : null}
                        <Anchor
                          href={getAttachmentUrl(notice)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {getAttachmentName(notice)
                            ? `View attachment (${getAttachmentName(notice)})`
                            : "View attachment"}
                        </Anchor>
                      </Box>
                    ) : null}

                    <Text size="sm" color="dimmed" mb="sm">
                      {notice.description}
                    </Text>

                    <Group position="apart" mt="md">
                      <Badge
                        size="md"
                        variant={
                          notice.scope === "global" ? "filled" : "outline"
                        }
                        color={notice.scope === "global" ? "yellow" : "blue"}
                      >
                        {notice.hall}
                      </Badge>

                      <Text size="sm" color="dimmed">
                        Posted by: {notice.posted_by}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Box>
      </Card>

      {allowEdit ? (
        <Modal
          opened={isCreateNoticeOpen}
          onClose={() => {
            setIsCreateNoticeOpen(false);
            setEditingNotice(null);
          }}
          title={editingNotice ? "Edit Notice" : "Create New Notice"}
          size="lg"
        >
          <CreateNotice
            onSubmit={handleCreateNoticeSubmit}
            existingAnnouncement={editingNotice}
          />
        </Modal>
      ) : null}
    </Container>
  );
}

NoticeBoard.propTypes = {
  allowEdit: PropTypes.bool,
};

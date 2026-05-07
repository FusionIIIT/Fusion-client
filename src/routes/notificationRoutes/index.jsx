import {
  Flex,
  Select,
  MultiSelect,
  Container,
  Modal,
  Loader,
  Grid,
  Button,
  Paper,
  Stack,
  Textarea,
  TextInput,
  Group,
  Text,
} from "@mantine/core";
import { SortAscending } from "@phosphor-icons/react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import CustomBreadcrumbs from "../../components/Breadcrumbs.jsx";
import ModuleTabs from "../../components/moduleTabs.jsx";
import { NotificationCard } from "../../Modules/Notification/components/NotificationCard";
import {
  getUnreadCount,
  sortNotifications,
  filterActiveNotifications,
} from "../../Modules/Notification/utils/notificationUtils";
import { Empty } from "../../components/empty";
import classes from "../../Modules/Dashboard/Dashboard.module.css";
import NotificationsHook from "../../Modules/Notification/Notifications";
import AnnouncementsHook from "../../Modules/Notification/Announcements";
import {
  notificationAPI,
  notificationUtils,
} from "../../Modules/Notification/api";
import { announcementCreateRoute } from "../dashboardRoutes";

/**
 * Combined Notifications and Announcements view
 */
function NotificationView() {
  const notificationsData = NotificationsHook();
  const announcementsData = AnnouncementsHook();
  const role = useSelector((state) => state.user.role);
  const roles = useSelector((state) => state.user.roles);

  const [activeTab, setActiveTab] = useState("0");
  const [sortedBy, setSortedBy] = useState("Most Recent");

  const [manageLoading, setManageLoading] = useState(false);
  const [manageSubmitting, setManageSubmitting] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState(null);
  const [manageAnnouncements, setManageAnnouncements] = useState([]);
  const [announcementStatusMap, setAnnouncementStatusMap] = useState({});
  const [announcementStatsMap, setAnnouncementStatsMap] = useState({});
  const [studentRollOptions, setStudentRollOptions] = useState([]);
  const [studentRollLoading, setStudentRollLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    module: "Fusion",
    target_audience: "all_students",
    batch: "",
    specific_usernames: [],
  });
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: "",
    module: "Fusion",
    target_audience: "all_students",
    batch: "",
    specific_usernames: [],
  });

  const targetAudienceOptions = [
    { value: "all_users", label: "All Users" },
    { value: "students", label: "Students" },
    { value: "faculty", label: "Faculty" },
    { value: "professor", label: "Professor" },
    { value: "staff", label: "Staff" },
    { value: "batch", label: "Batch" },
    { value: "specific_users", label: "Specific Users" },
    { value: "all_cse", label: "ALL CSE" },
    { value: "all_ece", label: "ALL ECE" },
    { value: "all_me", label: "ALL ME" },
    { value: "all_ug", label: "ALL UG" },
    { value: "all_pg", label: "ALL PG" },
    { value: "all_students", label: "ALL Students" },
    { value: "specific_student", label: "Specific Student" },
  ];

  const tabItems = [{ title: "Notifications" }, { title: "Announcements" }];

  const canManageAnnouncements = useMemo(() => {
    const allRoles = [...(Array.isArray(roles) ? roles : []), role]
      .filter(Boolean)
      .map((r) => String(r).toLowerCase());

    return allRoles.some((r) =>
      ["admin", "professor", "faculty", "staff"].some((k) => r.includes(k)),
    );
  }, [role, roles]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("authToken");
    return { headers: { Authorization: `Token ${token}` } };
  }, []);

  const refreshNotificationLists = useCallback(async () => {
    try {
      const data = await notificationAPI.fetchAll();
      const { notifications: updatedNotifications, announcements } =
        notificationUtils.separate(data);
      notificationsData.setNotificationsList(updatedNotifications);
      announcementsData.setAnnouncementsList(announcements);
    } catch (err) {
      console.error("Failed to refresh notifications:", err);
    }
  }, [notificationsData, announcementsData]);

  const fetchManageAnnouncements = useCallback(async () => {
    if (!canManageAnnouncements) return;

    try {
      setManageLoading(true);
      const { data } = await axios.get(
        `${announcementCreateRoute}my_announcements/`,
        getAuthHeaders(),
      );
      setManageAnnouncements(data?.results || []);
    } catch (err) {
      console.error("Failed to load your announcements:", err);
    } finally {
      setManageLoading(false);
    }
  }, [canManageAnnouncements, getAuthHeaders]);

  useEffect(() => {
    fetchManageAnnouncements();
  }, [fetchManageAnnouncements]);

  const fetchStudentRollNumbers = useCallback(async () => {
    if (!canManageAnnouncements) return;

    try {
      setStudentRollLoading(true);
      const { data } = await axios.get(
        `${announcementCreateRoute}student_roll_numbers/`,
        getAuthHeaders(),
      );

      setStudentRollOptions(
        (data?.results || []).map((student) => ({
          value: student.username,
          label: student.username,
        })),
      );
    } catch (err) {
      console.error("Failed to load student roll numbers:", err);
    } finally {
      setStudentRollLoading(false);
    }
  }, [canManageAnnouncements, getAuthHeaders]);

  useEffect(() => {
    fetchStudentRollNumbers();
  }, [fetchStudentRollNumbers]);

  const parseAnnouncementMessage = (announcement) => {
    if (announcement?.title || announcement?.content) {
      return {
        title: announcement?.title || "",
        content: announcement?.content || "",
      };
    }

    const raw = (announcement?.message || "").trim();
    if (!raw) {
      return { title: "", content: "" };
    }

    if (raw.includes("\n\n")) {
      const [title, ...rest] = raw.split("\n\n");
      return { title: title.trim(), content: rest.join("\n\n").trim() };
    }

    return { title: raw, content: raw };
  };

  const getAudienceFromAnnouncement = (announcement) => {
    if (announcement?.target_group === "all_users") return "all_users";
    if (announcement?.target_group === "faculty") return "faculty";
    if (announcement?.target_group === "staff") return "staff";
    if (announcement?.target_group === "students") return "all_students";
    if (announcement?.target_group === "specific_users")
      return "specific_users";

    const batch = (announcement?.batch || "").toUpperCase();
    if (batch === "BCS") return "all_cse";
    if (batch === "BEC") return "all_ece";
    if (batch === "BME") return "all_me";
    if (batch === "UG") return "all_ug";
    if (batch === "PG") return "all_pg";

    return "all_students";
  };

  const mapAudienceToPayload = (audience, specificUsernames = []) => {
    if (audience === "all_users") return { target_group: "all_users" };
    if (audience === "students") return { target_group: "students" };
    if (audience === "faculty" || audience === "professor") {
      return { target_group: "faculty" };
    }
    if (audience === "staff") return { target_group: "staff" };
    if (audience === "batch") return { target_group: "batch" };
    if (audience === "specific_users") {
      return {
        target_group: "specific_users",
        specific_usernames: specificUsernames,
      };
    }
    if (audience === "all_cse") return { target_group: "batch", batch: "BCS" };
    if (audience === "all_ece") return { target_group: "batch", batch: "BEC" };
    if (audience === "all_me") return { target_group: "batch", batch: "BME" };
    if (audience === "all_ug") return { target_group: "batch", batch: "UG" };
    if (audience === "all_pg") return { target_group: "batch", batch: "PG" };
    if (audience === "specific_student") {
      return {
        target_group: "specific_users",
        specific_usernames: specificUsernames,
      };
    }

    return { target_group: "students" };
  };

  const resetCreateForm = () => {
    setFormData({
      title: "",
      content: "",
      module: "Fusion",
      target_audience: "all_students",
      batch: "",
      specific_usernames: [],
    });
  };

  const closeEditModal = () => {
    setEditingAnnouncementId(null);
    setIsEditModalOpen(false);
    setEditFormData({
      title: "",
      content: "",
      module: "Fusion",
      target_audience: "all_students",
      batch: "",
      specific_usernames: [],
    });
  };

  const validateAudienceSelection = (source) => {
    if (!(source?.title || "").trim() || !(source?.content || "").trim()) {
      notifications.show({
        title: "Missing fields",
        message: "Please enter both title and content.",
        color: "orange",
      });
      return false;
    }

    if (
      (source.target_audience === "specific_student" ||
        source.target_audience === "specific_users") &&
      (source.specific_usernames || []).length === 0
    ) {
      notifications.show({
        title: "No students selected",
        message: "Please select at least one student roll number.",
        color: "orange",
      });
      return false;
    }

    if (source.target_audience === "batch" && !(source.batch || "").trim()) {
      notifications.show({
        title: "Batch required",
        message: "Please provide a batch value.",
        color: "orange",
      });
      return false;
    }

    return true;
  };

  const handleEditAnnouncement = async (announcement) => {
    let specificRecipients = [];
    if (announcement.target_group === "specific_users") {
      try {
        const { data } = await axios.get(
          `${announcementCreateRoute}${announcement.id}/`,
          getAuthHeaders(),
        );

        specificRecipients = (data?.recipients || []).map(
          (recipient) => recipient.user_username,
        );
      } catch (err) {
        console.error("Failed to load recipients for edit:", err);
      }
    }

    const parsed = parseAnnouncementMessage(announcement);
    setEditingAnnouncementId(announcement.id);
    setEditFormData({
      title: parsed.title,
      content: parsed.content,
      module: announcement.module || "Fusion",
      target_audience: getAudienceFromAnnouncement(announcement),
      batch: announcement.batch || "",
      specific_usernames: specificRecipients,
    });
    setIsEditModalOpen(true);
  };

  const handleViewStatus = async (announcementId) => {
    try {
      const [statsRes, detailRes] = await Promise.all([
        axios.get(
          `${announcementCreateRoute}${announcementId}/statistics/`,
          getAuthHeaders(),
        ),
        axios.get(
          `${announcementCreateRoute}${announcementId}/`,
          getAuthHeaders(),
        ),
      ]);

      setAnnouncementStatsMap((prev) => ({
        ...prev,
        [announcementId]: statsRes.data,
      }));

      setAnnouncementStatusMap((prev) => ({
        ...prev,
        [announcementId]: detailRes.data,
      }));
    } catch (err) {
      console.error("Failed to fetch announcement status:", err);
      notifications.show({
        title: "Status load failed",
        message: "Could not load recipient read status.",
        color: "red",
      });
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      setDeletingAnnouncementId(announcementId);
      await axios.delete(
        `${announcementCreateRoute}${announcementId}/`,
        getAuthHeaders(),
      );

      notifications.show({
        title: "Deleted",
        message: "Announcement deleted successfully.",
        color: "green",
      });

      await fetchManageAnnouncements();
      await refreshNotificationLists();
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      notifications.show({
        title: "Delete failed",
        message: "Could not delete announcement.",
        color: "red",
      });
    } finally {
      setDeletingAnnouncementId(null);
    }
  };

  const buildPayloadFromForm = (source) => {
    const audiencePayload = mapAudienceToPayload(
      source.target_audience,
      source.specific_usernames,
    );

    const payload = {
      title: (source.title || "").trim(),
      content: (source.content || "").trim(),
      module: (source.module || "Fusion").trim() || "Fusion",
      ...audiencePayload,
    };

    if (source.target_audience === "batch" && (source.batch || "").trim()) {
      payload.batch = source.batch.trim();
    }

    return payload;
  };

  const handleCreateAnnouncement = async () => {
    const title = (formData.title || "").trim();
    const content = (formData.content || "").trim();

    if (!title || !content) {
      notifications.show({
        title: "Missing fields",
        message: "Please enter both title and content.",
        color: "orange",
      });
      return;
    }

    if (
      (formData.target_audience === "specific_student" ||
        formData.target_audience === "specific_users") &&
      formData.specific_usernames.length === 0
    ) {
      notifications.show({
        title: "No students selected",
        message: "Please select at least one student roll number.",
        color: "orange",
      });
      return;
    }

    const payload = buildPayloadFromForm(formData);

    try {
      setManageSubmitting(true);
      await axios.post(announcementCreateRoute, payload, getAuthHeaders());

      notifications.show({
        title: "Created",
        message: "Announcement created successfully.",
        color: "green",
      });

      resetCreateForm();
      await fetchManageAnnouncements();
      await refreshNotificationLists();
    } catch (err) {
      console.error("Failed to save announcement:", err);
      const serverData = err?.response?.data;
      const serverMessage =
        serverData?.detail ||
        serverData?.message ||
        (typeof serverData === "string" ? serverData : null) ||
        (serverData && Object.keys(serverData).length
          ? Object.entries(serverData)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : null);

      notifications.show({
        title: "Save failed",
        message:
          serverMessage ||
          "Could not save announcement. Please check role permissions.",
        color: "red",
      });
    } finally {
      setManageSubmitting(false);
    }
  };

  const handleResendAnnouncement = async () => {
    if (!editingAnnouncementId) return;
    if (!validateAudienceSelection(editFormData)) return;

    const payload = buildPayloadFromForm(editFormData);

    try {
      setManageSubmitting(true);
      await axios.patch(
        `${announcementCreateRoute}${editingAnnouncementId}/`,
        payload,
        getAuthHeaders(),
      );

      notifications.show({
        title: "Resent",
        message: "Announcement updated and resent successfully.",
        color: "green",
      });

      closeEditModal();
      await fetchManageAnnouncements();
      await refreshNotificationLists();
    } catch (err) {
      console.error("Failed to resend announcement:", err);
      const serverData = err?.response?.data;
      const serverMessage =
        serverData?.detail ||
        serverData?.message ||
        (typeof serverData === "string" ? serverData : null) ||
        (serverData && Object.keys(serverData).length
          ? Object.entries(serverData)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : null);

      notifications.show({
        title: "Resend failed",
        message: serverMessage || "Could not update and resend announcement.",
        color: "red",
      });
    } finally {
      setManageSubmitting(false);
    }
  };

  // Get data based on active tab
  const currentList =
    activeTab === "0"
      ? notificationsData.notificationsList
      : announcementsData.announcementsList;
  const currentHandlers =
    activeTab === "0" ? notificationsData : announcementsData;
  const loading =
    activeTab === "0" ? notificationsData.loading : announcementsData.loading;
  const loadingId =
    activeTab === "0"
      ? notificationsData.loadingId
      : announcementsData.loadingId;

  // Calculate badge counts
  const notifCount = getUnreadCount(notificationsData.notificationsList);
  const announceCount = getUnreadCount(announcementsData.announcementsList);
  const badges = [notifCount, announceCount];

  // Sort data
  const sortedNotifications = useMemo(
    () => sortNotifications(currentList, sortedBy),
    [sortedBy, currentList],
  );

  const activeNotifications = filterActiveNotifications(sortedNotifications);

  return (
    <>
      <CustomBreadcrumbs />

      {/* Header with tabs and filters */}
      <Flex
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        mt="lg"
        direction={{ base: "column", sm: "row" }}
      >
        <ModuleTabs
          tabs={tabItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          badges={badges}
        />

        <Flex
          w={{ base: "40%", sm: "auto" }}
          align="center"
          mt="md"
          rowGap="1rem"
          columnGap="4rem"
          wrap="wrap"
        >
          <Select
            classNames={{
              option: classes.selectoptions,
              input: classes.selectinputs,
            }}
            variant="filled"
            leftSection={<SortAscending />}
            data={["Most Recent", "Tags", "Title"]}
            value={sortedBy}
            onChange={setSortedBy}
            placeholder="Sort By"
          />
        </Flex>
      </Flex>

      {/* Notifications/Announcements Grid */}
      {loading ? (
        <Container py="xl">
          <Loader size="lg" />
        </Container>
      ) : activeNotifications.length === 0 ? (
        <Empty />
      ) : (
        <Grid mt="xl">
          {activeNotifications.map((item) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onMarkAsRead={currentHandlers.markAsRead}
              onMarkAsUnread={currentHandlers.markAsUnread}
              onDelete={currentHandlers.deleteNotification}
              loadingId={loadingId}
            />
          ))}
        </Grid>
      )}

      {canManageAnnouncements && activeTab === "1" && (
        <Paper withBorder radius="md" p="md" mt="xl">
          <Stack gap="sm">
            <Text fw={600} size="lg">
              Manage Announcements
            </Text>

            <Textarea
              label="Content"
              placeholder="Type announcement content"
              minRows={3}
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
            />

            <Group grow>
              <TextInput
                label="Title"
                placeholder="Announcement title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <TextInput
                label="Module"
                placeholder="Fusion"
                value={formData.module}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, module: e.target.value }))
                }
              />
              <Select
                label="Target Audience"
                value={formData.target_audience}
                data={targetAudienceOptions}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    target_audience: value || "all_students",
                    batch: value === "batch" ? prev.batch : "",
                    specific_usernames:
                      value === "specific_student" || value === "specific_users"
                        ? prev.specific_usernames
                        : [],
                  }))
                }
              />
            </Group>

            {formData.target_audience === "batch" && (
              <TextInput
                label="Batch"
                placeholder="e.g. 2023 or programme code"
                value={formData.batch}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, batch: e.target.value }))
                }
              />
            )}

            {(formData.target_audience === "specific_student" ||
              formData.target_audience === "specific_users") && (
              <MultiSelect
                label="Select Students"
                placeholder="Choose roll numbers"
                data={studentRollOptions}
                value={formData.specific_usernames}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    specific_usernames: value,
                  }))
                }
                searchable
                clearable
                nothingFoundMessage={
                  studentRollLoading
                    ? "Loading students..."
                    : "No students found"
                }
              />
            )}

            <Group>
              <Button
                onClick={handleCreateAnnouncement}
                loading={manageSubmitting}
              >
                Create Announcement
              </Button>
            </Group>

            <Text fw={600} mt="md">
              Your Announcements
            </Text>

            {manageLoading ? (
              <Loader size="sm" />
            ) : manageAnnouncements.length === 0 ? (
              <Text c="dimmed" size="sm">
                No announcements created yet.
              </Text>
            ) : (
              <Stack gap="xs">
                {manageAnnouncements.map((announcement) => (
                  <Paper key={announcement.id} withBorder p="sm" radius="sm">
                    <Group justify="space-between" align="start">
                      <Stack gap={2} style={{ flex: 1 }}>
                        <Text fw={500}>
                          {announcement.title || announcement.message}
                        </Text>
                        {(announcement.content || "").trim() && (
                          <Text size="sm" c="dimmed">
                            {announcement.content}
                          </Text>
                        )}
                        <Text size="xs" c="dimmed">
                          Module: {announcement.module || "Fusion"} • Target:{" "}
                          {announcement.target_group}
                        </Text>
                      </Stack>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => handleEditAnnouncement(announcement)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          variant="light"
                          loading={deletingAnnouncementId === announcement.id}
                          onClick={() =>
                            handleDeleteAnnouncement(announcement.id)
                          }
                        >
                          Delete
                        </Button>
                        <Button
                          size="xs"
                          variant="default"
                          onClick={() => handleViewStatus(announcement.id)}
                        >
                          View Stats
                        </Button>
                      </Group>
                    </Group>

                    {announcementStatsMap[announcement.id] && (
                      <Stack mt="sm" gap={4}>
                        <Text size="xs" fw={600}>
                          Total:{" "}
                          {
                            announcementStatsMap[announcement.id]
                              .total_recipients
                          }{" "}
                          • Read:{" "}
                          {announcementStatsMap[announcement.id].read_count} •
                          Unread:{" "}
                          {announcementStatsMap[announcement.id].unread_count}
                        </Text>
                      </Stack>
                    )}

                    {announcement.target_group === "specific_users" &&
                      announcementStatusMap[announcement.id]?.recipients
                        ?.length > 0 && (
                        <Stack mt="sm" gap={4}>
                          <Text size="xs" fw={600}>
                            Read Status
                          </Text>
                          {announcementStatusMap[
                            announcement.id
                          ].recipients.map((recipient) => (
                            <Text key={recipient.id} size="xs" c="dimmed">
                              {recipient.user_username}:{" "}
                              {recipient.is_read ? "Read" : "Unread"}
                            </Text>
                          ))}
                        </Stack>
                      )}
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      )}

      <Modal
        opened={isEditModalOpen}
        onClose={closeEditModal}
        centered
        title="Edit Announcement"
        size="lg"
      >
        <Stack gap="sm">
          <Textarea
            label="Content"
            placeholder="Type announcement content"
            minRows={3}
            value={editFormData.content}
            onChange={(e) =>
              setEditFormData((prev) => ({ ...prev, content: e.target.value }))
            }
          />

          <Group grow>
            <TextInput
              label="Title"
              placeholder="Announcement title"
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <TextInput
              label="Module"
              placeholder="Fusion"
              value={editFormData.module}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, module: e.target.value }))
              }
            />
            <Select
              label="Target Audience"
              value={editFormData.target_audience}
              data={targetAudienceOptions}
              onChange={(value) =>
                setEditFormData((prev) => ({
                  ...prev,
                  target_audience: value || "all_students",
                  batch: value === "batch" ? prev.batch : "",
                  specific_usernames:
                    value === "specific_student" || value === "specific_users"
                      ? prev.specific_usernames
                      : [],
                }))
              }
            />
          </Group>

          {editFormData.target_audience === "batch" && (
            <TextInput
              label="Batch"
              placeholder="e.g. 2023 or programme code"
              value={editFormData.batch}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, batch: e.target.value }))
              }
            />
          )}

          {(editFormData.target_audience === "specific_student" ||
            editFormData.target_audience === "specific_users") && (
            <MultiSelect
              label="Select Students"
              placeholder="Choose roll numbers"
              data={studentRollOptions}
              value={editFormData.specific_usernames}
              onChange={(value) =>
                setEditFormData((prev) => ({
                  ...prev,
                  specific_usernames: value,
                }))
              }
              searchable
              clearable
              nothingFoundMessage={
                studentRollLoading ? "Loading students..." : "No students found"
              }
            />
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button
              onClick={handleResendAnnouncement}
              loading={manageSubmitting}
            >
              Resend
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default NotificationView;

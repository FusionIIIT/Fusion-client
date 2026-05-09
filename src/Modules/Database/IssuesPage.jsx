import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Image,
  FileInput,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import {
  dbIssuesRoute,
  dbIssueSupportRoute,
  dbIssueUpdateRoute,
} from "../../routes/dashboardRoutes";
import { mediaRoute } from "../../routes/globalRoutes";

const moduleOptions = [
  { value: "academic_information", label: "Academic" },
  { value: "central_mess", label: "Central Mess" },
  { value: "complaint_system", label: "Complaint System" },
  { value: "eis", label: "Employee Information System" },
  { value: "file_tracking", label: "File Tracking" },
  { value: "health_center", label: "Health Center" },
  { value: "leave", label: "Leave" },
  { value: "online_cms", label: "Online CMS" },
  { value: "placement_cell", label: "Placement Cell" },
  { value: "scholarships", label: "Scholarships" },
  { value: "visitor_hostel", label: "Visitor Hostel" },
  { value: "other", label: "Other" },
];

const typeOptions = [
  { value: "feature_request", label: "Feature Request" },
  { value: "bug_report", label: "Bug Report" },
  { value: "security_issue", label: "Security Issue" },
  { value: "ui_issue", label: "UI Issue" },
  { value: "other", label: "Other" },
];

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    module: "academic_information",
    report_type: "bug_report",
    title: "",
    text: "",
    images: [],
  });

  const token = localStorage.getItem("authToken");

  const authHeaders = {
    Authorization: `Token ${token}`,
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(dbIssuesRoute, { headers: authHeaders });
      setIssues(data.issues || []);
    } catch (error) {
      notifications.show({
        title: "Issues",
        message: "Failed to fetch issues",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const submitIssue = async () => {
    if (!formData.title.trim() || !formData.text.trim()) {
      notifications.show({ title: "Validation", message: "Title and text are required", color: "yellow" });
      return;
    }

    const body = new FormData();
    body.append("module", formData.module);
    body.append("report_type", formData.report_type);
    body.append("title", formData.title);
    body.append("text", formData.text);
    formData.images.forEach((img) => body.append("images", img));

    try {
      if (editingId) {
        await axios.put(dbIssueUpdateRoute(editingId), body, { headers: authHeaders });
        notifications.show({ title: "Issue", message: "Issue updated", color: "green" });
      } else {
        await axios.post(dbIssuesRoute, body, { headers: authHeaders });
        notifications.show({ title: "Issue", message: "Issue created", color: "green" });
      }

      setFormData({
        module: "academic_information",
        report_type: "bug_report",
        title: "",
        text: "",
        images: [],
      });
      setEditingId(null);
      fetchIssues();
    } catch (error) {
      notifications.show({
        title: "Issue",
        message: error?.response?.data?.error || "Operation failed",
        color: "red",
      });
    }
  };

  const toggleSupport = async (issueId) => {
    try {
      await axios.post(dbIssueSupportRoute(issueId), {}, { headers: authHeaders });
      fetchIssues();
    } catch (error) {
      notifications.show({
        title: "Support",
        message: error?.response?.data?.error || "Unable to toggle support",
        color: "red",
      });
    }
  };

  const getIssueImageSrc = (imageValue) => {
    if (!imageValue) return "";

    const imagePath = typeof imageValue === "string" ? imageValue : imageValue.image;
    if (!imagePath) return "";

    return imagePath.startsWith("http") || imagePath.startsWith("/")
      ? imagePath
      : `${mediaRoute}${imagePath}`;
  };

  const startEdit = (issue) => {
    setEditingId(issue.id);
    setFormData({
      module: issue.module,
      report_type: issue.report_type,
      title: issue.title,
      text: issue.text,
      images: [],
    });
  };

  return (
    <Stack>
      <Title order={3}>Issue Reporting</Title>
      <Card withBorder>
        <Stack>
          <Group grow>
            <Select
              label="Module"
              data={moduleOptions}
              value={formData.module}
              onChange={(value) => setFormData((p) => ({ ...p, module: value || "academic_information" }))}
            />
            <Select
              label="Issue Type"
              data={typeOptions}
              value={formData.report_type}
              onChange={(value) => setFormData((p) => ({ ...p, report_type: value || "bug_report" }))}
            />
          </Group>
          <TextInput
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.currentTarget.value }))}
          />
          <Textarea
            label="Description"
            minRows={3}
            value={formData.text}
            onChange={(e) => setFormData((p) => ({ ...p, text: e.currentTarget.value }))}
          />
          <FileInput
            label="Images"
            multiple
            value={formData.images}
            onChange={(value) => setFormData((p) => ({ ...p, images: value || [] }))}
            accept="image/png,image/jpeg,image/gif"
          />
          <Group>
            <Button onClick={submitIssue}>{editingId ? "Update Issue" : "Create Issue"}</Button>
            {editingId && (
              <Button variant="default" onClick={() => {
                setEditingId(null);
                setFormData({ module: "academic_information", report_type: "bug_report", title: "", text: "", images: [] });
              }}>
                Cancel Edit
              </Button>
            )}
          </Group>
        </Stack>
      </Card>

      <Title order={4}>Open and Closed Issues</Title>
      <Stack>
        {issues.map((issue) => (
          <Card key={issue.id} withBorder>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={600}>{issue.title}</Text>
                <Group>
                  <Badge color={issue.closed ? "red" : "green"}>{issue.closed ? "Closed" : "Open"}</Badge>
                  <Badge variant="light">{issue.report_type}</Badge>
                </Group>
              </Group>
              <Text size="sm" c="dimmed">By {issue.username}</Text>
              <Text>{issue.text}</Text>
              {Array.isArray(issue.images) && issue.images.length > 0 && (
                <Stack gap="xs">
                  <Text size="sm" fw={500}>Attached images</Text>
                  <Group gap="sm" align="flex-start" wrap="wrap">
                    {issue.images.map((image) => {
                      const imageSrc = getIssueImageSrc(image);

                      return imageSrc ? (
                        <Image
                          key={image.id || imageSrc}
                          src={imageSrc}
                          alt={issue.title}
                          w={180}
                          h={120}
                          fit="cover"
                          radius="sm"
                        />
                      ) : null;
                    })}
                  </Group>
                </Stack>
              )}
              <Group>
                <Button size="xs" variant="light" onClick={() => toggleSupport(issue.id)} disabled={issue.is_owner}>
                  {issue.is_supported ? "Withdraw Support" : "Support"} ({issue.support_count})
                </Button>
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => startEdit(issue)}
                  disabled={!issue.is_owner || issue.closed}
                >
                  Edit
                </Button>
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>
      {!loading && issues.length === 0 && <Text c="dimmed">No issues found.</Text>}
    </Stack>
  );
}

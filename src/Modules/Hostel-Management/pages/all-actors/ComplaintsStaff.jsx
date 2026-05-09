import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Loader,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { commonService } from "../../services";
import { host } from "../../../../routes/globalRoutes";

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const sortOptions = [
  { value: "created_desc", label: "Newest" },
  { value: "created_asc", label: "Oldest" },
  { value: "updated_desc", label: "Recently Updated" },
  { value: "status_asc", label: "Status" },
];

const resolveFileUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/")) {
    return `${host}${value}`;
  }
  return `${host}/${value}`;
};

const getStatusMeta = (value) => {
  const normalized = String(value || "open").toLowerCase();
  if (normalized === "resolved") {
    return { color: "teal", label: "Resolved" };
  }
  if (normalized === "in_progress") {
    return { color: "blue", label: "In Progress" };
  }
  return { color: "orange", label: "Open" };
};

export default function ComplaintsStaff() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_desc");
  const [pendingStatus, setPendingStatus] = useState({});
  const requestRef = useRef(0);

  const categoryOptions = useMemo(() => {
    const values = new Set(
      complaints
        .map((complaint) => complaint.category)
        .filter((value) => value && String(value).trim().length > 0),
    );
    return Array.from(values)
      .sort()
      .map((value) => ({ value, label: value }));
  }, [complaints]);

  const fetchComplaints = async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        sort: sortBy || undefined,
      };
      const response = await commonService.getHostelComplaints(params);
      if (requestId !== requestRef.current) return;
      setComplaints(response.data?.complaints || []);
      setError("");
    } catch (err) {
      if (requestId !== requestRef.current) return;
      setError(
        err.response?.data?.error ||
          "Failed to fetch complaints. Please try again.",
      );
      setComplaints([]);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [search, statusFilter, categoryFilter, sortBy]);

  const handleStatusChange = (complaintId, value) => {
    setPendingStatus((prev) => ({ ...prev, [complaintId]: value }));
  };

  const handleStatusUpdate = async (complaintId) => {
    const nextStatus = pendingStatus[complaintId];
    if (!nextStatus) return;

    try {
      await commonService.updateHostelComplaintStatus(complaintId, nextStatus);
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === complaintId
            ? {
                ...complaint,
                status: nextStatus,
                updated_at: new Date().toISOString(),
              }
            : complaint,
        ),
      );
      setPendingStatus((prev) => {
        const updated = { ...prev };
        delete updated[complaintId];
        return updated;
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to update status. Please try again.",
      );
    }
  };

  return (
    <Container size="lg" px="xs">
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Stack spacing="md">
          <Text size="xl" fw={600} color="dimmed">
            Complaints Management
          </Text>

          <Group grow align="end">
            <TextInput
              label="Search"
              placeholder="Search by student, roll no, hall, category"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              leftSection={<IconSearch size={14} />}
            />
            <Select
              label="Status"
              placeholder="All"
              clearable
              data={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Select
              label="Category"
              placeholder="All"
              clearable
              data={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
            <Select
              label="Sort"
              data={sortOptions}
              value={sortBy}
              onChange={setSortBy}
            />
          </Group>

          {error && (
            <Text color="red" size="sm">
              {error}
            </Text>
          )}

          <ScrollArea h={520}>
            {loading ? (
              <Box py="md">
                <Loader size="md" />
              </Box>
            ) : complaints.length === 0 ? (
              <Text color="dimmed" align="center">
                No complaints found.
              </Text>
            ) : (
              <Stack spacing="md">
                {complaints.map((complaint) => {
                  const statusMeta = getStatusMeta(complaint.status);
                  const fileUrl = resolveFileUrl(complaint.image_upload);
                  return (
                    <Card key={complaint.id} withBorder radius="md">
                      <Group position="apart" align="flex-start" mb="xs">
                        <Stack spacing={2}>
                          <Text fw={600}>#{complaint.id}</Text>
                          <Text size="sm" color="dimmed">
                            {complaint.student_name} ({complaint.roll_number})
                          </Text>
                          <Text size="sm" color="dimmed">
                            Hall: {complaint.hall_name}
                          </Text>
                        </Stack>
                        <Badge color={statusMeta.color} variant="filled">
                          {statusMeta.label}
                        </Badge>
                      </Group>

                      <Text size="sm" mb="xs">
                        {complaint.description}
                      </Text>

                      <Group spacing="xs" mb="xs">
                        {complaint.category && (
                          <Badge color="blue" variant="outline">
                            {complaint.category}
                          </Badge>
                        )}
                        {complaint.contact_number && (
                          <Badge color="gray" variant="outline">
                            {complaint.contact_number}
                          </Badge>
                        )}
                        {fileUrl && (
                          <Text
                            component="a"
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="sm"
                            color="blue"
                          >
                            View Attachment
                          </Text>
                        )}
                      </Group>

                      <Group position="apart" align="center" mt="sm">
                        <Text size="xs" color="dimmed">
                          Created: {complaint.created_at || "-"} | Updated:{" "}
                          {complaint.updated_at || "-"}
                        </Text>
                        <Group spacing="xs">
                          <Select
                            data={statusOptions}
                            value={
                              pendingStatus[complaint.id] || complaint.status
                            }
                            onChange={(value) =>
                              handleStatusChange(complaint.id, value)
                            }
                            size="xs"
                          />
                          <Button
                            size="xs"
                            onClick={() => handleStatusUpdate(complaint.id)}
                          >
                            Update
                          </Button>
                        </Group>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </ScrollArea>
        </Stack>
      </Card>
    </Container>
  );
}

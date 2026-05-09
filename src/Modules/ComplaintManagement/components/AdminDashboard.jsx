import React, { useState, useEffect } from "react";
import {
  Paper, Text, Button, Flex, Grid, Badge, Select,
  Loader, Center, Divider, Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getAdminComplaints, adminAssign, getCaretakers, getSupervisors, extractApiErrorMessage } from "../routes/api";
import ComplaintDetails from "./ComplaintDetails";

const STATUS_MAP = {
  0: { label: "Pending", color: "blue" },
  1: { label: "In Progress", color: "cyan" },
  2: { label: "Resolved", color: "green" },
  3: { label: "Declined", color: "red" },
  4: { label: "Escalated", color: "orange" },
  5: { label: "Closed", color: "teal" },
  6: { label: "Reopened", color: "yellow" },
};

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Failed to load complaints.");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [caretakerId, setCaretakerId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [caretakerOptions, setCaretakerOptions] = useState([]);
  const [supervisorOptions, setSupervisorOptions] = useState([]);
  const [scope, setScope] = useState("overdue_escalated");

  const token = localStorage.getItem("authToken");

  const isOverdueComplaint = (complaint) => (
    !!complaint.sla_deadline
    && new Date(complaint.sla_deadline) < new Date()
    && [0, 1, 6].includes(complaint.status)
  );

  const stats = {
    total: complaints.length,
    escalated: complaints.filter((complaint) => complaint.status === 4).length,
    overdue: complaints.filter((complaint) => isOverdueComplaint(complaint)).length,
    needsAssignment: complaints.filter((complaint) => !complaint.assigned_caretaker || !complaint.assigned_supervisor).length,
  };

  const fetchComplaints = async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("Failed to load complaints.");
    const response = await getAdminComplaints(token, scope);
    if (response.success) {
      setComplaints(response.data.results || []);
    } else {
      setIsError(true);
      const message = extractApiErrorMessage(response.error, "Failed to load complaints.");
      setErrorMessage(message);
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const fetchAssignees = async () => {
    const [caretakersResponse, supervisorsResponse] = await Promise.all([
      getCaretakers(token),
      getSupervisors(token),
    ]);
    if (caretakersResponse.success) {
      const caretakers = caretakersResponse.data.caretakers || [];
      setCaretakerOptions(caretakers.map((caretaker) => ({
        value: String(caretaker.id),
        label: `#${caretaker.id} - ${caretaker.area}`,
      })));
    }
    if (supervisorsResponse.success) {
      const supervisors = supervisorsResponse.data.supervisors || [];
      setSupervisorOptions(supervisors.map((supervisor) => ({
        value: String(supervisor.id),
        label: `#${supervisor.id} - ${supervisor.area}`,
      })));
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchAssignees();
  }, [scope]);

  const handleAssign = async (complaintId) => {
    if (!caretakerId && !supervisorId) {
      notifications.show({
        title: "Error",
        message: "Please enter at least one of Caretaker ID or Supervisor ID.",
        color: "red",
      });
      return;
    }
    setAssignLoading(true);
    const caretakerValue = caretakerId ? Number(caretakerId) : null;
    const supervisorValue = supervisorId ? Number(supervisorId) : null;
    const response = await adminAssign(complaintId, caretakerValue, supervisorValue, token);
    setAssignLoading(false);
    if (response.success) {
      notifications.show({
        title: "Intervention Applied",
        message: "Complaint assignment has been updated and moved to active handling.",
        color: "blue",
      });
      setAssigningId(null);
      setCaretakerId("");
      setSupervisorId("");
      fetchComplaints();
    } else {
      const msg =
        response?.error?.message ||
        response?.error?.detail ||
        (typeof response?.error === "string"
          ? response.error
          : JSON.stringify(response?.error || {}));
      notifications.show({
        title: "Error",
        message: msg || "Failed to assign complaint.",
        color: "red",
      });
    }
  };

  const formatDateTime = (datetimeStr) => {
    const date = new Date(datetimeStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };

  const severityLabel = (priority) => {
    const value = String(priority || "").toUpperCase();
    if (value === "EMERGENCY") return "Critical";
    if (value === "URGENT") return "High";
    if (value === "LOW") return "Low";
    return "Medium";
  };

  const severityColor = (priority) => {
    const value = String(priority || "").toUpperCase();
    if (value === "EMERGENCY") return "grape";
    if (value === "URGENT") return "red";
    if (value === "LOW") return "green";
    return "yellow";
  };

  if (showDetails && selectedComplaint) {
    return (
      <Grid mt="xl" style={{ paddingInline: "49px", width: "100%" }}>
        <Paper
          radius="md" px="lg" pt="sm" pb="xl"
          style={{ borderLeft: "0.6rem solid #15ABFF", width: "70vw", backgroundColor: "white" }}
          withBorder
        >
          <ComplaintDetails
            complaintId={selectedComplaint.id}
            onBack={() => setShowDetails(false)}
          />
        </Paper>
      </Grid>
    );
  }

  return (
    <Grid mt="xl" style={{ paddingInline: "49px", width: "100%" }}>
      <Paper
        radius="md" px="lg" pt="sm" pb="xl"
        style={{
          borderLeft: "0.6rem solid #15ABFF",
          width: "100%",
          backgroundColor: "white",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
        withBorder
      >
        <Title order={3} mb="md" size="24px">Admin Dashboard</Title>

        <Text size="13px" color="dimmed" mb="md">
          Monitor overdue and escalated complaints, review details, and intervene by reassigning caretaker/supervisor.
        </Text>

        <Flex gap="xs" mb="md">
          <Button
            size="xs"
            variant={scope === "overdue_escalated" ? "filled" : "outline"}
            onClick={() => setScope("overdue_escalated")}
          >
            Overdue and Escalated
          </Button>
          <Button
            size="xs"
            variant={scope === "all_unresolved" ? "filled" : "outline"}
            onClick={() => setScope("all_unresolved")}
          >
            All Unresolved
          </Button>
        </Flex>

        <Grid mb="md">
          <Grid.Col span={3}>
            <Paper withBorder p="sm">
              <Text size="xs" color="dimmed">In Scope</Text>
              <Text size="xl" weight={700}>{stats.total}</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="sm">
              <Text size="xs" color="dimmed">Escalated</Text>
              <Text size="xl" weight={700} color="orange">{stats.escalated}</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="sm">
              <Text size="xs" color="dimmed">Overdue</Text>
              <Text size="xl" weight={700} color="red">{stats.overdue}</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="sm">
              <Text size="xs" color="dimmed">Needs Assignment</Text>
              <Text size="xl" weight={700} color="grape">{stats.needsAssignment}</Text>
            </Paper>
          </Grid.Col>
        </Grid>

        {isLoading ? (
          <Center style={{ minHeight: "40vh" }}>
            <Loader size="xl" variant="bars" />
          </Center>
        ) : isError ? (
          <Center style={{ minHeight: "40vh" }}>
            <Text color="red" size="14px">{errorMessage}</Text>
          </Center>
        ) : complaints.length === 0 ? (
          <Center style={{ minHeight: "40vh" }}>
            <Text size="14px">No complaints found in this scope.</Text>
          </Center>
        ) : (
          complaints.map((complaint) => {
            const statusInfo = STATUS_MAP[complaint.status] || { label: "Unknown", color: "gray" };
            const isOverdue = isOverdueComplaint(complaint);
            const hasFeedback = !!complaint.has_feedback || (complaint.feedback || "").trim().length > 0;

            return (
              <Paper
                key={complaint.id}
                radius="md" px="lg" pt="sm" pb="xl"
                style={{ width: "100%", margin: "10px 0" }}
                withBorder
              >
                <Flex direction="column" style={{ width: "100%" }}>
                  <Flex direction="row" justify="space-between" align="center">
                    <Flex direction="row" gap="xs" align="center">
                      <Text size="14px" style={{ fontWeight: "bold" }}>
                        #{complaint.id}
                      </Text>
                      <Badge size="lg" color={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                      <Badge size="lg" color="blue">{complaint.complaint_type}</Badge>
                      {isOverdue && (
                        <Badge size="lg" color="red" variant="filled">
                          OVERDUE
                        </Badge>
                      )}
                      {complaint.priority && (
                        <Badge
                          size="sm"
                          color={complaint.priority === "URGENT" ? "red" : complaint.priority === "LOW" ? "gray" : "blue"}
                          variant="outline"
                        >
                          {complaint.priority}
                        </Badge>
                      )}
                      {hasFeedback && (
                        <Badge size="sm" color="teal" variant="outline">
                          Feedback Available
                        </Badge>
                      )}
                    </Flex>
                  </Flex>

                  <Flex direction="column" gap="xs" mt="xs">
                    <Text size="14px">
                      <strong>Date:</strong> {formatDateTime(complaint.complaint_date)}
                    </Text>
                    <Text size="14px">
                      <strong>Location:</strong> {complaint.specific_location}, {complaint.location}
                    </Text>
                    <Flex gap="xs" align="center" wrap="wrap">
                      <Text size="14px">
                        <strong>SLA Deadline:</strong> {complaint.sla_deadline ? formatDateTime(complaint.sla_deadline) : "N/A"}
                      </Text>
                      <Badge size="sm" color={severityColor(complaint.priority)} variant="light">
                        {severityLabel(complaint.priority)}
                      </Badge>
                    </Flex>
                    <Text size="14px">
                      <strong>Assigned Caretaker:</strong> {complaint.assigned_caretaker || "Not assigned"}
                    </Text>
                    <Text size="14px">
                      <strong>Assigned Supervisor:</strong> {complaint.assigned_supervisor || "Not assigned"}
                    </Text>
                  </Flex>

                  <Divider my="sm" />

                  <Flex direction="row" justify="space-between" align="center">
                    <Text size="14px">
                      <strong>Details:</strong> {complaint.details}
                    </Text>
                    <Flex gap="sm">
                      <Button
                        variant="outline" size="xs"
                        onClick={() => { setSelectedComplaint(complaint); setShowDetails(true); }}
                      >
                        Details
                      </Button>
                      {assigningId === complaint.id ? (
                        <Flex gap="xs" align="center">
                          <Select
                            placeholder="Caretaker ID"
                            value={caretakerId}
                            onChange={setCaretakerId}
                            data={caretakerOptions}
                            searchable
                            clearable
                            size="xs"
                            style={{ width: 170 }}
                          />
                          <Select
                            placeholder="Supervisor ID"
                            value={supervisorId}
                            onChange={setSupervisorId}
                            data={supervisorOptions}
                            searchable
                            clearable
                            size="xs"
                            style={{ width: 170 }}
                          />
                          <Button size="xs" color="blue" loading={assignLoading} onClick={() => handleAssign(complaint.id)}>
                            Reassign
                          </Button>
                          <Button size="xs" variant="outline" onClick={() => setAssigningId(null)}>
                            Cancel
                          </Button>
                        </Flex>
                      ) : (
                        <Button
                          variant="outline" size="xs" color="grape"
                          onClick={() => {
                            setAssigningId(complaint.id);
                            setCaretakerId("");
                            setSupervisorId("");
                          }}
                        >
                          Reassign
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              </Paper>
            );
          })
        )}
      </Paper>
    </Grid>
  );
}

export default AdminDashboard;

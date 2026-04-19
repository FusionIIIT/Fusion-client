import React, { useState, useEffect } from "react";
import {
  Button,
  ScrollArea,
  Table,
  Text,
  Container,
  Paper,
  LoadingOverlay,
  Select,
  Badge,
  Group,
  Alert,
} from "@mantine/core";
import axios from "axios";
import { host } from "../../../../../routes/globalRoutes/index.jsx";
import AddCommunicationLog from "./AddCommunicationLog.jsx";
import CommunicationLogDetail from "./CommunicationLogDetail.jsx";
import "../../../style/Pcc_Admin/ManageAttorneys.css";

const API_BASE_URL = `${host}/patentsystem`;

function CommunicationLogs() {
  const [logs, setLogs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddingLog, setIsAddingLog] = useState(false);

  const authToken = localStorage.getItem("authToken");

  // Fetch ongoing applications for the dropdown
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const [ongoingRes, newRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/pccAdmin/applications/ongoing/`, {
            headers: { Authorization: `Token ${authToken}` },
          }),
          axios.get(`${API_BASE_URL}/pccAdmin/applications/new/`, {
            headers: { Authorization: `Token ${authToken}` },
          }),
        ]);

        const ongoingApps = ongoingRes.data.applications || [];
        const newApps = newRes.data.applications || [];
        const allApps = [...newApps, ...ongoingApps];

        // Deduplicate by id
        const uniqueApps = allApps.reduce((acc, app) => {
          if (!acc.find((a) => a.application_id === app.application_id)) {
            acc.push(app);
          }
          return acc;
        }, []);

        setApplications(uniqueApps);
        setError(null);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [authToken]);

  // Fetch communication logs when application is selected
  useEffect(() => {
    if (!selectedApplicationId) {
      setLogs([]);
      return;
    }

    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/pccAdmin/applications/${selectedApplicationId}/communications/`,
          {
            headers: { Authorization: `Token ${authToken}` },
          },
        );
        setLogs(response.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching communication logs:", err);
        setError("Failed to load communication logs.");
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [selectedApplicationId, authToken]);

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setIsAddingLog(false);
  };

  const handleBackToList = async () => {
    setSelectedLog(null);
    setIsAddingLog(false);
    // Refresh logs
    if (selectedApplicationId) {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/pccAdmin/applications/${selectedApplicationId}/communications/`,
          {
            headers: { Authorization: `Token ${authToken}` },
          },
        );
        setLogs(response.data || []);
      } catch (err) {
        console.error("Error refreshing logs:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddLogClick = () => {
    if (!selectedApplicationId) {
      setError("Please select an application first.");
      return;
    }
    setIsAddingLog(true);
    setSelectedLog(null);
  };

  const handleLogAdded = async () => {
    setIsAddingLog(false);
    // Refresh logs
    if (selectedApplicationId) {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/pccAdmin/applications/${selectedApplicationId}/communications/`,
          {
            headers: { Authorization: `Token ${authToken}` },
          },
        );
        setLogs(response.data || []);
      } catch (err) {
        console.error("Error refreshing logs:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDirectionBadge = (direction) => {
    if (direction === "OUTGOING") {
      return (
        <Badge color="blue" variant="light">
          Outgoing
        </Badge>
      );
    }
    return (
      <Badge color="green" variant="light">
        Incoming
      </Badge>
    );
  };

  // Show detail view
  if (selectedLog) {
    return (
      <CommunicationLogDetail log={selectedLog} onBack={handleBackToList} />
    );
  }

  // Show add form
  if (isAddingLog) {
    return (
      <AddCommunicationLog
        applicationId={selectedApplicationId}
        onBack={handleBackToList}
        onSuccess={handleLogAdded}
      />
    );
  }

  const applicationOptions = applications.map((app) => ({
    value: String(app.application_id),
    label: `#${app.application_id} — ${app.title || "Untitled"}`,
  }));

  return (
    <Container id="pms-pcc-manage-attorneys-container">
      <Text id="pms-pcc-page-heading-title">Communication Logs</Text>
      <Text size="sm" color="dimmed" mb="md">
        Log and track all external communications with attorneys, patent
        offices, and other parties.
      </Text>

      {error && (
        <Alert
          color="red"
          mb="md"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Application Selector */}
      <Group mb="md" align="flex-end">
        <Select
          label="Select Application"
          placeholder="Choose an application to view logs"
          data={applicationOptions}
          value={selectedApplicationId ? String(selectedApplicationId) : null}
          onChange={(val) => setSelectedApplicationId(val)}
          searchable
          clearable
          style={{ flex: 1, maxWidth: 500 }}
        />

        <Button
          variant="outline"
          color="blue"
          onClick={handleAddLogClick}
          id="pms-pcc-add-new-attorney-button"
          disabled={!selectedApplicationId}
        >
          + Add Communication Log
        </Button>
      </Group>

      {isLoading && <LoadingOverlay visible />}

      {selectedApplicationId && !isLoading && (
        <Paper id="pms-pcc-manage-attorney-table-card">
          <ScrollArea>
            <Table
              highlightOnHover
              striped
              withBorder
              id="pms-pcc-manage-attorney-styledTable"
            >
              <thead id="pms-pcc-fusionTableHeader">
                <tr>
                  <th>Date</th>
                  <th>Direction</th>
                  <th>Subject</th>
                  <th>External Party</th>
                  <th>Confidentiality</th>
                  <th>Logged By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      <Text color="dimmed" py="md">
                        No communication logs found for this application.
                      </Text>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDate(log.created_at)}</td>
                      <td>{getDirectionBadge(log.direction)}</td>
                      <td>{log.subject}</td>
                      <td>{log.external_party_name || "N/A"}</td>
                      <td>
                        <Badge
                          color={
                            log.confidentiality_level ===
                            "Attorney-Client Privileged"
                              ? "red"
                              : log.confidentiality_level === "Confidential"
                                ? "orange"
                                : log.confidentiality_level === "Public"
                                  ? "green"
                                  : "blue"
                          }
                          variant="light"
                        >
                          {log.confidentiality_level || "Internal"}
                        </Badge>
                      </td>
                      <td>{log.logged_by_name || "PCC Admin"}</td>
                      <td>
                        <Button
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewDetail(log)}
                          id="pms-pcc-view-details-button"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </ScrollArea>
        </Paper>
      )}

      {!selectedApplicationId && !isLoading && (
        <Paper p="xl" withBorder mt="md" style={{ textAlign: "center" }}>
          <Text color="dimmed" size="lg">
            Select an application above to view its communication logs.
          </Text>
        </Paper>
      )}
    </Container>
  );
}

export default CommunicationLogs;

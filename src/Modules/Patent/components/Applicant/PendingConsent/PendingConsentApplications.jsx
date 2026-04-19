import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Button,
  Group,
  Badge,
  Box,
  Loader,
  Alert,
  Modal,
  Divider,
  Progress,
  Grid,
} from "@mantine/core";
import {
  Handshake,
  CheckCircle,
  Warning,
  Eye,
  Clock
} from "@phosphor-icons/react";
import axios from "axios";
import { host } from "../../../../../routes/globalRoutes/index.jsx";

const API_BASE_URL = `${host}/patentsystem`;

const PendingConsentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    fetchPendingConsentApplications();
  }, []);

  const fetchPendingConsentApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/applicant/applications/pending-consent/`,
        {
          headers: { Authorization: `Token ${authToken}` },
        }
      );
      setApplications(response.data || []);
    } catch (err) {
      console.error("Error fetching pending consent applications:", err);
      setActionMessage({
        type: "error",
        text: "Failed to load pending consent applications.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGiveConsent = async (applicationId) => {
    try {
      setConsentLoading(true);
      await axios.post(
        `${API_BASE_URL}/applicant/applications/consent/${applicationId}/`,
        {},
        {
          headers: { Authorization: `Token ${authToken}` },
        }
      );

      setActionMessage({
        type: "success",
        text: "Consent given successfully! The application owner will be notified.",
      });

      // Refresh the list
      fetchPendingConsentApplications();
      setDetailModalOpen(false);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to give consent.",
      });
    } finally {
      setConsentLoading(false);
    }
  };

  const openDetailModal = async (application) => {
    try {
      // Fetch full application details
      const response = await axios.get(
        `${API_BASE_URL}/applicant/applications/details/${application.application_id}`,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      setSelectedApplication(response.data);
      setDetailModalOpen(true);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: "Failed to load application details.",
      });
    }
  };

  if (loading) {
    return (
      <Box style={{ textAlign: "center", padding: "2rem" }}>
        <Loader size="lg" />
        <Text mt="md">Loading pending consent applications...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Group position="apart" mb="lg">
        <Text size="xl" weight={600}>
          <Handshake size={24} style={{ marginRight: "10px", verticalAlign: "middle" }} />
          Applications Awaiting Your Consent
        </Text>
        <Badge color="orange" size="lg">
          {applications.length} Pending
        </Badge>
      </Group>

      {actionMessage && (
        <Alert
          color={actionMessage.type === "success" ? "green" : "red"}
          title={actionMessage.type === "success" ? "Success" : "Error"}
          mb="md"
          withCloseButton
          onClose={() => setActionMessage(null)}
        >
          {actionMessage.text}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card p="xl" radius="md" withBorder style={{ textAlign: "center" }}>
          <CheckCircle size={48} color="#51cf66" style={{ marginBottom: "1rem" }} />
          <Text size="lg" weight={500} mb="sm">
            No Pending Consents
          </Text>
          <Text color="dimmed">
            You don't have any patent applications waiting for your consent.
          </Text>
        </Card>
      ) : (
        <Box>
          {applications.map((app) => (
            <Card key={app.application_id} p="lg" radius="md" withBorder mb="md">
              <Grid>
                <Grid.Col span={8}>
                  <Text weight={600} size="lg" mb="xs">
                    {app.title}
                  </Text>
                  <Text size="sm" color="dimmed" mb="sm">
                    Token: {app.token_number} • Primary Applicant: {app.primary_applicant}
                  </Text>

                  <Group spacing="xs" mb="sm">
                    <Badge color="orange" leftSection={<Clock size={14} />}>
                      Pending Your Consent
                    </Badge>
                    <Badge variant="outline">
                      Your Share: {app.your_percentage}%
                    </Badge>
                  </Group>

                  <Text size="sm" color="dimmed">
                    Submitted: {new Date(app.submitted_date).toLocaleDateString()}
                  </Text>
                </Grid.Col>

                <Grid.Col span={4} style={{ textAlign: "right" }}>
                  <Box mb="md">
                    <Text size="sm" color="dimmed" mb="xs">
                      Consent Progress
                    </Text>
                    <Progress
                      value={(app.consents_received / app.total_inventors) * 100}
                      color="teal"
                      size="sm"
                      mb="xs"
                    />
                    <Text size="xs" color="dimmed">
                      {app.consents_received} of {app.total_inventors} inventors
                    </Text>
                  </Box>

                  <Group spacing="sm">
                    <Button
                      variant="light"
                      leftSection={<Eye size={16} />}
                      onClick={() => openDetailModal(app)}
                    >
                      Review
                    </Button>
                    <Button
                      color="green"
                      leftSection={<CheckCircle size={16} />}
                      onClick={() => handleGiveConsent(app.application_id)}
                      loading={consentLoading}
                    >
                      Give Consent
                    </Button>
                  </Group>
                </Grid.Col>
              </Grid>
            </Card>
          ))}
        </Box>
      )}

      {/* Application Detail Modal */}
      <Modal
        opened={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        size="xl"
        title="Application Details - Review for Consent"
      >
        {selectedApplication && (
          <Box>
            <Text weight={600} size="lg" mb="md">
              {selectedApplication.title}
            </Text>

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" weight={500}>Token Number:</Text>
                <Text size="sm" color="dimmed" mb="sm">{selectedApplication.token_number}</Text>

                <Text size="sm" weight={500}>Primary Applicant:</Text>
                <Text size="sm" color="dimmed" mb="sm">{selectedApplication.primary_applicant}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="sm" weight={500}>IP Type:</Text>
                <Text size="sm" color="dimmed" mb="sm">{selectedApplication.section_i?.type_of_ip || "N/A"}</Text>

                <Text size="sm" weight={500}>Area of Invention:</Text>
                <Text size="sm" color="dimmed" mb="sm">{selectedApplication.section_i?.area || "N/A"}</Text>
              </Grid.Col>
            </Grid>

            <Divider my="md" />

            <Text weight={500} mb="sm">Problem Statement:</Text>
            <Text size="sm" color="dimmed" mb="md">{selectedApplication.section_i?.problem || "N/A"}</Text>

            <Text weight={500} mb="sm">Objective:</Text>
            <Text size="sm" color="dimmed" mb="md">{selectedApplication.section_i?.objective || "N/A"}</Text>

            <Divider my="md" />

            <Text weight={500} mb="sm">Inventors & Shares:</Text>
            {selectedApplication.inventors?.map((inventor, index) => (
              <Box key={index} p="sm" mb="xs" style={{
                backgroundColor: inventor.user_email === localStorage.getItem("userEmail")
                  ? "#e6fffa" : "#f8f9fa",
                borderRadius: "8px"
              }}>
                <Group position="apart">
                  <Box>
                    <Text size="sm" weight={500}>
                      {inventor.name}
                      {inventor.user_email === localStorage.getItem("userEmail") && (
                        <Badge color="blue" size="xs" ml="xs">You</Badge>
                      )}
                    </Text>
                    <Text size="xs" color="dimmed">{inventor.email}</Text>
                  </Box>
                  <Group>
                    <Badge color="gray" variant="outline">
                      {inventor.percentage_share}%
                    </Badge>
                    {inventor.has_consent ? (
                      <Badge color="green" leftSection={<CheckCircle size={12} />}>
                        Consented
                      </Badge>
                    ) : (
                      <Badge color="orange" leftSection={<Warning size={12} />}>
                        Pending
                      </Badge>
                    )}
                  </Group>
                </Group>
              </Box>
            ))}

            <Divider my="md" />

            <Group position="apart">
              <Text size="sm" color="dimmed">
                By giving consent, you acknowledge your {selectedApplication.inventors?.find(inv =>
                  inv.user_email === localStorage.getItem("userEmail")
                )?.percentage_share}% ownership share in this patent application.
              </Text>
              <Group>
                <Button
                  variant="light"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  color="green"
                  leftSection={<CheckCircle size={16} />}
                  onClick={() => handleGiveConsent(selectedApplication.application_id)}
                  loading={consentLoading}
                >
                  Give Consent
                </Button>
              </Group>
            </Group>
          </Box>
        )}
      </Modal>
    </Box>
  );
};

export default PendingConsentApplications;
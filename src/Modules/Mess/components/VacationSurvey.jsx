import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
  Textarea,
} from "@mantine/core";
import {
  CheckCircle,
  Calendar,
  WarningCircle,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import { vacationSurveyRoute, vacationSurveyResponseRoute } from "../routes";

// ============= STUDENT COMPONENT =============
export function StudentVacationSurvey() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState("");

  const getHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { Authorization: `Token ${token}` };
  };

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const response = await axios.get(vacationSurveyRoute, {
          headers: getHeaders(),
        });
        setSurveys(response.data.payload || []);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load vacation surveys right now.",
        );
        setSurveys([]);
      } finally {
        setLoading(false);
      }
    };

    loadSurveys();
  }, []);

  const handleSubmitResponse = async (surveyId, preferences) => {
    try {
      setSubmittingId(surveyId);
      const response = await axios.post(
        vacationSurveyResponseRoute,
        {
          survey_id: surveyId,
          preferences,
        },
        { headers: getHeaders() },
      );

      setSurveys((prev) =>
        prev.map((survey) =>
          survey.id === surveyId
            ? {
                ...survey,
                user_responded: true,
                user_response: response.data.payload,
              }
            : survey,
        ),
      );

      notifications.show({
        title: "Response Submitted",
        message:
          response.data.message ||
          "Your vacation survey response was saved successfully.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (err) {
      notifications.show({
        title: "Submission Failed",
        message:
          err.response?.data?.message ||
          "Unable to submit your response. Please try again.",
        color: "red",
        icon: <WarningCircle size={18} />,
      });
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" p="xl">
        <Loader />
      </Flex>
    );
  }

  const activeSurveys = surveys.filter((s) => s.status === "active");
  const closedSurveys = surveys.filter((s) => s.status === "closed");

  return (
    <Stack gap="lg">
      {error ? (
        <Alert color="red" icon={<WarningCircle size={18} />}>
          {error}
        </Alert>
      ) : null}

      <Card shadow="sm" radius="lg" p="xl" withBorder>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={3} c="#1c7ed6">
              Vacation Food Preference Surveys
            </Title>
            <Text c="dimmed" size="sm" mt={4}>
              Help us plan better food options during your vacation periods.
            </Text>
          </div>
          <Badge size="lg" variant="light" color="blue">
            {activeSurveys.length} Active
          </Badge>
        </Group>
      </Card>

      {activeSurveys.length === 0 && closedSurveys.length === 0 ? (
        <Card shadow="sm" radius="lg" p="xl" withBorder>
          <Text fw={600}>No surveys available right now.</Text>
          <Text size="sm" c="dimmed" mt={4}>
            New surveys will appear here when caretakers publish them.
          </Text>
        </Card>
      ) : null}

      {activeSurveys.length > 0 ? (
        <Stack gap="md">
          <Group gap="xs">
            <Calendar size={18} color="#1c7ed6" />
            <Title order={4}>Active Surveys</Title>
          </Group>

          {activeSurveys.map((survey) => (
            <SurveyResponseCard
              key={survey.id}
              survey={survey}
              onSubmit={handleSubmitResponse}
              isSubmitting={submittingId === survey.id}
            />
          ))}
        </Stack>
      ) : null}

      {closedSurveys.length > 0 ? (
        <Stack gap="md">
          <Group gap="xs">
            <Calendar size={18} color="#999" />
            <Title order={4}>Closed Surveys</Title>
          </Group>

          {closedSurveys.map((survey) => (
            <Card key={survey.id} shadow="sm" radius="lg" p="xl" withBorder>
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <div>
                  <Badge color="gray">Closed</Badge>
                  <Title order={4} mt="sm">
                    {survey.title}
                  </Title>
                  {survey.description && (
                    <Text size="sm" mt="sm">
                      {survey.description}
                    </Text>
                  )}
                </div>
              </Group>
            </Card>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

function SurveyResponseCard({ survey, onSubmit, isSubmitting }) {
  const [preferences, setPreferences] = useState(
    survey.user_response?.preferences || "",
  );

  return (
    <Card shadow="sm" radius="lg" p="xl" withBorder>
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <div>
          <Group gap="xs" mb="xs">
            <Badge color="teal">Active</Badge>
            {survey.vacation_period && (
              <Badge variant="light" color="blue">
                {survey.vacation_period}
              </Badge>
            )}
          </Group>
          <Title order={4}>{survey.title}</Title>
          {survey.description && (
            <Text size="sm" c="dimmed" mt={4}>
              {survey.description}
            </Text>
          )}
        </div>

        {survey.user_responded ? (
          <Badge color="green" variant="light">
            Response submitted
          </Badge>
        ) : null}
      </Group>

      <Divider my="lg" />

      <Stack gap="md">
        <Textarea
          placeholder="Share your food preferences, dietary restrictions, or special requests..."
          label="Your Preferences"
          minRows={4}
          value={preferences}
          onChange={(e) => setPreferences(e.currentTarget.value)}
          disabled={isSubmitting || survey.user_responded}
        />

        <Button
          onClick={() => onSubmit(survey.id, preferences)}
          loading={isSubmitting}
          disabled={survey.user_responded || !preferences.trim()}
          fullWidth
          color="blue"
        >
          {survey.user_responded ? "Response Submitted" : "Submit Response"}
        </Button>
      </Stack>
    </Card>
  );
}

// ============= CARETAKER COMPONENT =============
export function CaretakerVacationSurvey() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    title: "",
    description: "",
    vacation_period: "",
  });

  const getHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { Authorization: `Token ${token}` };
  };

  const loadSurveys = async () => {
    try {
      const response = await axios.get(vacationSurveyRoute, {
        headers: getHeaders(),
      });
      setSurveys(response.data.payload || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load vacation surveys right now.",
      );
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleCreateSurvey = async () => {
    if (!newSurvey.title.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Survey title is required.",
        color: "red",
        icon: <WarningCircle size={18} />,
      });
      return;
    }

    try {
      const response = await axios.post(vacationSurveyRoute, newSurvey, {
        headers: getHeaders(),
      });

      setSurveys((prev) => [response.data.payload, ...prev]);
      setCreateModalOpen(false);
      setNewSurvey({
        title: "",
        description: "",
        vacation_period: "",
      });

      notifications.show({
        title: "Survey Created",
        message: "New vacation survey has been created successfully.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (err) {
      notifications.show({
        title: "Creation Failed",
        message:
          err.response?.data?.message ||
          "Unable to create survey. Please try again.",
        color: "red",
        icon: <WarningCircle size={18} />,
      });
    }
  };

  const handleDeleteSurvey = async (surveyId) => {
    try {
      await axios.delete(`${vacationSurveyRoute}${surveyId}/`, {
        headers: getHeaders(),
      });

      setSurveys((prev) => prev.filter((s) => s.id !== surveyId));

      notifications.show({
        title: "Survey Deleted",
        message: "Vacation survey has been removed.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (err) {
      notifications.show({
        title: "Deletion Failed",
        message:
          err.response?.data?.message ||
          "Unable to delete survey. Please try again.",
        color: "red",
        icon: <WarningCircle size={18} />,
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" p="xl">
        <Loader />
      </Flex>
    );
  }

  return (
    <Stack gap="lg">
      {error ? (
        <Alert color="red" icon={<WarningCircle size={18} />}>
          {error}
        </Alert>
      ) : null}

      <Card shadow="sm" radius="lg" p="xl" withBorder>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={3} c="#1c7ed6">
              Manage Vacation Food Surveys
            </Title>
            <Text c="dimmed" size="sm" mt={4}>
              Create surveys to gather student preferences during vacation
              periods.
            </Text>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            leftSection={<Plus size={18} />}
            color="blue"
          >
            Create Survey
          </Button>
        </Group>
      </Card>

      <CreateSurveyModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSurvey}
        newSurvey={newSurvey}
        setNewSurvey={setNewSurvey}
      />

      {surveys.length === 0 ? (
        <Card shadow="sm" radius="lg" p="xl" withBorder>
          <Text fw={600}>No surveys created yet.</Text>
          <Text size="sm" c="dimmed" mt={4}>
            Click "Create Survey" to get started.
          </Text>
        </Card>
      ) : (
        <Stack gap="md">
          {surveys.map((survey) => (
            <Card key={survey.id} shadow="sm" radius="lg" p="xl" withBorder>
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <div>
                  <Group gap="xs" mb="xs">
                    <Badge color={survey.status === "active" ? "teal" : "gray"}>
                      {survey.status}
                    </Badge>
                    {survey.response_count !== undefined && (
                      <Badge variant="light" color="blue">
                        {survey.response_count} responses
                      </Badge>
                    )}
                  </Group>
                  <Title order={4}>{survey.title}</Title>
                  {survey.vacation_period && (
                    <Text size="sm" c="dimmed" mt={4}>
                      Period: {survey.vacation_period}
                    </Text>
                  )}
                  {survey.description && (
                    <Text size="sm" mt="sm">
                      {survey.description}
                    </Text>
                  )}
                </div>
                <Button
                  onClick={() => handleDeleteSurvey(survey.id)}
                  color="red"
                  variant="light"
                  size="sm"
                  leftSection={<Trash size={16} />}
                >
                  Delete
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function CreateSurveyModal({
  opened,
  onClose,
  onSubmit,
  newSurvey,
  setNewSurvey,
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Create Vacation Survey">
      <Stack gap="md">
        <input
          type="text"
          placeholder="Survey Title (e.g., 'Winter Vacation Preferences')"
          value={newSurvey.title}
          onChange={(e) =>
            setNewSurvey({ ...newSurvey, title: e.target.value })
          }
          style={{
            padding: "8px",
            border: "1px solid #ced4da",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />

        <Textarea
          placeholder="Survey Description (optional)"
          minRows={3}
          value={newSurvey.description}
          onChange={(e) =>
            setNewSurvey({ ...newSurvey, description: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Vacation Period (e.g., 'Dec 15 - Jan 15')"
          value={newSurvey.vacation_period}
          onChange={(e) =>
            setNewSurvey({ ...newSurvey, vacation_period: e.target.value })
          }
          style={{
            padding: "8px",
            border: "1px solid #ced4da",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />

        <Group justify="flex-end" gap="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} color="blue">
            Create Survey
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

SurveyResponseCard.propTypes = {
  survey: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    vacation_period: PropTypes.string,
    user_responded: PropTypes.bool,
    user_response: PropTypes.shape({
      preferences: PropTypes.string,
    }),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

CreateSurveyModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  newSurvey: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    vacation_period: PropTypes.string.isRequired,
  }).isRequired,
  setNewSurvey: PropTypes.func.isRequired,
};

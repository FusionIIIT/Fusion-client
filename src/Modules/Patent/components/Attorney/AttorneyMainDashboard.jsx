import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Loader,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { attorneyService } from "../../services/attorneyService.jsx";

function AttorneyMainDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentsByApplication, setCommentsByApplication] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const response = await attorneyService.fetchAttorneyApplications();
        setApplications(response.applications || []);
      } catch (loadError) {
        console.error("Failed to load attorney applications:", loadError);
        setError("Unable to load assigned applications.");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const handleForward = async (applicationId) => {
    const comments = (commentsByApplication[applicationId] || "").trim();
    if (!comments) {
      setError("Comments are required before forwarding to Director.");
      return;
    }

    try {
      setSubmittingId(applicationId);
      await attorneyService.forwardAttorneyApplicationToDirector(
        applicationId,
        comments,
      );
      setApplications((currentApplications) =>
        currentApplications.filter(
          (application) => application.application_id !== applicationId,
        ),
      );
      setCommentsByApplication((currentComments) => {
        const nextComments = { ...currentComments };
        delete nextComments[applicationId];
        return nextComments;
      });
      setError("");
    } catch (forwardError) {
      console.error("Failed to forward application:", forwardError);
      setError(
        forwardError.response?.data?.error || "Unable to forward application.",
      );
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <Title order={2} mb="md">
        Attorney Review Queue
      </Title>
      <Text mb="lg" c="dimmed">
        Review the patentability assessment, add justification, and forward the
        application back to the Director.
      </Text>

      {error ? (
        <Alert color="red" mb="lg">
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Loader />
      ) : applications.length === 0 ? (
        <Card withBorder>
          <Text>No applications are currently assigned to you.</Text>
        </Card>
      ) : (
        <Stack gap="md">
          {applications.map((application) => (
            <Card
              key={application.application_id}
              withBorder
              shadow="sm"
              p="lg"
            >
              <Stack gap="sm">
                <div>
                  <Text fw={700} size="lg">
                    {application.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Application ID: {application.application_id}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Status: {application.ui_status || application.status}
                  </Text>
                </div>

                <Textarea
                  label="Attorney comments"
                  placeholder="Add your patentability assessment and forwarding justification"
                  minRows={4}
                  value={
                    commentsByApplication[application.application_id] || ""
                  }
                  onChange={(event) =>
                    setCommentsByApplication((currentComments) => ({
                      ...currentComments,
                      [application.application_id]: event.currentTarget.value,
                    }))
                  }
                  required
                />

                <Button
                  onClick={() => handleForward(application.application_id)}
                  loading={submittingId === application.application_id}
                >
                  Forward to Director
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </div>
  );
}

export default AttorneyMainDashboard;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { dbFeedbackRoute, dbIssuesRoute } from "../../routes/dashboardRoutes";

export default function ViewDatabase() {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState({
    average_rating: 0,
    my_feedback: null,
    top_feedbacks: [],
  });

  const token = localStorage.getItem("authToken");
  const authHeaders = { Authorization: `Token ${token}` };

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      setLoading(true);
      try {
        const [issuesRes, feedbackRes] = await Promise.all([
          axios.get(dbIssuesRoute, { headers: authHeaders }),
          axios.get(dbFeedbackRoute, { headers: authHeaders }),
        ]);

        setIssues(issuesRes.data?.issues || []);
        setFeedbackSummary({
          average_rating: feedbackRes.data?.average_rating || 0,
          my_feedback: feedbackRes.data?.my_feedback || null,
          top_feedbacks: feedbackRes.data?.top_feedbacks || [],
        });
      } catch (error) {
        notifications.show({
          title: "Database",
          message: "Unable to load dashboard summary",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardSummary();
  }, []);

  const metrics = useMemo(() => {
    const openCount = issues.filter((issue) => !issue.closed).length;
    const closedCount = issues.filter((issue) => issue.closed).length;
    const myReported = issues.filter((issue) => issue.is_owner).length;
    const mySupported = issues.filter((issue) => issue.is_supported).length;

    return {
      openCount,
      closedCount,
      myReported,
      mySupported,
      avgRating: Number(feedbackSummary.average_rating || 0).toFixed(1),
      totalTopFeedbacks: feedbackSummary.top_feedbacks.length,
      hasMyFeedback: Boolean(feedbackSummary.my_feedback),
    };
  }, [issues, feedbackSummary]);

  const recentIssues = useMemo(() => issues.slice(0, 5), [issues]);

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Paper shadow="sm" p="xl" radius="md">
          <Stack gap="md">
            <Title order={2}>Database Dashboard</Title>
            <Text c="dimmed">
              Monitor issues, feedback, and activity from one place.
            </Text>

            <Group>
              <Button component={Link} to="/database/issues">Raise or Track Issues</Button>
              <Button component={Link} to="/database/feedback" variant="light">Give Feedback</Button>
              <Button component={Link} to="/database/search" variant="default">Search</Button>
            </Group>
          </Stack>
        </Paper>

        {loading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
              <Card withBorder>
                <Text size="sm" c="dimmed">Open Issues</Text>
                <Title order={3}>{metrics.openCount}</Title>
              </Card>
              <Card withBorder>
                <Text size="sm" c="dimmed">Closed Issues</Text>
                <Title order={3}>{metrics.closedCount}</Title>
              </Card>
              <Card withBorder>
                <Text size="sm" c="dimmed">Your Reported Issues</Text>
                <Title order={3}>{metrics.myReported}</Title>
              </Card>
              <Card withBorder>
                <Text size="sm" c="dimmed">Your Supported Issues</Text>
                <Title order={3}>{metrics.mySupported}</Title>
              </Card>
              <Card withBorder>
                <Text size="sm" c="dimmed">Average Feedback Rating</Text>
                <Title order={3}>{metrics.avgRating}</Title>
              </Card>
              <Card withBorder>
                <Text size="sm" c="dimmed">Top Feedback Entries</Text>
                <Title order={3}>{metrics.totalTopFeedbacks}</Title>
              </Card>
              <Card withBorder>
                <Text size="sm" c="dimmed">Your Feedback</Text>
                <Title order={4}>{metrics.hasMyFeedback ? "Submitted" : "Not Submitted"}</Title>
              </Card>
            </SimpleGrid>

            <Paper shadow="sm" p="xl" radius="md">
              <Stack gap="md">
                <Title order={4}>Recent Issues</Title>
                {recentIssues.length === 0 ? (
                  <Text c="dimmed">No issues found yet.</Text>
                ) : (
                  recentIssues.map((issue) => (
                    <Card key={issue.id} withBorder>
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={4}>
                          <Text fw={600}>{issue.title}</Text>
                          <Text size="sm" c="dimmed">{issue.text || "No description"}</Text>
                          <Text size="xs" c="dimmed">By {issue.username}</Text>
                        </Stack>
                        <Badge color={issue.closed ? "red" : "green"}>
                          {issue.closed ? "Closed" : "Open"}
                        </Badge>
                      </Group>
                    </Card>
                  ))
                )}
              </Stack>
            </Paper>
          </>
        )}
      </Stack>
    </Container>
  );
}

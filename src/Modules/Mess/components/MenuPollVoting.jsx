import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  CheckCircle,
  ForkKnife,
  ListChecks,
  WarningCircle,
} from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import { menuPollRoute, menuPollVoteRoute } from "../routes";

const MESS_LABELS = {
  mess1: "Central Mess 1",
  mess2: "Central Mess 2",
};

function formatPollMeta(poll) {
  const parts = [];
  if (poll.meal_time_display) {
    parts.push(poll.meal_time_display);
  }
  if (poll.poll_date) {
    parts.push(`For ${poll.poll_date}`);
  }
  return parts.join(" • ");
}

function MenuPollVoting() {
  const [polls, setPolls] = useState([]);
  const [messOption, setMessOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingVoteId, setSubmittingVoteId] = useState(null);
  const [error, setError] = useState("");

  const getHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { Authorization: `Token ${token}` };
  };

  useEffect(() => {
    const loadPolls = async () => {
      try {
        const response = await axios.get(menuPollRoute, {
          headers: getHeaders(),
        });
        setPolls(response.data.payload || []);
        setMessOption(response.data.mess_option || null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load menu polls right now.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPolls();
  }, []);

  const openPolls = polls.filter((poll) => poll.status === "open");
  const closedPolls = polls.filter((poll) => poll.status === "closed");

  const handleVote = async (pollId, optionId) => {
    try {
      setSubmittingVoteId(optionId);
      const response = await axios.post(
        menuPollVoteRoute,
        {
          poll_id: pollId,
          option_id: optionId,
        },
        { headers: getHeaders() },
      );

      setPolls((prev) =>
        prev.map((poll) => (poll.id === pollId ? response.data.payload : poll)),
      );
      notifications.show({
        title: "Vote recorded",
        message:
          response.data.message ||
          "Your menu preference was saved successfully.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit your vote.");
    } finally {
      setSubmittingVoteId(null);
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
              Vote on Upcoming Menu Choices
            </Title>
            <Text c="dimmed" size="sm" mt={4}>
              Share your preference for upcoming meals in your registered mess.
            </Text>
          </div>
          <Badge size="lg" variant="light" color="blue">
            {messOption
              ? polls[0]?.mess_option_display || MESS_LABELS[messOption]
              : "No mess linked"}
          </Badge>
        </Group>

        {!messOption ? (
          <Alert color="orange" mt="lg" icon={<ForkKnife size={18} />}>
            Register in a mess first to take part in menu polls.
          </Alert>
        ) : null}
      </Card>

      <Stack gap="md">
        <Group gap="xs">
          <ListChecks size={18} color="#1c7ed6" />
          <Title order={4}>Open Polls</Title>
        </Group>

        {openPolls.length === 0 ? (
          <Card shadow="sm" radius="lg" p="xl" withBorder>
            <Text fw={600}>No open menu polls right now.</Text>
            <Text size="sm" c="dimmed" mt={4}>
              New polls from the warden or caretaker will appear here.
            </Text>
          </Card>
        ) : (
          openPolls.map((poll) => (
            <Card key={poll.id} shadow="sm" radius="lg" p="xl" withBorder>
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <div>
                  <Group gap="xs" mb="xs">
                    <Badge color="teal">Open</Badge>
                    <Badge variant="light" color="blue">
                      {poll.total_votes} votes so far
                    </Badge>
                  </Group>
                  <Title order={4}>{poll.question}</Title>
                  {formatPollMeta(poll) ? (
                    <Text size="sm" c="dimmed" mt={4}>
                      {formatPollMeta(poll)}
                    </Text>
                  ) : null}
                  {poll.description ? (
                    <Text size="sm" mt="sm">
                      {poll.description}
                    </Text>
                  ) : null}
                </div>

                {poll.user_vote_option ? (
                  <Badge color="blue" variant="light">
                    Vote submitted
                  </Badge>
                ) : null}
              </Group>

              <Divider my="lg" />

              <Stack gap="sm">
                {poll.options.map((option) => (
                  <Paper
                    key={option.id}
                    radius="md"
                    p="md"
                    withBorder
                    bg={option.is_selected ? "#eef6ff" : "#ffffff"}
                  >
                    <Group justify="space-between" align="center" wrap="wrap">
                      <div>
                        <Text fw={600}>{option.option_text}</Text>
                        <Text size="xs" c="dimmed" mt={2}>
                          {option.vote_count} votes • {option.vote_percentage}%
                        </Text>
                      </div>
                      <Button
                        size="sm"
                        variant={option.is_selected ? "filled" : "light"}
                        color={option.is_selected ? "blue" : "gray"}
                        onClick={() => handleVote(poll.id, option.id)}
                        disabled={!poll.can_vote}
                        loading={submittingVoteId === option.id}
                      >
                        {option.is_selected ? "Selected" : "Vote"}
                      </Button>
                    </Group>
                  </Paper>
                ))}
              </Stack>

              <Text size="xs" c="dimmed" mt="md">
                You can update your choice while the poll remains open.
              </Text>
            </Card>
          ))
        )}
      </Stack>

      {closedPolls.length > 0 ? (
        <Stack gap="md">
          <Group gap="xs">
            <WarningCircle size={18} color="#495057" />
            <Title order={4}>Closed Polls</Title>
          </Group>

          {closedPolls.map((poll) => (
            <Card key={poll.id} shadow="sm" radius="lg" p="xl" withBorder>
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <div>
                  <Group gap="xs" mb="xs">
                    <Badge color="gray">Closed</Badge>
                    <Badge variant="light" color="blue">
                      {poll.total_votes} final votes
                    </Badge>
                  </Group>
                  <Title order={4}>{poll.question}</Title>
                  {formatPollMeta(poll) ? (
                    <Text size="sm" c="dimmed" mt={4}>
                      {formatPollMeta(poll)}
                    </Text>
                  ) : null}
                </div>
                {poll.user_vote_option ? (
                  <Badge color="blue" variant="light">
                    Your vote saved
                  </Badge>
                ) : null}
              </Group>

              <Divider my="lg" />

              <Stack gap="sm">
                {poll.options.map((option) => (
                  <Paper
                    key={option.id}
                    radius="md"
                    p="sm"
                    withBorder
                    bg={option.is_selected ? "#eef6ff" : "#ffffff"}
                  >
                    <Group justify="space-between" align="center">
                      <div>
                        <Text fw={600}>{option.option_text}</Text>
                        <Text size="xs" c="dimmed" mt={2}>
                          {option.vote_count} votes • {option.vote_percentage}%
                        </Text>
                      </div>
                      {option.is_selected ? (
                        <Badge color="blue" variant="light">
                          Your choice
                        </Badge>
                      ) : null}
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Card>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

export default MenuPollVoting;

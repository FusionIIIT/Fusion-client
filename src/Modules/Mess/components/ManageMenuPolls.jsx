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
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import {
  CheckCircle,
  ListChecks,
  LockKey,
  PlusCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import { menuPollRoute } from "../routes";

const MESS_OPTIONS = [
  { label: "Central Mess 1", value: "mess1" },
  { label: "Central Mess 2", value: "mess2" },
];

const MEAL_OPTIONS = [
  { label: "Any meal slot", value: "" },
  { label: "Monday Breakfast", value: "MB" },
  { label: "Monday Lunch", value: "ML" },
  { label: "Monday Dinner", value: "MD" },
  { label: "Tuesday Breakfast", value: "TB" },
  { label: "Tuesday Lunch", value: "TL" },
  { label: "Tuesday Dinner", value: "TD" },
  { label: "Wednesday Breakfast", value: "WB" },
  { label: "Wednesday Lunch", value: "WL" },
  { label: "Wednesday Dinner", value: "WD" },
  { label: "Thursday Breakfast", value: "THB" },
  { label: "Thursday Lunch", value: "THL" },
  { label: "Thursday Dinner", value: "THD" },
  { label: "Friday Breakfast", value: "FB" },
  { label: "Friday Lunch", value: "FL" },
  { label: "Friday Dinner", value: "FD" },
  { label: "Saturday Breakfast", value: "SB" },
  { label: "Saturday Lunch", value: "SL" },
  { label: "Saturday Dinner", value: "SD" },
  { label: "Sunday Breakfast", value: "SUB" },
  { label: "Sunday Lunch", value: "SUL" },
  { label: "Sunday Dinner", value: "SUD" },
];

const initialForm = {
  question: "",
  description: "",
  mess_option: "mess1",
  meal_time: "",
  poll_date: "",
  optionsText: "",
};

function parseOptions(optionsText) {
  return optionsText
    .split(/\n|,/)
    .map((option) => option.trim())
    .filter(Boolean);
}

function formatPollMeta(poll) {
  const parts = [poll.mess_option_display];
  if (poll.meal_time_display) {
    parts.push(poll.meal_time_display);
  }
  if (poll.poll_date) {
    parts.push(`For ${poll.poll_date}`);
  }
  return parts.join(" • ");
}

function ManageMenuPolls() {
  const [polls, setPolls] = useState([]);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPollId, setUpdatingPollId] = useState(null);
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
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load the menu polls right now.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPolls();
  }, []);

  const visiblePolls = polls.filter((poll) => {
    if (filter === "all") {
      return true;
    }
    return poll.status === filter;
  });

  const pollStats = {
    total: polls.length,
    open: polls.filter((poll) => poll.status === "open").length,
    votes: polls.reduce((sum, poll) => sum + (poll.total_votes || 0), 0),
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreatePoll = async () => {
    const options = parseOptions(form.optionsText);
    if (!form.question.trim()) {
      setError("Add a clear poll question before publishing.");
      return;
    }
    if (options.length < 2) {
      setError("Add at least two menu options for students to vote on.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = await axios.post(
        menuPollRoute,
        {
          question: form.question.trim(),
          description: form.description.trim(),
          mess_option: form.mess_option,
          meal_time: form.meal_time || null,
          poll_date: form.poll_date || null,
          options,
        },
        { headers: getHeaders() },
      );

      setPolls((prev) => [response.data.payload, ...prev]);
      setForm(initialForm);
      notifications.show({
        title: "Menu poll created",
        message:
          response.data.message || "Students can start voting on the new poll.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create the menu poll.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (poll) => {
    const nextStatus = poll.status === "open" ? "closed" : "open";
    try {
      setUpdatingPollId(poll.id);
      const response = await axios.put(
        menuPollRoute,
        {
          id: poll.id,
          status: nextStatus,
        },
        { headers: getHeaders() },
      );
      setPolls((prev) =>
        prev.map((item) =>
          item.id === poll.id ? response.data.payload : item,
        ),
      );
      notifications.show({
        title: nextStatus === "open" ? "Poll reopened" : "Poll closed",
        message:
          response.data.message || "The poll status was updated successfully.",
        color: nextStatus === "open" ? "blue" : "dark",
        icon:
          nextStatus === "open" ? (
            <PlusCircle size={18} />
          ) : (
            <LockKey size={18} />
          ),
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update the poll status.",
      );
    } finally {
      setUpdatingPollId(null);
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

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
        <Card
          shadow="sm"
          radius="lg"
          p="xl"
          withBorder
          style={{ gridColumn: "span 2" }}
        >
          <Stack gap="md">
            <div>
              <Title order={3} c="#1c7ed6">
                Create a Menu Poll
              </Title>
              <Text c="dimmed" size="sm" mt={4}>
                Publish a menu choice for one mess and collect student votes in
                the same workspace.
              </Text>
            </div>

            <TextInput
              label="Poll question"
              placeholder="What should be served for Friday dinner?"
              value={form.question}
              onChange={(event) =>
                handleChange("question", event.currentTarget.value)
              }
            />

            <Textarea
              label="Context"
              placeholder="Optional note for students"
              minRows={3}
              value={form.description}
              onChange={(event) =>
                handleChange("description", event.currentTarget.value)
              }
            />

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <div>
                <Text size="sm" fw={500} mb={6}>
                  Mess
                </Text>
                <SegmentedControl
                  fullWidth
                  value={form.mess_option}
                  onChange={(value) => handleChange("mess_option", value)}
                  data={MESS_OPTIONS}
                />
              </div>

              <div>
                <Text size="sm" fw={500} mb={6}>
                  Meal slot
                </Text>
                <select
                  value={form.meal_time}
                  onChange={(event) =>
                    handleChange("meal_time", event.currentTarget.value)
                  }
                  style={{
                    width: "100%",
                    minHeight: 36,
                    borderRadius: 8,
                    border: "1px solid #ced4da",
                    padding: "0 12px",
                    backgroundColor: "#fff",
                  }}
                >
                  {MEAL_OPTIONS.map((item) => (
                    <option key={item.value || "blank"} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <TextInput
                label="Target date"
                type="date"
                value={form.poll_date}
                onChange={(event) =>
                  handleChange("poll_date", event.currentTarget.value)
                }
              />
            </SimpleGrid>

            <Textarea
              label="Poll options"
              description="Add one menu option per line. Commas also work."
              placeholder={"Paneer Bhurji\nAloo Paratha\nPoha"}
              minRows={4}
              value={form.optionsText}
              onChange={(event) =>
                handleChange("optionsText", event.currentTarget.value)
              }
            />

            <Group justify="flex-end">
              <Button
                leftSection={<PlusCircle size={18} />}
                onClick={handleCreatePoll}
                loading={saving}
              >
                Publish Poll
              </Button>
            </Group>
          </Stack>
        </Card>

        <Stack gap="lg">
          <Card shadow="sm" radius="lg" p="lg" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="sm" tt="uppercase" fw={700} c="dimmed">
                  Poll summary
                </Text>
                <Title order={2}>{pollStats.total}</Title>
                <Text size="sm" c="dimmed">
                  total polls created so far
                </Text>
              </div>
              <ListChecks size={28} color="#1c7ed6" />
            </Group>
            <Divider my="md" />
            <Stack gap="sm">
              <Paper radius="md" p="sm" bg="#eef6ff">
                <Text size="sm" fw={700}>
                  {pollStats.open} open polls
                </Text>
                <Text size="xs" c="dimmed">
                  Students can vote while these stay open.
                </Text>
              </Paper>
              <Paper radius="md" p="sm" bg="#f8f9fa">
                <Text size="sm" fw={700}>
                  {pollStats.votes} total votes
                </Text>
                <Text size="xs" c="dimmed">
                  Vote counts update live as students respond.
                </Text>
              </Paper>
            </Stack>
          </Card>

          <Card shadow="sm" radius="lg" p="lg" withBorder>
            <Text size="sm" fw={700} mb="sm">
              View
            </Text>
            <SegmentedControl
              fullWidth
              value={filter}
              onChange={setFilter}
              data={[
                { label: "All", value: "all" },
                { label: "Open", value: "open" },
                { label: "Closed", value: "closed" },
              ]}
            />
          </Card>
        </Stack>
      </SimpleGrid>

      <Stack gap="md">
        {visiblePolls.length === 0 ? (
          <Card shadow="sm" radius="lg" p="xl" withBorder>
            <Text fw={600}>No polls match the selected view.</Text>
            <Text size="sm" c="dimmed" mt={4}>
              Create a new poll to start collecting menu preferences.
            </Text>
          </Card>
        ) : (
          visiblePolls.map((poll) => (
            <Card key={poll.id} shadow="sm" radius="lg" p="xl" withBorder>
              <Flex
                justify="space-between"
                align="flex-start"
                gap="md"
                wrap="wrap"
              >
                <div>
                  <Group gap="xs" mb="xs">
                    <Badge color={poll.status === "open" ? "teal" : "gray"}>
                      {poll.status}
                    </Badge>
                    <Badge variant="light" color="blue">
                      {poll.total_votes} votes
                    </Badge>
                  </Group>
                  <Title order={4}>{poll.question}</Title>
                  <Text size="sm" c="dimmed" mt={4}>
                    {formatPollMeta(poll)}
                  </Text>
                  {poll.description ? (
                    <Text size="sm" mt="sm">
                      {poll.description}
                    </Text>
                  ) : null}
                </div>

                <Button
                  variant={poll.status === "open" ? "default" : "filled"}
                  color={poll.status === "open" ? "dark" : "blue"}
                  leftSection={
                    poll.status === "open" ? (
                      <LockKey size={16} />
                    ) : (
                      <PlusCircle size={16} />
                    )
                  }
                  loading={updatingPollId === poll.id}
                  onClick={() => handleToggleStatus(poll)}
                >
                  {poll.status === "open" ? "Close Poll" : "Reopen Poll"}
                </Button>
              </Flex>

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
                          Your vote
                        </Badge>
                      ) : null}
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
}

export default ManageMenuPolls;

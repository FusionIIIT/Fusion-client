import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Loader,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { WarningCircle } from "@phosphor-icons/react";
import { wardenDecisionRoute, host } from "../routes";

const requestTypeLabels = {
  all: "All",
  rebate: "Rebates",
  special_request: "Special Food",
  registration: "Registrations",
  deregistration: "Deregistrations",
  payment_update: "Payment Updates",
};

function getItemKey(item) {
  return `${item.request_type}-${item.id}`;
}

function resolveDocumentUrl(documentUrl) {
  if (!documentUrl) {
    return "";
  }
  if (documentUrl.startsWith("http")) {
    return documentUrl;
  }
  return `${host}/${documentUrl.replace(/^\/+/, "")}`;
}

function WardenDecisionDesk() {
  const [queue, setQueue] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submittingKey, setSubmittingKey] = useState("");
  const [error, setError] = useState("");

  const syncDrafts = (items) => {
    setDrafts((prev) => {
      const next = { ...prev };
      items.forEach((item) => {
        const key = getItemKey(item);
        if (!next[key]) {
          next[key] = {
            warden_remark: item.warden_remark || "",
            override_conditions: item.override_conditions || "",
          };
        }
      });
      return next;
    });
  };

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");
      const response = await axios.get(wardenDecisionRoute, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      const items = response.data.payload || [];
      setQueue(items);
      syncDrafts(items);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.error ||
          "Unable to load escalated mess requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filteredQueue = useMemo(() => {
    if (filter === "all") {
      return queue;
    }
    return queue.filter((item) => item.request_type === filter);
  }, [filter, queue]);

  const filterOptions = useMemo(
    () => [
      {
        label: `All (${queue.length})`,
        value: "all",
      },
      ...Object.entries(requestTypeLabels)
        .filter(([key]) => key !== "all")
        .map(([key, label]) => ({
          label: `${label} (${queue.filter((item) => item.request_type === key).length})`,
          value: key,
        })),
    ],
    [queue],
  );

  const updateDraft = (item, field, value) => {
    const key = getItemKey(item);
    setDrafts((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {
          warden_remark: "",
          override_conditions: "",
        }),
        [field]: value,
      },
    }));
  };

  const handleDecision = async (item, status) => {
    const key = getItemKey(item);
    const draft = drafts[key] || {
      warden_remark: "",
      override_conditions: "",
    };

    try {
      setSubmittingKey(key);
      setError("");
      const token = localStorage.getItem("authToken");
      await axios.put(
        wardenDecisionRoute,
        {
          request_type: item.request_type,
          id: item.id,
          status,
          warden_remark: draft.warden_remark,
          override_conditions: draft.override_conditions,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      setQueue((prev) =>
        prev.filter(
          (entry) =>
            !(entry.request_type === item.request_type && entry.id === item.id),
        ),
      );
    } catch (decisionError) {
      setError(
        decisionError.response?.data?.message ||
          "Unable to save the warden decision.",
      );
    } finally {
      setSubmittingKey("");
    }
  };

  if (loading) {
    return (
      <Card shadow="sm" radius="xl" p="xl" withBorder>
        <Flex justify="center" align="center" py="xl">
          <Loader />
        </Flex>
      </Card>
    );
  }

  return (
    <Card shadow="sm" radius="xl" p="xl" withBorder>
      <Group justify="space-between" align="flex-start" gap="md" mb="lg">
        <div>
          <Title order={3}>Escalated Request Desk</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Review caretaker escalations, add a final remark, and record any
            special override conditions before closing the request.
          </Text>
        </div>
        <Badge size="lg" radius="xl" color="indigo" variant="light">
          {filteredQueue.length} in view
        </Badge>
      </Group>

      {error ? (
        <Alert color="red" icon={<WarningCircle size={18} />} mb="lg">
          {error}
        </Alert>
      ) : null}

      <Group justify="space-between" mb="lg">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          data={filterOptions}
          radius="xl"
        />
        <Button variant="light" onClick={fetchQueue}>
          Refresh
        </Button>
      </Group>

      <Stack gap="lg">
        {filteredQueue.length > 0 ? (
          filteredQueue.map((item) => {
            const draft = drafts[getItemKey(item)] || {
              warden_remark: "",
              override_conditions: "",
            };

            return (
              <Card key={getItemKey(item)} radius="lg" p="lg" withBorder>
                <Group justify="space-between" align="flex-start" mb="md">
                  <div>
                    <Group gap="sm">
                      <Badge color="indigo" variant="light">
                        {requestTypeLabels[item.request_type] ||
                          item.request_label}
                      </Badge>
                      <Badge color="orange" variant="outline">
                        Escalated
                      </Badge>
                    </Group>
                    <Title order={4} mt="sm">
                      {item.summary}
                    </Title>
                    <Text c="dimmed" size="sm" mt={4}>
                      Student: {item.student_id}
                    </Text>
                  </div>
                  {item.document_url ? (
                    <Button
                      component="a"
                      href={resolveDocumentUrl(item.document_url)}
                      target="_blank"
                      rel="noreferrer"
                      variant="light"
                      size="xs"
                    >
                      View Attachment
                    </Button>
                  ) : null}
                </Group>

                <Stack gap="xs" mb="md">
                  {Object.entries(item.details || {}).map(([label, value]) => (
                    <Text key={label} size="sm">
                      <Text span fw={600}>
                        {label}:
                      </Text>{" "}
                      {value || "-"}
                    </Text>
                  ))}
                  {item.escalation_remark ? (
                    <Text size="sm">
                      <Text span fw={600}>
                        Escalation note:
                      </Text>{" "}
                      {item.escalation_remark}
                    </Text>
                  ) : null}
                  {item.manager_remark ? (
                    <Text size="sm">
                      <Text span fw={600}>
                        Caretaker remark:
                      </Text>{" "}
                      {item.manager_remark}
                    </Text>
                  ) : null}
                </Stack>

                <Textarea
                  label="Warden Remark"
                  placeholder="Record the final reasoning for this request."
                  value={draft.warden_remark}
                  onChange={(event) =>
                    updateDraft(
                      item,
                      "warden_remark",
                      event.currentTarget.value,
                    )
                  }
                  minRows={2}
                />

                <Textarea
                  label="Override Conditions"
                  placeholder="Optional. Add any special conditions tied to this decision."
                  value={draft.override_conditions}
                  onChange={(event) =>
                    updateDraft(
                      item,
                      "override_conditions",
                      event.currentTarget.value,
                    )
                  }
                  minRows={2}
                  mt="md"
                />

                <Group justify="flex-end" mt="lg">
                  <Button
                    color="green"
                    variant="light"
                    loading={submittingKey === getItemKey(item)}
                    onClick={() =>
                      handleDecision(
                        item,
                        item.request_type === "rebate" ||
                          item.request_type === "special_request"
                          ? "2"
                          : "accept",
                      )
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    color="red"
                    variant="light"
                    loading={submittingKey === getItemKey(item)}
                    onClick={() =>
                      handleDecision(
                        item,
                        item.request_type === "rebate" ||
                          item.request_type === "special_request"
                          ? "0"
                          : "reject",
                      )
                    }
                  >
                    Reject
                  </Button>
                </Group>
              </Card>
            );
          })
        ) : (
          <Text ta="center" c="dimmed" py="lg">
            No escalated requests are waiting for warden review right now.
          </Text>
        )}
      </Stack>
    </Card>
  );
}

export default WardenDecisionDesk;

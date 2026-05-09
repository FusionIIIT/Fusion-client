import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Loader,
  ScrollArea,
  SegmentedControl,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  Broom,
  ChatCircleText,
  ForkKnife,
  WarningCircle,
  Wrench,
} from "@phosphor-icons/react";
import { feedbackRoute } from "../routes";

const categoryMeta = {
  Food: { label: "Food", icon: <ForkKnife size={16} weight="fill" /> },
  Cleanliness: {
    label: "Cleanliness",
    icon: <Broom size={16} weight="fill" />,
  },
  Maintenance: {
    label: "Maintenance",
    icon: <Wrench size={16} weight="fill" />,
  },
  Others: {
    label: "Others",
    icon: <ChatCircleText size={16} weight="fill" />,
  },
};

function ViewFeedback() {
  const [activeTab, setActiveTab] = useState("Food");
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(feedbackRoute, {
          method: "GET",
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Unable to fetch feedback data.");
        }

        const data = await response.json();
        setFeedbackData(
          (data.payload || []).map((feedback) => ({
            ...feedback,
            status: feedback.is_read ? "Read" : "Unread",
          })),
        );
      } catch (fetchError) {
        setError(fetchError.message || "Unable to fetch feedback data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const markAsRead = async (index, feedback) => {
    const authToken = localStorage.getItem("authToken");

    try {
      const response = await fetch(feedbackRoute, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: feedback.student_id,
          mess: feedback.mess,
          feedback_type: feedback.feedback_type,
          description: feedback.description,
          fdate: feedback.fdate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark feedback as read.");
      }

      setFeedbackData((prevData) =>
        prevData.map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, status: "Read", is_read: true }
            : item,
        ),
      );
    } catch (updateError) {
      setError(updateError.message || "Failed to update feedback status.");
    }
  };

  const filteredFeedback = feedbackData.filter(
    (feedback) => feedback.feedback_type === activeTab,
  );

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
          <Title order={3}>Feedback Review</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Track student concerns by category and clear unread items quickly.
          </Text>
        </div>
        <Badge size="lg" radius="xl" color="blue" variant="light">
          {filteredFeedback.length} item
          {filteredFeedback.length === 1 ? "" : "s"}
        </Badge>
      </Group>

      {error ? (
        <Alert color="red" icon={<WarningCircle size={18} />} mb="lg">
          {error}
        </Alert>
      ) : null}

      <SegmentedControl
        fullWidth
        radius="xl"
        value={activeTab}
        onChange={setActiveTab}
        data={Object.entries(categoryMeta).map(([value, item]) => ({
          label: item.label,
          value,
        }))}
      />

      <ScrollArea mt="lg" offsetScrollbars>
        <Table
          striped
          highlightOnHover
          verticalSpacing="md"
          horizontalSpacing="md"
          miw={820}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Student ID</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Mess</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map((item, index) => (
                <Table.Tr key={`${item.student_id}-${item.fdate}-${index}`}>
                  <Table.Td>{item.fdate}</Table.Td>
                  <Table.Td>{item.student_id}</Table.Td>
                  <Table.Td>
                    <Text size="sm" maw={320}>
                      {item.description}
                    </Text>
                  </Table.Td>
                  <Table.Td>{item.mess}</Table.Td>
                  <Table.Td>
                    <Badge
                      color={item.status === "Unread" ? "blue" : "gray"}
                      variant={item.status === "Unread" ? "light" : "outline"}
                    >
                      {item.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant={item.status === "Unread" ? "light" : "subtle"}
                      color={item.status === "Unread" ? "blue" : "gray"}
                      onClick={() => markAsRead(index, item)}
                      disabled={item.status === "Read"}
                    >
                      {item.status === "Unread" ? "Mark as read" : "Handled"}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c="dimmed" py="lg">
                    No {activeTab.toLowerCase()} feedback is pending right now.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}

export default ViewFeedback;

import { useEffect, useState } from "react";
import { Button, Card, Group, Rating, Stack, Text, Textarea, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { dbFeedbackRoute } from "../../routes/dashboardRoutes";

export default function FeedbackPage() {
  const [myFeedback, setMyFeedback] = useState(null);
  const [topFeedbacks, setTopFeedbacks] = useState([]);
  const [average, setAverage] = useState(0);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const token = localStorage.getItem("authToken");
  const authHeaders = { Authorization: `Token ${token}` };

  const fetchFeedback = async () => {
    try {
      const { data } = await axios.get(dbFeedbackRoute, { headers: authHeaders });
      setMyFeedback(data.my_feedback);
      setTopFeedbacks(data.top_feedbacks || []);
      setAverage(data.average_rating || 0);

      if (data.my_feedback) {
        setRating(data.my_feedback.rating || 0);
        setFeedback(data.my_feedback.feedback || "");
      }
    } catch (error) {
      notifications.show({ title: "Feedback", message: "Unable to load feedback", color: "red" });
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const submit = async () => {
    if (rating < 1 || rating > 5) {
      notifications.show({ title: "Validation", message: "Rating must be between 1 and 5", color: "yellow" });
      return;
    }

    try {
      await axios.post(
        dbFeedbackRoute,
        { rating, feedback },
        { headers: { ...authHeaders, "Content-Type": "application/json" } },
      );
      notifications.show({ title: "Feedback", message: "Feedback saved", color: "green" });
      fetchFeedback();
    } catch (error) {
      notifications.show({
        title: "Feedback",
        message: error?.response?.data?.error || "Unable to save feedback",
        color: "red",
      });
    }
  };

  return (
    <Stack>
      <Title order={3}>Feedback</Title>
      <Card withBorder>
        <Stack>
          <Text fw={500}>Average rating: {average}</Text>
          <Group>
            <Text>Your rating</Text>
            <Rating value={rating} onChange={setRating} />
          </Group>
          <Textarea
            label="Your feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.currentTarget.value)}
            minRows={3}
          />
          <Button onClick={submit}>{myFeedback ? "Update Feedback" : "Submit Feedback"}</Button>
        </Stack>
      </Card>

      <Title order={4}>Top Feedbacks</Title>
      <Stack>
        {topFeedbacks.map((item) => (
          <Card withBorder key={item.id}>
            <Text fw={600}>{item.username}</Text>
            <Text size="sm">Rating: {item.rating}</Text>
            <Text c="dimmed">{item.feedback || "No comment"}</Text>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

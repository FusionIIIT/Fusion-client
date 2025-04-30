/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Loader,
  Notification,
  Stack,
  Progress,
  Badge,
  Group,
  Button,
} from "@mantine/core"; // Mantine UI components
import { IconThumbUp, IconThumbDown, IconMeh } from "@tabler/icons-react";

export default function ViewFeedback({ branch }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [summary, setSummary] = useState(""); // To hold the summary
  const [summaryEmoji, setSummaryEmoji] = useState(""); // To hold the emoji for summary
  const [progressValues, setProgressValues] = useState([]);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/dep/api/feedback/",
          {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          },
        );
        // Filter feedback based on the branch
        const filteredFeedback = response.data.filter(
          (item) => item.department === branch,
        );
        setData(filteredFeedback);

        // Generate summary
        generateSummary(filteredFeedback);

        // Initialize progress bars with zero
        setProgressValues(new Array(filteredFeedback.length).fill(0));

        // Trigger progress bar animation after a short delay
        setTimeout(() => {
          setProgressValues(
            filteredFeedback.map((feedback) =>
              getProgressValue(feedback.rating),
            ),
          );
        }, 100); // Delay the progress animation slightly
      } catch (error) {
        const errorResponse = error.response?.data || error.message;
        setErrorMessage(errorResponse.detail || "Error fetching feedback.");
        console.error("Error fetching feedback:", errorResponse);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [branch, authToken]);

  const generateSummary = (feedbackData) => {
    // Categorize feedback by rating
    const positive = feedbackData.filter(
      (item) => item.rating === "Excellent",
    ).length;
    const good = feedbackData.filter((item) => item.rating === "Good").length;
    const poor = feedbackData.filter((item) => item.rating === "Poor").length;

    // Construct the summary message
    let summaryText = "Feedback Summary: ";
    let emoji = ""; // Variable to store the emoji

    if (positive > good && positive > poor) {
      summaryText +=
        "Most users are happy with this department, with many praising its services.";
      emoji = "😊"; // Emoji for positive feedback
    } else if (poor > good && poor > positive) {
      summaryText +=
        "Some users have expressed concerns about this department, with several highlighting areas for improvement.";
      emoji = "😞"; // Emoji for poor feedback
    } else {
      summaryText +=
        "There is a mix of opinions about this department, with users sharing both positive and negative feedback.";
      emoji = "😐"; // Emoji for mixed feedback
    }

    setSummary(summaryText); // Set the summary in state
    setSummaryEmoji(emoji); // Set the corresponding emoji
  };

  const getProgressValue = (rating) => {
    if (rating === "Excellent") return 100;
    if (rating === "Good") return 66;
    if (rating === "Poor") return 33;
    return 0; // Default fallback if no rating
  };

  if (loading) {
    return (
      <Container size="sm" py="xl" style={{ textAlign: "center" }}>
        <Loader size="xl" variant="dots" />
      </Container>
    );
  }

  return (
    <Container
      size="xl"
      py="xl"
      style={{
        background: "linear-gradient(to right, #ff6a00, #ee0979)",
        color: "#fff",
      }}
    >
      {/* Error Notification */}
      {errorMessage && (
        <Notification
          color="red"
          title="Error"
          mb="md"
          style={{
            borderRadius: "20px",
            backgroundColor: "#e74c3c",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          {errorMessage}
        </Notification>
      )}

      {/* Title Section */}
      <Grid mb="lg" justify="center">
        <Grid.Col span={12}>
          <Title
            order={1}
            align="center"
            style={{
              fontWeight: "900",
              fontSize: "36px",
              letterSpacing: "2px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Feedback for {branch}
          </Title>
        </Grid.Col>
      </Grid>

      {/* Special Summary Card */}
      {summary && (
        <Grid mb="lg" justify="center">
          <Grid.Col span={12} sm={8}>
            <Card
              shadow="xl"
              padding="lg"
              radius="xl"
              withBorder
              style={{
                background: "#1f2a44",
                boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
                position: "relative",
              }}
            >
              <Group position="center" style={{ marginBottom: "15px" }}>
                <Text
                  size="lg"
                  weight={600}
                  align="center"
                  style={{
                    color: "#ECF0F1",
                    letterSpacing: "1px",
                    textShadow: "1px 1px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {summary} {summaryEmoji}
                </Text>
              </Group>
              <Badge
                color="yellow"
                size="lg"
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  borderRadius: "12px",
                  backgroundColor: "#f39c12",
                  color: "#fff",
                }}
              >
                Summary
              </Badge>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {/* Feedback Cards */}
      <Grid gutter="md" justify="center" style={{ paddingTop: "30px" }}>
        {data.map((feedback, index) => (
          <Grid.Col span={12} sm={6} md={4} key={index}>
            <Card
              shadow="lg"
              padding="lg"
              radius="md"
              withBorder
              style={{
                background: "#2C3E50",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                borderRadius: "18px",
                boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 15px 25px rgba(0, 0, 0, 0.3)",
                },
              }}
            >
              <Stack spacing="sm" align="center">
                {/* Remark */}
                <Text
                  weight={500}
                  size="lg"
                  style={{
                    lineHeight: 1.5,
                    color: "#fff",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "18px",
                  }}
                >
                  {feedback.remark}
                </Text>

                {/* Rating - Animated Progress Bar */}
                <Group position="apart" style={{ width: "100%" }}>
                  <Progress
                    value={progressValues[index]}
                    label={feedback.rating}
                    size="md"
                    color={
                      feedback.rating === "Excellent"
                        ? "teal"
                        : feedback.rating === "Good"
                          ? "yellow"
                          : "red"
                    }
                    style={{
                      flex: 1,
                      marginTop: "15px",
                      background: "rgba(0, 0, 0, 0.1)",
                      borderRadius: "10px",
                    }}
                  />
                  {/* Rating Icons */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {feedback.rating === "Excellent" && (
                      <IconThumbUp size={30} color="teal" />
                    )}
                    {feedback.rating === "Good" && (
                      <IconMeh size={30} color="yellow" />
                    )}
                    {feedback.rating === "Poor" && (
                      <IconThumbDown size={30} color="red" />
                    )}
                  </div>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Call-to-Action Button */}
      <Grid justify="center" style={{ marginTop: "40px" }}>
        <Button
          size="lg"
          radius="xl"
          style={{
            background: "#ff6a00",
            color: "#fff",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Add New Feedback
        </Button>
      </Grid>
    </Container>
  );
}

ViewFeedback.propTypes = {
  branch: PropTypes.string.isRequired,
};

import React, { useEffect, useState, useCallback } from "react";
import {
  Card, Title, TextInput, Textarea,
  Button, LoadingOverlay, Notification, Container, Alert, Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from '@tabler/icons-react';
import { useParams } from "react-router-dom";
import axios from "axios";
import { reviewDetailRoute } from "../../../routes/academicRoutes";

export default function ProfessorReviewForm() {
  const { token } = useParams();
  const [data, setData]           = useState(null);
  const [score, setScore]         = useState("");
  const [comments, setComments]   = useState("");
  const [loading, setLoading]     = useState(true);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid review token");
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        const url = reviewDetailRoute(token);
        const authToken = localStorage.getItem("authToken");
        
        if (!authToken) {
          throw new Error("Authentication required");
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const res = await axios.get(url, {
          headers: { Authorization: `Token ${authToken}` },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        setData(res.data);
        setError(null);
      } catch (e) {
        const errorMsg = e.response?.data?.detail || e.message || "Failed to load form";
        setError(errorMsg);
        showNotification({ 
          message: errorMsg, 
          color: "red", 
          icon: <IconX /> 
        });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token]);

  const handleSubmit = useCallback(async () => {
    if (!score || !comments) {
      showNotification({
        message: "Please fill in all required fields",
        color: "orange",
        icon: <IconX />,
      });
      return;
    }

    if (isNaN(Number(score)) || Number(score) < 0 || Number(score) > 100) {
      showNotification({
        message: "Score must be a number between 0 and 100",
        color: "orange",
        icon: <IconX />,
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const url = reviewDetailRoute(token);
      const authToken = localStorage.getItem("authToken");
      
      if (!authToken) {
        throw new Error("Authentication required");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      await axios.post(url, { score: Number(score), comments }, {
        headers: { Authorization: `Token ${authToken}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      showNotification({ 
        message: "Review submitted successfully", 
        color: "teal", 
        icon: <IconCheck /> 
      });
      setDone(true);
    } catch (e) {
      const errorMsg = e.response?.data?.detail || e.message || "Submission failed";
      showNotification({ 
        message: errorMsg, 
        color: "red", 
        icon: <IconX /> 
      });
    } finally {
      setSubmitting(false);
    }
  }, [score, comments, token]);

  if (loading) return <LoadingOverlay visible overlayBlur={2} />;
  
  if (error) {
    return (
      <Container size="sm" mt="xl">
        <Alert color="red" title="Error" icon={<IconX />}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (done) {
    return (
      <Container size="sm" mt="xl">
        <Notification color="teal" icon={<IconCheck />} disallowClose>
          Thank you for your review!
        </Notification>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container size="sm" mt="xl">
        <Text color="dimmed" ta="center">No data available</Text>
      </Container>
    );
  }

  return (
    <Container size="md" mt="xl">
      <Card shadow="sm" p="lg" withBorder>
        <Title order={3} mb="md">{data.title || 'Review Form'}</Title>
        
        {data.synopsis_url && (
          <iframe
            src={data.synopsis_url}
            width="100%" 
            height="300"
            style={{ border: "1px solid #ccc", marginTop: 16 }}
            title="Synopsis document"
          />
        )}
        
        {data.report_url && (
          <iframe
            src={data.report_url}
            width="100%" 
            height="400"
            style={{ border: "1px solid #ccc", marginTop: 16 }}
            title="Report document"
          />
        )}
        
        <TextInput
          label="Score (0-100)"
          type="number"
          min="0"
          max="100"
          required
          value={score}
          onChange={(e) => setScore(e.target.value)}
          mt="md"
          placeholder="Enter score"
        />
        <Textarea
          label="Comments"
          required
          minRows={4}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          mt="md"
          placeholder="Enter your review comments"
        />
        <Button 
          fullWidth 
          mt="md" 
          onClick={handleSubmit}
          loading={submitting}
          disabled={!score || !comments}
        >
          Submit Review
        </Button>
      </Card>
    </Container>
  );
}

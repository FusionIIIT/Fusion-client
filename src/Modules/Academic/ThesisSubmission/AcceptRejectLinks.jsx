import React, { useEffect, useState } from "react";
import { Card, Title, Notification, Loader, Container, Alert, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { invitationActionRoute } from "../../../routes/academicRoutes";

export default function AcceptRejectLinks({ action }) {
  const { token } = useParams();
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || (action !== "accept" && action !== "reject")) {
      setError("Invalid link or action");
      return;
    }

    const run = async () => {
      try {
        const url = invitationActionRoute(token) + action + "/";
        const authToken = localStorage.getItem("authToken");
        
        if (!authToken) {
          throw new Error("Authentication required");
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const res = await axios.get(url, {
          headers: { Authorization: `Token ${authToken}` },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        setMsg(res.data.detail || "Action completed successfully");
      } catch (e) {
        if (axios.isCancel(e)) {
          setError("Request timeout. Please try again.");
        } else {
          setError(e.response?.data?.detail || e.message || "Error processing link");
        }
      }
    };
    run();
  }, [action, token]);

  if (!msg && !error) {
    return (
      <Container size="sm" mt="xl">
        <Card shadow="sm" p="lg" withBorder>
          <Loader aria-label="Processing request" />
        </Card>
      </Container>
    );
  }

  return (
    <Container size="sm" mt="xl">
      <Card shadow="sm" p="lg" withBorder>
        <Title order={4} mb="md">
          {error ? "Error" : action === "accept" ? "Invitation Accepted" : "Invitation Rejected"}
        </Title>
        {error ? (
          <Alert icon={<IconX size={16} />} color="red">
            {error}
          </Alert>
        ) : (
          <Notification icon={<IconCheck size={16} />} color="teal" disallowClose>
            {msg}
          </Notification>
        )}
      </Card>
    </Container>
  );
}

AcceptRejectLinks.propTypes = {
  action: PropTypes.oneOf(["accept", "reject"]).isRequired,
};

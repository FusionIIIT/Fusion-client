import { useEffect, useState } from "react";
import {
  Center, Card, Title, Text, Loader, Alert, Container,
} from "@mantine/core";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { invitationActionRoute } from "../routes/academicRoutes";
import InstitutePublicHeader from "../components/InstitutePublicHeader";

// Public page reached from an emailed invitation link. The examiner has no
// Fusion account -- the token in the URL is the sole credential, so this
// page must never attach an Authorization header.
export default function ThesisInvitationResponse() {
  const { token, action } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || (action !== "accept" && action !== "reject")) {
      setStatus("error");
      setMessage("This link is invalid.");
      return;
    }

    (async () => {
      try {
        const res = await axios.get(invitationActionRoute(token, action));
        setStatus("done");
        setMessage(res.data?.detail || "Your response has been recorded.");
      } catch (e) {
        setStatus("error");
        setMessage(
          e.response?.data?.error || e.message || "This link is invalid or has expired.",
        );
      }
    })();
  }, [token, action]);

  return (
    <>
      <InstitutePublicHeader />
      <Container size="sm" mt="xl">
        <Card shadow="sm" p="xl" radius="md" withBorder>
          {status === "loading" && (
            <Center py="xl">
              <Loader aria-label="Processing your response" />
            </Center>
          )}

          {status === "done" && (
            <>
              <Center mb="sm">
                <IconCheck size={40} color="var(--mantine-color-teal-6)" />
              </Center>
              <Title order={3} align="center" mb="xs">
                {action === "accept" ? "Invitation Accepted" : "Invitation Declined"}
              </Title>
              <Text align="center" c="dimmed">
                {message}
              </Text>
              {action === "accept" && (
                <Text align="center" c="dimmed" size="sm" mt="md">
                  A link to review the thesis will be sent to your email shortly.
                </Text>
              )}
            </>
          )}

          {status === "error" && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Unable to process this link">
              {message}
            </Alert>
          )}
        </Card>
      </Container>
    </>
  );
}

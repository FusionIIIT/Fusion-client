import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Group,
  Title,
  Text,
  Alert,
  Card,
  Grid,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { DateInput } from "@mantine/dates";
import axios from "axios";
import {
  WarningCircle,
  CalendarX,
  SignOut,
  CheckCircle,
} from "@phosphor-icons/react";
import { deregistrationRequestRoute } from "../routes";

function Deregistration() {
  const [endDate, setEndDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestRequest, setLatestRequest] = useState(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);
  const today = new Date();
  const statusMeta = {
    pending: { color: "yellow", label: "Pending Review" },
    escalated: { color: "blue", label: "Escalated to Warden" },
    accept: { color: "green", label: "Approved" },
    reject: { color: "red", label: "Rejected" },
    cancelled: { color: "gray", label: "Cancelled" },
  };
  const activeRequest = ["pending", "escalated"].includes(
    latestRequest?.status,
  );

  const fetchLatestRequest = async () => {
    try {
      setIsLoadingRequest(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLatestRequest(null);
        return;
      }

      const response = await axios.get(deregistrationRequestRoute, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      const [mostRecentRequest] = response.data.payload || [];
      setLatestRequest(mostRecentRequest || null);
    } catch (error) {
      setLatestRequest(null);
    } finally {
      setIsLoadingRequest(false);
    }
  };

  useEffect(() => {
    fetchLatestRequest();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (activeRequest) {
      notifications.show({
        title: "Request Already Pending",
        message:
          "Your previous deregistration request is still active and awaiting final review.",
        color: "yellow",
        icon: <WarningCircle size={20} />,
      });
      return;
    }

    if (!endDate) {
      notifications.show({
        title: "Validation Error",
        message: "Please select an active deregistration end date.",
        color: "red",
        icon: <WarningCircle size={20} />,
      });
      return;
    }

    const data = {
      end_date: endDate.toISOString().split("T")[0],
    };

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.post(deregistrationRequestRoute, data, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setLatestRequest(response.data.payload || null);
        notifications.show({
          title: "Request Submitted",
          message:
            "Deregistration application has been lodged successfully and is awaiting review.",
          color: "green",
          icon: <CheckCircle size={20} />,
        });
        setEndDate(null);
      } else {
        throw new Error("Failed to process deregistration");
      }
    } catch (error) {
      notifications.show({
        title: "Submission Error",
        message:
          error.response?.data?.message ||
          "Failed to submit deregistration application. Please try again.",
        color: "red",
        icon: <WarningCircle size={20} />,
      });
      await fetchLatestRequest();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="md" px={0} mt="lg">
      <Card
        shadow="sm"
        radius="lg"
        p="xl"
        withBorder
        style={{ backgroundColor: "#ffffff" }}
      >
        <Group mb="xl" align="flex-start">
          <SignOut size={36} color="#e03131" weight="duotone" />
          <div style={{ flex: 1 }}>
            <Title order={3} fw={800} style={{ color: "#e03131" }}>
              Opt-out & Deregistration
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              Submit a formal request to cancel your active mess subscription.
            </Text>
          </div>
        </Group>

        <Alert
          icon={<WarningCircle size={24} />}
          title="Important Notice Outline"
          color="orange"
          variant="light"
          radius="md"
          mb="xl"
          styles={{ title: { fontWeight: 700 } }}
        >
          To maintain fair billing and meal planning algorithms, keep the
          following in mind:
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            <li>
              You will be deregistered strictly from the date you fill below.
            </li>
            <li>
              Once deregistered, you cannot claim meals for that active day.
              Choose the next available day optimally.
            </li>
            <li>
              <strong>
                You can only formally deregister starting from the next month's
                billing cycle.
              </strong>
            </li>
          </ul>
        </Alert>

        {isLoadingRequest ? (
          <Group justify="center" mb="xl">
            <Loader size="sm" />
          </Group>
        ) : latestRequest ? (
          <Card bg="blue.0" radius="md" p="lg" withBorder mb="xl">
            <Group justify="space-between" align="center" mb="xs">
              <Title order={5}>Latest Deregistration Request</Title>
              <Badge
                color={statusMeta[latestRequest.status]?.color || "gray"}
                variant="light"
              >
                {statusMeta[latestRequest.status]?.label ||
                  latestRequest.status}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              Requested end date: {latestRequest.end_date}
            </Text>
            {latestRequest.deregistration_remark ? (
              <Text size="sm" mt="xs">
                Remark: {latestRequest.deregistration_remark}
              </Text>
            ) : null}
            {activeRequest ? (
              <Text size="sm" mt="xs" fw={500}>
                A new request cannot be submitted until this one is finalized.
              </Text>
            ) : null}
          </Card>
        ) : null}

        <form onSubmit={handleSubmit}>
          <Card bg="gray.0" radius="md" p="xl" withBorder>
            <Grid align="flex-end" gutter="lg">
              <Grid.Col span={{ base: 12, sm: 8 }}>
                <DateInput
                  label="Deregistration End Date"
                  description="Select the official date to terminate meals"
                  placeholder="e.g. Next Month's 1st Day"
                  value={endDate}
                  minDate={
                    new Date(today.getFullYear(), today.getMonth() + 1, 1)
                  }
                  onChange={setEndDate}
                  required
                  radius="md"
                  size="md"
                  leftSection={<CalendarX size={18} color="#e03131" />}
                  valueFormat="MMMM D, YYYY"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Button
                  size="md"
                  radius="md"
                  color="red"
                  type="submit"
                  fullWidth
                  loading={isSubmitting}
                  disabled={activeRequest}
                  leftSection={<SignOut size={18} />}
                  style={{ backgroundColor: "#e03131" }}
                >
                  {activeRequest ? "Awaiting Decision" : "Submit Opt-Out"}
                </Button>
              </Grid.Col>
            </Grid>
          </Card>
        </form>
      </Card>
    </Container>
  );
}

export default Deregistration;

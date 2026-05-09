import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Card,
  Container,
  Flex,
  Grid,
  Loader,
  Text,
  Title,
} from "@mantine/core";
import {
  BellSimple,
  ChatCircleText,
  CalendarCheck,
  WarningCircle,
  Wallet,
} from "@phosphor-icons/react";
import axios from "axios";
import { operationsBoardRoute } from "../routes";

function StatCard({ title, value, caption, color, icon }) {
  return (
    <Card
      shadow="sm"
      radius="lg"
      p="lg"
      withBorder
      style={{ height: "100%", backgroundColor: color }}
    >
      <Flex justify="space-between" align="flex-start" mb="md">
        <div>
          <Text size="sm" fw={700} tt="uppercase" c="dark.6">
            {title}
          </Text>
          <Text size="xl" fw={800} mt={4}>
            {value}
          </Text>
        </div>
        {icon}
      </Flex>
      <Text size="sm" c="dimmed">
        {caption}
      </Text>
    </Card>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  caption: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
};

function MessAnnouncements() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    feedback: 0,
    pendingRebates: 0,
    pendingSpecialFood: 0,
    pendingRegistrations: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(operationsBoardRoute, {
          headers: { Authorization: `Token ${token}` },
        });

        setStats({
          feedback: response.data.payload?.feedback || 0,
          pendingRebates: response.data.payload?.pendingRebates || 0,
          pendingSpecialFood: response.data.payload?.pendingSpecialFood || 0,
          pendingRegistrations:
            response.data.payload?.pendingRegistrations || 0,
          pendingPayments: response.data.payload?.pendingPayments || 0,
        });
      } catch (err) {
        setError("Unable to load the live operations board.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" p="xl">
        <Loader />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert color="red" icon={<WarningCircle size={18} />}>
        {error}
      </Alert>
    );
  }

  return (
    <Container fluid px={0}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Flex justify="space-between" align="center" mb="lg">
          <div>
            <Title order={2}>Mess Operations Board</Title>
            <Text c="dimmed" size="sm">
              A live summary of the workflow queues you can present to
              reviewers.
            </Text>
          </div>
          <BellSimple size={28} color="#1c7ed6" />
        </Flex>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              title="Unread Feedback"
              value={stats.feedback}
              caption="Student issues and suggestions awaiting review."
              color="#eef6ff"
              icon={<ChatCircleText size={28} color="#1c7ed6" />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              title="Pending Rebates"
              value={stats.pendingRebates}
              caption="Leave-linked rebate requests still in the approval flow."
              color="#fff9db"
              icon={<CalendarCheck size={28} color="#f08c00" />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              title="Special Food"
              value={stats.pendingSpecialFood}
              caption="Special meal requests waiting for caretaker action."
              color="#fff0f6"
              icon={<BellSimple size={28} color="#c2255c" />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              title="Registrations"
              value={stats.pendingRegistrations}
              caption="New mess enrollments waiting to be approved."
              color="#ebfbee"
              icon={<CalendarCheck size={28} color="#2b8a3e" />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              title="Payment Updates"
              value={stats.pendingPayments}
              caption="Balance correction requests needing validation."
              color="#f3f0ff"
              icon={<Wallet size={28} color="#5f3dc4" />}
            />
          </Grid.Col>
        </Grid>
      </Card>
    </Container>
  );
}

export default MessAnnouncements;

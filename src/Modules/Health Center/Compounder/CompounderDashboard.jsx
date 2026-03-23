import React from "react";
import {
  Container,
  Stack,
  Title,
  Grid,
  Card,
  Text,
  Button,
  Group,
} from "@mantine/core";
import {
  Users,
  Package,
  ClipboardText,
  Calendar,
  Megaphone,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export default function CompounderDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: <Users size={32} weight="duotone" color="#15abff" />,
      title: "Patient Records",
      description: "Manage patient medical records and history",
      action: () => navigate("/healthcenter/compounder/patient-log/history"),
    },
    {
      icon: <Package size={32} weight="duotone" color="#15abff" />,
      title: "Medicine Stock",
      description: "Manage inventory and track medicine stock",
      action: () => navigate("/healthcenter/compounder/manage-stock"),
    },
    {
      icon: <ClipboardText size={32} weight="duotone" color="#15abff" />,
      title: "Prescriptions",
      description: "View and manage patient prescriptions",
      action: () => navigate("/healthcenter/compounder/patient-log/history"),
    },
    {
      icon: <Calendar size={32} weight="duotone" color="#15abff" />,
      title: "Doctor Schedule",
      description: "Manage doctor and pathologist schedules",
      action: () => navigate("/healthcenter/compounder/schedule"),
    },
    {
      icon: <Users size={32} weight="duotone" color="#15abff" />,
      title: "Medical Staff",
      description: "Add and manage doctors and pathologists",
      action: () => navigate("/healthcenter/compounder/doctor"),
    },
    {
      icon: <Megaphone size={32} weight="duotone" color="#15abff" />,
      title: "Announcements",
      description: "Publish health center announcements",
      action: () => navigate("/healthcenter/compounder/announcements"),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} size="h2" mb="xs">
            Health Center Management Dashboard
          </Title>
          <Text c="dimmed">Manage operations, staff, and patient records</Text>
        </div>

        <Grid gutter="lg">
          {cards.map((card, idx) => (
            <Grid.Col key={idx} span={{ base: 12, sm: 6, md: 4 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,0,0,0.12)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0,0,0,0.12)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Group justify="center" mb="md">
                  {card.icon}
                </Group>
                <Text fw={600} size="md" ta="center" mb="xs">
                  {card.title}
                </Text>
                <Text size="sm" c="dimmed" ta="center" mb="md">
                  {card.description}
                </Text>
                <Button
                  variant="light"
                  fullWidth
                  color="#15abff"
                  onClick={card.action}
                >
                  Manage
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Card shadow="sm" padding="lg" radius="md" withBorder mt="lg">
          <Title order={3} mb="md">
            Quick Statistics
          </Title>
          <Stack gap="sm">
            <Text size="sm">
              <strong>Current Status:</strong> Operational
            </Text>
            <Text size="sm">
              <strong>Operating Hours:</strong> Monday - Friday, 9:00 AM - 5:00
              PM
            </Text>
            <Text size="sm">
              <strong>Staff Support:</strong> Available on extension 2421
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

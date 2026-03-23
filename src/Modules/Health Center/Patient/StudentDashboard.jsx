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
import { Calendar, Heart, FileText, Megaphone } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: <Calendar size={32} weight="duotone" color="#15abff" />,
      title: "View Schedule",
      description: "Check doctor and pathologist availability",
      action: () => navigate("/healthcenter/student/schedule"),
    },
    {
      icon: <FileText size={32} weight="duotone" color="#15abff" />,
      title: "Medical History",
      description: "View your prescriptions and medical records",
      action: () => navigate("/healthcenter/student/history"),
    },
    {
      icon: <Heart size={32} weight="duotone" color="#15abff" />,
      title: "Medical Relief",
      description: "Apply for financial medical assistance",
      action: () => navigate("/healthcenter/student/medical-relief"),
    },
    {
      icon: <Megaphone size={32} weight="duotone" color="#15abff" />,
      title: "Feedback",
      description: "Share your feedback about health center services",
      action: () => navigate("/healthcenter/student/feedback"),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} size="h2" mb="xs">
            Welcome to Health Center
          </Title>
          <Text c="dimmed">
            Manage your health records and schedule appointments
          </Text>
        </div>

        <Grid gutter="lg">
          {cards.map((card, idx) => (
            <Grid.Col key={idx} span={{ base: 12, sm: 6, md: 3 }}>
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
                  Access
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Card shadow="sm" padding="lg" radius="md" withBorder mt="lg">
          <Title order={3} mb="md">
            Quick Information
          </Title>
          <Stack gap="sm">
            <Text size="sm">
              <strong>Operating Hours:</strong> Monday - Friday, 9:00 AM - 5:00
              PM
            </Text>
            <Text size="sm">
              <strong>Emergency Contact:</strong> Extension 2421 / 2422
            </Text>
            <Text size="sm">
              <strong>Appointment:</strong> Book appointments through the
              schedule section
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

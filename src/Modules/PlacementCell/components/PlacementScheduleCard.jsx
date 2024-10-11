import React from "react";
import { Card, Text, Badge, Group, Button, Image } from "@mantine/core";
import { IconClock, IconBriefcase, IconMapPin } from "@tabler/icons-react";

function PlacementScheduleCard() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 400, position: 'relative' }}>
      {/* Deadline on top right */}
      <Text size="xs" color="dimmed" align="right" style={{ position: 'absolute', top: '10px', right: '10px' }}>
        Deadline: <br /> May 8, 2024, 11:59pm
      </Text>

      {/* Logo and Company Information */}
      <Group align="flex-start">
        {/* Adjust the size of the logo */}
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
          alt="Amazon"
          width={40} // Reduced size
          height={40} // Reduced size
        />
      </Group>
      <Text weight={700} size="lg" >Amazon</Text>
      <Group spacing={5} mt={5}>
        <IconMapPin size={16} />
        <Text size="sm" color="dimmed">Miaplaza, New York, USA</Text>
      </Group>

      <Text weight={500} size="md" mt="sm">
        Customer Service Agent
      </Text>

      <Group mt="xs" spacing="xs">
        <Badge color="green">Full Time</Badge>
        <Group spacing={5}>
          <IconClock size={16} />
          <Text size="xs" color="dimmed">5 min ago</Text>
        </Group>
      </Group>

      <Text size="sm" mt="sm" color="dimmed">
        This will be an MCQ challenge. The participants will have to answer 30 questions in 30 minutes. This will be an MCQ challenge...
      </Text>

      <Group position="apart" mt="md">
        <Text size="xl" weight={700} color="blue">
          $60/Hour
        </Text>
        <Button variant="light" color="blue" size="xs">Apply Now</Button>
      </Group>
    </Card>
  );
}

export default PlacementScheduleCard;

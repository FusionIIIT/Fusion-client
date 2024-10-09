import React from 'react';
import { Card, Text, Button, Group } from '@mantine/core';

function SampleComponent() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group position="apart" style={{ marginBottom: 5, marginTop: 'sm' }}>
        <Text weight={500}>Placement Cell</Text>
      </Group>

      <Text size="sm" color="dimmed">
        Welcome to the Placement Cell. Here you can find all the information related to placements, including upcoming events, company visits, and more.
      </Text>

      <Button variant="light" color="blue" fullWidth style={{ marginTop: 14 }}>
        Learn More
      </Button>
    </Card>
  );
}

export default SampleComponent;
import React from 'react';
import { SimpleGrid, Card, Group, Text } from '@mantine/core';
import {
  IconFileText,
  IconAlertTriangle,
  IconPackage,
} from '@tabler/icons-react';

export default function StatisticsCards({ claims, alerts, requisitions }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mb="xl">
      <Card withBorder p="lg">
        <Group position="apart">
          <div>
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Pending Claims
            </Text>
            <Text weight={700} size="lg">
              {Array.isArray(claims) ? claims.length : 0}
            </Text>
          </div>
          <IconFileText size={32} color="blue" />
        </Group>
      </Card>

      <Card withBorder p="lg">
        <Group position="apart">
          <div>
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Low Stock Alerts
            </Text>
            <Text weight={700} size="lg">
              {Array.isArray(alerts) ? alerts.length : 0}
            </Text>
          </div>
          <IconAlertTriangle size={32} color="red" />
        </Group>
      </Card>

      <Card withBorder p="lg">
        <Group position="apart">
          <div>
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Pending Requisitions
            </Text>
            <Text weight={700} size="lg">
              {Array.isArray(requisitions) ? requisitions.length : 0}
            </Text>
          </div>
          <IconPackage size={32} color="orange" />
        </Group>
      </Card>
    </SimpleGrid>
  );
}

import React from 'react';
import { Stack, Card, Button, Text } from '@mantine/core';

export default function InventoryTab() {
  return (
    <Stack gap="md">
      <Button
        variant="filled"
        onClick={() => {
          window.location.href = '/health_center/inventory';
        }}
      >
        Go to Inventory Management
      </Button>
      <Text color="dimmed" size="sm">
        Access full inventory management with stock updates and requisitions
      </Text>
    </Stack>
  );
}

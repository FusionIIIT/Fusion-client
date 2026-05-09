import React from 'react';
import { Table,
  ScrollArea, Button, Text } from '@mantine/core';

export default function AlertsTab({ alerts }) {
  return (
    <>
      {Array.isArray(alerts) && alerts.length > 0 ? (
        <ScrollArea><Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Medicine</Table.Th>
              <Table.Th>Current Stock</Table.Th>
              <Table.Th>Threshold</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {alerts.map((alert) => (
              <Table.Tr key={alert.id}>
                <Table.Td>{alert.medicine_name}</Table.Td>
                <Table.Td>{alert.current_stock}</Table.Td>
                <Table.Td>{alert.threshold}</Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => {
                      // Navigate to inventory management
                      window.location.href = '/health_center/inventory';
                    }}
                  >
                    Order
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table></ScrollArea>
      ) : (
        <Text color="dimmed">No low stock alerts</Text>
      )}
    </>
  );
}

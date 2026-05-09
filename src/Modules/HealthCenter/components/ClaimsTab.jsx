import React from 'react';
import { Stack, Card, Group, Button, Text } from '@mantine/core';

export default function ClaimsTab({ claims }) {
  return (
    <>
      {Array.isArray(claims) && claims.length > 0 ? (
        <Stack gap="md">
          {claims.map((claim) => (
            <Card key={claim.id} withBorder p="md">
              <Group position="apart">
                <div>
                  <Text weight={700}>Claim #{claim.id}</Text>
                  <Text size="sm" color="dimmed">
                    Amount: ₹{claim.claim_amount} | Status: {claim.status}
                  </Text>
                </div>
                <Button
                  variant="filled"
                  onClick={() => {
                    // Navigate to claims processing
                    window.location.href = `/health_center/claims-processing/${claim.id}`;
                  }}
                >
                  Review & Process
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      ) : (
        <Text color="dimmed">No pending claims</Text>
      )}
    </>
  );
}

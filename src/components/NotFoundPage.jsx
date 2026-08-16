import React from 'react';
import { Center, Stack, Title, Text, Button } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from "@mantine/hooks";
import { pageTitle } from "../lib/pageTitle";

export default function NotFoundPage() {
  useDocumentTitle(pageTitle("Page not found"));
  const navigate = useNavigate();

  return (
    <Center style={{ minHeight: '80vh', padding: '2rem' }}>
      <Stack align="center" gap="xl">
        <IconSearch size={160} color="gray" />

        <Title order={1} fw={900} fz={{ base: 24, sm: 34 }}>
          404 — Page Not Found
        </Title>

        <Text
          size="lg"
          ta="center"
          style={{ maxWidth: 500 }}
        >
          we couldn't find the page you're looking for. It may have been moved or deleted.
        </Text>

        <Button size="md" onClick={() => navigate('/dashboard', { replace: true })}>
          Go Back Home
        </Button>
      </Stack>
    </Center>
  );
}

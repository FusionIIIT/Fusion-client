import React from 'react';
import { Card, Text, Stack, Paper, Group, SimpleGrid, Container } from "@mantine/core";
import PropTypes from "prop-types";

function StudentInfoCard({ name, roomNo, hallName, hallNo }) {
  return (
    <Container size="xs" px="xs">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{
          maxWidth: "400px",
          margin: "auto",
        }}
        styles={(theme) => ({
          root: { 
            backgroundColor: theme.colors.gray[0] 
          },
        })}
      >
        <Stack spacing="md">
          <Paper p="md" radius="md" withBorder>
            <Group position="apart">
              <Text size="lg" weight={500} color="blue">Allotted Room</Text>
            </Group>
          </Paper>
          <SimpleGrid cols={2} spacing="md">
            <Paper p="md" radius="md" withBorder>
              <Text weight={500} color="dimmed">Name:</Text>
              <Text size="lg" italic>{name}</Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Text weight={500} color="dimmed">Room No:</Text>
              <Text size="lg">{roomNo}</Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Text weight={500} color="dimmed">Hall Name:</Text>
              <Text size="lg">{hallName}</Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Text weight={500} color="dimmed">Hall No:</Text>
              <Text size="lg">{hallNo}</Text>
            </Paper>
          </SimpleGrid>
        </Stack>
      </Card>
    </Container>
  );
}

StudentInfoCard.propTypes = {
  name: PropTypes.string.isRequired,
  roomNo: PropTypes.string.isRequired,
  hallName: PropTypes.string.isRequired,
  hallNo: PropTypes.string.isRequired,
};

export default StudentInfoCard;
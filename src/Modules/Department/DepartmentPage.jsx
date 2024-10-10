import React, { useState } from "react";
import {
  Container,
  Grid,
  Text,
  Group,
  ActionIcon,
  Badge,
  Title,
  Paper,
} from "@mantine/core";
import { TrashSimple, Share } from "phosphor-react";

function DepartmentPage() {
  const [announcements] = useState([
    {
      id: 1,
      date: "2023-10-02",
      title: "Some announcement",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      author: "VKJ",
    },
    {
      id: 2,
      date: "2023-10-02",
      title: "Some announcement",
      content:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      author: "VKJ",
    },
    {
      id: 3,
      date: "2023-10-02",
      title: "Some announcement",
      content:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      author: "VKJ",
    },
  ]);

  return (
    <div style={{ display: "flex", backgroundColor: "#f5f7fb" }}>
      {/* Sidebar */}

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Container>
          <Title order={2} my="md" style={{ marginBottom: "30px" }}>
            Announcements
          </Title>

          <Grid>
            {announcements.map((announcement) => (
              <Grid.Col key={announcement.id} span={12}>
                <Paper
                  shadow="xs"
                  p="md"
                  radius="md"
                  withBorder
                  style={{ backgroundColor: "#fff", position: "relative" }}
                >
                  <Group position="apart" mb="xs">
                    <Text weight={600} size="lg">
                      {announcement.title}
                    </Text>
                    <Group spacing="xs">
                      <ActionIcon>
                        <Share size={20} />
                      </ActionIcon>
                      <ActionIcon color="red">
                        <TrashSimple size={20} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Text size="sm" color="dimmed" style={{ lineHeight: 1.6 }}>
                    {announcement.content}
                  </Text>

                  <Group position="apart" mt="md">
                    <Badge size="sm" color="gray" variant="light">
                      {announcement.date}
                    </Badge>
                    <Text size="xs" color="gray">
                      {announcement.author}
                    </Text>
                  </Group>

                  {/* Purple left border like in the image */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "5px",
                      height: "100%",
                      backgroundColor: "#7367F0",
                      borderRadius: "3px 0 0 3px",
                    }}
                  />
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </div>
    </div>
  );
}

export default DepartmentPage;

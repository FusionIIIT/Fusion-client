// import React, { useState } from "react";
// import {
//   Container,
//   Grid,
//   Text,
//   Group,
//   ActionIcon,
//   Badge,
//   Title,
//   Paper,
// } from "@mantine/core";
// import { TrashSimple, Share } from "phosphor-react";

// function Announcement() {
//   const [announcements] = useState([
//     {
//       id: 1,
//       date: "2023-10-02",
//       title: "Some announcement",
//       content:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       author: "VKJ",
//     },
//     {
//       id: 2,
//       date: "2023-10-02",
//       title: "Some announcement",
//       content:
//         "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
//       author: "VKJ",
//     },
//     {
//       id: 3,
//       date: "2023-10-02",
//       title: "Some announcement",
//       content:
//         "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
//       author: "VKJ",
//     },
//   ]);
//   return (
//     <div style={{ display: "flex", backgroundColor: "#f5f7fb" }}>
//       {/* Sidebar */}
//       {/* Main Content */}
//       <div style={{ flex: 1, padding: "20px" }}>
//         <Container>
//           <Title order={2} my="md" style={{ marginBottom: "30px" }}>
//             Announcements
//           </Title>
//           <Grid>
//             {announcements.map((announcement) => (
//               <Grid.Col key={announcement.id} span={12}>
//                 <Paper
//                   shadow="xs"
//                   p="md"
//                   radius="md"
//                   withBorder
//                   style={{ backgroundColor: "#fff", position: "relative" }}
//                 >
//                   <Group position="apart" mb="xs">
//                     <Text weight={600} size="lg">
//                       {announcement.title}
//                     </Text>
//                     <Group spacing="xs">
//                       <ActionIcon>
//                         <Share size={20} />
//                       </ActionIcon>
//                       <ActionIcon color="red">
//                         <TrashSimple size={20} />
//                       </ActionIcon>
//                     </Group>
//                   </Group>
//                   <Text size="sm" color="dimmed" style={{ lineHeight: 1.6 }}>
//                     {announcement.content}
//                   </Text>
//                   <Group position="apart" mt="md">
//                     <Badge size="sm" color="gray" variant="light">
//                       {announcement.date}
//                     </Badge>
//                     <Text size="xs" color="gray">
//                       {announcement.author}
//                     </Text>
//                   </Group>
//                   {/* Purple left border like in the image */}
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: 0,
//                       left: 0,
//                       width: "5px",
//                       height: "100%",
//                       backgroundColor: "#7367F0",
//                       borderRadius: "3px 0 0 3px",
//                     }}
//                   />
//                 </Paper>
//               </Grid.Col>
//             ))}
//           </Grid>
//         </Container>
//       </div>
//     </div>
//   );
// }
// export default Announcement;

import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Grid,
  Text,
  Group,
  ActionIcon,
  Badge,
  Title,
  Paper,
  Select,
  Button,
} from "@mantine/core";
import { BookmarkSimple, Trash, CaretRight } from "phosphor-react";

function AnnouncementCard({ announcement }) {
  return (
    <Paper
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      style={{ backgroundColor: "#fff", position: "relative", height: "100%" }}
    >
      <Group position="apart" mb="xs">
        <Text weight={500}>{announcement.title}</Text>
        <Group spacing={5}>
          <ActionIcon variant="subtle" color="gray">
            <BookmarkSimple size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red">
            <Trash size={18} />
          </ActionIcon>
        </Group>
      </Group>

      <Text size="sm" color="dimmed" style={{ lineHeight: 1.6 }} mb="xl">
        {announcement.content}
      </Text>

      <Group
        position="apart"
        mt="md"
        style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          right: "16px",
        }}
      >
        <Badge size="sm" color="gray" variant="light">
          {announcement.date}
        </Badge>
        <Group spacing={5}>
          <Text size="xs" color="gray">
            {announcement.author}
          </Text>
          <ActionIcon variant="subtle">
            <CaretRight size={18} />
          </ActionIcon>
        </Group>
      </Group>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "4px",
          height: "100%",
          backgroundColor: "#7367F0",
          borderRadius: "4px 0 0 4px",
        }}
      />
    </Paper>
  );
}

AnnouncementCard.propTypes = {
  announcement: PropTypes.shape({
    id: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
  }).isRequired,
};

function Anouncement() {
  const [announcements] = useState([
    {
      id: 1,
      date: "2023-10-02",
      title: "Some announcement",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      author: "VKJ",
    },
    {
      id: 2,
      date: "2023-10-02",
      title: "Some announcement",
      content:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      author: "VKJ",
    },
    {
      id: 3,
      date: "2023-10-02",
      title: "Some announcement",
      content:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      author: "VKJ",
    },
    {
      id: 4,
      date: "2023-10-02",
      title: "Some announcement",
      content:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      author: "VKJ",
    },
  ]);

  return (
    <div
      style={{
        backgroundColor: "#f5f7fb",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Container size="xl">
        <Group position="apart" mb="xl">
          <Group>
            <Title order={2}>Announcements</Title>
            <Badge size="lg" radius="sm" variant="filled" color="grape">
              26
            </Badge>
          </Group>
          <Group>
            <Select
              placeholder="Sort By"
              data={[
                { value: "date", label: "Date" },
                { value: "person", label: "Person" },
                { value: "batch", label: "Batch" },
              ]}
              style={{ width: 120 }}
            />
            <Button variant="outline">Filter</Button>
          </Group>
        </Group>

        <Grid gutter="md">
          {[...Array(2)].map((_, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {announcements
                .slice(rowIndex * 2, rowIndex * 2 + 2)
                .map((announcement) => (
                  <Grid.Col key={announcement.id} span={6}>
                    <AnnouncementCard announcement={announcement} />
                  </Grid.Col>
                ))}
            </React.Fragment>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default Anouncement;

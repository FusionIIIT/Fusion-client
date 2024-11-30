// import React from 'react';
// import { Card, Text, Title } from '@mantine/core';

// function NextRoundInfo({ title, topics, duration, date }) {
//   return (
//     <Card shadow="sm" padding="lg" radius="md" withBorder style={{ marginTop: '20px' }}>
//       <Title order={4}>Next Round</Title>
//       <Text weight={500} size="lg" style={{ marginTop: '10px' }}>
//         {title}
//       </Text>
//       <Text color="dimmed" size="sm">
//         Topics: {topics}
//       </Text>
//       <Text color="dimmed" size="sm">
//         Duration: {duration}
//       </Text>
//       <Text color="dimmed" size="sm">
//         Date and Time: {date}
//       </Text>
//     </Card>
//   );
// }

// export default NextRoundInfo;
import React from "react";
import { Card, Text, Title } from "@mantine/core";

function NextRoundInfo() {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ marginTop: "20px", width: "400px" }}
    >
      <Title order={4} style={{ marginBottom: "10px" }}>
        Next Round
      </Title>

      <Text weight={500} size="lg" style={{ marginBottom: "8px" }}>
        Coding Interview
      </Text>

      <Text color="dimmed" size="sm" style={{ marginBottom: "4px" }}>
        <b>Topics:</b> 2 DSA Questions, CS Fundamentals
      </Text>
      <Text color="dimmed" size="sm" style={{ marginBottom: "4px" }}>
        <b>Duration:</b> 45 mins
      </Text>
      <Text color="dimmed" size="sm" style={{ marginBottom: "4px" }}>
        <b>Date and Time:</b> Oct 6, 2024 17:00
      </Text>
    </Card>
  );
}

export default NextRoundInfo;

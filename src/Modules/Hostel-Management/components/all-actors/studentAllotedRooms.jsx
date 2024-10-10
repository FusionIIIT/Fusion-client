import { Card, Text, Grid, Container, Box, Divider } from "@mantine/core";
import PropTypes from "prop-types";

// StudentInfo Component that holds the data
function StudentInfo() {
  const studentData = {
    name: "Akshay Behl",
    roomNo: "B-443",
    hallName: "Maa Saraswati",
    hallNo: "Hall 4",
  };

  return (
    <Component
      name={studentData.name}
      roomNo={studentData.roomNo}
      hallName={studentData.hallName}
      hallNo={studentData.hallNo}
    />
  );
}

// Component that receives data through props
function Component({ name, roomNo, hallName, hallNo }) {
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
      >
        {/* Top Section with Light Gray Background */}
        <Box
          style={{
            backgroundColor: "#f1f3f5",
            padding: "10px",
            borderTopLeftRadius: "6px",
            borderTopRightRadius: "6px",
          }}
        >
          <Text fw={700} fz="lg" align="center" color="dark">
            Students' Allotted Rooms
          </Text>
        </Box>

        {/* Divider */}
        <Divider my="md" />

        {/* Data Section */}
        <Grid mt="sm" gutter="sm">
          <Grid.Col span={6}>
            <Text fw={500}>Name:</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{name}</Text>
          </Grid.Col>

          <Grid.Col span={6}>
            <Text fw={500}>Room No:</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{roomNo}</Text>
          </Grid.Col>

          <Grid.Col span={6}>
            <Text fw={500}>Hall Name:</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{hallName}</Text>
          </Grid.Col>

          <Grid.Col span={6}>
            <Text fw={500}>Hall No:</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{hallNo}</Text>
          </Grid.Col>
        </Grid>
      </Card>
    </Container>
  );
}

Component.propTypes = {
  name: PropTypes.string.isRequired,
  roomNo: PropTypes.string.isRequired,
  hallName: PropTypes.string.isRequired,
  hallNo: PropTypes.string.isRequired,
};

export default StudentInfo;

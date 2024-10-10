import { useState } from "react";
import { Card, Select, Grid, Text, Paper, Box } from "@mantine/core";

// Define data for all hostels
const hostelsData = {
  "Hall 1": {
    name: "Tagore Hostel",
    code: "Hall 1",
    category: "Boys",
    capacity: "600",
    roomType: "2 Seater",
    batchAssigned: "2022",
    numberOfRooms: "300",
    caretakerName: "Arvind Kumar",
    wardenName: "Ravi Shankar",
  },
  "Hall 2": {
    name: "Nehru Hostel",
    code: "Hall 2",
    category: "Boys",
    capacity: "500",
    roomType: "3 Seater",
    batchAssigned: "2021",
    numberOfRooms: "200",
    caretakerName: "Suresh Gupta",
    wardenName: "Anil Singh",
  },
  "Hall 3": {
    name: "Indira Gandhi Hostel",
    code: "Hall 3",
    category: "Girls",
    capacity: "450",
    roomType: "Single Seater",
    batchAssigned: "2023",
    numberOfRooms: "150",
    caretakerName: "Shalini Mehta",
    wardenName: "Priya Rao",
  },
  "Hall 4": {
    name: "Vivekanand Hostel",
    code: "Hall 4",
    category: "Boys",
    capacity: "554",
    roomType: "3 Seater",
    batchAssigned: "2023",
    numberOfRooms: "221",
    caretakerName: "Mandeep Sharma",
    wardenName: "Rohit Khanna",
  },
};

export default function ViewHostel() {
  const [selectedHall, setSelectedHall] = useState("Hall 1");

  // Get data of the selected hall
  const hostel = hostelsData[selectedHall];

  return (
     <Paper
      shadow="md"
      p="md"
      withBorder
      sx={(theme) => ({
        position: 'fixed',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.white,
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
      })}
    >
    <Text 
        align="left" 
        mb="xl" 
        size="xl" 
        style={{ color: '#757575', fontWeight: 'bold' }}
    >            View Hostel
          </Text>
      <Card
        shadow="sm"
        padding="sm"
        radius="md"
        withBorder
        style={(theme) => ({
          height:"100%",
          width:"100%",
          margin: "auto",
          backgroundColor: theme.white,
        })}
      >
        {/* Grey Background for Heading */}
        <Box
          style={{
            padding: "5px",
            borderTopLeftRadius: "6px",
            borderTopRightRadius: "6px",
          }}
        >
          
        </Box>

        {/* Added margin-top for space between the heading and dropdown */}
        <Select
          data={Object.keys(hostelsData)}
          placeholder="Select Hall"
          value={selectedHall}
          onChange={setSelectedHall}
          mb="md"
          mt="lg" // Added margin-top to create space
        />

        {/* Display Data of Selected Hostel */}
        <Grid>
          {[
            { label: "Name:", value: hostel.name },
            { label: "Code:", value: hostel.code },
            { label: "Category:", value: hostel.category },
            { label: "Capacity:", value: hostel.capacity },
            { label: "Room Type:", value: hostel.roomType },
            { label: "Batch Assigned:", value: hostel.batchAssigned },
            { label: "Number Of Rooms:", value: hostel.numberOfRooms },
            { label: "Caretaker Name:", value: hostel.caretakerName },
            { label: "Warden Name:", value: hostel.wardenName },
          ].map((item, index) => (
            <Grid.Col span={12} key={index}>
              <Grid
                style={{
                  backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                  padding: "8px 16px",
                }}
              >
                <Grid.Col span={6}>
                  <Text weight={500}>{item.label}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text align="right">{item.value}</Text>
                </Grid.Col>
              </Grid>
            </Grid.Col>
          ))}
        </Grid>
      </Card>
    </Paper>
  );
}

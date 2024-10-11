import React, { useState } from "react";
import { TextInput, Button, Group, Select, Textarea, Card, Title, Grid, ActionIcon } from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";

// import { IconCalendar } from "@tabler/icons-react";
// import from phosphor-icons
import { Calendar } from "@phosphor-icons/react";
// import { Smiley, Heart, Horse } from "@phosphor-icons/react";

function AddPlacementEventForm() {
  const [company, setCompany] = useState("");
  const [date, setDate] = useState(null);
  const [location, setLocation] = useState("");
  const [ctc, setCtc] = useState("");
  const [time, setTime] = useState("");
  const [placementType, setPlacementType] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [datePickerOpened, setDatePickerOpened] = useState(false); // State to manage date picker visibility

  const handleSubmit = () => {
    console.log({
      company,
      date,
      location,
      ctc,
      time,
      placementType,
      description,
      role,
    });
  };

  return (
    <Card shadow="md" padding="lg" radius="md" withBorder style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Title order={3} align="center" style={{ marginBottom: "20px" }}>
        Add Placement Event
      </Title>

      <Grid gutter="lg">
        {/* First row: Company Name, Date, Location */}
        <Grid.Col span={4}>
          <TextInput
            label="Company Name"
            placeholder="Enter company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={4} style={{ position: "relative" }}>
          <TextInput
            label="Date (yyyy-mm-dd)"
            placeholder="Pick date"
            value={date ? date.toLocaleDateString() : ""}
            readOnly // Make the input read-only
            rightSection={
              <ActionIcon
                onClick={() => setDatePickerOpened((prev) => !prev)} // Toggle date picker visibility
              >
                <Calendar size={16} />
              </ActionIcon>
            }
          />
          {datePickerOpened && ( // Show date picker when state is true
            <DatePicker
              value={date}
              onChange={(selectedDate) => {
                setDate(selectedDate); // Set selected date
                setDatePickerOpened(false); // Close date picker
              }}
              onBlur={() => setDatePickerOpened(false)} // Close date picker on blur
              style={{ zIndex: 1 }} // Adjust position
            />
          )}
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            label="Location"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Grid.Col>

        {/* Second row: CTC, Time, Placement Type */}
        <Grid.Col span={4}>
          <TextInput
            label="CTC In Lpa"
            placeholder="Enter CTC"
            value={ctc}
            onChange={(e) => setCtc(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TimeInput
            label="Time"
            placeholder="Select time"
            value={time}
            onChange={setTime}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label="Placement Type"
            placeholder="Select placement type"
            data={["Placement", "Internship"]}
            value={placementType}
            onChange={setPlacementType}
          />
        </Grid.Col>

        {/* Third row: Description */}
        <Grid.Col span={12}>
          <Textarea
            label="Description"
            placeholder="Enter a description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minRows={3}
          />
        </Grid.Col>

        {/* Fourth row: Role Offered */}
        <Grid.Col span={12}>
          <TextInput
            label="Role Offered"
            placeholder="Enter the role offered"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </Grid.Col>
      </Grid>

      {/* Submit button */}
      <Group position="right" style={{ marginTop: "20px" }}>
        <Button onClick={handleSubmit}>Add Event</Button>
      </Group>
    </Card>
  );
}

export default AddPlacementEventForm;

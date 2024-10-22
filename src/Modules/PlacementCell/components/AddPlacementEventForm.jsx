import React, { useState, useEffect } from "react";
import { TextInput, Button, Group, Select, Textarea, Card, Title, Grid, ActionIcon } from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { Calendar } from "@phosphor-icons/react";
import axios from "axios"; // Make sure axios is imported

function AddPlacementEventForm() {
  const [company, setCompany] = useState("");
  const [date, setDate] = useState(null);
  const [location, setLocation] = useState("");
  const [ctc, setCtc] = useState("");
  const [time, setTime] = useState(""); // Time as string
  const [placementType, setPlacementType] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [datePickerOpened, setDatePickerOpened] = useState(false);

  // Function to get the current time in HH:mm:ss format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', { hour12: false });
  };

  // Set the default time to the current time
  useEffect(() => {
    setTime(getCurrentTime());
  }, []); // Empty dependency array to ensure it runs only once on component mount

  const handleSubmit = async () => {
    console.log("Submitting form"); // Debugging log

    const formData = new FormData();
    formData.append("placement_type", placementType);
    formData.append("company_name", company);
    formData.append("ctc", ctc);
    formData.append("description", description);
    formData.append("title", company);
    formData.append("location", location);
    formData.append("role", role);

    // Append resume file if it exists
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    // Always use either the default or user-provided time
    formData.append("schedule_at", time);

    if (date) {
      formData.append("placement_date", date.toISOString().split("T")[0]);
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/placement/api/placement/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data.message);
    } catch (error) {
      console.error("Error adding schedule:", error.response?.data?.error || error.message);
    }
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
            readOnly
            rightSection={
              <ActionIcon
                onClick={() => setDatePickerOpened((prev) => !prev)}
              >
                <Calendar size={16} />
              </ActionIcon>
            }
          />
          {datePickerOpened && (
            <DatePicker
              value={date}
              onChange={(selectedDate) => {
                setDate(selectedDate);
                setDatePickerOpened(false);
              }}
              onBlur={() => setDatePickerOpened(false)}
              style={{ zIndex: 1 }}
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
            onChange={(value) => setTime(value.toLocaleTimeString('en-GB', { hour12: false }))}
            format="24"
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

        {/* Fifth row: Resume */}
        <Grid.Col span={12}>
          <TextInput
            label="Resume"
            type="file"
            onChange={(e) => setResumeFile(e.target.files[0])}
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

import React, { useState } from "react";
import {
  Card,
  TextInput,
  Textarea,
  Select,
  Grid,
  Group,
  Button,
  ActionIcon,
  Title,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { Calendar } from "@phosphor-icons/react";
import PropTypes from "prop-types";

function EditPlacementForm({ initialValues, onSubmit, onClose }) {
  const [company, setCompany] = useState(initialValues.companyName || "");
  const [date, setDate] = useState(initialValues.date || null);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [location, setLocation] = useState(initialValues.location || "");
  const [ctc, setCtc] = useState(initialValues.salary || "");
  const [time, setTime] = useState(initialValues.time || "");
  const [placementType, setPlacementType] = useState(
    initialValues.jobType || "",
  );
  const [jobRole, setRole] = useState(initialValues.position || "");
  const [description, setDescription] = useState(
    initialValues.description || "",
  );

  const handleSubmit = () => {
    onSubmit({
      company,
      date,
      location,
      ctc,
      time,
      placementType,
      jobRole,
      description,
    });
    onClose();
  };

  return (
    <Card style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Increased the maxWidth */}
      <Title order={3} align="center" style={{ marginBottom: "20px" }}>
        Edit Placement Event
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
              <ActionIcon onClick={() => setDatePickerOpened((prev) => !prev)}>
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
            onChange={(value) =>
              setTime(value.toLocaleTimeString("en-GB", { hour12: false }))
            }
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
            value={jobRole}
            onChange={(e) => setRole(e.target.value)}
          />
        </Grid.Col>
      </Grid>

      {/* Submit button */}
      <Group position="right" style={{ marginTop: "20px" }}>
        <Button onClick={handleSubmit}>Save Changes</Button>
      </Group>
    </Card>
  );
}

EditPlacementForm.propTypes = {
  initialValues: PropTypes.shape({
    companyName: PropTypes.string,
    date: PropTypes.instanceOf(Date), // or PropTypes.string if it's a string
    location: PropTypes.string,
    salary: PropTypes.string,
    time: PropTypes.string,
    jobType: PropTypes.string,
    position: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditPlacementForm;

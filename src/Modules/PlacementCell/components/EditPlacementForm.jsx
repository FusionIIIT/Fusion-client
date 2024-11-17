import React, { useState } from "react";
import {
  Modal,
  Card,
  Title,
  Grid,
  TextInput,
  ActionIcon,
  Select,
  Textarea,
  Group,
  Button,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { TimeInput } from "@mantine/dates";
import PropTypes from "prop-types";

const EditPlacementForm = ({ isOpen, onClose, placementData, onSubmit }) => {
  const {
    companyLogo,
    companyName,
    location,
    position,
    jobType,
    description,
    salary,
  } = placementData;

  // Initialize state
  const [company, setCompany] = useState(companyName);
  const [date, setDate] = useState(new Date());
  const [locationInput, setLocation] = useState(location);
  const [ctc, setCtc] = useState("");
  const [time, setTime] = useState(new Date());
  const [placementType, setPlacementType] = useState("");
  const [descriptionInput, setDescription] = useState(description);
  const [role, setRole] = useState(position);
  const [datePickerOpened, setDatePickerOpened] = useState(false);

  return (
    <Modal size="lg" centered opened={isOpen} onClose={onClose}>
      <Card>
        <Title order={3} align="center" style={{ marginBottom: "20px" }}>
          Edit Placement Event
        </Title>
        <Grid gutter="lg">
          <Grid.Col span={4}>
            <TextInput
              label="Company Name"
              placeholder="Enter company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </Grid.Col>

          {/* Date Picker */}
          <Grid.Col span={4}>
            <DateInput
              label="Date"
              placeholder="Pick a date"
              value={date}
              onChange={setDate} 
              opened={datePickerOpened} 
              onFocus={() => setDatePickerOpened(true)} 
              onBlur={() => setDatePickerOpened(false)} 
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <TextInput
              label="Location"
              placeholder="Enter location"
              value={locationInput}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <TextInput
              label="CTC In Lpa"
              placeholder="Enter CTC"
              value={ctc}
              onChange={(e) => setCtc(e.target.value)}
            />
          </Grid.Col>

          {/* Time Picker */}
          <Grid.Col span={4}>
            <TimeInput
              label="Time"
              placeholder="Select time"
              value={time}
              onChange={setTime} // Set selected time to state
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

          <Grid.Col span={12}>
            <Textarea
              label="Description"
              placeholder="Enter a description"
              value={descriptionInput}
              onChange={(e) => setDescription(e.target.value)}
              minRows={3}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              label="Role Offered"
              placeholder="Enter the role offered"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </Grid.Col>
        </Grid>
        <Group position="right" style={{ marginTop: "20px" }}>
          <Button
            onClick={() =>
              onSubmit({
                company,
                date,
                locationInput,
                ctc,
                time,
                placementType,
                descriptionInput,
                role,
              })
            }
          >
            Save Changes
          </Button>
        </Group>
      </Card>
    </Modal>
  );
};

EditPlacementForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  placementData: PropTypes.shape({
    companyLogo: PropTypes.string,
    companyName: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    jobType: PropTypes.string.isRequired,
    description: PropTypes.string,
    salary: PropTypes.string,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default EditPlacementForm;

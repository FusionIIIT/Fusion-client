import "@mantine/dates/styles.css";

import React, { useState } from "react";
import {
  Modal,
  Card,
  Title,
  Grid,
  TextInput,
  Select,
  Textarea,
  Group,
  Button,
  MultiSelect,
} from "@mantine/core";
import { format } from "date-fns";
import PropTypes from "prop-types";

// Convert a stored datetime ("YYYY-MM-DD HH:mm:ss" or ISO) to a datetime-local input value.
const toLocalInput = (value) => {
  if (!value) return "";
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? "" : format(d, "yyyy-MM-dd'T'HH:mm");
};

function EditPlacementForm({ isOpen, onClose, placementData, onSubmit }) {
  const {
    companyName,
    location,
    position,
    jobType,
    description,
    salary,
    postedTime,
    endDateTime,
  } = placementData;

  const [company, setCompany] = useState(companyName);
  const [locationInput, setLocation] = useState(location);
  const [ctc, setCtc] = useState(salary);
  const [scheduleAt, setScheduleAt] = useState(toLocalInput(postedTime));
  const [endAt, setEndAt] = useState(toLocalInput(endDateTime));
  const [placementType, setPlacementType] = useState(jobType);
  const [descriptionInput, setDescription] = useState(description);
  const [role, setRole] = useState(position);

  const [tpoFields] = useState([
    { value: "field1", label: "Field 1" },
    { value: "field2", label: "Field 2" },
    { value: "field3", label: "Field 3" },
  ]);

  const [selectedFields, setSelectedFields] = useState([]);

  const handleSubmit = () => {
    const parsedCtc = parseFloat(ctc);
    if (Number.isNaN(parsedCtc) || parsedCtc <= 0) {
      alert("CTC must be a valid positive decimal number.");
      return;
    }

    if (!scheduleAt) {
      alert("Please pick a schedule date and time.");
      return;
    }

    // Emit backend-ready field names/formats; the card reports the API result.
    onSubmit({
      company,
      location: locationInput,
      ctc: parsedCtc.toFixed(2),
      placementType,
      description: descriptionInput,
      role,
      schedule_at: scheduleAt.replace("T", " "),
      placement_date: scheduleAt.split("T")[0],
      end_datetime: endAt ? endAt.replace("T", " ") : null,
      end_date: endAt ? endAt.split("T")[0] : null,
    });
  };

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

          <Grid.Col span={4}>
            <TextInput
              type="datetime-local"
              label="Schedule (date & time)"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <TextInput
              type="datetime-local"
              label="Closes at (end)"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
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
              resize="vertical"
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

          <Grid.Col span={12}>
            <MultiSelect
              label="Select Fields"
              placeholder="Select fields"
              data={tpoFields}
              value={selectedFields}
              onChange={setSelectedFields}
              searchable
              clearable
            />
          </Grid.Col>
        </Grid>

        <Group position="right" style={{ marginTop: "20px" }}>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </Group>
      </Card>
    </Modal>
  );
}

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
    postedTime: PropTypes.string,
    endDateTime: PropTypes.string,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default EditPlacementForm;

import React, { useState } from "react";
import {
  Card,
  Text,
  Badge,
  Group,
  Button,
  Image,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Textarea,
  Grid,
  Title,
} from "@mantine/core";
import {
  Clock,
  MapPin,
  Trash,
  Pencil,
  Eye,
  Calendar,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DatePicker, TimeInput } from "@mantine/dates";
import PropTypes from "prop-types";
import { Notification } from "@mantine/core";

function PlacementScheduleCard({
  companyLogo,
  companyName,
  location,
  position,
  jobType,
  postedTime,
  // deadline,
  description,
  salary,
}) {
  const role = useSelector((state) => state.user.role);
  const [visible, setVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [company, setCompany] = useState(companyName);
  const [date, setDate] = useState(null);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [locationInput, setLocation] = useState(location);
  const [ctc, setCtc] = useState("");
  const [time, setTime] = useState("");
  const [placementType, setPlacementType] = useState("");
  const [jobRole, setRole] = useState(position);
  const [descriptionInput, setDescription] = useState(description);

  const navigate = useNavigate();

  const handleApplyClick = async () => {
    const token = localStorage.getItem("authToken");
    console.log("Auth Token:", token);
    console.log("Placement ID:", placementId);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/placement/api/apply-placement/",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ placementId }),
        },
      );
      if (response.ok) {
        console.log("Application successful");
      } else {
        console.error("Failed to apply");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handelViewClick = () => {
    navigate(
      `/placement-cell/view?companyName=${encodeURIComponent(companyName)}&companyLogo=${encodeURIComponent(companyLogo)}`,
    );
  };

  const handleDeleteClick = () => {
    setVisible(false);
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    setIsModalOpen(false);
  };

  if (!visible) return null;

  return (
    <>
      <Card
        shadow="sm"
        padding="lg"
        radius="lg"
        withBorder
        style={{ width: 320, position: "relative" }}
      >
        <Group align="flex-start">
          <Image
            src={companyLogo}
            alt={`${companyName} logo`}
            width={40}
            height={40}
            fit="contain"
            withPlaceholder
          />
        </Group>
        <Text weight={700} size="lg" mt={10}>
          {companyName}
        </Text>
        <Group spacing={5} mt={5}>
          <MapPin size={16} />
          <Text size="sm" color="dimmed">
            {location}
          </Text>
        </Group>
        <Text weight={500} size="md" mt="sm">
          {position}
        </Text>
        <Group mt="xs" spacing="xs">
          <Badge color="green">{jobType}</Badge>
          <Group spacing={5}>
            <Clock size={16} />
            <Text size="xs" color="dimmed">
              {postedTime}
            </Text>
          </Group>
        </Group>
        <Text
          size="sm"
          mt="sm"
          color="dimmed"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {description}
        </Text>
        <Group
          position="apart"
          mt="md"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <Text size="xl" weight={700} color="blue">
            {salary}
          </Text>

          {role === "student" && (
            <Button
              variant="light"
              color="blue"
              size="xs"
              onClick={handleApplyClick}
            >
              Apply Now
            </Button>
          )}

          {role === "placement officer" && (
            <Group position="right" spacing="xs">
              <ActionIcon
                onClick={handleEditClick}
                color="blue"
                size="md"
                variant="light"
              >
                <Pencil size={22} />
              </ActionIcon>

              <ActionIcon
                onClick={handelViewClick}
                color="blue"
                size="md"
                variant="light"
              >
                <Eye size={22} />
              </ActionIcon>

              <ActionIcon
                onClick={handleDeleteClick}
                color="red"
                size="md"
                variant="light"
              >
                <Trash size={22} />
              </ActionIcon>
            </Group>
          )}
        </Group>
      </Card>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Placement Event"
      >
        <Card shadow="md" padding="lg" radius="md" withBorder>
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
                value={jobRole}
                onChange={(e) => setRole(e.target.value)}
              />
            </Grid.Col>
          </Grid>
          <Group position="right" style={{ marginTop: "20px" }}>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </Group>
        </Card>
      </Modal>
    </>
  );
}
PlacementScheduleCard.propTypes = {
  companyLogo: PropTypes.string,
  companyName: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  position: PropTypes.string.isRequired,
  jobType: PropTypes.string.isRequired,
  postedTime: PropTypes.string.isRequired,
  // deadline: PropTypes.string,
  description: PropTypes.string,
  salary: PropTypes.string,
};
export default PlacementScheduleCard;

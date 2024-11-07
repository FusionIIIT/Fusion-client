
import React, { useState } from "react";
import { Card, Text, Badge, Group, Button, Image, ActionIcon } from "@mantine/core";
import { Clock, MapPin, Trash, Pencil, Eye } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';


function PlacementScheduleCard({
  companyLogo,
  companyName,
  location,
  position,
  jobType,
  postedTime,
  deadline,
  description,
  salary,
}) {
  const role = useSelector((state) => state.user.role);

  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  const handleApplyClick = () => {
    navigate(
      `/placement-cell/apply?companyName=${encodeURIComponent(companyName)}&companyLogo=${encodeURIComponent(companyLogo)}`,
    );
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
    // Logic for editing the event can be added here
    alert("Edit button clicked!");
  };

  if (!visible) return null;

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="lg"
      withBorder
      style={{ maxWidth: 400, position: "relative" }}
    >


      {/* Logo and Company Information */}
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
      <Group position="apart" mt="md" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Text size="xl" weight={700} color="blue">
          {salary}
        </Text>

        {/* Apply now button for students only */}

        {role == 'student' && (
          <Button
            variant="light"
            color="blue"
            size="xs"
            onClick={handleApplyClick}
          >
            Apply Now
          </Button>
        )
        }


        {/* Delete and Edit icons */}
        {role == 'placement officer' && (

          <Group position="right" spacing="xs" style={{}}>
            <ActionIcon onClick={handleEditClick} color="blue" size="md" variant="light">
              <Pencil size={22} />
            </ActionIcon>
 
            <ActionIcon onClick={handelViewClick} color="blue" size="md" variant="light">
              <Eye size={22} />
            </ActionIcon>

            <ActionIcon onClick={handleDeleteClick} color="red" size="md" variant="light">
              <Trash size={22} />
            </ActionIcon>
          </Group>
        )}

      </Group>
    </Card>
  );
}

export default PlacementScheduleCard;

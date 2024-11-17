import React, { useState } from "react";
import {
  Card,
  Text,
  Badge,
  Group,
  Button,
  Image,
  ActionIcon,
} from "@mantine/core";
import {
  Clock,
  MapPin,
  Trash,
  Pencil,
  Eye,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { format } from "date-fns";
import EditPlacementForm from "./EditPlacementForm";

function PlacementScheduleCard({
  jobId,
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleApplyClick = async () => {
    const token = localStorage.getItem("authToken");
    console.log("Auth Token:", token);
    console.log("Placement ID:", jobId);
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
    navigate(`/placement-cell/view?jobId=${encodeURIComponent(jobId)}`);
  };
  

  const handleDeleteClick = async () => {
    setVisible(false);
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`http://127.0.0.1:8000/placement/api/placement/${jobId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        alert("Placement schedule deleted successfully!");
        setIsModalOpen(false); 
      } else {
        const errorData = await response.json();
        console.error("Delete failed:", errorData);
        alert("Failed to Delete placement schedule.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the placement schedule.");
    }
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

const handleSubmit = async () => {
  const token = localStorage.getItem("authToken");

  const formattedDate = date ? format(date, "yyyy-MM-dd") : null;
  const formattedTime = time || "00:00:00";

  const updatedData = {
    placement_type: placementType,
    company_name: company,
    ctc: ctc,
    description: descriptionInput,
    schedule_at: formattedTime, 
    placement_date: formattedDate,
    location: locationInput,
    role: jobRole,
  };

  try {
    const response = await fetch(`http://127.0.0.1:8000/placement/api/placement/${jobId}/`, {
      method: "PUT",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      alert("Placement schedule updated successfully!");
      setIsModalOpen(false); 
    } else {
      const errorData = await response.json();
      console.error("Update failed:", errorData);
      alert("Failed to update placement schedule.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while updating the placement schedule.");
  }
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

      {/* Modal for editing placement */}
      <EditPlacementForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        placementData={{ companyLogo, companyName, location, position, jobType, postedTime, description, salary }}
        onSubmit={handleSubmit}
      />

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

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Text, Flex, Divider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { updateProfileSection } from "../services/profileService";
import SkillForm from "../components/forms/SkillForm";
import SkillsTable from "../components/tables/SkillsTable";

function SkillsTechComponent({ data }) {
  const [skills, setSkills] = useState(data || []);
  const [newSkill, setNewSkill] = useState("");
  const [rating, setRating] = useState(0);

  const updateSkills = async () => {
    if (!newSkill.trim()) {
      notifications.show({
        title: "Error",
        message: "Skill name cannot be empty!",
        color: "red",
      });
      return;
    }

    const normalizedRating = Number(rating);

    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      notifications.show({
        title: "Error",
        message: "Rating must be between 1 and 5",
        color: "red",
      });
      return;
    }

    const newSkillEntry = {
      skillsubmit: {
        skill_name: newSkill.trim(),
        skill_rating: normalizedRating,
      },
    };

    try {
      await updateProfileSection(newSkillEntry);

      setSkills([
        ...skills,
        { skill_name: newSkill.trim(), skill_rating: normalizedRating },
      ]);
      setNewSkill("");
      setRating(1);
      notifications.show({
        title: "Success",
        message: "Skill added successfully!",
        color: "green",
      });
    } catch (error) {
      const backendError = error?.response?.data;
      const errorMessage =
        backendError?.skill_name?.[0]
        || backendError?.skill_rating?.[0]
        || backendError?.error
        || "Failed to update skills. Please try again.";

      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    }
  };

  return (
    <Flex
      w={{ base: "100%", sm: "60%" }}
      p="md"
      h="auto"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      direction="column"
      justify="space-evenly"
    >
      {/* Add Skill Section */}
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          Skills & Technologies
        </Text>
        <Divider my="md" />
        <Flex w="100%" direction="column">
          <Text fw={500} mb="lg">
            Add New Skill/Technology
          </Text>
          <SkillForm
            newSkill={newSkill}
            rating={rating}
            setNewSkill={setNewSkill}
            setRating={setRating}
            onSubmit={updateSkills}
          />
        </Flex>
      </Flex>

      {/* Display Skills Section */}
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          Your Skills
        </Text>
        <Divider my="md" />
        <SkillsTable skills={skills} />
      </Flex>
    </Flex>
  );
}

SkillsTechComponent.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      skill_name: PropTypes.string.isRequired,
      skill_rating: PropTypes.number.isRequired,
    }),
  ),
};

export default SkillsTechComponent;

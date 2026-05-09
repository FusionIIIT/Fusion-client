import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Flex, Divider, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useFormState } from "../utils/formHelpers";
import { updateProfileSection } from "../services/profileService";
import AchievementForm from "../components/forms/AchievementForm";
import AchievementsTable from "../components/tables/AchievementsTable";

const getAchievementType = (value) => {
  const normalized = String(value || "Other").trim().toUpperCase();
  if (normalized === "EDUCATIONAL") return "EDUCATIONAL";
  return "OTHER";
};

const formatApiError = (error) => {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.error) return data.error;
  if (data && typeof data === "object") {
    const firstFieldError = Object.values(data).flat()[0];
    if (firstFieldError) return firstFieldError;
  }
  return "Error adding achievement";
};

function AchievementsComponent({ achievements }) {
  const [achievementsList, setAchievementsList] = useState(achievements || []);

  useEffect(() => {
    setAchievementsList(achievements || []);
  }, [achievements]);

  const { formData: achievement, handleFieldChange, resetForm } = useFormState({
    skill: "",
    type: "Educational",
    date: "",
    issuer: "",
    description: "",
  });

  const handleSubmit = async () => {
    try {
      const achievementName = String(achievement.skill || "").trim();
      if (!achievementName) {
        notifications.show({
          message: "Achievement name is required.",
          color: "yellow",
        });
        return;
      }

      const payload = {
        achievement: achievementName,
        achievement_type: getAchievementType(achievement.type),
        issuer: String(achievement.issuer || "").trim(),
        description: String(achievement.description || "").trim(),
      };

      if (achievement.date) {
        payload.date_earned = achievement.date;
      }

      const response = await updateProfileSection({
        achievementsubmit: payload,
      });

      const createdAchievement = response?.data?.id
        ? response.data
        : payload;

      setAchievementsList((prev) => [...prev, createdAchievement]);

      resetForm();

      notifications.show({
        message: "Achievement added successfully!",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: formatApiError(error),
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
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          Achievements
        </Text>
        <Divider my="md" />
        <Flex w="100%" direction="column">
          <Text fw={500} mb="md">
            Add a new achievement
          </Text>
            <AchievementForm
              formData={achievement}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
            />
        </Flex>
        <Divider my="md" />
        <Text fw={500} mb="md">
          Your Achievements
        </Text>
        <Divider my="md" />
          <AchievementsTable achievements={achievementsList} />
      </Flex>
    </Flex>
  );
}

AchievementsComponent.propTypes = {
  achievements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      achievement_type: PropTypes.string,
      date_earned: PropTypes.string,
      issuer: PropTypes.string,
      description: PropTypes.string,
    }),
  ),
};

AchievementsComponent.defaultProps = {
  achievements: [],
};

export default AchievementsComponent;

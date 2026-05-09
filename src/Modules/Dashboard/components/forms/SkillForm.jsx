import PropTypes from "prop-types";
import { Button, Input, Flex, NumberInput } from "@mantine/core";

export default function SkillForm({ newSkill, rating, setNewSkill, setRating, onSubmit }) {
  return (
    <Flex
      align="center"
      justify="space-between"
      direction={{ base: "column", sm: "row" }}
      gap="md"
    >
      <Input.Wrapper label="Skill/Technology" w={{ base: "100%", sm: "50%" }}>
        <Input
          size="md"
          mt="xs"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
        />
      </Input.Wrapper>
      <Input.Wrapper label="Rating" w={{ base: "100%", sm: "30%" }}>
        <NumberInput
          mt="xs"
          min={1}
          max={5}
          clampBehavior="strict"
          value={rating}
          onChange={setRating}
        />
      </Input.Wrapper>
      <Button mt="xl" onClick={onSubmit}>
        Add
      </Button>
    </Flex>
  );
}

SkillForm.propTypes = {
  newSkill: PropTypes.string.isRequired,
  rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  setNewSkill: PropTypes.func.isRequired,
  setRating: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

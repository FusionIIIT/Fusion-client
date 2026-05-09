import PropTypes from "prop-types";
import { Flex, Input, Button, Select, Textarea } from "@mantine/core";

export default function AchievementForm({ formData, onChange, onSubmit }) {
  return (
    <Flex w="100%" direction="column">
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Achievement name" w="65%">
          <Input
            size="md"
            mt="xs"
            value={formData.skill}
            onChange={(e) => onChange("skill", e.target.value)}
          />
        </Input.Wrapper>
        <Input.Wrapper label="Type" w="30%">
          <Select
            size="md"
            mt="xs"
            data={["Educational", "Other"]}
            value={formData.type}
            onChange={(value) => onChange("type", value || "Educational")}
          />
        </Input.Wrapper>
      </Flex>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Date" w={{ base: "45%", sm: "30%" }}>
          <Input
            type="date"
            size="md"
            mt="xs"
            value={formData.date}
            onChange={(e) => onChange("date", e.target.value)}
          />
        </Input.Wrapper>
        <Input.Wrapper label="Issuer" w={{ base: "50%", sm: "65%" }}>
          <Input
            size="md"
            mt="xs"
            value={formData.issuer}
            onChange={(e) => onChange("issuer", e.target.value)}
          />
        </Input.Wrapper>
      </Flex>
      <Flex gap="md" direction="column">
        <Input.Wrapper label="Description" w="100%">
          <Textarea
            autosize
            minRows={5}
            resize="vertical"
            mt="xs"
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </Input.Wrapper>
        <Button size="md" onClick={onSubmit}>
          Submit
        </Button>
      </Flex>
    </Flex>
  );
}

AchievementForm.propTypes = {
  formData: PropTypes.shape({
    skill: PropTypes.string,
    type: PropTypes.string,
    date: PropTypes.string,
    issuer: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

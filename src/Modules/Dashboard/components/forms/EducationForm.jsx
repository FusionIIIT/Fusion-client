import PropTypes from "prop-types";
import { Flex, Input, Button } from "@mantine/core";

export default function EducationForm({ formData, onChange, onSubmit }) {
  return (
    <>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Degree" w="48%">
          <Input name="degree" value={formData.degree} onChange={onChange} size="md" mt="xs" />
        </Input.Wrapper>
        <Input.Wrapper label="Stream" w="48%">
          <Input name="stream" value={formData.stream} onChange={onChange} size="md" mt="xs" />
        </Input.Wrapper>
      </Flex>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Institute Name" w="65%">
          <Input name="institute" value={formData.institute} onChange={onChange} size="md" mt="xs" />
        </Input.Wrapper>
        <Input.Wrapper label="Grade" w="30%">
          <Input name="grade" value={formData.grade} onChange={onChange} size="md" mt="xs" />
        </Input.Wrapper>
      </Flex>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Start Date" w="48%">
          <Input
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={onChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
        <Input.Wrapper label="End Date" w="48%">
          <Input
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={onChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
      </Flex>
      <Button onClick={onSubmit} size="md" w="fit-content" mt="lg">
        Submit
      </Button>
    </>
  );
}

EducationForm.propTypes = {
  formData: PropTypes.shape({
    degree: PropTypes.string,
    stream: PropTypes.string,
    institute: PropTypes.string,
    grade: PropTypes.string,
    start_date: PropTypes.string,
    end_date: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

import PropTypes from "prop-types";
import { Flex, Input, Button, Textarea } from "@mantine/core";

export default function CourseForm({ formData, onChange, onSubmit }) {
  return (
    <>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Course Name" w="65%">
          <Input name="course_name" value={formData.course_name} onChange={onChange} size="md" mt="xs" />
        </Input.Wrapper>
        <Input.Wrapper label="License No." w="30%">
          <Input name="license" value={formData.license} onChange={onChange} size="md" mt="xs" />
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
      <Input.Wrapper label="Description" w={{ base: "100%", sm: "80%" }}>
        <Textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          autosize
          minRows={5}
          resize="vertical"
          mt="xs"
        />
      </Input.Wrapper>
      <Button onClick={onSubmit} size="md" mt="lg">
        Submit
      </Button>
    </>
  );
}

CourseForm.propTypes = {
  formData: PropTypes.shape({
    course_name: PropTypes.string,
    license: PropTypes.string,
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

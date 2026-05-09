import PropTypes from "prop-types";
import { Flex, Input, Button, Select, Textarea } from "@mantine/core";

export default function ProjectForm({ formData, onChange, onStatusChange, onSubmit }) {
  return (
    <>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Project Name" w="65%">
          <Input name="project_name" value={formData.project_name} onChange={onChange} size="md" mt="xs" />
        </Input.Wrapper>
        <Input.Wrapper label="Status" w="30%">
          <Select
            name="status"
            data={["ONGOING", "COMPLETED"]}
            value={formData.status}
            onChange={onStatusChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
      </Flex>
      <Input.Wrapper label="Project Link" w="100%" mb="md">
        <Input
          name="project_link"
          value={formData.project_link}
          onChange={onChange}
          size="md"
          mt="xs"
        />
      </Input.Wrapper>
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
      <Input.Wrapper label="Description" w="100%" mb="md">
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

ProjectForm.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

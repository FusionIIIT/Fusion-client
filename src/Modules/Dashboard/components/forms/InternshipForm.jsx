import PropTypes from "prop-types";
import { Flex, Input, Button, Select, Textarea } from "@mantine/core";

export default function InternshipForm({ formData, onChange, onStatusChange, onSubmit }) {
  return (
    <>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Organization Name" w="65%">
          <Input name="organization" value={formData.organization} onChange={onChange} size="md" mt="xs" />
        </Input.Wrapper>
        <Input.Wrapper label="Location" w="30%">
          <Input name="location" value={formData.location} onChange={onChange} size="md" mt="xs" />
        </Input.Wrapper>
      </Flex>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Job Profile Title" w="65%">
          <Input name="job_title" value={formData.job_title} onChange={onChange} size="md" mt="xs" />
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
      <Input.Wrapper label="Description" w="100%">
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

InternshipForm.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

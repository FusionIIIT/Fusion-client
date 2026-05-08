import {
  Button,
  FileInput,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
} from "@mantine/core";
import PropTypes from "prop-types";

function DeanProcessingActionModal({
  opened,
  onClose,
  onSubmit,
  designationOptions,
  designation,
  setDesignation,
  remarks,
  setRemarks,
  file = null,
  setFile,
  isSaving,
  isReady,
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Process & Forward to Director"
      centered
    >
      <form onSubmit={onSubmit}>
        <Stack>
          <Select
            label="Forward To"
            placeholder="Select designation and user"
            data={designationOptions}
            value={designation}
            onChange={(value) => setDesignation(value || "")}
            searchable
            required
          />
          <Textarea
            label="Remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.currentTarget.value)}
            minRows={3}
          />
          <FileInput
            label="Attachment"
            value={file}
            onChange={setFile}
            clearable
          />
          <Group justify="flex-end">
            <Button type="submit" loading={isSaving} disabled={!isReady}>
              Forward
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

DeanProcessingActionModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  designationOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  designation: PropTypes.string.isRequired,
  setDesignation: PropTypes.func.isRequired,
  remarks: PropTypes.string.isRequired,
  setRemarks: PropTypes.func.isRequired,
  file: PropTypes.oneOfType([
    PropTypes.instanceOf(File),
    PropTypes.oneOf([null]),
  ]),
  setFile: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isReady: PropTypes.bool.isRequired,
};

export default DeanProcessingActionModal;

import {
  Button,
  FileInput,
  Group,
  Modal,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import PropTypes from "prop-types";

function BillProcessingModal({
  opened,
  onClose,
  onSubmit,
  designationOptions,
  designation,
  setDesignation,
  vendorId,
  setVendorId,
  remarks,
  setRemarks,
  attachment = null,
  setAttachment,
  isSaving,
  isReady,
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Process Bill" centered>
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
          <TextInput
            label="Vendor ID (Optional)"
            value={vendorId}
            onChange={(event) => setVendorId(event.currentTarget.value)}
            placeholder="e.g. 12"
          />
          <Textarea
            label="Remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.currentTarget.value)}
            minRows={3}
          />
          <FileInput
            label="Bill Attachment"
            value={attachment}
            onChange={setAttachment}
            required
            clearable
          />
          <Group justify="flex-end">
            <Button type="submit" loading={isSaving} disabled={!isReady}>
              Submit
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

BillProcessingModal.propTypes = {
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
  vendorId: PropTypes.string.isRequired,
  setVendorId: PropTypes.func.isRequired,
  remarks: PropTypes.string.isRequired,
  setRemarks: PropTypes.func.isRequired,
  attachment: PropTypes.oneOfType([
    PropTypes.instanceOf(File),
    PropTypes.oneOf([null]),
  ]),
  setAttachment: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isReady: PropTypes.bool.isRequired,
};

export default BillProcessingModal;

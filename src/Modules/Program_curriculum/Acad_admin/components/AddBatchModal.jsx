import PropTypes from "prop-types";
import { Modal, Stack, Select, TextInput, Group, Button } from "@mantine/core";

// Create a new batch (programme + discipline + year + seats).
function AddBatchModal({
  opened,
  onClose,
  newBatchData,
  setNewBatchData,
  programmeOptions,
  getDisciplineOptions,
  onSubmit,
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add New Batch"
      size="md"
      centered
    >
      <Stack spacing="md">
        <Select
          label="Programme"
          placeholder="Select programme"
          value={newBatchData.programme}
          onChange={(value) =>
            setNewBatchData({ ...newBatchData, programme: value })
          }
          data={programmeOptions}
          required
        />

        <Select
          label="Discipline"
          placeholder="Select discipline"
          value={newBatchData.discipline}
          onChange={(value) =>
            setNewBatchData({ ...newBatchData, discipline: value })
          }
          data={getDisciplineOptions(newBatchData.programme)}
          disabled={!newBatchData.programme}
          required
        />

        <TextInput
          label="Academic Year"
          placeholder="Enter year"
          value={newBatchData.year}
          onChange={(event) =>
            setNewBatchData({
              ...newBatchData,
              year: event.currentTarget.value,
            })
          }
          type="number"
          min="2020"
          max="2030"
          required
        />

        <TextInput
          label="Total Seats"
          placeholder="Enter total seats"
          value={newBatchData.totalSeats}
          onChange={(event) =>
            setNewBatchData({
              ...newBatchData,
              totalSeats: event.currentTarget.value,
            })
          }
          type="number"
          min="1"
          max="500"
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              !newBatchData.programme ||
              !newBatchData.discipline ||
              !newBatchData.totalSeats
            }
          >
            Add Batch
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

AddBatchModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  newBatchData: PropTypes.object.isRequired,
  setNewBatchData: PropTypes.func.isRequired,
  programmeOptions: PropTypes.array.isRequired,
  getDisciplineOptions: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddBatchModal;

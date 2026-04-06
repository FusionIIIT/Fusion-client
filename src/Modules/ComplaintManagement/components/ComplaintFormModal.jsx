import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";

const complaintTypeOptions = [
  "Electricity",
  "carpenter",
  "plumber",
  "garbage",
  "dustbin",
  "internet",
  "other",
].map((value) => ({ value, label: value }));

const areaOptions = [
  "hall-1",
  "hall-3",
  "hall-4",
  "library",
  "computer center",
  "core_lab",
  "LHTC",
  "NR2",
  "NR3",
  "Admin building",
  "Rewa_Residency",
  "Maa Saraswati Hostel",
  "Nagarjun Hostel",
  "Panini Hostel",
].map((value) => ({ value, label: value }));

const initialForm = {
  complaint_type: "internet",
  location: "hall-3",
  specific_location: "",
  details: "",
  status: 0,
  remarks: "Pending",
  reason: "None",
  comment: "None",
};

export default function ComplaintFormModal({
  opened,
  mode,
  initialData,
  canChangeStatus,
  onClose,
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialForm,
        ...initialData,
      });
      return;
    }
    setForm(initialForm);
  }, [initialData, opened]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === "create" ? "Create Complaint" : "Edit Complaint"}
      centered
    >
      <Stack>
        <Select
          label="Complaint Type"
          data={complaintTypeOptions}
          value={form.complaint_type}
          onChange={(value) => handleChange("complaint_type", value)}
          required
        />
        <Select
          label="Location"
          data={areaOptions}
          value={form.location}
          onChange={(value) => handleChange("location", value)}
          required
        />
        <TextInput
          label="Specific Location"
          value={form.specific_location}
          onChange={(event) =>
            handleChange("specific_location", event.currentTarget.value)
          }
        />
        <Textarea
          label="Details"
          value={form.details}
          onChange={(event) =>
            handleChange("details", event.currentTarget.value)
          }
          required
          minRows={3}
        />
        {mode === "edit" && canChangeStatus && (
          <NumberInput
            label="Status"
            value={form.status}
            onChange={(value) => handleChange("status", value || 0)}
            min={0}
            max={3}
          />
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={() => onSubmit(form)}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

ComplaintFormModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  initialData: PropTypes.shape({
    complaint_type: PropTypes.string,
    location: PropTypes.string,
    specific_location: PropTypes.string,
    details: PropTypes.string,
    status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    remarks: PropTypes.string,
    reason: PropTypes.string,
    comment: PropTypes.string,
  }),
  canChangeStatus: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

ComplaintFormModal.defaultProps = {
  initialData: null,
  canChangeStatus: false,
  loading: false,
};

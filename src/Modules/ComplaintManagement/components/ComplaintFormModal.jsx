import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
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

const priorityOptions = ["Urgent", "Standard", "Low"].map((value) => ({
  value,
  label: value,
}));

const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

const initialForm = {
  complaint_type: "internet",
  location: "hall-3",
  specific_location: "",
  details: "",
  status: 0,
  remarks: "",
  priority: "Standard",
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
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialForm,
        ...initialData,
      });
      setAttachment(null);
      setErrors({});
      return;
    }
    setForm(initialForm);
    setAttachment(null);
    setErrors({});
  }, [initialData, opened]);

  const validateField = (field, value) => {
    if (field === "complaint_type" && !String(value || "").trim()) {
      return "Complaint type is required.";
    }
    if (field === "location" && !String(value || "").trim()) {
      return "Location is required.";
    }
    if (field === "details" && !String(value || "").trim()) {
      return "Description is required.";
    }
    if (field === "priority" && !String(value || "").trim()) {
      return "Priority is required.";
    }
    return undefined;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleBlur = (field) => {
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, form[field]),
    }));
  };

  const handleAttachmentChange = (event) => {
    const file = event.currentTarget.files?.[0] || null;
    if (!file) {
      setAttachment(null);
      return;
    }

    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        upload_complaint: "Only JPG, PNG, PDF, and DOCX files are allowed.",
      }));
      event.currentTarget.value = "";
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      setErrors((prev) => ({
        ...prev,
        upload_complaint: "Attachment must be 5 MB or smaller.",
      }));
      event.currentTarget.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, upload_complaint: undefined }));
    setAttachment(file);
  };

  const handleSubmit = () => {
    const nextErrors = {};
    ["complaint_type", "location", "details", "priority"].forEach((field) => {
      const message = validateField(field, form[field]);
      if (message) {
        nextErrors[field] = message;
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    onSubmit({
      complaint_type: form.complaint_type,
      location: form.location,
      specific_location: form.specific_location || "",
      details: form.details,
      priority: form.priority,
      remarks: form.remarks || "",
      ...(mode === "edit" && canChangeStatus ? { status: form.status } : {}),
      upload_complaint: attachment,
    });
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
          onBlur={() => handleBlur("complaint_type")}
          required
          error={errors.complaint_type}
        />
        <Select
          label="Location"
          data={areaOptions}
          value={form.location}
          onChange={(value) => handleChange("location", value)}
          onBlur={() => handleBlur("location")}
          required
          error={errors.location}
        />
        <Select
          label="Priority"
          data={priorityOptions}
          value={form.priority}
          onChange={(value) => handleChange("priority", value)}
          onBlur={() => handleBlur("priority")}
          required
          error={errors.priority}
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
          onBlur={() => handleBlur("details")}
          required
          minRows={3}
          error={errors.details}
        />
        {mode === "edit" && canChangeStatus && (
          <Textarea
            label="Remarks"
            value={form.remarks || ""}
            onChange={(event) =>
              handleChange("remarks", event.currentTarget.value)
            }
            minRows={2}
          />
        )}
        <div>
          <Text size="sm" fw={500} mb={4}>
            Attachment
          </Text>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.docx"
            onChange={handleAttachmentChange}
          />
          {errors.upload_complaint && (
            <Text size="xs" c="red" mt={4}>
              {errors.upload_complaint}
            </Text>
          )}
          {attachment && (
            <Text size="xs" c="dimmed" mt={4}>
              Selected: {attachment.name}
            </Text>
          )}
        </div>
        {mode === "edit" && canChangeStatus && (
          <NumberInput
            label="Status"
            value={form.status}
            onChange={(value) => handleChange("status", value || 0)}
            min={0}
            max={2}
          />
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={handleSubmit}>
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
    priority: PropTypes.string,
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

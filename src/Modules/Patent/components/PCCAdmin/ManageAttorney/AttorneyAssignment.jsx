import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  TextInput,
  Textarea,
  Button,
  Title,
  FileInput,
  Alert,
  LoadingOverlay,
  Card,
  Text,
  Badge,
  Group,
} from "@mantine/core";
import {
  UserCircle,
  EnvelopeSimple,
  Phone,
  Buildings,
  Briefcase,
  ArrowLeft,
  Paperclip,
} from "phosphor-react";
import { attorneyAssignmentService } from "../../../services/attorneyService.jsx";
import "../../../style/Pcc_Admin/NewAttorneyForm.css";

function AttorneyAssignment({ applicationId, onBack }) {
  const [existingAssignment, setExistingAssignment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    attorney_name: "",
    attorney_email: "",
    attorney_phone: "",
    attorney_firm: "",
    specialization: "",
    remarks: "",
  });
  const [engagementProof, setEngagementProof] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch existing assignment on mount
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setIsLoading(true);
        const data =
          await attorneyAssignmentService.getAssignment(applicationId);
        if (data) {
          setExistingAssignment(data);
          setFormData({
            attorney_name: data.attorney_name || "",
            attorney_email: data.attorney_email || "",
            attorney_phone: data.attorney_phone || "",
            attorney_firm: data.attorney_firm || "",
            specialization: data.specialization || "",
            remarks: data.remarks || "",
          });
        }
      } catch (err) {
        console.error("Error fetching attorney assignment:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignment();
  }, [applicationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.attorney_name || formData.attorney_name.trim().length < 2) {
      setError("Attorney name must be at least 2 characters.");
      return;
    }

    try {
      setIsSaving(true);
      await attorneyAssignmentService.assignAttorney(applicationId, {
        ...formData,
        engagement_proof: engagementProof,
      });

      setSuccess("Attorney assigned successfully!");
      setIsEditing(false);

      // Refresh data
      const data = await attorneyAssignmentService.getAssignment(applicationId);
      if (data) {
        setExistingAssignment(data);
      }
    } catch (err) {
      setError(err.message || "Failed to assign attorney.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  // View mode - show existing assignment
  if (existingAssignment && !isEditing) {
    return (
      <div id="pcc-new-attorney-form-container">
        <div id="pcc-new-attorney-form-header">
          <Title order={2} id="pcc-new-attorney-form-title">
            Attorney Assignment
          </Title>
          <Group>
            <Button
              variant="outline"
              color="blue"
              onClick={() => setIsEditing(true)}
            >
              Edit Assignment
            </Button>
            <Button
              variant="subtle"
              leftIcon={<ArrowLeft size={20} weight="bold" />}
              onClick={onBack}
            >
              Back
            </Button>
          </Group>
        </div>

        {success && (
          <Alert
            color="green"
            mb="md"
            withCloseButton
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        <Card p="lg" radius="md" withBorder>
          <Group mb="md">
            <Badge
              size="lg"
              color={existingAssignment.is_active ? "green" : "red"}
              variant="light"
            >
              {existingAssignment.is_active ? "Active" : "Inactive"}
            </Badge>
          </Group>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Attorney Name
            </Text>
            <Text size="md">{existingAssignment.attorney_name}</Text>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Email
            </Text>
            <Text size="md">
              {existingAssignment.attorney_email || "Not provided"}
            </Text>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Phone
            </Text>
            <Text size="md">
              {existingAssignment.attorney_phone || "Not provided"}
            </Text>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Firm
            </Text>
            <Text size="md">
              {existingAssignment.attorney_firm || "Not provided"}
            </Text>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Specialization
            </Text>
            <Text size="md">
              {existingAssignment.specialization || "Not provided"}
            </Text>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Remarks
            </Text>
            <Text size="md">{existingAssignment.remarks || "No remarks"}</Text>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Assigned Date
            </Text>
            <Text size="md">
              {existingAssignment.assigned_date
                ? new Date(existingAssignment.assigned_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )
                : "N/A"}
            </Text>
          </div>

          {existingAssignment.engagement_proof && (
            <div style={{ marginBottom: "12px" }}>
              <Text weight={500} size="sm" color="dimmed">
                Engagement Proof
              </Text>
              <Button
                component="a"
                href={existingAssignment.engagement_proof}
                target="_blank"
                download
                variant="outline"
                color="blue"
                leftIcon={<Paperclip size={18} />}
                mt="xs"
              >
                Download Proof
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Edit/Create mode - show form
  return (
    <div id="pcc-new-attorney-form-container">
      <LoadingOverlay visible={isSaving} />

      <div id="pcc-new-attorney-form-header">
        <Title order={2} id="pcc-new-attorney-form-title">
          {existingAssignment
            ? "Update Attorney Assignment"
            : "Assign Attorney"}
        </Title>
        <Button
          variant="subtle"
          leftIcon={<ArrowLeft size={20} weight="bold" />}
          onClick={existingAssignment ? () => setIsEditing(false) : onBack}
          id="pcc-new-attorney-back-btn"
        >
          {existingAssignment ? "Cancel" : "Back"}
        </Button>
      </div>

      {error && (
        <Alert
          color="red"
          mb="md"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} id="pcc-new-attorney-form-content">
        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <UserCircle size={20} id="pcc-new-attorney-form-icon" />
              <span>Attorney Name *</span>
            </div>
            <TextInput
              name="attorney_name"
              value={formData.attorney_name}
              onChange={handleChange}
              required
              placeholder="Full name of the attorney"
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <EnvelopeSimple size={20} id="pcc-new-attorney-form-icon" />
              <span>Attorney Email</span>
            </div>
            <TextInput
              name="attorney_email"
              type="email"
              value={formData.attorney_email}
              onChange={handleChange}
              placeholder="attorney@example.com"
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Phone size={20} id="pcc-new-attorney-form-icon" />
              <span>Phone Number</span>
            </div>
            <TextInput
              name="attorney_phone"
              value={formData.attorney_phone}
              onChange={handleChange}
              placeholder="+91 XXXXXXXXXX"
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Buildings size={20} id="pcc-new-attorney-form-icon" />
              <span>Law Firm</span>
            </div>
            <TextInput
              name="attorney_firm"
              value={formData.attorney_firm}
              onChange={handleChange}
              placeholder="Name of the law firm"
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Briefcase size={20} id="pcc-new-attorney-form-icon" />
              <span>Specialization</span>
            </div>
            <TextInput
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g. Software Patents, Biotech, Mechanical"
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Paperclip size={20} id="pcc-new-attorney-form-icon" />
              <span>Engagement Proof (optional)</span>
            </div>
            <FileInput
              placeholder="Upload engagement letter / contract"
              value={engagementProof}
              onChange={setEngagementProof}
              accept="image/*,application/pdf,.doc,.docx"
              clearable
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field" style={{ width: "100%" }}>
            <div id="pcc-new-attorney-form-label">
              <EnvelopeSimple size={20} id="pcc-new-attorney-form-icon" />
              <span>Remarks</span>
            </div>
            <Textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              minRows={3}
              maxRows={6}
              placeholder="Any additional notes about this attorney engagement..."
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-footer">
          <Button
            type="submit"
            variant="filled"
            color="blue"
            id="pcc-new-attorney-form-submit-btn"
            loading={isSaving}
          >
            {existingAssignment ? "Update Assignment" : "Assign Attorney"}
          </Button>
        </div>
      </form>
    </div>
  );
}

AttorneyAssignment.propTypes = {
  applicationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onBack: PropTypes.func.isRequired,
};

export default AttorneyAssignment;

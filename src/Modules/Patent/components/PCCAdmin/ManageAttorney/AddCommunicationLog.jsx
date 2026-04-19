import React, { useState } from "react";
import {
  TextInput,
  Textarea,
  Button,
  Title,
  Select,
  FileInput,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import {
  EnvelopeSimple,
  PaperPlaneTilt,
  UserCircle,
  ArrowLeft,
  Paperclip,
  ShieldCheck,
} from "phosphor-react";
import PropTypes from "prop-types";
import { communicationLogService } from "../../../services/communicationLogService.jsx";
import "../../../style/Pcc_Admin/NewAttorneyForm.css";

function AddCommunicationLog({ applicationId, onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    direction: "",
    subject: "",
    body: "",
    external_party_name: "",
    external_party_email: "",
    confidentiality_level: "Internal",
  });
  const [attachment, setAttachment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.direction) {
      setError("Please select a communication direction.");
      return;
    }
    if (!formData.subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!formData.body.trim()) {
      setError("Body/details are required.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await communicationLogService.addLog(applicationId, {
        ...formData,
        attachment,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to add communication log.");
      console.error("Error adding log:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="pcc-new-attorney-form-container">
      <LoadingOverlay visible={isLoading} />

      <div id="pcc-new-attorney-form-header">
        <Title order={2} id="pcc-new-attorney-form-title">
          Log External Communication
        </Title>
        <Button
          variant="subtle"
          leftIcon={<ArrowLeft size={20} weight="bold" />}
          onClick={onBack}
          id="pcc-new-attorney-back-btn"
        >
          Back
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
              <PaperPlaneTilt size={20} id="pcc-new-attorney-form-icon" />
              <span>Direction</span>
            </div>
            <Select
              placeholder="Select direction"
              data={[
                { value: "INCOMING", label: "Incoming" },
                { value: "OUTGOING", label: "Outgoing" },
              ]}
              value={formData.direction}
              onChange={(val) =>
                setFormData({ ...formData, direction: val || "" })
              }
              required
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <EnvelopeSimple size={20} id="pcc-new-attorney-form-icon" />
              <span>Subject</span>
            </div>
            <TextInput
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Brief subject of the communication"
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <UserCircle size={20} id="pcc-new-attorney-form-icon" />
              <span>External Party Name</span>
            </div>
            <TextInput
              name="external_party_name"
              value={formData.external_party_name}
              onChange={handleChange}
              placeholder="Attorney, Patent Office, etc."
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <EnvelopeSimple size={20} id="pcc-new-attorney-form-icon" />
              <span>External Party Email</span>
            </div>
            <TextInput
              name="external_party_email"
              value={formData.external_party_email}
              onChange={handleChange}
              placeholder="email@example.com"
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <ShieldCheck size={20} id="pcc-new-attorney-form-icon" />
              <span>Confidentiality Level</span>
            </div>
            <Select
              placeholder="Select confidentiality level"
              data={[
                { value: "Public", label: "Public" },
                { value: "Internal", label: "Internal" },
                { value: "Confidential", label: "Confidential" },
                {
                  value: "Attorney-Client Privileged",
                  label: "Attorney-Client Privileged",
                },
              ]}
              value={formData.confidentiality_level}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  confidentiality_level: val || "Internal",
                })
              }
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field" style={{ width: "100%" }}>
            <div id="pcc-new-attorney-form-label">
              <EnvelopeSimple size={20} id="pcc-new-attorney-form-icon" />
              <span>Details / Body</span>
            </div>
            <Textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              required
              minRows={5}
              maxRows={10}
              placeholder="Detailed description of the communication, instructions received, actions taken..."
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Paperclip size={20} id="pcc-new-attorney-form-icon" />
              <span>Attachment (optional)</span>
            </div>
            <FileInput
              placeholder="Upload proof / screenshot / document"
              value={attachment}
              onChange={setAttachment}
              accept="image/*,application/pdf,.doc,.docx"
              clearable
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
            loading={isLoading}
          >
            Log Communication
          </Button>
        </div>
      </form>
    </div>
  );
}

AddCommunicationLog.propTypes = {
  applicationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onBack: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default AddCommunicationLog;

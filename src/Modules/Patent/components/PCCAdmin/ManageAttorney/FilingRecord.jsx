import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  TextInput,
  Textarea,
  Button,
  Title,
  Select,
  FileInput,
  Alert,
  LoadingOverlay,
  Card,
  Text,
  Badge,
  Group,
} from "@mantine/core";
import {
  FileText,
  ArrowLeft,
  Paperclip,
  Globe,
  Calendar,
  Buildings,
  Hash,
} from "phosphor-react";
import { filingRecordService } from "../../../services/attorneyService.jsx";
import "../../../style/Pcc_Admin/NewAttorneyForm.css";

function FilingRecord({ applicationId, onBack }) {
  const [existingRecord, setExistingRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    filing_office: "",
    jurisdiction: "India",
    external_filing_id: "",
    filing_date: "",
    international_filing_justification: "",
    remarks: "",
  });
  const [confirmationProof, setConfirmationProof] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setIsLoading(true);
        const data = await filingRecordService.getFilingRecord(applicationId);
        // data could be { filing_record: null } from backend if none exists
        if (data && !("filing_record" in data && data.filing_record === null)) {
          setExistingRecord(data);
          setFormData({
            filing_office: data.filing_office || "",
            jurisdiction: data.jurisdiction || "India",
            external_filing_id: data.external_filing_id || "",
            filing_date: data.filing_date || "",
            international_filing_justification:
              data.international_filing_justification || "",
            remarks: data.remarks || "",
          });
        }
      } catch (err) {
        console.error("Error fetching filing record:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecord();
  }, [applicationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.filing_office.trim()) {
      setError("Filing office is required.");
      return;
    }
    if (!formData.jurisdiction.trim()) {
      setError("Jurisdiction is required.");
      return;
    }
    if (!formData.filing_date) {
      setError("Filing date is required.");
      return;
    }

    // Validate international filing justification for non-Indian jurisdictions
    if (
      formData.jurisdiction !== "India" &&
      (!formData.international_filing_justification ||
        formData.international_filing_justification.trim().length < 10)
    ) {
      setError(
        "International filing justification is required (minimum 10 characters) for non-Indian jurisdictions.",
      );
      return;
    }

    try {
      setIsSaving(true);
      await filingRecordService.recordFiling(applicationId, {
        ...formData,
        confirmation_proof: confirmationProof,
      });

      setSuccess("Filing record saved successfully!");
      setIsEditing(false);

      const data = await filingRecordService.getFilingRecord(applicationId);
      if (data) {
        setExistingRecord(data);
      }
    } catch (err) {
      setError(err.message || "Failed to record filing.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  // View mode
  if (existingRecord && !isEditing) {
    return (
      <div id="pcc-new-attorney-form-container">
        <div id="pcc-new-attorney-form-header">
          <Title order={2} id="pcc-new-attorney-form-title">
            Filing Record
          </Title>
          <Group>
            <Button
              variant="outline"
              color="blue"
              onClick={() => setIsEditing(true)}
            >
              Update Record
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

        <Card p="lg" radius="md" withBorder mb="md">
          <Group mb="md">
            <Badge size="lg" color="green" variant="filled">
              Filed
            </Badge>
            <Badge size="lg" color="blue" variant="light">
              {existingRecord.jurisdiction || "India"}
            </Badge>
          </Group>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Filing Office
            </Text>
            <Text size="md">{existingRecord.filing_office}</Text>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Jurisdiction
            </Text>
            <Text size="md">{existingRecord.jurisdiction}</Text>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              External Filing ID
            </Text>
            <Text size="md">
              {existingRecord.external_filing_id || "Not assigned yet"}
            </Text>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Filing Date
            </Text>
            <Text size="md">
              {existingRecord.filing_date
                ? new Date(existingRecord.filing_date).toLocaleDateString(
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

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Filed By
            </Text>
            <Text size="md">{existingRecord.filed_by_name || "PCC Admin"}</Text>
          </div>

          {existingRecord.jurisdiction !== "India" &&
            existingRecord.international_filing_justification && (
              <div style={{ marginBottom: "12px" }}>
                <Text weight={500} size="sm" color="dimmed">
                  International Filing Justification
                </Text>
                <Text
                  size="md"
                  style={{
                    whiteSpace: "pre-wrap",
                    backgroundColor: "#f8f9fa",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  {existingRecord.international_filing_justification}
                </Text>
              </div>
            )}

          {existingRecord.remarks && (
            <div style={{ marginBottom: "12px" }}>
              <Text weight={500} size="sm" color="dimmed">
                Remarks
              </Text>
              <Text size="md">{existingRecord.remarks}</Text>
            </div>
          )}

          {existingRecord.confirmation_proof && (
            <div style={{ marginBottom: "12px" }}>
              <Text weight={500} size="sm" color="dimmed">
                Confirmation Proof
              </Text>
              <Button
                component="a"
                href={existingRecord.confirmation_proof}
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

  // Edit/Create form
  return (
    <div id="pcc-new-attorney-form-container">
      <LoadingOverlay visible={isSaving} />

      <div id="pcc-new-attorney-form-header">
        <Title order={2} id="pcc-new-attorney-form-title">
          {existingRecord ? "Update Filing Record" : "Record Patent Filing"}
        </Title>
        <Button
          variant="subtle"
          leftIcon={<ArrowLeft size={20} weight="bold" />}
          onClick={existingRecord ? () => setIsEditing(false) : onBack}
          id="pcc-new-attorney-back-btn"
        >
          {existingRecord ? "Cancel" : "Back"}
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
              <Buildings size={20} id="pcc-new-attorney-form-icon" />
              <span>Filing Office *</span>
            </div>
            <TextInput
              name="filing_office"
              value={formData.filing_office}
              onChange={handleChange}
              required
              placeholder="e.g. Indian Patent Office, USPTO, EPO"
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Globe size={20} id="pcc-new-attorney-form-icon" />
              <span>Jurisdiction *</span>
            </div>
            <Select
              placeholder="Select jurisdiction"
              data={[
                { value: "India", label: "India" },
                { value: "United States", label: "United States" },
                { value: "European Union", label: "European Union" },
                { value: "China", label: "China" },
                { value: "Japan", label: "Japan" },
                { value: "South Korea", label: "South Korea" },
                { value: "International (PCT)", label: "International (PCT)" },
                { value: "Other", label: "Other" },
              ]}
              value={formData.jurisdiction}
              onChange={(val) =>
                setFormData({ ...formData, jurisdiction: val || "India" })
              }
              required
              searchable
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Hash size={20} id="pcc-new-attorney-form-icon" />
              <span>External Filing ID</span>
            </div>
            <TextInput
              name="external_filing_id"
              value={formData.external_filing_id}
              onChange={handleChange}
              placeholder="Application number from patent office"
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Calendar size={20} id="pcc-new-attorney-form-icon" />
              <span>Filing Date *</span>
            </div>
            <TextInput
              name="filing_date"
              type="date"
              value={formData.filing_date}
              onChange={handleChange}
              required
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        {formData.jurisdiction !== "India" && (
          <div id="pcc-new-attorney-form-section">
            <div id="pcc-new-attorney-form-field" style={{ width: "100%" }}>
              <div id="pcc-new-attorney-form-label">
                <Globe size={20} id="pcc-new-attorney-form-icon" />
                <span>International Filing Justification * (min 10 chars)</span>
              </div>
              <Textarea
                name="international_filing_justification"
                value={formData.international_filing_justification}
                onChange={handleChange}
                required
                minRows={3}
                maxRows={6}
                placeholder="Justify why this patent needs to be filed internationally..."
                id="pcc-new-attorney-form-input"
              />
            </div>
          </div>
        )}

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Paperclip size={20} id="pcc-new-attorney-form-icon" />
              <span>Confirmation Proof (optional)</span>
            </div>
            <FileInput
              placeholder="Upload filing receipt / confirmation"
              value={confirmationProof}
              onChange={setConfirmationProof}
              accept="image/*,application/pdf,.doc,.docx"
              clearable
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field" style={{ width: "100%" }}>
            <div id="pcc-new-attorney-form-label">
              <FileText size={20} id="pcc-new-attorney-form-icon" />
              <span>Remarks</span>
            </div>
            <Textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              minRows={3}
              maxRows={6}
              placeholder="Any additional remarks about the filing..."
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
            {existingRecord ? "Update Filing Record" : "Record Filing"}
          </Button>
        </div>
      </form>
    </div>
  );
}

FilingRecord.propTypes = {
  applicationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onBack: PropTypes.func.isRequired,
};

export default FilingRecord;

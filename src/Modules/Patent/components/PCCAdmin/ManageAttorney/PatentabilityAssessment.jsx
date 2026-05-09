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
  NumberInput,
  Progress,
} from "@mantine/core";
import {
  MagnifyingGlass,
  ArrowLeft,
  Paperclip,
  ChartBar,
  Lightbulb,
  Scales,
  Star,
} from "phosphor-react";
import { patentabilityAssessmentService } from "../../../services/attorneyService.jsx";
import "../../../style/Pcc_Admin/NewAttorneyForm.css";

function PatentabilityAssessment({ applicationId, onBack }) {
  const [existingAssessment, setExistingAssessment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    assessed_by_attorney: "",
    novelty_score: "",
    non_obviousness_score: "",
    utility_score: "",
    search_completeness: "",
    recommendation: "",
    opinion_summary: "",
    prior_art_references: "",
  });
  const [attorneyReport, setAttorneyReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        const data =
          await patentabilityAssessmentService.getAssessment(applicationId);
        if (data) {
          setExistingAssessment(data);
          setFormData({
            assessed_by_attorney: data.assessed_by_attorney || "",
            novelty_score: data.novelty_score ?? "",
            non_obviousness_score: data.non_obviousness_score ?? "",
            utility_score: data.utility_score ?? "",
            search_completeness: data.search_completeness ?? "",
            recommendation: data.recommendation || "",
            opinion_summary: data.opinion_summary || "",
            prior_art_references: data.prior_art_references || "",
          });
        }
      } catch (err) {
        console.error("Error fetching assessment:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessment();
  }, [applicationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.assessed_by_attorney.trim()) {
      setError("Attorney name who performed the assessment is required.");
      return;
    }
    if (!formData.recommendation) {
      setError("Recommendation is required.");
      return;
    }
    if (
      !formData.opinion_summary ||
      formData.opinion_summary.trim().length < 20
    ) {
      setError("Opinion summary must be at least 20 characters.");
      return;
    }

    try {
      setIsSaving(true);
      await patentabilityAssessmentService.recordAssessment(applicationId, {
        ...formData,
        attorney_report: attorneyReport,
      });

      setSuccess("Patentability assessment recorded successfully!");
      setIsEditing(false);

      const data =
        await patentabilityAssessmentService.getAssessment(applicationId);
      if (data) {
        setExistingAssessment(data);
      }
    } catch (err) {
      setError(err.message || "Failed to record assessment.");
    } finally {
      setIsSaving(false);
    }
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case "File Patent":
        return "green";
      case "Do Not File":
        return "red";
      case "Needs Amendment":
        return "orange";
      default:
        return "gray";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 60) return "blue";
    if (score >= 40) return "yellow";
    return "red";
  };

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  // View mode
  if (existingAssessment && !isEditing) {
    return (
      <div id="pcc-new-attorney-form-container">
        <div id="pcc-new-attorney-form-header">
          <Title order={2} id="pcc-new-attorney-form-title">
            Patentability Assessment
          </Title>
          <Group>
            <Button
              variant="outline"
              color="blue"
              onClick={() => setIsEditing(true)}
            >
              Update Assessment
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
            <Badge
              size="lg"
              color={getRecommendationColor(existingAssessment.recommendation)}
              variant="filled"
            >
              {existingAssessment.recommendation || "Pending"}
            </Badge>
          </Group>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Assessed By (Attorney)
            </Text>
            <Text size="md">{existingAssessment.assessed_by_attorney}</Text>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text weight={500} size="sm" color="dimmed">
              Assessment Date
            </Text>
            <Text size="md">
              {existingAssessment.assessment_date
                ? new Date(
                    existingAssessment.assessment_date,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </Text>
          </div>
        </Card>

        <Card p="lg" radius="md" withBorder mb="md">
          <Text weight={600} size="lg" mb="md">
            Scores
          </Text>

          <div style={{ marginBottom: "16px" }}>
            <Group position="apart" mb={4}>
              <Text size="sm" weight={500}>
                Novelty Score
              </Text>
              <Text size="sm" weight={600}>
                {existingAssessment.novelty_score ?? "N/A"}/100
              </Text>
            </Group>
            {existingAssessment.novelty_score != null && (
              <Progress
                value={existingAssessment.novelty_score}
                color={getScoreColor(existingAssessment.novelty_score)}
                size="lg"
                radius="xl"
              />
            )}
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Group position="apart" mb={4}>
              <Text size="sm" weight={500}>
                Non-Obviousness Score
              </Text>
              <Text size="sm" weight={600}>
                {existingAssessment.non_obviousness_score ?? "N/A"}/100
              </Text>
            </Group>
            {existingAssessment.non_obviousness_score != null && (
              <Progress
                value={existingAssessment.non_obviousness_score}
                color={getScoreColor(existingAssessment.non_obviousness_score)}
                size="lg"
                radius="xl"
              />
            )}
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Group position="apart" mb={4}>
              <Text size="sm" weight={500}>
                Utility Score
              </Text>
              <Text size="sm" weight={600}>
                {existingAssessment.utility_score ?? "N/A"}/100
              </Text>
            </Group>
            {existingAssessment.utility_score != null && (
              <Progress
                value={existingAssessment.utility_score}
                color={getScoreColor(existingAssessment.utility_score)}
                size="lg"
                radius="xl"
              />
            )}
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Group position="apart" mb={4}>
              <Text size="sm" weight={500}>
                Search Completeness
              </Text>
              <Text size="sm" weight={600}>
                {existingAssessment.search_completeness ?? "N/A"}/100
              </Text>
            </Group>
            {existingAssessment.search_completeness != null && (
              <Progress
                value={existingAssessment.search_completeness}
                color={getScoreColor(existingAssessment.search_completeness)}
                size="lg"
                radius="xl"
              />
            )}
          </div>
        </Card>

        <Card p="lg" radius="md" withBorder mb="md">
          <Text weight={600} size="lg" mb="sm">
            Opinion Summary
          </Text>
          <Text
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              backgroundColor: "#f8f9fa",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            {existingAssessment.opinion_summary || "No summary provided."}
          </Text>
        </Card>

        {existingAssessment.prior_art_references && (
          <Card p="lg" radius="md" withBorder mb="md">
            <Text weight={600} size="lg" mb="sm">
              Prior Art References
            </Text>
            <Text
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
                backgroundColor: "#f8f9fa",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              {existingAssessment.prior_art_references}
            </Text>
          </Card>
        )}

        {existingAssessment.attorney_report && (
          <Card p="lg" radius="md" withBorder mb="md">
            <Text weight={600} size="lg" mb="sm">
              Attorney Report
            </Text>
            <Button
              component="a"
              href={existingAssessment.attorney_report}
              target="_blank"
              download
              variant="outline"
              color="blue"
              leftIcon={<Paperclip size={18} />}
            >
              Download Report
            </Button>
          </Card>
        )}
      </div>
    );
  }

  // Edit/Create form
  return (
    <div id="pcc-new-attorney-form-container">
      <LoadingOverlay visible={isSaving} />

      <div id="pcc-new-attorney-form-header">
        <Title order={2} id="pcc-new-attorney-form-title">
          {existingAssessment
            ? "Update Patentability Assessment"
            : "Record Patentability Assessment"}
        </Title>
        <Button
          variant="subtle"
          leftIcon={<ArrowLeft size={20} weight="bold" />}
          onClick={existingAssessment ? () => setIsEditing(false) : onBack}
          id="pcc-new-attorney-back-btn"
        >
          {existingAssessment ? "Cancel" : "Back"}
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
              <MagnifyingGlass size={20} id="pcc-new-attorney-form-icon" />
              <span>Assessed By (Attorney Name) *</span>
            </div>
            <TextInput
              value={formData.assessed_by_attorney}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  assessed_by_attorney: e.target.value,
                })
              }
              required
              placeholder="Name of attorney who conducted the assessment"
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Star size={20} id="pcc-new-attorney-form-icon" />
              <span>Recommendation *</span>
            </div>
            <Select
              placeholder="Select recommendation"
              data={[
                { value: "File Patent", label: "File Patent" },
                { value: "Do Not File", label: "Do Not File" },
                { value: "Needs Amendment", label: "Needs Amendment" },
              ]}
              value={formData.recommendation}
              onChange={(val) =>
                setFormData({ ...formData, recommendation: val || "" })
              }
              required
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Lightbulb size={20} id="pcc-new-attorney-form-icon" />
              <span>Novelty Score (0-100)</span>
            </div>
            <NumberInput
              value={formData.novelty_score}
              onChange={(val) =>
                setFormData({ ...formData, novelty_score: val })
              }
              min={0}
              max={100}
              placeholder="0-100"
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Scales size={20} id="pcc-new-attorney-form-icon" />
              <span>Non-Obviousness Score (0-100)</span>
            </div>
            <NumberInput
              value={formData.non_obviousness_score}
              onChange={(val) =>
                setFormData({ ...formData, non_obviousness_score: val })
              }
              min={0}
              max={100}
              placeholder="0-100"
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <ChartBar size={20} id="pcc-new-attorney-form-icon" />
              <span>Utility Score (0-100)</span>
            </div>
            <NumberInput
              value={formData.utility_score}
              onChange={(val) =>
                setFormData({ ...formData, utility_score: val })
              }
              min={0}
              max={100}
              placeholder="0-100"
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <MagnifyingGlass size={20} id="pcc-new-attorney-form-icon" />
              <span>Search Completeness (0-100)</span>
            </div>
            <NumberInput
              value={formData.search_completeness}
              onChange={(val) =>
                setFormData({ ...formData, search_completeness: val })
              }
              min={0}
              max={100}
              placeholder="0-100"
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field" style={{ width: "100%" }}>
            <div id="pcc-new-attorney-form-label">
              <Lightbulb size={20} id="pcc-new-attorney-form-icon" />
              <span>Opinion Summary * (min 20 chars)</span>
            </div>
            <Textarea
              value={formData.opinion_summary}
              onChange={(e) =>
                setFormData({ ...formData, opinion_summary: e.target.value })
              }
              required
              minRows={5}
              maxRows={10}
              placeholder="Detailed opinion on the patentability of the invention..."
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field" style={{ width: "100%" }}>
            <div id="pcc-new-attorney-form-label">
              <MagnifyingGlass size={20} id="pcc-new-attorney-form-icon" />
              <span>Prior Art References</span>
            </div>
            <Textarea
              value={formData.prior_art_references}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  prior_art_references: e.target.value,
                })
              }
              minRows={3}
              maxRows={8}
              placeholder="List any prior art references found during the search..."
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Paperclip size={20} id="pcc-new-attorney-form-icon" />
              <span>Attorney Report (optional)</span>
            </div>
            <FileInput
              placeholder="Upload attorney's assessment report"
              value={attorneyReport}
              onChange={setAttorneyReport}
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
            loading={isSaving}
          >
            {existingAssessment ? "Update Assessment" : "Record Assessment"}
          </Button>
        </div>
      </form>
    </div>
  );
}

PatentabilityAssessment.propTypes = {
  applicationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onBack: PropTypes.func.isRequired,
};

export default PatentabilityAssessment;

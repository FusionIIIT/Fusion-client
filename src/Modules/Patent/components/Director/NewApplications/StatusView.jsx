import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Text,
  Card,
  Grid,
  Button,
  Loader,
  Alert,
  Title,
  Group,
  Textarea,
} from "@mantine/core";
import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react";
import "../../../style/Director/StatusView.css";
import {
  fetchDirectorApplicationDetails,
  approveDirectorApplication,
  rejectDirectorApplication,
} from "../../../services/directorService";

function FormField({ label, value }) {
  return (
    <div id="pms-new-status-form-field">
      <Text id="pms-new-status-field-label">{label}</Text>
      <Text id="pms-new-status-field-value">{value || "Not provided"}</Text>
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function FileDownloadButton({ fileUrl, label, disabled }) {
  if (!fileUrl || fileUrl === "null" || disabled) {
    return (
      <Button
        variant="outline"
        color="gray"
        leftIcon={<DownloadSimple size={18} />}
        disabled
      >
        No {label} Available
      </Button>
    );
  }

  return (
    <Button
      component="a"
      href={fileUrl}
      target="_blank"
      rel="noreferrer"
      variant="outline"
      color="blue"
      leftIcon={<DownloadSimple size={18} />}
    >
      View {label}
    </Button>
  );
}

FileDownloadButton.propTypes = {
  fileUrl: PropTypes.string,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

function FormFieldWithDownload({ label, value, fileUrl, fileLabel }) {
  return (
    <div id="pms-new-status-form-field-with-download">
      <div id="pms-new-status-field-label-container">
        <Text id="pms-new-status-field-label">{label}</Text>
        <Text id="pms-new-status-field-value">{value || "Not provided"}</Text>
      </div>
      <div id="pms-new-status-download-button-wrapper">
        <FileDownloadButton
          fileUrl={fileUrl}
          label={fileLabel}
          disabled={!fileUrl || fileUrl === "null"}
        />
      </div>
    </div>
  );
}

FormFieldWithDownload.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fileUrl: PropTypes.string,
  fileLabel: PropTypes.string.isRequired,
};

function FormSection({ title, children }) {
  return (
    <Card
      id="pms-new-status-detail-section"
      p="lg"
      radius="md"
      withBorder
      mb="md"
    >
      <Title id="pms-new-status-section-title">{title}</Title>
      {children}
    </Card>
  );
}

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function PatentApplication() {
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [decisionComments, setDecisionComments] = useState("");
  const handleAccept = async () => {
    if (!decisionComments.trim()) {
      alert("Comments are required to approve and forward the application.");
      return;
    }

    try {
      await approveDirectorApplication(applicationId, decisionComments.trim());

      alert("Application approved successfully and sent to PCC Admin.");
      window.history.back();
    } catch (err) {
      console.error("Error in approving application:", err);
      alert(`Failed to approve: ${err.response?.data?.error || err.message}`);
    }
  };
  const handleReject = async () => {
    if (!decisionComments.trim()) {
      alert("Comments are required to reject and send back for revision.");
      return;
    }

    try {
      await rejectDirectorApplication(applicationId, decisionComments.trim());
      alert("Application sent back for revision successfully.");
      window.history.back();
    } catch (err) {
      console.error("Error in Reverting application:", err);
      alert(
        `Failed to send back for revision: ${err.response?.data?.error || err.message}`,
      );
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem("selectedApplicationId");
    if (storedId) {
      const idParts = storedId.split("_");
      const numericId = idParts.length > 1 ? idParts[1] : storedId;
      setApplicationId(numericId);
    } else {
      setError("No application selected - Please choose an application first");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!applicationId) return;

      try {
        setLoading(true);
        const response = await fetchDirectorApplicationDetails(applicationId);

        if (response) {
          setApplicationData(response);
          setApplicationId(response.application_id);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching details:", err);
        setError(
          `Failed to load details: ${err.response?.data?.error || err.message}`,
        );
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) fetchApplicationDetails();
  }, [applicationId]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedApplicationId");
      localStorage.removeItem("selectedApplicationToken");
    };
  }, []);

  if (loading) {
    return (
      <Container id="pms-new-status-loader-container">
        <Loader size="lg" color="blue" />
        <Text mt="md">Loading application details...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container id="pms-new-status-error-container">
        <Alert color="red" title="Error">
          {error}
        </Alert>
        <Button mt="md" onClick={() => window.history.back()}>
          Back to Applications
        </Button>
      </Container>
    );
  }

  if (!applicationData) {
    return (
      <Container id="pms-new-status-error-container">
        <Alert color="blue" title="No Data">
          No application data found
        </Alert>
        <Button mt="md" onClick={() => window.history.back()}>
          Back to Applications
        </Button>
      </Container>
    );
  }

  const {
    application_id,
    title,
    application_number,
    token_no,
    primary_applicant_name,
    attorney_name,
    status,
    decision_status,
    budget_estimate,
    budget_status,
    comments,
    applicants,
    section_I,
    section_II,
    section_III,
    dates,
    last_updated_at,
  } = applicationData;
  const displayApplicationNumber =
    application_number || token_no || "Not Assigned";

  const formatDate = (dateString, fallbackText = "Not recorded") => {
    if (!dateString) return fallbackText;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Container
      className={`pms-new-status-director-detail-container ${isMobile ? "mobile-form-container" : ""}`}
    >
      <Button
        onClick={() => window.history.back()}
        variant="outline"
        color="blue"
        leftIcon={<ArrowLeft size={18} />}
        id="pms-new-status-director-view-back-button"
      >
        Back
      </Button>

      <div id="pms-new-status-form-content">
        <FormSection title="Application Overview">
          <Grid>
            <Grid.Col span={12} md={4}>
              <FormField label="Application ID:" value={application_id} />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField label="Title:" value={title} />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField
                label="Primary Applicant:"
                value={primary_applicant_name}
              />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField
                label="Submission Date:"
                value={formatDate(dates?.submitted_date)}
              />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField
                label="Application No:"
                value={displayApplicationNumber}
              />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField label="Attorney:" value={attorney_name} />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField
                label="Workflow Note:"
                value={
                  status === "Returned to Director"
                    ? "Attorney completed review and returned the file for Director action."
                    : status === "Attorney Assigned"
                      ? "Waiting for attorney patentability assessment."
                      : ""
                }
              />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField label="Status:" value={status} />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField label="Decision Status:" value={decision_status} />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField label="Budget Estimate:" value={budget_estimate} />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField label="Budget Status:" value={budget_status} />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField
                label="Last Updated:"
                value={formatDate(last_updated_at)}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormField label="Comments:" value={comments} />
            </Grid.Col>
          </Grid>
        </FormSection>
        <FormSection title="Key Dates">
          <div id="pms-new-status-key-dates-grid">
            <div id="pms-new-status-key-date-card">
              <div id="pms-new-status-key-date-title">Submitted</div>
              <div id="pms-new-status-key-date-value">
                {formatDate(dates?.submitted_date, "Not yet submitted")}
              </div>
            </div>

            <div id="pms-new-status-key-date-card">
              <div id="pms-new-status-key-date-title">
                Forwarded to Director
              </div>
              <div id="pms-new-status-key-date-value">
                {formatDate(
                  dates?.forwarded_to_director_date,
                  "Not yet forwarded",
                )}
              </div>
            </div>
            <div id="pms-new-status-key-date-card">
              <div id="pms-new-status-key-date-title">Director Approval</div>
              <div id="pms-new-status-key-date-value">
                {formatDate(dates?.director_approval_date, "Not yet approved")}
              </div>
            </div>
            <div id="pms-new-status-key-date-card">
              <div id="pms-new-status-key-date-title">
                Patentability Check Started
              </div>
              <div id="pms-new-status-key-date-value">
                {formatDate(
                  dates?.patentability_check_start_date,
                  "Not started",
                )}
              </div>
            </div>
            <div id="pms-new-status-key-date-card">
              <div id="pms-new-status-key-date-title">
                Patentability Check Completed
              </div>
              <div id="pms-new-status-key-date-value">
                {formatDate(
                  dates?.patentability_check_completed_date,
                  "Not completed",
                )}
              </div>
            </div>
            <div id="pms-new-status-key-date-card">
              <div id="pms-new-status-key-date-title">
                Search Report Generated
              </div>
              <div id="pms-new-status-key-date-value">
                {formatDate(
                  dates?.search_report_generated_date,
                  "Not generated",
                )}
              </div>
            </div>
            <div id="pms-new-status-key-date-card">
              <div id="pms-new-status-key-date-title">Patent Filed</div>
              <div id="pms-new-status-key-date-value">
                {formatDate(dates?.patent_filed_date, "Not filed")}
              </div>
            </div>
            <div id="pms-new-status-key-date-card">
              <div id="pms-new-status-key-date-title">Patent Published</div>
              <div id="pms-new-status-key-date-value">
                {formatDate(dates?.patent_published_date, "Not published")}
              </div>
            </div>
            <div id="pms-new-status-key-date-card">
              <div id="pms-new-status-key-date-title">Final Decision</div>
              <div id="pms-new-status-key-date-value">
                {formatDate(dates?.final_decision_date, "No final decision")}
              </div>
            </div>
            <div id="pms-new-status-key-date-card">
              <div id="pms-new-status-key-date-title">Decision Date</div>
              <div id="pms-new-status-key-date-value">
                {formatDate(dates?.decision_date, "No decision")}
              </div>
            </div>
          </div>
        </FormSection>
        <FormSection title="Section I: Administrative and Technical Details">
          <Grid>
            <Grid.Col span={12} md={6}>
              <FormField label="Type of IP:" value={section_I?.type_of_ip} />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField label="Area:" value={section_I?.area} />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormField label="Problem:" value={section_I?.problem} />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormField label="Objective:" value={section_I?.objective} />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormField label="Novelty:" value={section_I?.novelty} />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormField label="Advantages:" value={section_I?.advantages} />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Is Tested:"
                value={
                  section_I?.is_tested === true
                    ? "Yes"
                    : section_I?.is_tested === false
                      ? "No"
                      : "Not specified"
                }
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormField
                label="Applications:"
                value={section_I?.applications}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormFieldWithDownload
                label="Proof of Concept Details:"
                value="Proof of Concept Documentation"
                fileUrl={section_I?.poc_details}
                fileLabel="Proof of Concept"
              />
            </Grid.Col>
          </Grid>
        </FormSection>
        <FormSection title="Section II: IPR Ownership">
          <Grid>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Funding Details:"
                value={section_II?.funding_details}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Funding Source:"
                value={section_II?.funding_source}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormFieldWithDownload
                label="Source Agreement:"
                value="Source Agreement Document"
                fileUrl={section_II?.source_agreement}
                fileLabel="Agreement Document"
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormField
                label="Publication Details:"
                value={section_II?.publication_details}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField label="MOU Details:" value={section_II?.mou_details} />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormFieldWithDownload
                label="MOU File:"
                value="MOU Document"
                fileUrl={section_II?.mou_file}
                fileLabel="MOU Document"
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormField
                label="Research Details:"
                value={section_II?.research_details}
              />
            </Grid.Col>
          </Grid>
        </FormSection>
        <FormSection title="Section III: Commercialization">
          <Grid>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Company Name:"
                value={section_III?.company_name}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Contact Person:"
                value={section_III?.contact_person}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Contact Number:"
                value={section_III?.contact_no}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Development Stage:"
                value={section_III?.development_stage}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormFieldWithDownload
                label="Form III:"
                value="Form III Document"
                fileUrl={section_III?.form_iii}
                fileLabel="Form III"
              />
            </Grid.Col>
          </Grid>
        </FormSection>
        <FormSection title="Applicants">
          {applicants?.length > 0 ? (
            <Grid>
              {applicants.map((applicant, index) => (
                <Grid.Col key={index} span={12} md={6}>
                  <Card id="pms-new-status-applicant-card">
                    <Text weight={600} size="lg" mb="xs">
                      Applicant {index + 1}
                    </Text>
                    <FormField label="Name:" value={applicant.name} />
                    <FormField label="Email:" value={applicant.email} />
                    <FormField label="Mobile:" value={applicant.mobile} />
                    <FormField label="Address:" value={applicant.address} />
                    <FormField
                      label="Share Percentage:"
                      value={
                        applicant.percentage_share
                          ? `${applicant.percentage_share}%`
                          : ""
                      }
                    />
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Text color="dimmed">No applicant information available</Text>
          )}
        </FormSection>
        <FormSection title="Application Decision">
          <div id="pms-new-status-decision-section">
            <div id="pms-new-status-assign-attorney-section">
              <Text size="lg" weight={500} mb="sm">
                Director Decision Comments
              </Text>

              <Textarea
                label="Director Comments *"
                placeholder="Add comments for this decision. These comments are mandatory and will be persisted."
                minRows={4}
                value={decisionComments}
                onChange={(event) =>
                  setDecisionComments(event.currentTarget.value)
                }
                mt="md"
              />
            </div>

            <div id="pms-new-status-decision-buttons">
              <Group spacing="md">
                <Button
                  color="green"
                  size="md"
                  onClick={handleAccept}
                  id="pms-new-status-decision-button"
                >
                  Approve
                </Button>
                <Button
                  color="red"
                  size="md"
                  onClick={handleReject}
                  id="pms-new-status-decision-button"
                >
                  Send Back for Revision
                </Button>
              </Group>
            </div>
          </div>
        </FormSection>
      </div>
    </Container>
  );
}

export default PatentApplication;

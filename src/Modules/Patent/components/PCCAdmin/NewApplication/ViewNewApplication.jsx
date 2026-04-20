import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Container,
  Text,
  Card,
  Grid,
  Button,
  Loader,
  Alert,
  Title,
  Textarea,
  Modal,
  Group,
  ActionIcon,
  Box,
  Select,
  NumberInput,
} from "@mantine/core";
import { ArrowLeft, Download } from "phosphor-react"; // Changed DownloadSimple to Download
import "../../../style/Pcc_Admin/ViewNewApplication.css";
import { host } from "../../../../../routes/globalRoutes/index.jsx";

// Field component for detail view
function FormField({ label, value }) {
  return (
    <div id="pms-pcc-form-field">
      <Text id="pms-pcc-field-label">{label}</Text>
      <Text id="pms-pcc-field-value">{value || "Not provided"}</Text>
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Field with download button for direct file URLs
function FormFieldWithDownload({ label, value, fileUrl, fileLabel }) {
  // Extract just the filename from the path for display
  const displayValue = value && typeof value === "string" && value.includes("/")
    ? value.split("/").pop()
    : value;

  return (
    <div id="pms-pcc-form-field-with-download">
      <div id="pms-pcc-field-label-container">
        <Text id="pms-pcc-field-label">{label}</Text>
        <Text id="pms-pcc-field-value">{displayValue || "Not provided"}</Text>
      </div>
      <div id="pms-pcc-download-button-wrapper">
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

// File Download Button Component
function FileDownloadButton({ fileUrl, label, disabled }) {
  if (!fileUrl || fileUrl === "null" || disabled) {
    return (
      <Button
        variant="outline"
        color="gray"
        leftIcon={<Download size={18} />} // Changed from DownloadSimple to Download
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
      download
      variant="outline"
      color="blue"
      leftIcon={<Download size={18} />} // Changed from DownloadSimple to Download
    >
      Download {label}
    </Button>
  );
}

FileDownloadButton.propTypes = {
  fileUrl: PropTypes.string,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

// Section component for detail view
function FormSection({ title, children }) {
  return (
    <Card id="pms-pcc-detail-section" p="lg" radius="md" withBorder mb="md">
      <Title id="pms-pcc-section-title">{title}</Title>
      {children}
    </Card>
  );
}

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function ViewNewApplication({ applicationId, handleBackToList }) {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [directors, setDirectors] = useState([]);
  const [selectedDirectorId, setSelectedDirectorId] = useState("");
  const [comments, setComments] = useState("");
  
  // Budget Data
  const [budgetData, setBudgetData] = useState({
    filing_cost: 0,
    attorney_fees: 0,
    administrative_cost: 0,
    remarks: "",
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [commentError, setCommentError] = useState(null);

  // Modal states
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [modificationModalOpen, setModificationModalOpen] = useState(false);

  const API_BASE_URL = `${host}/patentsystem`;
  const authToken = localStorage.getItem("authToken");

  const getApiErrorMessage = (err, fallbackMessage) => {
    const apiData = err?.response?.data;

    if (typeof apiData === "string" && apiData.trim()) {
      return apiData;
    }

    if (apiData?.error) {
      return apiData.error;
    }

    if (apiData?.message) {
      return apiData.message;
    }

    if (apiData?.detail) {
      return apiData.detail;
    }

    return err?.message || fallbackMessage;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch directors list when component mounts
  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/pccAdmin/directors/`,
          {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          },
        );

        if (response.data && response.data.directors) {
          const directorOptions = response.data.directors.map((director) => ({
            value: director.id.toString(),
            label: `${director.name} (${director.email})`,
          }));
          setDirectors(directorOptions);
          // Auto-select if only one director exists
          if (directorOptions.length === 1) {
            setSelectedDirectorId(directorOptions[0].value);
          }
        }
      } catch (err) {
        console.error("Error fetching directors list:", err);
      }
    };

    fetchDirectors();
  }, [authToken]);

  // Fetch application details
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!applicationId) {
        setError("No application ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/pccAdmin/applications/details/${applicationId}/`,
          {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          },
        );

        if (response.data) {
          setSelectedApplication(response.data);
          setComments(response.data.comments || "");
          setError(null);
        } else {
          setError("No application data found");
        }
      } catch (err) {
        console.error("Error fetching application details:", err);
        setError(`Failed to load application details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [applicationId, authToken]);



  const openForwardModal = () => {
    setComments("");
    setActionError(null);
    setCommentError(null);
    setForwardModalOpen(true);
  };

  const openModificationModal = () => {
    setComments("");
    setActionError(null);
    setCommentError(null);
    setModificationModalOpen(true);
  };

  // Handler for forward to director
  const handleForwardToDirector = async () => {
    // Reset errors
    setActionError(null);
    setCommentError(null);

    // Validate director selection
    if (!selectedDirectorId) {
      setActionError("Please select a director to forward to");
      return;
    }

    // Validate comments
    if (!comments.trim()) {
      setCommentError("Comments are required for forwarding to director");
      return;
    }

    setActionLoading(true);

    try {
      // First, review the application if not already reviewed
      if (selectedApplication.status === "Submitted" || selectedApplication.status === "Resubmitted") {
        await axios.post(
          `${API_BASE_URL}/pccAdmin/applications/new/review/${applicationId}/`,
          { comments: "" },
          {
            headers: {
              Authorization: `Token ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
      }

      // Then save the budget details
      await axios.post(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/budget/`,
        {
          filing_cost: budgetData.filing_cost,
          attorney_fees: budgetData.attorney_fees,
          administrative_cost: budgetData.administrative_cost,
          remarks: budgetData.remarks || comments,
        },
        { headers: { Authorization: `Token ${authToken}` } }
      );

      // Finally forward to director
      await axios.post(
        `${API_BASE_URL}/pccAdmin/applications/new/forward/${applicationId}/`,
        {
          comments,
          director_id: selectedDirectorId,
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      setActionSuccess("Application successfully forwarded to director");
      setForwardModalOpen(false);

      // Refresh application details after the action
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/applications/details/${applicationId}/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );

      if (response.data) {
        setSelectedApplication(response.data);
      }
    } catch (err) {
      console.error("Error forwarding to director:", err);
      setActionError(
        `Failed to forward application: ${getApiErrorMessage(err, "Unable to forward application.")}`,
      );
    } finally {
      setActionLoading(false);
      // Clear success message after 3 seconds
      if (actionSuccess) {
        setTimeout(() => setActionSuccess(null), 3000);
      }
    }
  };

  // Handler for request modification
  const handleRequestModification = async () => {
    // Reset errors
    setActionError(null);
    setCommentError(null);

    // Validate comments
    if (!comments.trim()) {
      setCommentError("Comments are required for requesting modification");
      return;
    }

    setActionLoading(true);

    try {
      await axios.post(
        `${API_BASE_URL}/pccAdmin/applications/new/requestModification/${applicationId}/`,
        {
          comments,
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      setActionSuccess("Modification request sent successfully");
      setModificationModalOpen(false);

      // Refresh application details after the action
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/applications/details/${applicationId}/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );

      if (response.data) {
        setSelectedApplication(response.data);
      }
    } catch (err) {
      console.error("Error requesting modification:", err);
      setActionError(
        `Failed to request modification: ${getApiErrorMessage(err, "Unable to request modification.")}`,
      );
    } finally {
      setActionLoading(false);
      // Clear success message after 3 seconds
      if (actionSuccess) {
        setTimeout(() => setActionSuccess(null), 3000);
      }
    }
  };

  if (loading) {
    return (
      <Container id="pms-pcc-loader-container">
        <Loader size="lg" color="blue" />
        <Text mt="md">Loading application details...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container id="pms-pcc-error-container">
        <Alert color="red" title="Error">
          {error}
        </Alert>
        <Button mt="md" onClick={handleBackToList}>
          Back to Applications
        </Button>
      </Container>
    );
  }

  if (!selectedApplication) {
    return (
      <Container id="pms-pcc-error-container">
        <Alert color="blue" title="No Data">
          No application data found
        </Alert>
        <Button mt="md" onClick={handleBackToList}>
          Back to Applications
        </Button>
      </Container>
    );
  }

  const {
    application_id,
    title,
    token_no,
    primary_applicant_name,
    status,
    decision_status,
    comments: app_comments,
    inventors: applicants,
    section_I,
    section_II,
    section_III,
    dates,
  } = selectedApplication;

  const submittedDate = dates?.submitted_date
    ? new Date(dates.submitted_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not recorded";

  // Build file URLs — backend returns media paths like /media/patent/...
  const mouFileUrl = section_II?.mou_file
    ? `${host}${section_II.mou_file}`
    : null;
  const firstSectionIII = Array.isArray(section_III) ? section_III[0] : section_III;
  const formIIIFileUrl = firstSectionIII?.form_iii
    ? `${host}${firstSectionIII.form_iii}`
    : null;
  const pocFileUrl = section_I?.poc_details
    ? `${host}${section_I.poc_details}`
    : null;
  const sourceAgreementFileUrl = section_II?.source_agreement
    ? `${host}${section_II.source_agreement}`
    : null;

  return (
    <Container
      id={`pms-pcc-new-app-detail-container1 ${isMobile ? "mobile-form-container" : ""}`}
      size="xl"
      px={0}
      fluid
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          marginBottom: "0",
        }}
      >
        <Button
          onClick={handleBackToList}
          variant="subtle"
          color="blue"
          leftIcon={<ArrowLeft size={18} />}
          style={{
            position: "absolute",
            left: "50px",
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            padding: "10px",
            fontWeight: "500",
          }}
        >
          Back
        </Button>

        <Text
          id={`pms-pcc-detail-page-title ${isMobile ? "mobile-detail-page-title" : ""}`}
          style={{
            fontSize: "24px",
            fontWeight: "600",
            textAlign: "center",
            margin: "0 auto",
          }}
        >
          Application Details
        </Text>
      </div>

      {actionSuccess && (
        <Alert color="green" title="Success" mb="md">
          {actionSuccess}
        </Alert>
      )}

      {/* Action buttons at the top of the form */}
      <Card id="pms-pcc-action-buttons-card" style={{ margin: "0 50px" }}>
        <Group
          position="center"
          spacing="md"
          id="pms-pcc-action-buttons-group"
          style={{ justifyContent: "center" }}
        >
          <Button
            component="a"
            href={`${API_BASE_URL}/download/${application_id}/`}
            target="_blank"
            download={`Application-${application_id}.pdf`}
            size="md"
            variant="outline"
            color="blue"
            leftIcon={<Download size={18} />}
            id="pms-pcc-action-button"
            sx={(theme) => ({
              borderColor: theme.colors.blue[6],
              color: theme.colors.blue[6],
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: `${theme.colors.blue[6]} !important`,
                color: "white !important",
              },
            })}
          >
            Download Application
          </Button>

          <Button
            size="md"
            variant="outline"
            color="green"
            leftIcon={<ActionIcon size={18} />}
            onClick={openForwardModal}
            id="pms-pcc-action-button"
            sx={(theme) => ({
              borderColor: theme.colors.green[6],
              color: theme.colors.green[6],
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: `${theme.colors.green[6]} !important`,
                color: "white !important",
              },
            })}
          >
            Forward to Director
          </Button>

          <Button
            size="md"
            variant="outline"
            color="orange"
            leftIcon={<ActionIcon size={18} />}
            onClick={openModificationModal}
            id="pms-pcc-action-button"
            sx={(theme) => ({
              borderColor: theme.colors.orange[6],
              color: theme.colors.orange[6],
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: `${theme.colors.orange[6]} !important`,
                color: "white !important",
              },
            })}
          >
            Request Modification
          </Button>
        </Group>
      </Card>

      <div id="pms-pcc-pcc-form-content">
        <FormSection title="Application Overview" id="pms-pcc-pcc-form-section">
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
              <FormField label="Submission Date:" value={submittedDate} />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField label="Token Number:" value={token_no} />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField label="Status:" value={status} />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <FormField label="Decision Status:" value={decision_status} />
            </Grid.Col>
            <Grid.Col span={12}>
              <FormField label="Comments:" value={app_comments} />
            </Grid.Col>
          </Grid>
        </FormSection>

        <FormSection title="Key Dates">
          <div id="pms-pcc-key-dates-container">
            <div id="pms-pcc-key-dates-grid">
              <div id="pms-pcc-key-date-card">
                <div id="pms-pcc-key-date-title">Forwarded to Director</div>
                <div id="pms-pcc-key-date-value">
                  {dates?.forwarded_to_director_date
                    ? new Date(
                        dates.forwarded_to_director_date,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not yet forwarded"}
                </div>
              </div>

              <div id="pms-pcc-key-date-card">
                <div id="pms-pcc-key-date-title">Director Approval</div>
                <div id="pms-pcc-key-date-value">
                  {dates?.director_approval_date
                    ? new Date(dates.director_approval_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "Not yet approved"}
                </div>
              </div>

              <div id="pms-pcc-key-date-card">
                <div id="pms-pcc-key-date-title">Patentability Check Start</div>
                <div id="pms-pcc-key-date-value">
                  {dates?.patentability_check_start_date
                    ? new Date(
                        dates.patentability_check_start_date,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not started"}
                </div>
              </div>

              <div id="pms-pcc-key-date-card">
                <div id="pms-pcc-key-date-title">
                  Patentability Check Completed
                </div>
                <div id="pms-pcc-key-date-value">
                  {dates?.patentability_check_completed_date
                    ? new Date(
                        dates.patentability_check_completed_date,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not completed"}
                </div>
              </div>

              <div id="pms-pcc-key-date-card">
                <div id="pms-pcc-key-date-title">Search Report Generated</div>
                <div id="pms-pcc-key-date-value">
                  {dates?.search_report_generated_date
                    ? new Date(
                        dates.search_report_generated_date,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not generated"}
                </div>
              </div>

              <div id="pms-pcc-key-date-card">
                <div id="pms-pcc-key-date-title">Date of Filing</div>
                <div id="pms-pcc-key-date-value">
                  {dates?.patent_filed_date
                    ? new Date(dates.patent_filed_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "Not recorded"}
                </div>
              </div>

              <div id="pms-pcc-key-date-card">
                <div id="pms-pcc-key-date-title">Date of Publication</div>
                <div id="pms-pcc-key-date-value">
                  {dates?.patent_published_date
                    ? new Date(dates.patent_published_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "Not yet published"}
                </div>
              </div>

              <div id="pms-pcc-key-date-card">
                <div id="pms-pcc-key-date-title">Decision Date</div>
                <div id="pms-pcc-key-date-value">
                  {dates?.decision_date
                    ? new Date(dates.decision_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "No decision yet"}
                </div>
              </div>

              <div id="pms-pcc-key-date-card">
                <div id="pms-pcc-key-date-title">Final Decision Date</div>
                <div id="pms-pcc-key-date-value">
                  {dates?.final_decision_date
                    ? new Date(dates.final_decision_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "No final decision yet"}
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Section I: Administrative and Technical Details">
          <Grid>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Type of IP:"
                value={
                  Array.isArray(section_I?.type_of_ip)
                    ? section_I?.type_of_ip.join(", ")
                    : section_I?.type_of_ip
                }
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Area of the invention:"
                value={section_I?.area}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Problem in the area:"
                value={section_I?.problem}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField label="Objective:" value={section_I?.objective} />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField label="Novelty:" value={section_I?.novelty} />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField label="Advantages:" value={section_I?.advantages} />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Tested:"
                value={
                  section_I?.is_tested === true
                    ? "Yes"
                    : section_I?.is_tested === false
                      ? "No"
                      : ""
                }
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormFieldWithDownload
                label="POC Details:"
                value={section_I?.poc_details}
                fileUrl={pocFileUrl}
                fileLabel="POC File"
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Applications:"
                value={section_I?.applications}
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
            <Grid.Col span={12} md={6}>
              <FormFieldWithDownload
                label="Source Agreement:"
                value={section_II?.source_agreement}
                fileUrl={sourceAgreementFileUrl}
                fileLabel="Source Agreement"
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormField
                label="Publication Details:"
                value={section_II?.publication_details}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FormFieldWithDownload
                label="MOU Details:"
                value={section_II?.mou_details}
                fileUrl={mouFileUrl}
                fileLabel="MOU File"
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
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
              <FormFieldWithDownload
                label="Development Stage:"
                value={section_III?.development_stage}
                fileUrl={formIIIFileUrl}
                fileLabel="Form III"
              />
            </Grid.Col>
          </Grid>
        </FormSection>

        <FormSection title="Inventors">
          {applicants && applicants.length > 0 ? (
            <Grid>
              {applicants.map((applicant, index) => (
                <Grid.Col key={index} span={12} md={6}>
                  <Card
                    id="pms-pcc-applicant-card"
                    p="md"
                    radius="sm"
                    withBorder
                  >
                    <Text weight={600} size="lg" mb="xs">
                      Inventor {index + 1}
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
      </div>

      {/* Forward to Director Modal - Improved UI */}
      <Modal
        opened={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        title={
          <Text style={{ fontSize: "22px", fontWeight: 600, color: "#1a1b1e" }}>
            Forward to Director
          </Text>
        }
        size="lg"
        padding="xl"
        radius="md"
        overlayProps={{
          opacity: 0.55,
          blur: 3,
        }}
        centered
      >
        <Box sx={{ padding: "0 10px" }}>
          {actionError && (
            <Alert color="red" title="Error" mb="xl" radius="md">
              {actionError}
            </Alert>
          )}

          <Select
            label={
              <Text weight={500} mb={5}>
                Select Director <span style={{ color: "red" }}>*</span>
              </Text>
            }
            placeholder="Choose a director"
            data={directors}
            value={selectedDirectorId}
            onChange={setSelectedDirectorId}
            mb="xl"
            size="md"
            radius="md"
            required
            searchable
          />

          <Title order={5} mt="md" mb="xs">Budget Proposal</Title>
          <Grid align="flex-end" mb="xl">
            <Grid.Col span={4}>
              <NumberInput
                label="Filing Cost"
                placeholder="0.00"
                value={budgetData.filing_cost}
                onChange={(val) => setBudgetData({ ...budgetData, filing_cost: val })}
                required
                min={0}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Attorney Fees"
                placeholder="0.00"
                value={budgetData.attorney_fees}
                onChange={(val) => setBudgetData({ ...budgetData, attorney_fees: val })}
                required
                min={0}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Admin Cost"
                placeholder="0.00"
                value={budgetData.administrative_cost}
                onChange={(val) => setBudgetData({ ...budgetData, administrative_cost: val })}
                required
                min={0}
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label={
              <Text weight={500} mb={5}>
                Comments for Director <span style={{ color: "red" }}>*</span>
              </Text>
            }
            placeholder="Add detailed comments for the director about this application"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            minRows={4}
            maxRows={6}
            mb="xl"
            size="md"
            radius="md"
            error={commentError}
            required
            withAsterisk={false}
          />

          <Text size="sm" color="dimmed" mb="xl" italic>
            Please provide detailed instructions or notes for the director to
            review this application.
          </Text>

          <Group position="right" mt="xl" spacing="md">
            <Button
              variant="outline"
              size="md"
              radius="md"
              onClick={() => {
                setForwardModalOpen(false);
                setActionError(null);
                setCommentError(null);
              }}
              sx={(theme) => ({
                borderColor: theme.colors.gray[5],
                color: theme.colors.gray[7],
                "&:hover": {
                  backgroundColor: theme.colors.gray[1],
                },
              })}
            >
              Cancel
            </Button>
            <Button
              color="green"
              size="md"
              radius="md"
              onClick={handleForwardToDirector}
              loading={actionLoading}
              sx={(theme) => ({
                backgroundColor: theme.colors.green[6],
                "&:hover": {
                  backgroundColor: theme.colors.green[7],
                },
              })}
            >
              Forward to Director
            </Button>
          </Group>
        </Box>
      </Modal>

      {/* Request Modification Modal - Improved UI */}
      <Modal
        opened={modificationModalOpen}
        onClose={() => setModificationModalOpen(false)}
        title={
          <Text style={{ fontSize: "22px", fontWeight: 600, color: "#1a1b1e" }}>
            Request Modification
          </Text>
        }
        size="lg"
        padding="xl"
        radius="md"
        overlayProps={{
          opacity: 0.55,
          blur: 3,
        }}
        centered
      >
        <Box sx={{ padding: "0 10px" }}>
          {actionError && (
            <Alert color="red" title="Error" mb="xl" radius="md">
              {actionError}
            </Alert>
          )}

          <Text size="md" mb="xl" weight={500}>
            Please specify what aspects of the application need to be modified
            by the applicant.
          </Text>

          <Textarea
            label={
              <Text weight={500} mb={5}>
                Modification Comments <span style={{ color: "red" }}>*</span>
              </Text>
            }
            placeholder="Provide detailed instructions about what needs to be modified in the application"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            minRows={5}
            maxRows={8}
            mb="xl"
            size="md"
            radius="md"
            error={commentError}
            required
            withAsterisk={false}
          />

          <Text size="sm" color="dimmed" mb="xl" italic>
            Be specific about what information is incorrect, missing, or needs
            clarification. These comments will be sent directly to the
            applicant.
          </Text>

          <Group position="right" mt="xl" spacing="md">
            <Button
              variant="outline"
              size="md"
              radius="md"
              onClick={() => {
                setModificationModalOpen(false);
                setActionError(null);
                setCommentError(null);
              }}
              sx={(theme) => ({
                borderColor: theme.colors.gray[5],
                color: theme.colors.gray[7],
                "&:hover": {
                  backgroundColor: theme.colors.gray[1],
                },
              })}
            >
              Cancel
            </Button>
            <Button
              color="orange"
              size="md"
              radius="md"
              onClick={handleRequestModification}
              loading={actionLoading}
              sx={(theme) => ({
                backgroundColor: theme.colors.orange[6],
                "&:hover": {
                  backgroundColor: theme.colors.orange[7],
                },
              })}
            >
              Request Modification
            </Button>
          </Group>
        </Box>
      </Modal>
    </Container>
  );
}

ViewNewApplication.propTypes = {
  applicationId: PropTypes.string.isRequired,
  handleBackToList: PropTypes.func.isRequired,
};

export default ViewNewApplication;

import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Text,
  Box,
  Grid,
  Container,
  Stepper,
  Badge,
  Loader,
  Title,
  Divider,
  Modal,
  Textarea,
  Group,
  Alert,
  Progress,
  Tooltip,
} from "@mantine/core";
import {
  CalendarCheck,
  User,
  FileText,
  Hourglass,
  Key,
  ArrowLeft,
  DownloadSimple,
  CheckCircle,
  CircleNotch,
  ArrowRight,
  Scales,
  Handshake,
  Warning,
} from "@phosphor-icons/react";
import PropTypes from "prop-types";
import axios from "axios";
import "../../../style/Applicant/ApplicationView.css";
import { host } from "../../../../../routes/globalRoutes/index.jsx";
import EditApplicationModal from "../EditApplication/EditApplicationModal.jsx";
import { getStatusColor } from "../../../utils/statusColors.js";

// Define API_BASE_URL
const API_BASE_URL = `${host}/patentsystem`;

// Progress Bar Component
function PatentProgressBar({ currentStatus, isMobile }) {
  const allStatuses = [
    "Submitted",
    "Reviewed by PCC Admin",
    "Forwarded for Director's Review",
    "Director's Approval Received",
    "Patentability Check Started",
    "Patentability Check Completed",
    "Patentability Search Report Generated",
    "Patent Filed",
    "Patent Published",
    "Patent Granted",
    "Patent Refused",
  ];

  const getStepIndex = (status) => {
    if (status === "Rejected") return -1;
    return allStatuses.findIndex((s) => s === status);
  };

  const currentStep = getStepIndex(currentStatus);
  const isRejected = currentStatus === "Rejected";
  const isRefused = currentStatus === "Patent Refused";
  const isGranted = currentStatus === "Patent Granted";

  // Determine which statuses to display based on current status
  let displayStatuses;
  if (isRefused) {
    displayStatuses = ["Submitted", "Patent Refused"];
  } else if (isGranted) {
    // Show only the first 11 stages without "Patent Refused" for granted patents
    displayStatuses = allStatuses.slice(0, 11);
  } else {
    displayStatuses = allStatuses;
  }

  return (
    <div id={`pms-progress-container ${isRejected ? "rejected" : ""}`}>
      {isRejected && (
        <Text color="red" size="lg" weight={600} id="pms-rejection-label">
          Application Rejected
        </Text>
      )}

      {!isMobile ? (
        // Desktop view
        <div id="pms-desktop-stepper">
          {isRefused ? (
            // Simple two-step progress for refused patents
            <Stepper
              active={1}
              id="pms-workflow-stepper"
              size="md"
              color="red"
              orientation="horizontal"
              iconSize={24}
              breakpoint="sm"
            >
              <Stepper.Step
                key="Submitted"
                icon={<CheckCircle size={18} />}
                label="Stage 1"
                description="Submitted"
                id="pms-completed-step"
              />
              <Stepper.Step
                key="Patent Refused"
                icon={<CircleNotch size={18} />}
                label="Stage 2"
                description="Patent Refused"
                id="pms-completed-step"
              />
            </Stepper>
          ) : (
            // Regular view with two rows for normal flow
            <>
              <Stepper
                active={isGranted ? 4 : currentStep}
                id="pms-workflow-stepper"
                size="md"
                color={isRejected ? "red" : "blue"}
                orientation="horizontal"
                iconSize={24}
                breakpoint="sm"
              >
                {displayStatuses.slice(0, 4).map((status, index) => (
                  <Stepper.Step
                    key={status}
                    icon={
                      isGranted || index < currentStep ? (
                        <CheckCircle size={18} />
                      ) : index === currentStep ? (
                        <CircleNotch size={18} />
                      ) : (
                        <ArrowRight size={18} />
                      )
                    }
                    label={`Stage ${index + 1}`}
                    description={status}
                    id={
                      isGranted || index <= currentStep
                        ? "pms-completed-step"
                        : "pms-pending-step"
                    }
                  />
                ))}
              </Stepper>
              <Stepper
                active={isGranted ? 7 : Math.max(0, currentStep - 4)} // All steps active if granted
                id="pms-workflow-stepper second-row"
                size="md"
                color={isRejected ? "red" : "blue"}
                orientation="horizontal"
                iconSize={24}
                breakpoint="sm"
              >
                {displayStatuses.slice(4).map((status, index) => (
                  <Stepper.Step
                    key={status}
                    icon={
                      isGranted || index + 4 < currentStep ? (
                        <CheckCircle size={18} />
                      ) : index + 4 === currentStep ? (
                        <CircleNotch size={18} />
                      ) : (
                        <ArrowRight size={18} />
                      )
                    }
                    label={`Stage ${index + 5}`}
                    description={status}
                    id={
                      isGranted || index + 4 <= currentStep
                        ? "pms-completed-step"
                        : "pms-pending-step"
                    }
                  />
                ))}
              </Stepper>
            </>
          )}
        </div>
      ) : (
        // Mobile view - vertical stepper
        <Stepper
          active={
            isRefused ? 1 : isGranted ? displayStatuses.length - 1 : currentStep
          }
          id="pms-workflow-stepper mobile-view"
          size="sm"
          color={isRefused ? "red" : isRejected ? "red" : "blue"}
          orientation="vertical"
          iconSize={16}
        >
          {displayStatuses.map((status, index) => (
            <Stepper.Step
              key={status}
              icon={
                isGranted || index < (isRefused ? 1 : currentStep) ? (
                  <CheckCircle size={16} />
                ) : index === (isRefused ? 1 : currentStep) ? (
                  <CircleNotch size={16} />
                ) : (
                  <ArrowRight size={16} />
                )
              }
              label={`Stage ${index + 1}`}
              description={status}
              id={
                isGranted || index <= (isRefused ? 1 : currentStep)
                  ? "completed-step"
                  : "pending-step"
              }
            />
          ))}
        </Stepper>
      )}
    </div>
  );
}

PatentProgressBar.propTypes = {
  currentStatus: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

// Application Card Component
function ApplicationCard({
  title,
  date,
  tokenNumber,
  applicationNumber,
  status,
  onViewApplication,
}) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Not available";

  return (
    <Card id="pms-application-card" shadow="sm" p="lg" radius="md" withBorder>
      <Text id="pms-app-card-title" weight={700} size="lg" mb="md">
        {title}
      </Text>

      <div id="pms-app-card-info">
        <div id="pms-info-item">
          <CalendarCheck size={18} />
          <Text id="pms-info-text">{formattedDate}</Text>
        </div>

        <div id="pms-info-item">
          <FileText size={18} />
          <Text id="pms-info-text">Application #{applicationNumber}</Text>
        </div>

        {tokenNumber ? (
          <div id="pms-info-item">
            <Key size={18} />
            <Text id="pms-info-text">Tracking Token: {tokenNumber}</Text>
          </div>
        ) : (
          <div id="pms-info-item">
            <Hourglass size={18} />
            <Text id="pms-info-text">Token: Awaiting assignment</Text>
          </div>
        )}

        <div id="pms-card-badge-container">
          <Badge color={getStatusColor(status)} size="lg">
            {status}
          </Badge>
        </div>
      </div>

      <Button
        variant="filled"
        color="blue"
        fullWidth
        mt="md"
        onClick={() => onViewApplication(applicationNumber)}
        id="pms-view-application-button"
      >
        View Details
      </Button>
    </Card>
  );
}

ApplicationCard.propTypes = {
  title: PropTypes.string.isRequired,
  date: PropTypes.string,
  tokenNumber: PropTypes.string,
  applicationNumber: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  onViewApplication: PropTypes.func.isRequired,
};

function ConditionalFileDownload({ filePath, label, value }) {
  const encodedFilePath = filePath ? encodeURI(filePath) : null;
  const fileUrl = encodedFilePath ? `${API_BASE_URL}${encodedFilePath}` : null;

  return (
    <div id="pms-form-field-with-download">
      <div id="pms-field-label-container">
        <Text id="pms-field-label">{label}</Text>
        <Text id="pms-field-value">{value || "Not provided"}</Text>
      </div>
      {fileUrl ? (
        <div id="pms-download-button-wrapper">
          <Button
            component="a"
            href={fileUrl}
            download
            variant="outline"
            color="blue"
            leftIcon={<DownloadSimple size={18} />}
          >
            Download {label.replace(":", "")}
          </Button>
        </div>
      ) : (
        <Text color="red" size="sm">
          Not submitted
        </Text>
      )}
    </div>
  );
}

ConditionalFileDownload.propTypes = {
  filePath: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

// File Download Button Component
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
      download
      variant="outline"
      color="blue"
      leftIcon={<DownloadSimple size={18} />}
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

function FormField({ label, value }) {
  const isMobile = window.innerWidth <= 768;

  return (
    <div
      className={`pms-form-field-label-and-value ${isMobile ? "pms-mobile-form-field" : ""}`}
      style={{ padding: "10px" }}
    >
      <Text
        className={`pms-form-field-label ${isMobile ? "pms-mobile-field-label" : ""}`}
      >
        {label}
      </Text>
      <Text
        className={`pms-form-field-value ${isMobile ? "pms-mobile-field-value" : ""}`}
      >
        {value?.trim() ? value : "Not provided"}
      </Text>
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Field with download button - moved outside of the render function
function FormFieldWithDownload({ label, value, fileUrl, fileLabel }) {
  // Extract just the filename from the path for display
  const displayValue = value && typeof value === "string" && value.includes("/")
    ? value.split("/").pop()
    : value;

  return (
    <div className="pms-form-field-with-download">
      <div className="pms-form-field-label-and-value">
        <Text className="pms-form-field-label">{label}</Text>
        <Text className="pms-form-field-value">{displayValue || "Not provided"}</Text>
      </div>
      <div id="pms-download-button-wrapper">
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

// Section component for detail view - moved outside of the render function
function FormSection({ title, children }) {
  return (
    <Card
      id={`pms-detail-section ${
        window.innerWidth <= 768 ? "mobile-form-section" : ""
      }`}
      radius="md"
      withBorder
      mb="md"
      p={40}
      style={{
        borderRadius: "20px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Title className="pms-form-section-title" style={{ marginLeft: "-10px" }}>
        {title}
      </Title>
      {children}
    </Card>
  );
}

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// Main Application View Component
function ApplicationView({ setActiveTab }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [isMobile, setIsMobile] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Feature 1: Appeal state
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealReason, setAppealReason] = useState("");

  // Feature 2: Consent state
  const [consentStatus, setConsentStatus] = useState(null);
  const [consentLoading, setConsentLoading] = useState(false);

  // Edit application modal state
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Retrieve authToken from local storage
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!authToken) {
        setError("Authorization token is missing. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          `${API_BASE_URL}/applicant/applications/`,
          {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          },
        );

        if (
          response.data &&
          response.data.applications &&
          Array.isArray(response.data.applications)
        ) {
          const formattedApplications = response.data.applications.map(
            (application) => ({
              title: application.title || "Untitled Application",
              date: application.submitted_date || "",
              tokenNumber: application.token_no || null,
              applicationNumber: application.application_id,
              status: application.status || "Pending",
            }),
          );

          setApplications(formattedApplications);
        } else {
          setError("No applications found or invalid response format");
        }
      } catch (err) {
        console.error("Error fetching application data:", err);
        setError("Failed to load application data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [authToken]);

  const handleViewApplication = async (applicationNumber) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/applicant/applications/details/${applicationNumber}`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );

      if (response.data) {
        setSelectedApplication(response.data);
        setViewMode("detail");
        localStorage.setItem("selectedApplicationId", applicationNumber);
      }
    } catch (err) {
      console.error("Error fetching application details:", err);
      setError("Failed to load application details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedApplication(null);
    setActionMessage(null);
  };

  const handleResubmit = async () => {
    if (!selectedApplication) return;

    // CRITICAL VALIDATION: Check consent status before allowing resubmission
    if (consentStatus) {
      if (!consentStatus.shares_valid) {
        setActionMessage({
          type: "error",
          text: "Cannot resubmit: Inventor percentage shares must sum to exactly 100% before resubmission."
        });
        return;
      }

      if (!consentStatus.all_consented) {
        setActionMessage({
          type: "error",
          text: "Cannot resubmit: All inventors must give their consent before resubmission."
        });
        return;
      }
    }

    try {
      setActionLoading(true);
      await axios.post(
        `${API_BASE_URL}/applicant/applications/resubmit/${selectedApplication.application_id}/`,
        {},
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      setActionMessage({ type: "success", text: "Application resubmitted successfully!" });
      // Refresh the detail
      const response = await axios.get(
        `${API_BASE_URL}/applicant/applications/details/${selectedApplication.application_id}`,
        { headers: { Authorization: `Token ${authToken}` } },
      );
      if (response.data) setSelectedApplication(response.data);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to resubmit application.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSuccess = async () => {
    // Refresh the application data after successful edit
    try {
      const response = await axios.get(
        `${API_BASE_URL}/applicant/applications/details/${selectedApplication.application_id}`,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      if (response.data) {
        setSelectedApplication(response.data);
        setActionMessage({
          type: "success",
          text: "Application updated and resubmitted successfully!"
        });
      }
    } catch (err) {
      console.error("Error refreshing application data:", err);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedApplication || !withdrawReason.trim()) return;
    try {
      setActionLoading(true);
      await axios.post(
        `${API_BASE_URL}/applicant/applications/withdraw/${selectedApplication.application_id}/`,
        { reason: withdrawReason },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      setWithdrawModalOpen(false);
      setWithdrawReason("");
      setActionMessage({ type: "success", text: "Application withdrawn successfully." });
      // Refresh the detail
      const response = await axios.get(
        `${API_BASE_URL}/applicant/applications/details/${selectedApplication.application_id}`,
        { headers: { Authorization: `Token ${authToken}` } },
      );
      if (response.data) setSelectedApplication(response.data);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to withdraw application.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Feature 1: Handle appeal submission
  const handleAppeal = async () => {
    if (!selectedApplication || !appealReason.trim()) return;
    try {
      setActionLoading(true);
      await axios.post(
        `${API_BASE_URL}/applicant/applications/${selectedApplication.application_id}/appeal/`,
        { reason: appealReason },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      setAppealModalOpen(false);
      setAppealReason("");
      setActionMessage({ type: "success", text: "Appeal lodged successfully. You will be notified of the decision." });
      // Refresh the detail
      const response = await axios.get(
        `${API_BASE_URL}/applicant/applications/details/${selectedApplication.application_id}`,
        { headers: { Authorization: `Token ${authToken}` } },
      );
      if (response.data) setSelectedApplication(response.data);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to lodge appeal. Make sure your reason is at least 50 characters.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Feature 2: Fetch consent status
  const fetchConsentStatus = async (applicationId) => {
    try {
      setConsentLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/applicant/applications/${applicationId}/consent/status/`,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      setConsentStatus(response.data);
    } catch (err) {
      console.error("Error fetching consent status:", err);
    } finally {
      setConsentLoading(false);
    }
  };

  // Feature 2: Handle giving consent
  const handleGiveConsent = async () => {
    if (!selectedApplication) return;
    try {
      setConsentLoading(true);
      await axios.post(
        `${API_BASE_URL}/applicant/applications/${selectedApplication.application_id}/consent/`,
        {},
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      setActionMessage({ type: "success", text: "Consent given successfully." });
      // Refresh consent status
      await fetchConsentStatus(selectedApplication.application_id);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to give consent.",
      });
    } finally {
      setConsentLoading(false);
    }
  };

  // Fetch consent status when viewing application details
  useEffect(() => {
    if (selectedApplication && viewMode === "detail") {
      fetchConsentStatus(selectedApplication.application_id);
    }
  }, [selectedApplication, viewMode]);

  // Render application list view with improved loading and error states
  const renderApplicationList = () => (
    // Replace the Grid component with this structure:
    <Box id="pms-applications-container">
      <Text id="pms-view-app-page-title">Your Patent Applications</Text>

      {loading ? (
        <div id="pms-loader-container">
          <Loader size="lg" color="blue" />
          <Text mt="md">Loading your applications...</Text>
        </div>
      ) : error ? (
        <Card id="pms-empty-state-card" p="xl" radius="md" withBorder>
          <Text style={{ fontSize: "22px", fontWeight: 500 }}>
            Unable to Load Applications
          </Text>
          <Divider
            w="100%"
            style={{ margin: "0 0", border: "0.5px solid rgb(215, 215, 215)" }}
          />
          <Text size="sm" color="dimmed" mt="sm">
            We encountered an issue while loading your applications. Please try
            again.
          </Text>
          <Button
            mt="lg"
            color="blue"
            onClick={() => window.location.reload()}
            fullWidth
          >
            Try Again
          </Button>
        </Card>
      ) : applications.length === 0 ? (
        <Card id="pms-empty-state-card" p="xl" radius="md" withBorder>
          <Text size="lg" align="center" weight={500}>
            No Applications Found
          </Text>
          <Text size="sm" color="dimmed" align="center" mt="sm">
            You haven't submitted any patent applications yet.
          </Text>
          <Button
            mt="lg"
            color="blue"
            onClick={() => setActiveTab("newApplication")}
            fullWidth
          >
            Start New Application
          </Button>
        </Card>
      ) : (
        <div id="pms-view-applications-grid">
          {applications.map((app, index) => (
            <ApplicationCard
              key={index}
              title={app.title}
              date={app.date}
              tokenNumber={app.tokenNumber}
              applicationNumber={app.applicationNumber}
              status={app.status}
              onViewApplication={handleViewApplication}
            />
          ))}
        </div>
      )}
    </Box>
  );

  // Render application detail view with enhanced UI
  const renderApplicationDetail = () => {
    if (!selectedApplication) return null;

    const {
      application_id,
      title,
      token_no,
      status,
      decision_status,
      comments,
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
    const pocFileUrl = section_I?.poc_details
      ? `${host}${section_I.poc_details}`
      : null;
    const sourceAgreementFileUrl = section_II?.source_agreement
      ? `${host}${section_II.source_agreement}`
      : null;
    const mouFileUrl = section_II?.mou_file
      ? `${host}${section_II.mou_file}`
      : null;
    const firstSectionIII = Array.isArray(section_III) ? section_III[0] : section_III;
    const formIIIFileUrl = firstSectionIII?.form_iii
      ? `${host}${firstSectionIII.form_iii}`
      : null;

    return (
      <Container
        id={`pms-detail-container ${
          isMobile ? "pms-mobile-form-container" : ""
        }`}
        size="100%"
        style={{ maxWidth: "100%", padding: "2rem" }}
      >
        <div id="pms-application-view-detail-header">
          <Button
            onClick={handleBackToList}
            leftIcon={<ArrowLeft size={18} />}
            id="pms-application-view-back-button"
          >
            Back
          </Button>
          <Text id="pms-application-view-page-title">
            Application ID : {application_id}
          </Text>
          <Button
            component="a"
            href={`${API_BASE_URL}/download/${application_id}/`}
            target="_blank"
            download={`Application-${application_id}.pdf`}
            id="pms-application-view-download-button"
            rightIcon={<DownloadSimple size={18} />}
          >
            Download
          </Button>
        </div>

        <div>
          {/* Show alert when modification is requested */}
          {status === "Draft" && decision_status === "Needs Revision" && comments && (
            <Alert
              icon={<Hourglass size={24} />}
              title="Modification Requested"
              color="orange"
              radius="md"
              mb="lg"
              style={{ 
                backgroundColor: "#fff4e6",
                borderLeft: "4px solid #ff922b"
              }}
            >
              <Text weight={600} size="md" mb="sm">
                The PCC Admin has requested modifications to your application.
              </Text>
              <Text weight={600} mb="xs">PCC Admin Comments:</Text>
              <Text
                style={{
                  backgroundColor: "#ffe8cc",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ffd8a8",
                  whiteSpace: "pre-wrap"
                }}
              >
                {comments}
              </Text>
              <Text mt="md" color="dimmed" size="sm">
                Please make the necessary changes and resubmit your application.
              </Text>
            </Alert>
          )}

          <FormSection
            title="Application Overview"
            id="pms-application-view-form-section"
          >
            <Grid>
              <Grid.Col span={12} md={4} className="pms-form-field-container">
                <FormField label="Title of Application:" value={title} />
              </Grid.Col>

              <Grid.Col span={12} md={4} className="pms-form-field-container">
                <FormField label="Submission Date:" value={submittedDate} />
              </Grid.Col>
              <Grid.Col span={12} md={4} className="pms-form-field-container">
                <FormField label="Token Number:" value={token_no} />
              </Grid.Col>
              <Grid.Col span={12} md={4} className="pms-form-field-container">
                <FormField label="Status:" value={status} />
              </Grid.Col>
              <Grid.Col span={12} md={4} className="pms-form-field-container">
                <FormField label="Decision Status:" value={decision_status} />
              </Grid.Col>
              <Grid.Col span={12} className="pms-form-field-container">
                <FormField label="Comments:" value={comments} />
              </Grid.Col>
            </Grid>
          </FormSection>

          <FormSection title="Key Dates">
            <div id="pms-key-dates-container">
              <div id="pms-key-dates-grid">
                {/* <div id="pms-key-date-card">
                <div id="pms-key-date-title">Reviewed by PCC</div>
                <div id="pms-key-date-value">
                  {dates?.reviewed_by_pcc_date
                    ? new Date(dates.reviewed_by_pcc_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "Not yet reviewed"}
                </div>
              </div> */}

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Forwarded to Director</div>
                  <div id="pms-key-date-value">
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

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Director Approval</div>
                  <div id="pms-key-date-value">
                    {dates?.director_approval_date
                      ? new Date(
                          dates.director_approval_date,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not yet approved"}
                  </div>
                </div>

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Patentability Check Start</div>
                  <div id="pms-key-date-value">
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

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">
                    Patentability Check Completed
                  </div>
                  <div id="pms-key-date-value">
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

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Search Report Generated</div>
                  <div id="pms-key-date-value">
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

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Date of Filing</div>
                  <div id="pms-key-date-value">
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

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Date of Publication</div>
                  <div id="pms-key-date-value">
                    {dates?.patent_published_date
                      ? new Date(
                          dates.patent_published_date,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not yet published"}
                  </div>
                </div>

                {/* <div id="pms-key-date-card">
                <div id="pms-key-date-title">Decision Date</div>
                <div id="pms-key-date-value">
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
              </div> */}

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title"> Date of Granting</div>
                  <div id="pms-key-date-value">
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
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Area of the invention:"
                  value={section_I?.area}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Problem in the area:"
                  value={section_I?.problem}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Objective of your invention:"
                  value={section_I?.objective}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField label="Novelty:" value={section_I?.novelty} />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField label="Advantages:" value={section_I?.advantages} />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
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
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormFieldWithDownload
                  label="POC Details:"
                  value={section_I?.poc_details}
                  fileUrl={pocFileUrl}
                  fileLabel="POC File"
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Applications:"
                  value={section_I?.applications}
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          <FormSection title="Section II: IPR Ownership">
            <Grid>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Funding Details:"
                  value={section_II?.funding_details}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Funding Source:"
                  value={section_II?.funding_source}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormFieldWithDownload
                  label="Source Agreement:"
                  value={section_II?.source_agreement}
                  fileUrl={sourceAgreementFileUrl}
                  fileLabel="Source Agreement"
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Publication Details:"
                  value={section_II?.publication_details}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormFieldWithDownload
                  label="MOU Details:"
                  value={section_II?.mou_details}
                  fileUrl={mouFileUrl}
                  fileLabel="MOU File"
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Research Details:"
                  value={section_II?.research_details}
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          <FormSection title="Section III: Commercialization">
            <Grid>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Company Name:"
                  value={section_III?.company_name}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Contact Person:"
                  value={section_III?.contact_person}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Contact Number:"
                  value={section_III?.contact_no}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormFieldWithDownload
                  label="Development Stage:"
                  value={section_III?.development_stage}
                  fileUrl={formIIIFileUrl}
                  fileLabel="Form III"
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          <FormSection title="Inventor">
            {applicants && applicants.length > 0 ? (
              <div id="pms-inventors-container">
                {applicants.map((applicant, index) => (
                  <Card
                    key={index}
                    id="pms-inventor-card"
                    p="md"
                    radius="sm"
                    withBorder
                  >
                    <Text weight={600} size="lg" mb="xs" align="center">
                      Inventor {index + 1}
                    </Text>
                    <div id="pms-inventor-details">
                      <FormField
                        className="pms-form-field-container"
                        label="Name:"
                        value={applicant.name}
                      />
                      <FormField
                        className="pms-form-field-container"
                        label="Email:"
                        value={applicant.email}
                      />
                      <FormField
                        className="pms-form-field-container"
                        label="Mobile:"
                        value={applicant.mobile}
                      />
                      <FormField
                        className="pms-form-field-container"
                        label="Address:"
                        value={applicant.address}
                      />
                      <FormField
                        label="Share Percentage:"
                        value={
                          applicant.percentage_share
                            ? `${applicant.percentage_share}%`
                            : ""
                        }
                      />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Text color="dimmed">No inventor information available</Text>
            )}
          </FormSection>

          <FormSection title="Application Progress">
            <PatentProgressBar currentStatus={status} isMobile={isMobile} />
          </FormSection>

          {/* Resubmit / Withdraw Actions */}
          {actionMessage && (
            <Alert
              color={actionMessage.type === "success" ? "green" : "red"}
              title={actionMessage.type === "success" ? "Success" : "Error"}
              mb="md"
              withCloseButton
              onClose={() => setActionMessage(null)}
            >
              {actionMessage.text}
            </Alert>
          )}

          {(status === "Rejected" ||
            status === "Needs Revision" ||
            status === "Draft") && (
            <Card p="lg" radius="md" withBorder mb="md">
              <Text weight={600} size="lg" mb="sm">
                Resubmit Application
              </Text>
              <Text size="sm" color="dimmed" mb="md">
                You can resubmit this application within 60 days of rejection.
                Make necessary changes before resubmitting.
                {consentStatus && (!consentStatus.shares_valid || !consentStatus.all_consented) && (
                  <Text color="red" size="sm" mt="xs">
                    ⚠️ Requirements: All inventors must consent AND percentage shares must total 100%
                  </Text>
                )}
              </Text>
              <Group>
                <Button
                  color="blue"
                  onClick={() => setEditModalOpen(true)}
                  leftSection={<ArrowRight size={16} />}
                >
                  Edit & Resubmit
                </Button>
                <Button
                  variant="light"
                  color="blue"
                  onClick={handleResubmit}
                  loading={actionLoading}
                  disabled={consentStatus && (!consentStatus.shares_valid || !consentStatus.all_consented)}
                >
                  Quick Resubmit
                </Button>
              </Group>
            </Card>
          )}

          {/* Feature 1: Appeal Section for Rejected Applications */}
          {status === "Rejected" && (
            <Card p="lg" radius="md" withBorder mb="md" style={{ borderLeft: "4px solid #805ad5" }}>
              <Group position="apart" mb="sm">
                <Text weight={600} size="lg">
                  <Scales size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                  Lodge Formal Appeal
                </Text>
                <Badge color="violet">Available within 60 days</Badge>
              </Group>
              <Text size="sm" color="dimmed" mb="md">
                If you believe the rejection decision was incorrect, you can lodge a formal appeal.
                Your appeal will be reviewed by the Director. Please provide a detailed reason
                (minimum 50 characters) explaining why you believe the decision should be reconsidered.
              </Text>
              <Button
                color="violet"
                leftSection={<Scales size={18} />}
                onClick={() => setAppealModalOpen(true)}
              >
                Lodge Appeal
              </Button>
            </Card>
          )}

          {/* Feature 1: Appeal Status Display */}
          {(status === "Appeal" || status === "Appeal Under Review" ||
            status === "Appeal Approved" || status === "Appeal Rejected") && (
            <Card p="lg" radius="md" withBorder mb="md" style={{
              borderLeft: `4px solid ${status === "Appeal Approved" ? "#38a169" : status === "Appeal Rejected" ? "#e53e3e" : "#805ad5"}`
            }}>
              <Text weight={600} size="lg" mb="sm">
                Appeal Status
              </Text>
              <Badge
                color={status === "Appeal Approved" ? "green" : status === "Appeal Rejected" ? "red" : "violet"}
                size="lg"
                mb="md"
              >
                {status}
              </Badge>
              {selectedApplication.appeal_reason && (
                <Box mt="md">
                  <Text weight={500} mb="xs">Your Appeal Reason:</Text>
                  <Text size="sm" style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "8px" }}>
                    {selectedApplication.appeal_reason}
                  </Text>
                </Box>
              )}
            </Card>
          )}

          {/* Feature 2: Consent Status Section */}
          {consentStatus && (
            <Card p="lg" radius="md" withBorder mb="md" style={{ borderLeft: "4px solid #319795" }}>
              <Group position="apart" mb="sm">
                <Text weight={600} size="lg">
                  <Handshake size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                  Inventor Consent Status
                </Text>
                {consentStatus.all_consented ? (
                  <Badge color="green" size="lg">All Consents Received</Badge>
                ) : (
                  <Badge color="orange" size="lg">Pending Consents</Badge>
                )}
              </Group>

              <Grid mb="md">
                <Grid.Col span={6}>
                  <Text size="sm" color="dimmed">Total Share Allocation</Text>
                  <Progress
                    value={parseFloat(consentStatus.total_share)}
                    color={consentStatus.shares_valid ? "green" : "red"}
                    size="lg"
                    mb="xs"
                  />
                  <Text size="sm" weight={500}>
                    {consentStatus.total_share}%
                    {!consentStatus.shares_valid && (
                      <Text component="span" color="red" ml="xs">
                        (Must equal 100%)
                      </Text>
                    )}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" color="dimmed">Consent Progress</Text>
                  <Progress
                    value={(consentStatus.inventors.filter(i => i.has_consent).length / consentStatus.inventors.length) * 100}
                    color="teal"
                    size="lg"
                    mb="xs"
                  />
                  <Text size="sm" weight={500}>
                    {consentStatus.inventors.filter(i => i.has_consent).length} / {consentStatus.inventors.length} inventors
                  </Text>
                </Grid.Col>
              </Grid>

              <Divider mb="md" />

              <Text weight={500} mb="sm">Inventors:</Text>
              {consentStatus.inventors.map((inventor, index) => (
                <Box key={index} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  backgroundColor: inventor.has_consent ? "#e6fffa" : "#fff5f5",
                  borderRadius: "8px",
                  marginBottom: "8px"
                }}>
                  <Box>
                    <Text weight={500}>{inventor.name}</Text>
                    <Text size="sm" color="dimmed">{inventor.email} • {inventor.percentage_share}%</Text>
                  </Box>
                  <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {inventor.has_consent ? (
                      <Tooltip label={`Consented on ${new Date(inventor.consent_date).toLocaleDateString()}`}>
                        <Badge color="green" leftSection={<CheckCircle size={14} />}>
                          Consented
                        </Badge>
                      </Tooltip>
                    ) : (
                      <Badge color="orange" leftSection={<Warning size={14} />}>
                        Pending
                      </Badge>
                    )}
                  </Box>
                </Box>
              ))}

              {/* Show Give Consent button if current user is an inventor who hasn't consented */}
              {consentStatus.inventors.some(i => !i.has_consent) && (
                <Box mt="md">
                  <Button
                    color="teal"
                    leftSection={<Handshake size={18} />}
                    onClick={handleGiveConsent}
                    loading={consentLoading}
                  >
                    Give My Consent
                  </Button>
                </Box>
              )}
            </Card>
          )}

          {status !== "Withdrawn" &&
            status !== "Patent Granted" &&
            status !== "Patent Refused" && (
              <Card p="lg" radius="md" withBorder mb="md">
                <Text weight={600} size="lg" mb="sm">
                  Withdraw Application
                </Text>
                <Text size="sm" color="dimmed" mb="md">
                  If you wish to withdraw this application, please provide a
                  reason. This action cannot be undone.
                </Text>
                <Button
                  color="red"
                  variant="outline"
                  onClick={() => setWithdrawModalOpen(true)}
                >
                  Withdraw Application
                </Button>
              </Card>
            )}

          {/* Withdraw Modal */}
          <Modal
            opened={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            title="Withdraw Application"
            centered
            size="md"
          >
            <Textarea
              label="Reason for Withdrawal"
              placeholder="Please explain why you want to withdraw this application"
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              required
              minRows={3}
              mb="md"
            />
            <Group position="right">
              <Button
                variant="outline"
                onClick={() => setWithdrawModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={handleWithdraw}
                loading={actionLoading}
                disabled={!withdrawReason.trim()}
              >
                Confirm Withdrawal
              </Button>
            </Group>
          </Modal>

          {/* Feature 1: Appeal Modal */}
          <Modal
            opened={appealModalOpen}
            onClose={() => setAppealModalOpen(false)}
            title="Lodge Formal Appeal"
            centered
            size="lg"
          >
            <Text size="sm" color="dimmed" mb="md">
              Please provide a detailed explanation for your appeal. Explain why you believe the
              rejection decision was incorrect and should be reconsidered by the Director.
            </Text>
            <Textarea
              label="Appeal Reason"
              placeholder="Enter your detailed appeal reason (minimum 50 characters)..."
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              required
              minRows={4}
              mb="md"
              error={appealReason.length > 0 && appealReason.length < 50 ? "Appeal reason must be at least 50 characters" : null}
            />
            <Text size="xs" color="dimmed" mb="md">
              Character count: {appealReason.length}/50 minimum
            </Text>
            <Group position="right">
              <Button
                variant="outline"
                onClick={() => {
                  setAppealModalOpen(false);
                  setAppealReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                color="violet"
                leftSection={<Scales size={18} />}
                onClick={handleAppeal}
                loading={actionLoading}
                disabled={appealReason.length < 50}
              >
                Submit Appeal
              </Button>
            </Group>
          </Modal>

          {/* Edit Application Modal */}
          <EditApplicationModal
            opened={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            application={selectedApplication}
            onSuccess={handleEditSuccess}
          />
        </div>
      </Container>
    );
  };

  return (
    <Box id="pms-application-view-container">
      {viewMode === "list"
        ? renderApplicationList()
        : renderApplicationDetail()}
    </Box>
  );
}

ApplicationView.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

export default ApplicationView;

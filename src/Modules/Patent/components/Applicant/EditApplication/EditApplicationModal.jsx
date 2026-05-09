import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Text,
  Stepper,
  Card,
  Grid,
  FileInput,
  NumberInput,
  Alert,
  Divider,
  Box,
  ActionIcon,
  Table,
  Badge,
} from "@mantine/core";
import {
  FileText,
  Plus,
  Trash,
  Upload,
  CheckCircle,
  Warning
} from "@phosphor-icons/react";
import axios from "axios";
import { host } from "../../../../../routes/globalRoutes/index.jsx";

const API_BASE_URL = `${host}/patentsystem`;

const EditApplicationModal = ({
  opened,
  onClose,
  application,
  onSuccess
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    area_of_invention: "",
    problem_statement: "",
    objective: "",
    ip_type: "",
    novelty: "",
    advantages: "",
    tested_experimentally: false,
    applications: "",
    funding_details: "",
    funding_source: "",
    publication_details: "",
    mou_details: "",
    research_details: "",
    development_stage: "",
    company_details: [],
    inventors: [],
    comments: ""
  });

  const [files, setFiles] = useState({
    poc_details: null,
    source_file: null,
    mou_file: null,
    form_iii: null
  });

  const authToken = localStorage.getItem("authToken");

  // Pre-populate form data when application changes
  useEffect(() => {
    if (application && opened) {
      console.log("Populating edit form with existing application data:", application);

      setFormData({
        // Preserve ALL existing data fields
        title: application.title || "",
        area_of_invention: application.section_i?.area || "",
        problem_statement: application.section_i?.problem || "",
        objective: application.section_i?.objective || "",
        ip_type: application.section_i?.type_of_ip || "",
        novelty: application.section_i?.novelty || "",
        advantages: application.section_i?.advantages || "",
        tested_experimentally: application.section_i?.is_tested || false,
        applications: application.section_i?.applications || "",

        // Section II - Preserve all funding data
        funding_details: application.section_ii?.funding_details || "",
        funding_source: application.section_ii?.funding_source || "",
        publication_details: application.section_ii?.publication_details || "",
        mou_details: application.section_ii?.mou_details || "",
        research_details: application.section_ii?.research_details || "",

        // Section III - Preserve company details and development stage
        development_stage: application.section_iii?.[0]?.development_stage ||
                          application.company_details?.[0]?.development_stage || "",
        company_details: application.section_iii?.length > 0
          ? application.section_iii
          : application.company_details || [],

        // Preserve inventor data with all fields
        inventors: (application.inventors || []).map(inventor => ({
          name: inventor.name || "",
          email: inventor.email || inventor.institute_mail || inventor.personal_mail || "",
          institute_mail: inventor.institute_mail || inventor.email || "",
          personal_mail: inventor.personal_mail || inventor.email || "",
          mobile: inventor.mobile || "",
          address: inventor.address || "",
          percentage_share: inventor.percentage_share || 0,
          has_consent: inventor.has_consent || false,
          consent_date: inventor.consent_date || null
        })),

        // Additional fields that might exist
        token_no: application.token_no || application.token_number || "",
        status: application.status || "",
        decision_status: application.decision_status || "",
        submitted_date: application.submitted_date || "",

        // Comments for this resubmission
        comments: ""
      });

      // Reset form state
      setActiveStep(0);
      setErrorMessage("");
      setSuccessMessage("");

      // Reset file uploads (user can choose new files if needed)
      setFiles({
        poc_details: null,
        source_file: null,
        mou_file: null,
        form_iii: null
      });
    }
  }, [application, opened]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCompany = () => {
    setFormData(prev => ({
      ...prev,
      company_details: [...prev.company_details, {
        company_name: "",
        contact_person: "",
        contact_no: ""
      }]
    }));
  };

  const removeCompany = (index) => {
    setFormData(prev => ({
      ...prev,
      company_details: prev.company_details.filter((_, i) => i !== index)
    }));
  };

  const updateCompany = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      company_details: prev.company_details.map((company, i) =>
        i === index ? { ...company, [field]: value } : company
      )
    }));
  };

  const updateInventor = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      inventors: prev.inventors.map((inventor, i) =>
        i === index ? { ...inventor, [field]: value } : inventor
      )
    }));
  };

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0: // Basic Information
        if (!formData.title?.trim()) {
          setErrorMessage("Title is required");
          return false;
        }
        if (!formData.area_of_invention?.trim()) {
          setErrorMessage("Area of invention is required");
          return false;
        }
        if (!formData.ip_type) {
          setErrorMessage("IP Type is required");
          return false;
        }
        break;
      case 1: // Technical Details
        if (!formData.problem_statement?.trim() || formData.problem_statement.length < 50) {
          setErrorMessage("Problem statement must be at least 50 characters");
          return false;
        }
        if (!formData.objective?.trim() || formData.objective.length < 30) {
          setErrorMessage("Objective must be at least 30 characters");
          return false;
        }
        break;
      case 2: // Funding & Research
        if (!formData.funding_details?.trim()) {
          setErrorMessage("Funding details are required");
          return false;
        }
        break;
      case 3: // Inventors validation
        const totalPercentage = formData.inventors.reduce((sum, inv) => sum + (parseFloat(inv.percentage_share) || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          setErrorMessage(`Inventor percentages must sum to 100%. Current total: ${totalPercentage}%`);
          return false;
        }
        break;
    }
    setErrorMessage("");
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setActiveStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);
      setErrorMessage("");

      // Prepare comprehensive data for submission - PRESERVE ALL EXISTING DATA
      const submitData = new FormData();

      // Create comprehensive data object ensuring NO data loss
      const comprehensiveData = {
        // Core application data
        title: formData.title || application.title || "",

        // Section I - Technical details (preserve all existing fields)
        area_of_invention: formData.area_of_invention || application.section_i?.area || "",
        problem_statement: formData.problem_statement || application.section_i?.problem || "",
        objective: formData.objective || application.section_i?.objective || "",
        ip_type: formData.ip_type || application.section_i?.type_of_ip || "",
        novelty: formData.novelty || application.section_i?.novelty || "",
        advantages: formData.advantages || application.section_i?.advantages || "",
        tested_experimentally: formData.tested_experimentally !== undefined
          ? formData.tested_experimentally
          : application.section_i?.is_tested || false,
        applications: formData.applications || application.section_i?.applications || "",

        // Section II - Funding & Research (preserve all existing fields)
        funding_details: formData.funding_details || application.section_ii?.funding_details || "",
        funding_source: formData.funding_source || application.section_ii?.funding_source || "",
        publication_details: formData.publication_details || application.section_ii?.publication_details || "",
        mou_details: formData.mou_details || application.section_ii?.mou_details || "",
        research_details: formData.research_details || application.section_ii?.research_details || "",

        // Section III - Company details (preserve existing structure)
        development_stage: formData.development_stage ||
                          application.section_iii?.[0]?.development_stage ||
                          application.company_details?.[0]?.development_stage || "",
        company_details: formData.company_details?.length > 0
          ? formData.company_details
          : application.section_iii?.length > 0
            ? application.section_iii
            : application.company_details?.length > 0
              ? application.company_details
              : [{
                  company_name: "Default Company",
                  contact_person: "Default Contact",
                  contact_no: "0000000000"
                }],

        // Inventor data (preserve existing inventor information)
        inventors: formData.inventors?.length > 0
          ? formData.inventors.map(inv => ({
              name: inv.name || "",
              institute_mail: inv.institute_mail || inv.email || "",
              personal_mail: inv.personal_mail || inv.email || "",
              mobile: inv.mobile || "",
              address: inv.address || "",
              percentage: inv.percentage_share || 0
            }))
          : (application.inventors || []).map(inv => ({
              name: inv.name || "",
              institute_mail: inv.institute_mail || inv.email || "",
              personal_mail: inv.personal_mail || inv.email || "",
              mobile: inv.mobile || "",
              address: inv.address || "",
              percentage: inv.percentage_share || 0
            })),

        // Comments for this resubmission
        comments: formData.comments || "Application updated via edit interface"
      };

      console.log("Submitting comprehensive resubmission data:", comprehensiveData);

      // Add JSON data
      submitData.append("json_data", JSON.stringify(comprehensiveData));

      // Add files (only if new files were uploaded)
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      const response = await axios.post(
        `${API_BASE_URL}/applicant/applications/resubmit/${application.application_id}/`,
        submitData,
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccessMessage("Application updated and resubmitted successfully!");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Resubmission error:", error);
      setErrorMessage(
        error.response?.data?.error ||
        "Failed to resubmit application. Please check all fields and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const ipTypes = [
    "Patent", "Copyright", "Trademark",
    "Industrial Design", "Trade Secret", "Geographical Indication"
  ];

  const developmentStages = [
    "Embryonic", "Partially developed", "Off-the-shelf"
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title="Edit Application for Resubmission"
      closeOnClickOutside={false}
    >
      <Box>
        {errorMessage && (
          <Alert color="red" title="Error" mb="md">
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert color="green" title="Success" mb="md" icon={<CheckCircle size={16} />}>
            {successMessage}
          </Alert>
        )}

        <Stepper active={activeStep} mb="xl">
          <Stepper.Step label="Basic Info" description="Title, area, IP type" />
          <Stepper.Step label="Technical" description="Problem, objective, novelty" />
          <Stepper.Step label="Research" description="Funding, publications" />
          <Stepper.Step label="Inventors" description="Review inventor details" />
          <Stepper.Step label="Review" description="Final review & submit" />
        </Stepper>

        {/* Data preservation info */}
        <Alert color="blue" title="Data Preservation" mb="md" icon={<CheckCircle size={16} />}>
          All your existing application data has been automatically loaded. You only need to modify the fields you want to change -
          everything else will be preserved exactly as it was.
        </Alert>

        {/* Step 0: Basic Information */}
        {activeStep === 0 && (
          <Card p="md">
            <Text weight={500} mb="md">Basic Information</Text>

            <TextInput
              label="Application Title"
              description="Current title loaded from your original application"
              placeholder="Enter application title"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              required
              mb="md"
            />

            <TextInput
              label="Area of Invention"
              description="Current area loaded from your original application"
              placeholder="e.g., Computer Science, Biotechnology"
              value={formData.area_of_invention}
              onChange={(e) => updateFormData("area_of_invention", e.target.value)}
              required
              mb="md"
            />

            <Select
              label="IP Type"
              placeholder="Select IP type"
              data={ipTypes}
              value={formData.ip_type}
              onChange={(value) => updateFormData("ip_type", value)}
              required
              mb="md"
            />

            <Textarea
              label="Novelty"
              placeholder="Describe the novel aspects"
              value={formData.novelty}
              onChange={(e) => updateFormData("novelty", e.target.value)}
              minRows={3}
              mb="md"
            />

            <Textarea
              label="Advantages"
              placeholder="List the advantages"
              value={formData.advantages}
              onChange={(e) => updateFormData("advantages", e.target.value)}
              minRows={3}
            />
          </Card>
        )}

        {/* Step 1: Technical Details */}
        {activeStep === 1 && (
          <Card p="md">
            <Text weight={500} mb="md">Technical Details</Text>

            <Textarea
              label="Problem Statement"
              placeholder="Describe the problem (minimum 50 characters)"
              value={formData.problem_statement}
              onChange={(e) => updateFormData("problem_statement", e.target.value)}
              minRows={4}
              required
              mb="md"
            />

            <Textarea
              label="Objective"
              placeholder="Describe the objective (minimum 30 characters)"
              value={formData.objective}
              onChange={(e) => updateFormData("objective", e.target.value)}
              minRows={3}
              required
              mb="md"
            />

            <Textarea
              label="Applications"
              placeholder="Describe potential applications"
              value={formData.applications}
              onChange={(e) => updateFormData("applications", e.target.value)}
              minRows={3}
              mb="md"
            />

            <FileInput
              label="POC Details (New Upload)"
              placeholder="Upload proof of concept document"
              accept=".pdf,.doc,.docx"
              value={files.poc_details}
              onChange={(file) => setFiles(prev => ({ ...prev, poc_details: file }))}
              leftSection={<Upload size={16} />}
            />
          </Card>
        )}

        {/* Step 2: Research & Funding */}
        {activeStep === 2 && (
          <Card p="md">
            <Text weight={500} mb="md">Research & Funding Details</Text>

            <Textarea
              label="Funding Details"
              placeholder="Describe funding sources and amounts"
              value={formData.funding_details}
              onChange={(e) => updateFormData("funding_details", e.target.value)}
              minRows={3}
              required
              mb="md"
            />

            <TextInput
              label="Funding Source"
              placeholder="e.g., Government Grant, Private Funding"
              value={formData.funding_source}
              onChange={(e) => updateFormData("funding_source", e.target.value)}
              mb="md"
            />

            <Textarea
              label="Publication Details"
              placeholder="List any related publications"
              value={formData.publication_details}
              onChange={(e) => updateFormData("publication_details", e.target.value)}
              minRows={2}
              mb="md"
            />

            <Textarea
              label="Research Details"
              placeholder="Additional research information"
              value={formData.research_details}
              onChange={(e) => updateFormData("research_details", e.target.value)}
              minRows={3}
              mb="md"
            />

            <Group>
              <FileInput
                label="Source Agreement (New)"
                accept=".pdf"
                value={files.source_file}
                onChange={(file) => setFiles(prev => ({ ...prev, source_file: file }))}
                leftSection={<Upload size={16} />}
                style={{ flex: 1 }}
              />

              <FileInput
                label="MOU File (New)"
                accept=".pdf"
                value={files.mou_file}
                onChange={(file) => setFiles(prev => ({ ...prev, mou_file: file }))}
                leftSection={<Upload size={16} />}
                style={{ flex: 1 }}
              />
            </Group>
          </Card>
        )}

        {/* Step 3: Inventors Review */}
        {activeStep === 3 && (
          <Card p="md">
            <Text weight={500} mb="md">Inventors Information</Text>
            <Text size="sm" color="dimmed" mb="md">
              Review and verify inventor details. Percentages must sum to exactly 100%.
            </Text>

            {formData.inventors.length > 0 ? (
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Percentage Share</th>
                    <th>Consent Status</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.inventors.map((inventor, index) => (
                    <tr key={index}>
                      <td>{inventor.name}</td>
                      <td>{inventor.email}</td>
                      <td>
                        <NumberInput
                          value={inventor.percentage_share}
                          onChange={(value) => updateInventor(index, "percentage_share", value)}
                          min={0}
                          max={100}
                          precision={2}
                          size="sm"
                          style={{ width: 100 }}
                        />%
                      </td>
                      <td>
                        <Badge color={inventor.has_consent ? "green" : "orange"}>
                          {inventor.has_consent ? "Consented" : "Pending"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert color="yellow" title="No Inventors Found">
                This application has no inventor data. Contact support if this seems incorrect.
              </Alert>
            )}

            <Box mt="md">
              <Text size="sm" weight={500}>
                Total Percentage: {formData.inventors.reduce((sum, inv) => sum + (parseFloat(inv.percentage_share) || 0), 0).toFixed(2)}%
              </Text>
              {Math.abs(formData.inventors.reduce((sum, inv) => sum + (parseFloat(inv.percentage_share) || 0), 0) - 100) > 0.01 && (
                <Text size="sm" color="red">
                  ⚠️ Percentages must sum to exactly 100%
                </Text>
              )}
            </Box>
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {activeStep === 4 && (
          <Card p="md">
            <Text weight={500} mb="md">Review & Submit</Text>

            <Textarea
              label="Comments (Optional)"
              description="Add any comments about the changes made"
              placeholder="Describe what was modified in this resubmission"
              value={formData.comments}
              onChange={(e) => updateFormData("comments", e.target.value)}
              minRows={3}
              mb="md"
            />

            <Alert color="blue" title="Ready to Resubmit" icon={<CheckCircle size={16} />}>
              Your application has been updated and is ready for resubmission.
              Once submitted, it will be reviewed by the PCC Admin.
            </Alert>
          </Card>
        )}

        <Divider my="md" />

        <Group position="apart">
          <Button
            variant="light"
            onClick={prevStep}
            disabled={activeStep === 0 || loading}
          >
            Previous
          </Button>

          <Group>
            <Button variant="light" onClick={onClose} disabled={loading}>
              Cancel
            </Button>

            {activeStep < 4 ? (
              <Button onClick={nextStep} disabled={loading}>
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={loading}
                leftSection={<CheckCircle size={16} />}
              >
                Resubmit Application
              </Button>
            )}
          </Group>
        </Group>
      </Box>
    </Modal>
  );
};

export default EditApplicationModal;
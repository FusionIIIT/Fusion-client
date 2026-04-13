import React, { useState } from "react";
import PropTypes from "prop-types";
import { TextInput, Button, Select, Grid, Title, Paper, FileInput, Group, Alert } from "@mantine/core";
import "./BonafideForm.css";
import axios from "axios";
import { Bonafide_Form_Submit } from "../../../routes/otheracademicRoutes";

function BonafideForm({ setTab }) {
  const roll = "";
  const name = "";
  const [formValues, setFormValues] = useState({
    student_name: name,
    roll_no: roll,
    purpose: "",
    branch: "",
    semester: "",
  });
  
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Allowed file extensions
  const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];
  const MAX_FILE_SIZE_MB = 5; // 5 MB max
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const validateFile = (selectedFile) => {
    // Reset previous errors
    setFileError("");
    
    if (!selectedFile) {
      return true; // File is optional
    }

    // Check file extension
    const fileName = selectedFile.name;
    const fileExtension = fileName.split(".").pop().toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setFileError(`File format not supported. Please upload PDF, JPG, or PNG only.`);
      setFile(null);
      return false;
    }

    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File size exceeds ${MAX_FILE_SIZE_MB} MB limit. Please compress and try again.`);
      setFile(null);
      return false;
    }

    // Verify MIME type matches extension
    const validMimeTypes = {
      pdf: ["application/pdf"],
      jpg: ["image/jpeg"],
      jpeg: ["image/jpeg"],
      png: ["image/png"],
    };

    const expectedMimeTypes = validMimeTypes[fileExtension] || [];
    if (expectedMimeTypes.length > 0 && !expectedMimeTypes.includes(selectedFile.type)) {
      setFileError("File content does not match the file extension. Please verify and try again.");
      setFile(null);
      return false;
    }

    setFile(selectedFile);
    return true;
  };

  const handleFileChange = (selectedFile) => {
    validateFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("No auth token found");
      setUploadError("Authentication error. Please login again.");
      return;
    }

    // Final validation before submission
    if (file) {
      if (!validateFile(file)) {
        return;
      }
    }

    const formData = new FormData();
    formData.append("student_name", name);
    formData.append("roll_no", roll);
    formData.append("purpose", formValues.purpose);
    formData.append("branch", formValues.branch);
    formData.append("semester", formValues.semester);
    if (file) {
      formData.append("bonafide_file", file);
    }

    try {
      const response = await axios.post(Bonafide_Form_Submit, formData, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Form submitted successfully:", response.data);
      setUploadSuccess("Bonafide certificate request submitted successfully!");
      
      // Reset form
      setFormValues({
        student_name: name,
        roll_no: roll,
        purpose: "",
        branch: "",
        semester: "",
      });
      setFile(null);
      setUploadError("");

      // After successful form submission, change the tab to "Bonafide Form Status"
      if (setTab) {
        setTimeout(() => setTab(1), 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          "Error submitting the form. Please try again.";
      console.error("Error submitting the form:", errorMessage);
      setUploadError(errorMessage);
      setUploadSuccess("");
    }
  };

  return (
    <Paper className="bonafide-paper">
      <Title order={2} align="center" className="form-title">
        Bonafide Certificate Request
      </Title>

      {uploadError && (
        <Alert color="red" title="Upload Error" style={{ marginBottom: "1rem" }}>
          {uploadError}
        </Alert>
      )}

      {uploadSuccess && (
        <Alert color="green" title="Success" style={{ marginBottom: "1rem" }}>
          {uploadSuccess}
        </Alert>
      )}

      {fileError && (
        <Alert color="yellow" title="File Validation Error" style={{ marginBottom: "1rem" }}>
          {fileError}
        </Alert>
      )}

      <form className="bonafide-form" onSubmit={handleSubmit}>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Roll No"
              placeholder="Enter your roll number"
              required
              className="form-input"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Branch"
              placeholder="Select your branch"
              data={[
                { value: "CSE", label: "Computer Science and Engineering" },
                {
                  value: "ECE",
                  label: "Electronics and Communication Engineering",
                },
                { value: "ME", label: "Mechanical Engineering" },
                { value: "SM", label: "Smart Manufacturing" },
                { value: "DS", label: "Design" },
              ]}
              required
              className="form-input"
              onChange={(value) => handleChange("branch", value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Semester"
              placeholder="Select your semester"
              data={[
                { value: "1", label: "Semester 1" },
                { value: "2", label: "Semester 2" },
                { value: "3", label: "Semester 3" },
                { value: "4", label: "Semester 4" },
                { value: "5", label: "Semester 5" },
                { value: "6", label: "Semester 6" },
                { value: "7", label: "Semester 7" },
                { value: "8", label: "Semester 8" },
              ]}
              required
              className="form-input"
              onChange={(value) => handleChange("semester", value)}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Purpose"
              placeholder="Enter the purpose of the bonafide certificate"
              required
              className="form-input"
              onChange={(e) => handleChange("purpose", e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <FileInput
              label="Bonafide Certificate (Optional)"
              placeholder="Upload PDF, JPG, or PNG (Max 5MB)"
              accept="application/pdf,image/jpeg,image/png"
              onChange={handleFileChange}
              className="form-input"
              value={file}
              clearable
              description="Supported formats: PDF, JPG, PNG. Maximum file size: 5MB"
            />
            {file && (
              <Group spacing="xs" style={{ marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", color: "#228be6" }}>
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </Group>
            )}
          </Grid.Col>
        </Grid>
        <Button type="submit" className="submit-btn">
          Submit
        </Button>
      </form>
    </Paper>
  );
}

BonafideForm.propTypes = {
  setTab: PropTypes.func.isRequired,
};

export default BonafideForm;

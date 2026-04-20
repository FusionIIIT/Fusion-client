import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  getAppraisalForms,
  createAppraisalForm,
  downloadAppraisalForm,
} from "./api";
import StatusBadge from "./components/StatusBadge";
import LoadingSpinner from "./components/LoadingSpinner";
import FormField from "./components/FormField";
import TextAreaField from "./components/TextAreaField";

function AppraisalForm({ onBack }) {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    department: "",
    designation: "",
    appraisal_year: "",
    self_summary: "",
    key_responsibilities: "",
    achievements: "",
    challenges_faced: "",
    teaching_performance: "",
    research_work: "",
    publications: "",
    projects_handled: "",
    administrative_contributions: "",
    trainings_attended: "",
    certifications: "",
    workshops: "",
    goals_achieved: "",
    future_goals: "",
    supporting_documents: "",
  });

  const fetchData = async () => {
    try {
      const res = await getAppraisalForms();
      setAppraisals(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const parseServerErrors = (errors) => {
    if (!errors || typeof errors !== "object") return {};
    const next = {};
    Object.entries(errors).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        next[key] = value.join(" ");
      } else if (typeof value === "string") {
        next[key] = value;
      }
    });
    return next;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setFieldErrors({});
    try {
      const required = [
        { key: "employee_id", label: "Employee ID" },
        { key: "employee_name", label: "Employee Name" },
        { key: "department", label: "Department" },
        { key: "designation", label: "Designation" },
        { key: "appraisal_year", label: "Appraisal Year" },
        { key: "self_summary", label: "Self Summary" },
        { key: "key_responsibilities", label: "Key Responsibilities" },
        { key: "achievements", label: "Achievements" },
        { key: "goals_achieved", label: "Goals Achieved" },
        { key: "future_goals", label: "Future Goals" },
      ];
      const missing = required
        .filter((field) => !String(formData[field.key] || "").trim())
        .map((field) => field.label);
      if (missing.length > 0) {
        const nextErrors = required.reduce((acc, field) => {
          if (!String(formData[field.key] || "").trim()) {
            acc[field.key] = "This field is required.";
          }
          return acc;
        }, {});
        setFieldErrors(nextErrors);
        setSubmitError(`Please fill required fields: ${missing.join(", ")}`);
        return;
      }

      await createAppraisalForm(formData);
      setSubmitSuccess("Your form is submitted.");
      setShowForm(false);
      setFieldErrors({});
      fetchData();
    } catch (err) {
      const serverErrors = err?.response?.data;
      const parsed = parseServerErrors(serverErrors);
      const generalError =
        parsed.error || parsed.detail || parsed.non_field_errors;
      if (generalError) {
        setSubmitError(generalError);
        delete parsed.error;
        delete parsed.detail;
        delete parsed.non_field_errors;
      }
      if (Object.keys(parsed).length > 0) {
        setFieldErrors(parsed);
        if (!generalError) {
          setSubmitError("Please correct the highlighted fields.");
        }
      } else {
        setSubmitError(
          "Submission failed. Please check the form fields and try again.",
        );
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await downloadAppraisalForm(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `appraisal-${id}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      window.alert("Unable to download appraisal form.");
    }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="fusion-page">
      <div className="fusion-card">
        <div className="fusion-actions">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="fusion-button-ghost"
            >
              Back to dashboard
            </button>
          </div>
          <div>
            <h1 className="fusion-heading">Performance Appraisals</h1>
            <p className="fusion-subtitle">
              Review and submit your annual self appraisals.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="fusion-button-primary"
          >
            New Self-Appraisal
          </button>
        </div>
      </div>

      <div className="fusion-table-wrap">
        <div className="fusion-filter-bar">
          <span className="fusion-subtitle">{appraisals.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="fusion-table">
            <thead>
              <tr>
                <th>Appraisal Year</th>
                <th>Department</th>
                <th>Reviewer</th>
                <th>Download</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appraisals.map((app) => (
                <tr key={app.id}>
                  <td>{app.appraisal_year || app.period}</td>
                  <td>{app.department || "-"}</td>
                  <td>{app.reviewer_id || "-"}</td>
                  <td>
                    <button
                      type="button"
                      className="fusion-button-ghost"
                      onClick={() => handleDownload(app.id)}
                    >
                      Download
                    </button>
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                </tr>
              ))}
              {appraisals.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center"
                    style={{ padding: "24px", color: "#94a3b8" }}
                  >
                    No appraisals submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && (
        <div className="fusion-modal">
          <div className="fusion-modal-card">
            <h2 className="fusion-heading" style={{ fontSize: "20px" }}>
              Self Appraisal Form
            </h2>
            <p className="fusion-subtitle" style={{ marginBottom: "16px" }}>
              Complete the required fields to submit your appraisal.
            </p>
            {submitSuccess && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {submitSuccess}
              </div>
            )}
            {submitError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="fusion-section">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Basic Details
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Employee ID"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                    error={fieldErrors.employee_id}
                  />
                  <FormField
                    label="Employee Name"
                    name="employee_name"
                    value={formData.employee_name}
                    onChange={handleChange}
                    required
                    error={fieldErrors.employee_name}
                  />
                  <FormField
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    error={fieldErrors.department}
                  />
                  <FormField
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    error={fieldErrors.designation}
                  />
                  <FormField
                    label="Appraisal Year"
                    name="appraisal_year"
                    value={formData.appraisal_year}
                    onChange={handleChange}
                    required
                    error={fieldErrors.appraisal_year}
                  />
                </div>
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Self Assessment
                </h3>
                <TextAreaField
                  label="Self Summary"
                  name="self_summary"
                  value={formData.self_summary}
                  onChange={handleChange}
                  required
                  error={fieldErrors.self_summary}
                />
                <TextAreaField
                  label="Key Responsibilities"
                  name="key_responsibilities"
                  value={formData.key_responsibilities}
                  onChange={handleChange}
                  required
                  error={fieldErrors.key_responsibilities}
                />
                <TextAreaField
                  label="Achievements"
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  required
                  error={fieldErrors.achievements}
                />
                <TextAreaField
                  label="Challenges Faced"
                  name="challenges_faced"
                  value={formData.challenges_faced}
                  onChange={handleChange}
                />
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Performance Sections
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextAreaField
                    label="Teaching Performance"
                    name="teaching_performance"
                    value={formData.teaching_performance}
                    onChange={handleChange}
                  />
                  <TextAreaField
                    label="Research Work"
                    name="research_work"
                    value={formData.research_work}
                    onChange={handleChange}
                  />
                  <TextAreaField
                    label="Publications"
                    name="publications"
                    value={formData.publications}
                    onChange={handleChange}
                  />
                  <TextAreaField
                    label="Projects Handled"
                    name="projects_handled"
                    value={formData.projects_handled}
                    onChange={handleChange}
                  />
                  <TextAreaField
                    label="Administrative Contributions"
                    name="administrative_contributions"
                    value={formData.administrative_contributions}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Development
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextAreaField
                    label="Trainings Attended"
                    name="trainings_attended"
                    value={formData.trainings_attended}
                    onChange={handleChange}
                  />
                  <TextAreaField
                    label="Certifications"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                  />
                  <TextAreaField
                    label="Workshops"
                    name="workshops"
                    value={formData.workshops}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Goals
                </h3>
                <TextAreaField
                  label="Goals Achieved"
                  name="goals_achieved"
                  value={formData.goals_achieved}
                  onChange={handleChange}
                  required
                  error={fieldErrors.goals_achieved}
                />
                <TextAreaField
                  label="Future Goals"
                  name="future_goals"
                  value={formData.future_goals}
                  onChange={handleChange}
                  required
                  error={fieldErrors.future_goals}
                />
                <FormField
                  label="Supporting Documents (reference)"
                  name="supporting_documents"
                  value={formData.supporting_documents}
                  onChange={handleChange}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="fusion-button-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="fusion-button-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default AppraisalForm;

AppraisalForm.propTypes = {
  onBack: PropTypes.func.isRequired,
};

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  getCPDAAdvances,
  createCPDAAdvance,
  downloadCPDAAdvance,
  withdrawCPDAAdvance,
} from "./api";
import StatusBadge from "./components/StatusBadge";
import LoadingSpinner from "./components/LoadingSpinner";
import FormField from "./components/FormField";
import TextAreaField from "./components/TextAreaField";

function CPDAAdvance({ onBack }) {
  const [advances, setAdvances] = useState([]);
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
    event_name: "",
    event_type: "",
    organized_by: "",
    venue: "",
    start_date: "",
    end_date: "",
    registration_fee: "",
    travel_expense: "",
    accommodation_expense: "",
    other_expenses: "",
    total_amount: "",
    purpose_of_attending: "",
    benefits_to_institution: "",
    invitation_letter: "",
    receipts: "",
    certificates: "",
  });

  const fetchData = async () => {
    try {
      const res = await getCPDAAdvances();
      setAdvances(res.data);
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
        { key: "event_name", label: "Event Name" },
        { key: "event_type", label: "Event Type" },
        { key: "start_date", label: "Start Date" },
        { key: "end_date", label: "End Date" },
        { key: "total_amount", label: "Total Amount" },
        { key: "purpose_of_attending", label: "Purpose of Attending" },
        { key: "benefits_to_institution", label: "Benefits to Institution" },
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

      if (formData.start_date && formData.end_date) {
        if (formData.start_date > formData.end_date) {
          setFieldErrors((prev) => ({
            ...prev,
            end_date: "End date must be on or after start date.",
          }));
          setSubmitError("End date must be on or after start date.");
          return;
        }
      }

      const numericFields = [
        "registration_fee",
        "travel_expense",
        "accommodation_expense",
        "other_expenses",
        "total_amount",
      ];
      const hasInvalidAmount = numericFields.some((key) => {
        if (String(formData[key] || "").trim()) {
          const value = Number(formData[key]);
          if (Number.isNaN(value) || value < 0) {
            setFieldErrors((prev) => ({
              ...prev,
              [key]: "Amount must be a non-negative number.",
            }));
            setSubmitError("Amounts must be valid non-negative numbers.");
            return true;
          }
        }
        return false;
      });
      if (hasInvalidAmount) return;

      await createCPDAAdvance(formData);
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
      const res = await downloadCPDAAdvance(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `cpda-advance-${id}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      window.alert("Unable to download CPDA advance.");
    }
  };

  const handleWithdraw = async (id) => {
    const confirm = window.confirm("Withdraw this CPDA advance request?");
    if (!confirm) return;
    const remarks =
      window.prompt("Reason for withdrawal (optional):", "") || "";
    try {
      await withdrawCPDAAdvance(id, remarks);
      fetchData();
    } catch (err) {
      console.error(err);
      window.alert("Unable to withdraw CPDA advance.");
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
            <h1 className="fusion-heading">CPDA Advance Requests</h1>
            <p className="fusion-subtitle">
              Submit advances for conferences, workshops, and travel.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="fusion-button-primary"
          >
            New CPDA Advance
          </button>
        </div>
      </div>

      <div className="fusion-table-wrap">
        <div className="fusion-filter-bar">
          <span className="fusion-subtitle">{advances.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="fusion-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>Total Amount</th>
                <th>Download</th>
                <th>Withdraw</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {advances.map((adv) => (
                <tr key={adv.id}>
                  <td>{adv.event_name || adv.purpose}</td>
                  <td>{adv.event_type || "-"}</td>
                  <td>{adv.start_date || adv.submission_date}</td>
                  <td>₹{adv.total_amount || adv.amount_required}</td>
                  <td>
                    <button
                      type="button"
                      className="fusion-button-ghost"
                      onClick={() => handleDownload(adv.id)}
                    >
                      Download
                    </button>
                  </td>
                  <td>
                    {(adv.approval_status || adv.status) === "PENDING" ? (
                      <button
                        type="button"
                        className="fusion-button-ghost"
                        onClick={() => handleWithdraw(adv.id)}
                      >
                        Withdraw
                      </button>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={adv.approval_status || adv.status} />
                  </td>
                </tr>
              ))}
              {advances.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center"
                    style={{ padding: "24px", color: "#94a3b8" }}
                  >
                    No CPDA advances submitted yet.
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
              CPDA Advance Application
            </h2>
            <p className="fusion-subtitle" style={{ marginBottom: "16px" }}>
              Complete the required fields to submit your CPDA request.
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
                  />
                  <FormField
                    label="Employee Name"
                    name="employee_name"
                    value={formData.employee_name}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Event Details
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Event Name"
                    name="event_name"
                    value={formData.event_name}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Event Type"
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Organized By"
                    name="organized_by"
                    value={formData.organized_by}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Start Date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="End Date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Expense Details
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Registration Fee"
                    name="registration_fee"
                    type="number"
                    step="0.01"
                    value={formData.registration_fee}
                    onChange={handleChange}
                    error={fieldErrors.registration_fee}
                  />
                  <FormField
                    label="Travel Expense"
                    name="travel_expense"
                    type="number"
                    step="0.01"
                    value={formData.travel_expense}
                    onChange={handleChange}
                    error={fieldErrors.travel_expense}
                  />
                  <FormField
                    label="Accommodation Expense"
                    name="accommodation_expense"
                    type="number"
                    step="0.01"
                    value={formData.accommodation_expense}
                    onChange={handleChange}
                    error={fieldErrors.accommodation_expense}
                  />
                  <FormField
                    label="Other Expenses"
                    name="other_expenses"
                    type="number"
                    step="0.01"
                    value={formData.other_expenses}
                    onChange={handleChange}
                    error={fieldErrors.other_expenses}
                  />
                  <FormField
                    label="Total Amount"
                    name="total_amount"
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={handleChange}
                    required
                    error={fieldErrors.total_amount}
                  />
                </div>
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Purpose
                </h3>
                <TextAreaField
                  label="Purpose of Attending"
                  name="purpose_of_attending"
                  value={formData.purpose_of_attending}
                  onChange={handleChange}
                  required
                  error={fieldErrors.purpose_of_attending}
                />
                <TextAreaField
                  label="Benefits to Institution"
                  name="benefits_to_institution"
                  value={formData.benefits_to_institution}
                  onChange={handleChange}
                  required
                  error={fieldErrors.benefits_to_institution}
                />
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Documents
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Invitation Letter (reference)"
                    name="invitation_letter"
                    value={formData.invitation_letter}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Receipts (reference)"
                    name="receipts"
                    value={formData.receipts}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Certificates (reference)"
                    name="certificates"
                    value={formData.certificates}
                    onChange={handleChange}
                  />
                </div>
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
export default CPDAAdvance;

CPDAAdvance.propTypes = {
  onBack: PropTypes.func.isRequired,
};

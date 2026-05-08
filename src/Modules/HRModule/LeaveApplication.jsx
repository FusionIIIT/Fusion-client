import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  getLeaveApplications,
  createLeaveApplication,
  getLeaveBalance,
  submitLeaveDocument,
  downloadLeaveApplication,
  withdrawLeaveApplication,
  requestLeaveCancellation,
  requestLeaveExtension,
  submitLeaveResumption,
} from "./api";
import StatusBadge from "./components/StatusBadge";
import LoadingSpinner from "./components/LoadingSpinner";
import FormField from "./components/FormField";
import TextAreaField from "./components/TextAreaField";

function LeaveApplication({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [balance, setBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    department: "",
    designation: "",
    leave_type: "",
    station_leave: "",
    is_half_day: false,
    half_day_slot: "",
    start_date: "",
    end_date: "",
    total_days: "",
    reason: "",
    contact_during_leave: "",
    address_during_leave: "",
    nominee_employee_id: "",
    handover_to: "",
    handover_notes: "",
    medical_certificate: "",
    attachment_file: "",
  });

  const fetchData = async () => {
    try {
      const [appsRes, balRes] = await Promise.all([
        getLeaveApplications(),
        getLeaveBalance(),
      ]);
      const appsData = appsRes?.data?.results ?? appsRes?.data ?? [];
      const balanceData = balRes?.data?.results ?? balRes?.data ?? [];
      setApplications(Array.isArray(appsData) ? appsData : []);
      setBalance(Array.isArray(balanceData) ? balanceData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const computeTotalDays = (start, end) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
      return "";
    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs < 0) return "";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return String(days);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "start_date" || name === "end_date") {
      next.total_days = computeTotalDays(next.start_date, next.end_date);
    }
    if (name === "leave_type") {
      if (!["Casual", "Restricted"].includes(value)) {
        next.station_leave = "";
      }
      if (value === "Vacation") {
        next.nominee_employee_id = "";
      }
      if (value !== "Casual") {
        next.is_half_day = false;
        next.half_day_slot = "";
      }
    }
    if (name === "station_leave" && value === "NOT_REQUIRED") {
      next.nominee_employee_id = "";
    }
    if (name === "is_half_day") {
      const { checked } = e.target;
      next.is_half_day = checked;
      if (checked) {
        next.total_days = "0.5";
        if (next.start_date) {
          next.end_date = next.start_date;
        }
      } else {
        next.half_day_slot = "";
        next.total_days = computeTotalDays(next.start_date, next.end_date);
      }
    }
    if ((name === "start_date" || name === "end_date") && next.is_half_day) {
      next.end_date = next.start_date;
      next.total_days = next.start_date ? "0.5" : "";
    }
    setFormData(next);
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

  const validateLeaveForm = () => {
    const required = [
      { key: "employee_id", label: "Employee ID" },
      { key: "employee_name", label: "Employee Name" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "leave_type", label: "Leave Type" },
      { key: "start_date", label: "Start Date" },
      { key: "end_date", label: "End Date" },
      { key: "reason", label: "Reason" },
      { key: "contact_during_leave", label: "Contact during leave" },
      { key: "address_during_leave", label: "Address during leave" },
    ];
    const nextErrors = {};
    const missing = required
      .filter((field) => !String(formData[field.key] || "").trim())
      .map((field) => field.label);
    required.forEach((field) => {
      if (!String(formData[field.key] || "").trim()) {
        nextErrors[field.key] = "This field is required.";
      }
    });

    const isClRhLeave = ["Casual", "Restricted"].includes(formData.leave_type);
    const isStationOnly =
      isClRhLeave && formData.station_leave === "NOT_REQUIRED";
    const isVacationLeave = formData.leave_type === "Vacation";

    if (isClRhLeave && !formData.station_leave) {
      missing.push("Station Leave");
      nextErrors.station_leave = "Select a station leave option.";
    }

    if (formData.is_half_day) {
      if (formData.leave_type !== "Casual") {
        nextErrors.is_half_day = "Half-day is only for Casual leave.";
        setSubmitError("Half-day is only allowed for Casual leave.");
        setFieldErrors(nextErrors);
        return false;
      }
      if (!formData.half_day_slot) {
        missing.push("Half-day Slot");
        nextErrors.half_day_slot = "Select AM or PM.";
      }
      if (
        formData.start_date &&
        formData.end_date &&
        formData.start_date !== formData.end_date
      ) {
        nextErrors.end_date = "Half-day leave must be for a single day.";
        setSubmitError("Half-day leave must be for a single day.");
        setFieldErrors(nextErrors);
        return false;
      }
    }

    if (
      !isStationOnly &&
      !isVacationLeave &&
      !String(formData.nominee_employee_id || "").trim()
    ) {
      missing.push("Nominee Employee ID");
      nextErrors.nominee_employee_id = "Nominee Employee ID is required.";
    }

    if (
      String(formData.nominee_employee_id || "").trim() &&
      String(formData.employee_id || "").trim() ===
        String(formData.nominee_employee_id || "").trim()
    ) {
      nextErrors.nominee_employee_id = "Nominee must be different.";
      setSubmitError("Nominee must be different from the applicant.");
      setFieldErrors(nextErrors);
      return false;
    }

    if (missing.length > 0) {
      setFieldErrors(nextErrors);
      setSubmitError(`Please fill required fields: ${missing.join(", ")}`);
      return false;
    }

    if (!formData.total_days) {
      setFieldErrors((prev) => ({
        ...prev,
        total_days: "Total days is required.",
      }));
      setSubmitError("Total Days is required.");
      return false;
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setFieldErrors({});
    if (!validateLeaveForm()) {
      return;
    }
    try {
      const payload = { ...formData };
      if (!payload.nominee_employee_id) {
        delete payload.nominee_employee_id;
      }
      await createLeaveApplication(payload);
      setSubmitSuccess("Your form is submitted.");
      setShowForm(false);
      setFieldErrors({});
      setFormData({
        employee_id: "",
        employee_name: "",
        department: "",
        designation: "",
        leave_type: "",
        station_leave: "",
        is_half_day: false,
        half_day_slot: "",
        start_date: "",
        end_date: "",
        total_days: "",
        reason: "",
        contact_during_leave: "",
        address_during_leave: "",
        nominee_employee_id: "",
        handover_to: "",
        handover_notes: "",
        medical_certificate: "",
        attachment_file: "",
      });
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

  const handleDocumentSubmit = async (leaveId) => {
    const submission = (
      window.prompt("Provide the requested document (link/number/details):") ||
      ""
    ).trim();
    if (!submission) {
      return;
    }
    try {
      await submitLeaveDocument(leaveId, submission);
      fetchData();
    } catch (err) {
      console.error(err);
      window.alert("Unable to submit document. Please try again.");
    }
  };

  const handleDownload = async (leaveId) => {
    try {
      const res = await downloadLeaveApplication(leaveId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `leave-application-${leaveId}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      window.alert("Unable to download leave application.");
    }
  };

  const handleWithdraw = async (leaveId) => {
    const confirm = window.confirm("Withdraw this leave request?");
    if (!confirm) return;
    const remarks =
      window.prompt("Reason for withdrawal (optional):", "") || "";
    try {
      await withdrawLeaveApplication(leaveId, remarks);
      fetchData();
    } catch (err) {
      console.error(err);
      window.alert("Unable to withdraw leave request.");
    }
  };

  const handleCancelRequest = async (leaveId) => {
    const confirm = window.confirm(
      "Request cancellation for this approved leave?",
    );
    if (!confirm) return;
    const reason =
      window.prompt("Reason for cancellation (optional):", "") || "";
    try {
      await requestLeaveCancellation(leaveId, reason);
      fetchData();
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.error || "Unable to request cancellation.";
      window.alert(message);
    }
  };

  const handleExtensionRequest = async (app) => {
    const confirm = window.confirm(
      "Request an extension for this approved leave?",
    );
    if (!confirm) return;
    const newEndDate = (
      window.prompt("New end date (YYYY-MM-DD):", "") || ""
    ).trim();
    if (!newEndDate) return;
    const parsed = new Date(newEndDate);
    if (Number.isNaN(parsed.getTime())) {
      window.alert("New end date must be in YYYY-MM-DD format.");
      return;
    }
    if (app.end_date && newEndDate <= app.end_date) {
      window.alert("New end date must be after the current end date.");
      return;
    }
    const reason = window.prompt("Reason for extension (optional):", "") || "";
    try {
      await requestLeaveExtension(app.id, { new_end_date: newEndDate, reason });
      fetchData();
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.error || "Unable to request extension.";
      window.alert(message);
    }
  };

  const handleResumptionSubmit = async (app) => {
    const confirm = window.confirm("Submit resumption request for this leave?");
    if (!confirm) return;
    const resumptionDate = (
      window.prompt("Resumption date (YYYY-MM-DD):", "") || ""
    ).trim();
    const reason = window.prompt("Resumption remarks (optional):", "") || "";
    if (resumptionDate) {
      const parsed = new Date(resumptionDate);
      if (Number.isNaN(parsed.getTime())) {
        window.alert("Resumption date must be in YYYY-MM-DD format.");
        return;
      }
      if (app.end_date && resumptionDate <= app.end_date) {
        window.alert("Resumption date must be after the leave end date.");
        return;
      }
    }
    try {
      await submitLeaveResumption(app.id, {
        resumption_date: resumptionDate,
        reason,
      });
      fetchData();
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.error || "Unable to submit resumption.";
      window.alert(message);
    }
  };

  const normalizedStatus = (status) => (status || "").toUpperCase();
  const isCancelAllowed = (app) => {
    const startDateRaw = app.start_date || app.from_date;
    if (!startDateRaw) return false;
    const startDate = new Date(startDateRaw);
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return today < startDate;
  };
  const isExtensionAllowed = (app) => {
    const endDateRaw = app.end_date || app.to_date;
    if (!endDateRaw) return false;
    const endDate = new Date(endDateRaw);
    const today = new Date();
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return today < endDate;
  };
  const isResumptionAllowed = (app) => {
    const endDateRaw = app.end_date || app.to_date;
    if (!endDateRaw) return false;
    const endDate = new Date(endDateRaw);
    const today = new Date();
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return today > endDate;
  };
  const statusCounts = applications.reduce((acc, app) => {
    const key =
      normalizedStatus(app.approval_status || app.status) || "UNKNOWN";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.trim().toLowerCase();
    const name = (app.leave_type || app.leave_type_name || "").toLowerCase();
    const matchesTerm = !term || name.includes(term);
    const matchesStatus =
      statusFilter === "ALL" ||
      normalizedStatus(app.approval_status || app.status) === statusFilter;
    return matchesTerm && matchesStatus;
  });

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
            <h1 className="fusion-heading">Leave Applications</h1>
            <p className="fusion-subtitle">
              Track your requests and manage balances.
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitError("");
              setSubmitSuccess("");
              setShowForm(true);
            }}
            className="fusion-button-primary"
          >
            Apply for Leave
          </button>
        </div>
      </div>

      <div className="fusion-grid fusion-grid-4">
        <div className="fusion-stat">
          <p className="fusion-stat-label">Total requests</p>
          <p className="fusion-stat-value">{applications.length}</p>
        </div>
        <div className="fusion-stat">
          <p className="fusion-stat-label">Pending</p>
          <p className="fusion-stat-value">{statusCounts.PENDING || 0}</p>
        </div>
        <div className="fusion-stat">
          <p className="fusion-stat-label">Approved</p>
          <p className="fusion-stat-value">{statusCounts.APPROVED || 0}</p>
        </div>
        <div className="fusion-stat">
          <p className="fusion-stat-label">Rejected</p>
          <p className="fusion-stat-value">{statusCounts.REJECTED || 0}</p>
        </div>
      </div>

      <div className="fusion-card">
        <div>
          <h2 className="fusion-heading" style={{ fontSize: "18px" }}>
            Your Leave Balance
          </h2>
          <p className="fusion-subtitle">Live balance by leave type</p>
        </div>
        {balance.length > 0 ? (
          <div className="fusion-balance-grid">
            {balance.map((b) => (
              <div key={b.leave_type || b.id} className="fusion-balance-card">
                <p className="fusion-balance-label">
                  {b.leave_type_name ||
                    b.leave_type?.name ||
                    b.leave_type ||
                    "Leave"}
                </p>
                <p className="fusion-balance-value">{b.current_balance ?? 0}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="fusion-subtitle" style={{ marginTop: "12px" }}>
            No leave balance available yet.
          </p>
        )}
      </div>

      <div className="fusion-table-wrap">
        <div className="fusion-filter-bar">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by leave type"
            className="fusion-input"
            style={{ maxWidth: "280px" }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="fusion-select"
            style={{ maxWidth: "200px" }}
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="FORWARDED">Forwarded</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <span className="fusion-subtitle" style={{ marginLeft: "auto" }}>
            {filteredApplications.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="fusion-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Document request</th>
                <th>Download</th>
                <th>Withdraw/Cancel/Extend</th>
                <th>Resumption</th>
                <th>Cancel status</th>
                <th>Extension</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>
                    {app.leave_type || app.leave_type_name || "Leave request"}
                  </td>
                  <td>{app.start_date || app.from_date}</td>
                  <td>{app.end_date || app.to_date}</td>
                  <td>{app.total_days || app.num_days}</td>
                  <td>
                    {app.document_request_status === "REQUESTED" ? (
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-slate-700">
                          {app.document_request_message || "Document requested"}
                        </span>
                        <button
                          type="button"
                          className="fusion-button-primary"
                          onClick={() => handleDocumentSubmit(app.id)}
                        >
                          Submit document
                        </button>
                      </div>
                    ) : app.document_request_status === "SUBMITTED" ? (
                      <span className="text-sm text-emerald-700">
                        Submitted
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">
                        Not requested
                      </span>
                    )}
                  </td>
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
                    {app.is_owner &&
                    ["PENDING", "FORWARDED"].includes(
                      app.approval_status || app.status,
                    ) ? (
                      <button
                        type="button"
                        className="fusion-button-ghost"
                        onClick={() => handleWithdraw(app.id)}
                      >
                        Withdraw
                      </button>
                    ) : app.is_owner &&
                      (app.approval_status || app.status) === "APPROVED" &&
                      (app.cancel_status || "NOT_REQUESTED") ===
                        "NOT_REQUESTED" &&
                      isCancelAllowed(app) ? (
                      <button
                        type="button"
                        className="fusion-button-ghost"
                        onClick={() => handleCancelRequest(app.id)}
                      >
                        Cancel
                      </button>
                    ) : app.is_owner &&
                      (app.approval_status || app.status) === "APPROVED" &&
                      (app.cancel_status || "NOT_REQUESTED") ===
                        "NOT_REQUESTED" ? (
                      <span className="text-sm text-slate-400">
                        Cancel window closed
                      </span>
                    ) : app.is_owner &&
                      (app.cancel_status || "NOT_REQUESTED") === "REQUESTED" ? (
                      <span className="text-sm text-slate-500">
                        Cancel requested
                      </span>
                    ) : app.is_owner &&
                      (app.approval_status || app.status) === "APPROVED" &&
                      (app.extension_status || "NOT_REQUESTED") ===
                        "NOT_REQUESTED" &&
                      isExtensionAllowed(app) ? (
                      <button
                        type="button"
                        className="fusion-button-ghost"
                        onClick={() => handleExtensionRequest(app)}
                      >
                        Request extension
                      </button>
                    ) : app.is_owner &&
                      (app.approval_status || app.status) === "APPROVED" &&
                      (app.extension_status || "NOT_REQUESTED") ===
                        "NOT_REQUESTED" ? (
                      <span className="text-sm text-slate-400">
                        Extension window closed
                      </span>
                    ) : app.is_owner &&
                      (app.extension_status || "NOT_REQUESTED") ===
                        "REQUESTED" ? (
                      <span className="text-sm text-slate-500">
                        Extension requested
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </td>
                  <td>
                    {app.is_owner &&
                    (app.approval_status || app.status) === "APPROVED" &&
                    (app.resumption_status || "NOT_REQUESTED") ===
                      "NOT_REQUESTED" &&
                    isResumptionAllowed(app) ? (
                      <button
                        type="button"
                        className="fusion-button-ghost"
                        onClick={() => handleResumptionSubmit(app)}
                      >
                        Submit resumption
                      </button>
                    ) : app.resumption_status &&
                      app.resumption_status !== "NOT_REQUESTED" ? (
                      <span className="text-sm text-slate-500">
                        {app.resumption_status}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </td>
                  <td>
                    {app.cancel_status && app.cancel_status !== "NOT_REQUESTED"
                      ? app.cancel_status
                      : "-"}
                  </td>
                  <td>
                    {app.extension_status &&
                    app.extension_status !== "NOT_REQUESTED"
                      ? `${app.extension_status}${app.extension_new_end_date ? ` (to ${app.extension_new_end_date})` : ""}`
                      : "-"}
                  </td>
                  <td>
                    <StatusBadge status={app.approval_status || app.status} />
                  </td>
                </tr>
              ))}
              {filteredApplications.length === 0 && (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center"
                    style={{ padding: "24px", color: "#94a3b8" }}
                  >
                    No leave applications found.
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
            <h2 className="text-xl font-bold mb-1">New Leave Application</h2>
            <p className="text-sm text-slate-500 mb-4">
              Fields marked required must be completed before submission.
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
                </div>
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Leave Details
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="mb-4">
                    <label
                      htmlFor="leave_type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      <span className="block">Leave Type</span>
                      <select
                        id="leave_type"
                        name="leave_type"
                        value={formData.leave_type}
                        onChange={handleChange}
                        required
                        aria-invalid={Boolean(fieldErrors.leave_type)}
                      >
                        <option value="" disabled>
                          Select leave type
                        </option>
                        <option value="Casual">Casual</option>
                        <option value="Restricted">Restricted</option>
                        <option value="Medical">Medical</option>
                        <option value="Earned">Earned</option>
                        <option value="Vacation">Vacation</option>
                        <option value="Sabbatical">Sabbatical</option>
                      </select>
                      {fieldErrors.leave_type && (
                        <p className="mt-1 text-xs text-red-600">
                          {fieldErrors.leave_type}
                        </p>
                      )}
                    </label>
                  </div>
                  {formData.leave_type === "Casual" && (
                    <div className="mb-4">
                      <label
                        htmlFor="is_half_day"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                      >
                        <input
                          id="is_half_day"
                          type="checkbox"
                          name="is_half_day"
                          checked={formData.is_half_day}
                          onChange={handleChange}
                        />
                        <span>Half-day CL</span>
                      </label>
                    </div>
                  )}
                  {(formData.leave_type === "Casual" ||
                    formData.leave_type === "Restricted") && (
                    <div className="mb-4">
                      <label
                        htmlFor="station_leave"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        <span className="block">Station Leave</span>
                        <select
                          id="station_leave"
                          name="station_leave"
                          value={formData.station_leave}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(fieldErrors.station_leave)}
                        >
                          <option value="" disabled>
                            Select station leave
                          </option>
                          <option value="WITH">With Station Leave</option>
                          <option value="WITHOUT">Without Station Leave</option>
                          <option value="NOT_REQUIRED">Not Required</option>
                        </select>
                        {fieldErrors.station_leave && (
                          <p className="mt-1 text-xs text-red-600">
                            {fieldErrors.station_leave}
                          </p>
                        )}
                      </label>
                    </div>
                  )}
                  {formData.leave_type === "Casual" && formData.is_half_day && (
                    <div className="mb-4">
                      <label
                        htmlFor="half_day_slot"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        <span className="block">Half-day Slot</span>
                        <select
                          id="half_day_slot"
                          name="half_day_slot"
                          value={formData.half_day_slot}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(fieldErrors.half_day_slot)}
                        >
                          <option value="" disabled>
                            Select slot
                          </option>
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                        {fieldErrors.half_day_slot && (
                          <p className="mt-1 text-xs text-red-600">
                            {fieldErrors.half_day_slot}
                          </p>
                        )}
                      </label>
                    </div>
                  )}
                  <FormField
                    label="Total Days"
                    name="total_days"
                    type="number"
                    value={formData.total_days}
                    onChange={handleChange}
                    required
                    readOnly
                    error={fieldErrors.total_days}
                  />
                  <FormField
                    label="Start Date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    error={fieldErrors.start_date}
                  />
                  <FormField
                    label="End Date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    error={fieldErrors.end_date}
                  />
                </div>
                <TextAreaField
                  label="Reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  error={fieldErrors.reason}
                />
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Contact & Responsibility
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Contact during leave"
                    name="contact_during_leave"
                    value={formData.contact_during_leave}
                    onChange={handleChange}
                    required
                    error={fieldErrors.contact_during_leave}
                  />
                  <FormField
                    label="Address during leave"
                    name="address_during_leave"
                    value={formData.address_during_leave}
                    onChange={handleChange}
                    required
                    error={fieldErrors.address_during_leave}
                  />
                  {!(formData.leave_type === "Vacation") &&
                    !(
                      formData.leave_type === "Casual" &&
                      formData.station_leave === "NOT_REQUIRED"
                    ) &&
                    !(
                      formData.leave_type === "Restricted" &&
                      formData.station_leave === "NOT_REQUIRED"
                    ) && (
                      <FormField
                        label="Nominee Employee ID"
                        name="nominee_employee_id"
                        value={formData.nominee_employee_id}
                        onChange={handleChange}
                        required
                        error={fieldErrors.nominee_employee_id}
                      />
                    )}
                </div>
                <TextAreaField
                  label="Handover Notes"
                  name="handover_notes"
                  value={formData.handover_notes}
                  onChange={handleChange}
                />
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Documents
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Medical Certificate (reference)"
                    name="medical_certificate"
                    value={formData.medical_certificate}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Attachment File (reference)"
                    name="attachment_file"
                    value={formData.attachment_file}
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
export default LeaveApplication;

LeaveApplication.propTypes = {
  onBack: PropTypes.func.isRequired,
};

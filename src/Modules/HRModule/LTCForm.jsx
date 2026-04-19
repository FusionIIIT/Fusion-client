import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  getLTCApplications,
  createLTCApplication,
  downloadLTCApplication,
  withdrawLTCApplication,
} from "./api";
import StatusBadge from "./components/StatusBadge";
import LoadingSpinner from "./components/LoadingSpinner";
import FormField from "./components/FormField";
import TextAreaField from "./components/TextAreaField";

function LTCForm({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    department: "",
    designation: "",
    ltc_block_year: "",
    travel_start_date: "",
    travel_end_date: "",
    destination: "",
    purpose_of_travel: "",
    family_members: "",
    relationship_details: "",
    travel_mode: "",
    ticket_number: "",
    ticket_cost: "",
    accommodation_cost: "",
    other_expenses: "",
    total_amount_claimed: "",
    tickets_upload: "",
    bills_upload: "",
    previous_ltc_used: "",
    last_ltc_date: "",
  });

  const fetchData = async () => {
    try {
      const res = await getLTCApplications();
      setApplications(res.data);
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
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    try {
      await createLTCApplication(formData);
      setSubmitSuccess("Your form is submitted.");
      setShowForm(false);
      fetchData();
    } catch (err) {
      const message = err?.response?.data
        ? JSON.stringify(err.response.data)
        : "Submission failed. Please check the form fields and try again.";
      setSubmitError(message);
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await downloadLTCApplication(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `ltc-application-${id}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      window.alert("Unable to download LTC application.");
    }
  };

  const handleWithdraw = async (id) => {
    const confirm = window.confirm("Withdraw this LTC request?");
    if (!confirm) return;
    const remarks =
      window.prompt("Reason for withdrawal (optional):", "") || "";
    try {
      await withdrawLTCApplication(id, remarks);
      fetchData();
    } catch (err) {
      console.error(err);
      window.alert("Unable to withdraw LTC request.");
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
            <h1 className="fusion-heading">LTC Applications</h1>
            <p className="fusion-subtitle">
              Plan and submit your LTC travel requests.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="fusion-button-primary"
          >
            Apply for LTC
          </button>
        </div>
      </div>

      <div className="fusion-table-wrap">
        <div className="fusion-filter-bar">
          <span className="fusion-subtitle">{applications.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="fusion-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Block Year</th>
                <th>Travel Start</th>
                <th>Destination</th>
                <th>Download</th>
                <th>Withdraw</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.employee_name || app.name}</td>
                  <td>{app.ltc_block_year || app.block_year}</td>
                  <td>{app.travel_start_date || app.leave_start_date}</td>
                  <td>{app.destination || app.place_of_visit}</td>
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
                    {(app.approval_status || app.status) === "PENDING" ? (
                      <button
                        type="button"
                        className="fusion-button-ghost"
                        onClick={() => handleWithdraw(app.id)}
                      >
                        Withdraw
                      </button>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={app.approval_status || app.status} />
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center"
                    style={{ padding: "24px", color: "#94a3b8" }}
                  >
                    No LTC applications submitted yet.
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
              LTC Application Form
            </h2>
            <p className="fusion-subtitle" style={{ marginBottom: "16px" }}>
              Complete the required fields to submit your LTC request.
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
                  Travel Details
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="LTC Block Year"
                    name="ltc_block_year"
                    value={formData.ltc_block_year}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Travel Start Date"
                    name="travel_start_date"
                    type="date"
                    value={formData.travel_start_date}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Travel End Date"
                    name="travel_end_date"
                    type="date"
                    value={formData.travel_end_date}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                  />
                </div>
                <TextAreaField
                  label="Purpose of Travel"
                  name="purpose_of_travel"
                  value={formData.purpose_of_travel}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Family Details
                </h3>
                <TextAreaField
                  label="Family Members (list)"
                  name="family_members"
                  value={formData.family_members}
                  onChange={handleChange}
                />
                <TextAreaField
                  label="Relationship Details"
                  name="relationship_details"
                  value={formData.relationship_details}
                  onChange={handleChange}
                />
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Expense Details
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Travel Mode"
                    name="travel_mode"
                    value={formData.travel_mode}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Ticket Number"
                    name="ticket_number"
                    value={formData.ticket_number}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Ticket Cost"
                    name="ticket_cost"
                    type="number"
                    step="0.01"
                    value={formData.ticket_cost}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Accommodation Cost"
                    name="accommodation_cost"
                    type="number"
                    step="0.01"
                    value={formData.accommodation_cost}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Other Expenses"
                    name="other_expenses"
                    type="number"
                    step="0.01"
                    value={formData.other_expenses}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Total Amount Claimed"
                    name="total_amount_claimed"
                    type="number"
                    step="0.01"
                    value={formData.total_amount_claimed}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Documents
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Tickets Upload (reference)"
                    name="tickets_upload"
                    value={formData.tickets_upload}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Bills Upload (reference)"
                    name="bills_upload"
                    value={formData.bills_upload}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="fusion-section-alt">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  History & Validation
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Previous LTC Used (Yes/No)"
                    name="previous_ltc_used"
                    value={formData.previous_ltc_used}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Last LTC Date"
                    name="last_ltc_date"
                    type="date"
                    value={formData.last_ltc_date}
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
export default LTCForm;

LTCForm.propTypes = {
  onBack: PropTypes.func.isRequired,
};

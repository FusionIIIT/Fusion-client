import React, { useState, useEffect } from "react";
import { getCPDAReimbursements, createCPDAReimbursement } from "./api";
import StatusBadge from "./components/StatusBadge";
import LoadingSpinner from "./components/LoadingSpinner";
import FormField from "./components/FormField";
import TextAreaField from "./components/TextAreaField";

function CPDAReimbursement() {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState("");
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
      const res = await getCPDAReimbursements();
      setReimbursements(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
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
        setSubmitError(`Please fill required fields: ${missing.join(", ")}`);
        return;
      }

      if (formData.start_date && formData.end_date) {
        if (formData.start_date > formData.end_date) {
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
            setSubmitError("Amounts must be valid non-negative numbers.");
            return true;
          }
        }
        return false;
      });
      if (hasInvalidAmount) return;

      await createCPDAReimbursement(formData);
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error(error);
      setSubmitError("Submission failed. Please check the form fields.");
    }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CPDA Reimbursement Requests</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          New Reimbursement
        </button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th>Event</th>
            <th>Type</th>
            <th>Start Date</th>
            <th>Total Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reimbursements.map((reim) => (
            <tr key={reim.id}>
              <td className="px-4 py-2 border">
                {reim.event_name || reim.purpose}
              </td>
              <td className="px-4 py-2 border">{reim.event_type || "-"}</td>
              <td className="px-4 py-2 border">
                {reim.start_date || reim.submission_date}
              </td>
              <td className="px-4 py-2 border">
                ₹{reim.total_amount || reim.advance_taken}
              </td>
              <td className="px-4 py-2 border">
                <StatusBadge status={reim.approval_status || reim.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-1">
              CPDA Reimbursement Application
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Complete the required fields to submit your CPDA request.
            </p>
            {submitError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
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

              <div className="rounded-lg border border-slate-200 bg-white p-4">
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

              <div className="rounded-lg border border-slate-200 bg-white p-4">
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
                  />
                  <FormField
                    label="Travel Expense"
                    name="travel_expense"
                    type="number"
                    step="0.01"
                    value={formData.travel_expense}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Accommodation Expense"
                    name="accommodation_expense"
                    type="number"
                    step="0.01"
                    value={formData.accommodation_expense}
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
                    label="Total Amount"
                    name="total_amount"
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Purpose
                </h3>
                <TextAreaField
                  label="Purpose of Attending"
                  name="purpose_of_attending"
                  value={formData.purpose_of_attending}
                  onChange={handleChange}
                  required
                />
                <TextAreaField
                  label="Benefits to Institution"
                  name="benefits_to_institution"
                  value={formData.benefits_to_institution}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
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
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
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
export default CPDAReimbursement;

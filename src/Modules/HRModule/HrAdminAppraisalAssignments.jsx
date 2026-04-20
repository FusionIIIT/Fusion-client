import React, { useEffect, useMemo, useState } from "react";
import { assignAppraisalForm, getAppraisalForms } from "./api";
import LoadingSpinner from "./components/LoadingSpinner";
import StatusBadge from "./components/StatusBadge";

const ASSIGNMENT_OPTIONS = [
  { value: "HOD", label: "Assign to HOD" },
  { value: "DIRECTOR", label: "Assign to Director" },
];

function HrAdminAppraisalAssignments() {
  const [loading, setLoading] = useState(true);
  const [appraisals, setAppraisals] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAppraisals = async () => {
    try {
      const res = await getAppraisalForms();
      setAppraisals(res?.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const pendingUnassigned = useMemo(
    () =>
      appraisals.filter(
        (item) =>
          (item.status || "").toUpperCase() === "PENDING" &&
          !String(item.assigned_reviewer_role || "").trim(),
      ),
    [appraisals],
  );

  const handleAssign = async (appraisalId, role) => {
    try {
      setActionLoading(appraisalId);
      await assignAppraisalForm(appraisalId, { role });
      await fetchAppraisals();
    } catch (error) {
      console.error(error);
      window.alert("Assignment failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Appraisal Assignment</h1>
        <p className="text-sm text-slate-500">
          Assign pending appraisals to HODs or the Director.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Appraisal Year</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Assign</th>
            </tr>
          </thead>
          <tbody>
            {pendingUnassigned.map((appraisal) => (
              <tr key={appraisal.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">
                  {appraisal.employee_name || "Employee"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {appraisal.department || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {appraisal.appraisal_year || "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={appraisal.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {ASSIGNMENT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
                        onClick={() => handleAssign(appraisal.id, option.value)}
                        disabled={actionLoading === appraisal.id}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {pendingUnassigned.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No pending appraisals waiting for assignment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HrAdminAppraisalAssignments;

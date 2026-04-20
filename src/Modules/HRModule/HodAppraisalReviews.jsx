import React, { useEffect, useMemo, useState } from "react";
import { getAppraisalForms, reviewAppraisalForm } from "./api";
import StatusBadge from "./components/StatusBadge";
import LoadingSpinner from "./components/LoadingSpinner";

function HodAppraisalReviews() {
  const [loading, setLoading] = useState(true);
  const [appraisals, setAppraisals] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
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
    fetchAppraisals();
  }, []);

  const handleDecision = async (appraisalId, action) => {
    const remarks = window.prompt("Add reviewer remarks (optional):", "") || "";
    const rating = window.prompt("Rating (optional):", "") || "";
    if ((action === "forward" || action === "approve") && !remarks.trim()) {
      window.alert("Reviewer remarks are required for this action.");
      return;
    }
    try {
      setActionLoading(appraisalId);
      await reviewAppraisalForm(appraisalId, { action, remarks, rating });
      const res = await getAppraisalForms();
      setAppraisals(res?.data ?? []);
    } catch (error) {
      console.error(error);
      window.alert("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingAppraisals = useMemo(
    () =>
      appraisals.filter(
        (item) => (item.status || "").toUpperCase() === "PENDING",
      ),
    [appraisals],
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">HOD Appraisal Reviews</h1>
        <p className="text-sm text-slate-500">
          Review pending self-appraisals and add reviewer feedback.
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
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingAppraisals.map((appraisal) => (
              <tr key={appraisal.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">
                  {appraisal.employee_name || appraisal.employee || "Employee"}
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
                    <button
                      type="button"
                      onClick={() => handleDecision(appraisal.id, "review")}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === appraisal.id}
                    >
                      Mark reviewed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(appraisal.id, "forward")}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === appraisal.id}
                    >
                      Send to director
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(appraisal.id, "approve")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === appraisal.id}
                    >
                      Approve
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingAppraisals.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No pending appraisals right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HodAppraisalReviews;

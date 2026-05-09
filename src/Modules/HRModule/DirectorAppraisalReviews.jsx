import React, { useEffect, useMemo, useState } from "react";
import { getAppraisalForms, reviewAppraisalForm } from "./api";
import StatusBadge from "./components/StatusBadge";
import LoadingSpinner from "./components/LoadingSpinner";

function DirectorAppraisalReviews() {
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

  const reviewQueue = useMemo(
    () =>
      appraisals.filter((item) =>
        ["PENDING", "REVIEWED"].includes((item.status || "").toUpperCase()),
      ),
    [appraisals],
  );

  const handleDecision = async (appraisalId, action) => {
    const remarks = window.prompt("Add director remarks (optional):", "") || "";
    const rating = window.prompt("Rating (optional):", "") || "";
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Director Appraisal Reviews</h1>
        <p className="text-sm text-slate-500">
          Review appraisals assigned by HR or forwarded by HODs.
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
            {reviewQueue.map((appraisal) => (
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
                      onClick={() => handleDecision(appraisal.id, "approve")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === appraisal.id}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(appraisal.id, "reject")}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === appraisal.id}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reviewQueue.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No reviewed appraisals right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DirectorAppraisalReviews;

import React, { useEffect, useMemo, useState } from "react";
import { getCPDAAdvances, approveRejectCPDAAdvance } from "./api";
import StatusBadge from "./components/StatusBadge";
import LoadingSpinner from "./components/LoadingSpinner";

function DirectorCpdaApprovals() {
  const [loading, setLoading] = useState(true);
  const [advances, setAdvances] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchAdvances = async () => {
      try {
        const res = await getCPDAAdvances();
        setAdvances(res?.data ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvances();
  }, []);

  const pendingAdvances = useMemo(() => advances, [advances]);

  const handleDecision = async (cpdaId, decision) => {
    const remarks = window.prompt("Add remarks (optional):", "") || "";
    try {
      setActionLoading(cpdaId);
      await approveRejectCPDAAdvance(cpdaId, decision, remarks);
      const res = await getCPDAAdvances();
      setAdvances(res?.data ?? []);
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
        <h1 className="text-2xl font-bold">Director CPDA Approvals</h1>
        <p className="text-sm text-slate-500">
          Review CPDA requests forwarded by HR admin.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Event</th>
              <th className="px-4 py-3 font-semibold">Start Date</th>
              <th className="px-4 py-3 font-semibold">Total Amount</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingAdvances.map((adv) => (
              <tr key={adv.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">
                  {adv.employee_name || adv.employee || "Employee"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {adv.event_name || adv.purpose || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {adv.start_date || adv.submission_date || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  ₹{adv.total_amount || adv.amount_required}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={adv.approval_status || adv.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision(adv.id, "approve")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === adv.id}
                    >
                      Send to accountant
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(adv.id, "reject")}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === adv.id}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingAdvances.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No pending CPDA requests right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DirectorCpdaApprovals;

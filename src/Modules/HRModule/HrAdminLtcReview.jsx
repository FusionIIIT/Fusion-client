import React, { useEffect, useMemo, useState } from "react";
import { getLTCApplications, approveRejectLTC } from "./api";
import StatusBadge from "./components/StatusBadge";
import LoadingSpinner from "./components/LoadingSpinner";

function HrAdminLtcReview() {
  const [loading, setLoading] = useState(true);
  const [ltcRequests, setLtcRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchLtc = async () => {
      try {
        const res = await getLTCApplications();
        setLtcRequests(res?.data ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLtc();
  }, []);

  const pendingRequests = useMemo(
    () =>
      ltcRequests.filter(
        (item) =>
          (item.approval_status || item.status || "").toUpperCase() ===
          "PENDING",
      ),
    [ltcRequests],
  );

  const handleDecision = async (ltcId, decision) => {
    const remarks = window.prompt("Add remarks (optional):", "") || "";
    try {
      setActionLoading(ltcId);
      await approveRejectLTC(ltcId, decision, remarks);
      const res = await getLTCApplications();
      setLtcRequests(res?.data ?? []);
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
        <h1 className="text-2xl font-bold">HR Admin LTC Review</h1>
        <p className="text-sm text-slate-500">
          Verify LTC documents and forward to accountant. HR cannot directly
          approve.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Block Year</th>
              <th className="px-4 py-3 font-semibold">Travel Dates</th>
              <th className="px-4 py-3 font-semibold">Destination</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((ltc) => (
              <tr key={ltc.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">
                  {ltc.employee_name || ltc.employee || "Employee"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {ltc.ltc_block_year || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {`${ltc.travel_start_date || "-"} to ${
                    ltc.travel_end_date || "-"
                  }`}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {ltc.destination || "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={ltc.approval_status || ltc.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision(ltc.id, "forward")}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === ltc.id}
                    >
                      Send to accountant
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(ltc.id, "reject")}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === ltc.id}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingRequests.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No pending LTC requests right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HrAdminLtcReview;

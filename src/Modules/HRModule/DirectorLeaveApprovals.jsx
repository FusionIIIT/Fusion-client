import React, { useEffect, useMemo, useState } from "react";
import {
  getLeaveApplications,
  approveRejectLeave,
  decideLeaveCancellation,
  decideLeaveExtension,
} from "./api";
import StatusBadge from "./components/StatusBadge";
import LoadingSpinner from "./components/LoadingSpinner";

function DirectorLeaveApprovals() {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await getLeaveApplications();
        setLeaves(res?.data ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const pendingLeaves = useMemo(
    () =>
      leaves.filter(
        (item) =>
          (item.approval_status || item.status || "").toUpperCase() ===
          "FORWARDED",
      ),
    [leaves],
  );

  const cancelRequests = useMemo(
    () =>
      leaves.filter(
        (item) =>
          (item.cancel_status || "").toUpperCase() === "REQUESTED" &&
          (item.cancel_current_approver_role || "").toUpperCase() ===
            "DIRECTOR",
      ),
    [leaves],
  );

  const extensionRequests = useMemo(
    () =>
      leaves.filter(
        (item) =>
          (item.extension_status || "").toUpperCase() === "REQUESTED" &&
          (item.extension_current_approver_role || "").toUpperCase() ===
            "DIRECTOR",
      ),
    [leaves],
  );

  const handleDecision = async (leaveId, decision) => {
    const remarks = window.prompt("Add remarks (optional):", "") || "";
    try {
      setActionLoading(leaveId);
      await approveRejectLeave(leaveId, decision, remarks);
      const res = await getLeaveApplications();
      setLeaves(res?.data ?? []);
    } catch (error) {
      console.error(error);
      window.alert("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelDecision = async (leaveId, decision) => {
    const remarks = window.prompt("Add remarks (optional):", "") || "";
    try {
      setActionLoading(leaveId);
      await decideLeaveCancellation(leaveId, decision, remarks);
      const res = await getLeaveApplications();
      setLeaves(res?.data ?? []);
    } catch (error) {
      console.error(error);
      window.alert("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtensionDecision = async (leaveId, decision) => {
    const remarks = window.prompt("Add remarks (optional):", "") || "";
    try {
      setActionLoading(leaveId);
      await decideLeaveExtension(leaveId, decision, remarks);
      const res = await getLeaveApplications();
      setLeaves(res?.data ?? []);
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
        <h1 className="text-2xl font-bold">Director Leave Approvals</h1>
        <p className="text-sm text-slate-500">
          Review leave requests forwarded by HODs.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Leave Type</th>
              <th className="px-4 py-3 font-semibold">From</th>
              <th className="px-4 py-3 font-semibold">To</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingLeaves.map((leave) => (
              <tr key={leave.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">
                  {leave.employee_name || leave.employee || "Employee"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.department || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.leave_type || leave.leave_type_name || "Leave request"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.start_date || leave.from_date || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.end_date || leave.to_date || "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={leave.approval_status || leave.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision(leave.id, "approve")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === leave.id}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(leave.id, "reject")}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === leave.id}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingLeaves.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No forwarded leave requests right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Cancellation requests</h2>
        <p className="text-sm text-slate-500">
          Review approved leave cancellations routed to you.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Leave Type</th>
              <th className="px-4 py-3 font-semibold">From</th>
              <th className="px-4 py-3 font-semibold">To</th>
              <th className="px-4 py-3 font-semibold">Requested by</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cancelRequests.map((leave) => (
              <tr key={leave.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">
                  {leave.employee_name || leave.employee || "Employee"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.department || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.leave_type || leave.leave_type_name || "Leave request"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.start_date || leave.from_date || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.end_date || leave.to_date || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.cancel_requested_by_role || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.cancel_reason || "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCancelDecision(leave.id, "approve")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === leave.id}
                    >
                      Approve cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancelDecision(leave.id, "reject")}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === leave.id}
                    >
                      Reject cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {cancelRequests.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No cancellation requests right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Extension requests</h2>
        <p className="text-sm text-slate-500">
          Review approved leave extensions routed to you.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Leave Type</th>
              <th className="px-4 py-3 font-semibold">From</th>
              <th className="px-4 py-3 font-semibold">To</th>
              <th className="px-4 py-3 font-semibold">New end</th>
              <th className="px-4 py-3 font-semibold">New days</th>
              <th className="px-4 py-3 font-semibold">Requested by</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {extensionRequests.map((leave) => (
              <tr key={leave.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">
                  {leave.employee_name || leave.employee || "Employee"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.department || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.leave_type || leave.leave_type_name || "Leave request"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.start_date || leave.from_date || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.end_date || leave.to_date || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.extension_new_end_date || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.extension_new_total_days || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.extension_requested_by_role || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {leave.extension_reason || "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleExtensionDecision(leave.id, "approve")
                      }
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === leave.id}
                    >
                      Approve extension
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleExtensionDecision(leave.id, "reject")
                      }
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={actionLoading === leave.id}
                    >
                      Reject extension
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {extensionRequests.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No extension requests right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DirectorLeaveApprovals;

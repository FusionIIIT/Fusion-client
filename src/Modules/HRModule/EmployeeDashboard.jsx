import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ClockCounterClockwise } from "@phosphor-icons/react";
import {
  getLeaveApplications,
  getLeaveBalance,
  getAppraisalForms,
  getLTCApplications,
  getCPDAAdvances,
} from "./api";
import StatusBadge from "./components/StatusBadge";
import LoadingSpinner from "./components/LoadingSpinner";

function EmployeeDashboard({ onOpenTab }) {
  const [loading, setLoading] = useState(true);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [ltcApplications, setLtcApplications] = useState([]);
  const [cpdaAdvances, setCpdaAdvances] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [leaveRes, balanceRes, appraisalRes, ltcRes, cpdaAdvanceRes] =
          await Promise.all([
            getLeaveApplications(),
            getLeaveBalance(),
            getAppraisalForms(),
            getLTCApplications(),
            getCPDAAdvances(),
          ]);
        setLeaveApplications(leaveRes.data || []);
        setLeaveBalance(balanceRes.data || []);
        setAppraisals(appraisalRes.data || []);
        setLtcApplications(ltcRes.data || []);
        setCpdaAdvances(cpdaAdvanceRes.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const quickActions = [];

  const historyItems = useMemo(() => {
    const toDateValue = (value) => {
      if (!value) return 0;
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const leaveHistory = leaveApplications.map((item) => ({
      id: `leave-${item.id}`,
      type: "Leave",
      title: item.leave_type || item.leave_type_name || "Leave request",
      dateLabel: item.start_date || item.from_date || "",
      dateValue: toDateValue(item.start_date || item.from_date),
      status: item.approval_status || item.status,
    }));

    const appraisalHistory = appraisals.map((item) => ({
      id: `appraisal-${item.id}`,
      type: "Appraisal",
      title: item.appraisal_year
        ? `Appraisal ${item.appraisal_year}`
        : "Self appraisal",
      dateLabel: item.applied_date || item.submission_date || "",
      dateValue: toDateValue(item.applied_date || item.submission_date),
      status: item.status,
    }));

    const ltcHistory = ltcApplications.map((item) => ({
      id: `ltc-${item.id}`,
      type: "LTC",
      title: item.ltc_block_year
        ? `Block year ${item.ltc_block_year}`
        : "LTC request",
      dateLabel: item.travel_start_date || item.leave_start_date || "",
      dateValue: toDateValue(item.travel_start_date || item.leave_start_date),
      status: item.approval_status || item.status,
    }));

    const cpdaAdvanceHistory = cpdaAdvances.map((item) => ({
      id: `cpda-advance-${item.id}`,
      type: "CPDA Advance",
      title: item.event_name || "CPDA request",
      dateLabel: item.applied_date || item.submission_date || "",
      dateValue: toDateValue(item.applied_date || item.submission_date),
      status: item.approval_status || item.status,
    }));

    return [
      ...leaveHistory,
      ...appraisalHistory,
      ...ltcHistory,
      ...cpdaAdvanceHistory,
    ]
      .sort((a, b) => b.dateValue - a.dateValue)
      .slice(0, 8);
  }, [leaveApplications, appraisals, ltcApplications, cpdaAdvances]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fusion-page">
      <div className="fusion-card">
        <h1 className="fusion-heading">Employee Dashboard</h1>
      </div>

      {leaveBalance.length > 0 && (
        <div className="fusion-card">
          <h2 className="fusion-heading" style={{ fontSize: "18px" }}>
            Leave balance
          </h2>
          <p className="fusion-subtitle">Live balance by leave type</p>
          <div className="fusion-balance-grid">
            {leaveBalance.map((item) => (
              <div key={item.leave_type} className="fusion-balance-card">
                <p className="fusion-balance-label">{item.leave_type_name}</p>
                <p className="fusion-balance-value">{item.current_balance}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {quickActions.length > 0 && (
        <div className="fusion-grid">
          {quickActions.map((action) => (
            <button
              key={action.value}
              type="button"
              onClick={() => onOpenTab(action.value)}
              className="fusion-card"
            >
              <div className="flex items-center gap-3 text-slate-900">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {action.icon}
                </span>
                <div>
                  <p className="text-lg font-semibold">{action.title}</p>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-blue-600">
                {action.cta}
              </p>
              <span
                className={
                  action.submitted
                    ? "mt-2 inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                    : "mt-2 inline-flex w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                }
              >
                {action.submitted ? "Submitted" : "Not submitted"}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="fusion-table-wrap">
        <div className="fusion-filter-bar">
          <div className="flex items-center gap-2 text-slate-900">
            <ClockCounterClockwise size={20} className="text-blue-600" />
            <h2 className="fusion-heading" style={{ fontSize: "18px" }}>
              Recent request history
            </h2>
          </div>
          <p className="fusion-subtitle">
            Latest updates across leave, appraisal, LTC, and CPDA workflows.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="fusion-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Details</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {historyItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.type}</td>
                  <td>{item.title}</td>
                  <td>{item.dateLabel || "-"}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
              {historyItems.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center"
                    style={{ padding: "24px", color: "#94a3b8" }}
                  >
                    No recent requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;

EmployeeDashboard.propTypes = {
  onOpenTab: PropTypes.func.isRequired,
};

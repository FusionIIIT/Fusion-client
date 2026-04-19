import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ClockCounterClockwise } from "@phosphor-icons/react";
import { decideLeaveNominee, getLeaveNomineeQueue } from "./api";
import LoadingSpinner from "./components/LoadingSpinner";
import StatusBadge from "./components/StatusBadge";

function NomineeDashboard({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState("");

  const fetchQueue = async () => {
    setError("");
    try {
      const res = await getLeaveNomineeQueue();
      const data = res?.data?.results ?? res?.data ?? [];
      setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Unable to load nominee requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDecision = async (id, action) => {
    try {
      await decideLeaveNominee(id, action);
      fetchQueue();
    } catch (err) {
      setError("Unable to submit your decision.");
    }
  };

  const items = useMemo(() => queue, [queue]);

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
            <h1 className="fusion-heading">Nominee Dashboard</h1>
            <p className="fusion-subtitle">
              Respond to leave handover nominations.
            </p>
          </div>
          <span className="fusion-subtitle">{items.length} pending</span>
        </div>
      </div>

      {error && (
        <div className="fusion-card">
          <p className="fusion-subtitle" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        </div>
      )}

      <div className="fusion-table-wrap">
        <div className="fusion-filter-bar">
          <div className="flex items-center gap-2 text-slate-900">
            <ClockCounterClockwise size={20} className="text-blue-600" />
            <h2 className="fusion-heading" style={{ fontSize: "18px" }}>
              Pending nominations
            </h2>
          </div>
          <p className="fusion-subtitle">
            Accept or decline responsibility requests.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="fusion-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.employee_name}</td>
                  <td>{item.leave_type}</td>
                  <td>
                    {item.start_date} to {item.end_date}
                  </td>
                  <td>
                    <StatusBadge status={item.nominee_status || "PENDING"} />
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="fusion-button-primary"
                        onClick={() => handleDecision(item.id, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="fusion-button-ghost"
                        onClick={() => handleDecision(item.id, "decline")}
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center"
                    style={{ padding: "24px", color: "#94a3b8" }}
                  >
                    No nominee requests right now.
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

export default NomineeDashboard;

NomineeDashboard.propTypes = {
  onBack: PropTypes.func.isRequired,
};

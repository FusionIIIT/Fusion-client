import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const roleMatchers = [
  { key: "hod", label: "HOD", match: (role) => /hod/i.test(role) },
  {
    key: "director",
    label: "Director",
    match: (role) => /director/i.test(role),
  },
  {
    key: "registrar",
    label: "Registrar",
    match: (role) => /registrar/i.test(role),
  },
  {
    key: "accountant",
    label: "Accountant",
    match: (role) => /accountant/i.test(role),
  },
  {
    key: "hr_admin",
    label: "HR Administration",
    match: (role) => /hr/i.test(role),
  },
];

const employeeActions = [
  {
    key: "leave",
    title: "Apply for Leave",
    description: "Submit a new leave request and track its status.",
    cta: "Apply leave",
    to: "/hr2?tab=leave",
  },
  {
    key: "appraisal",
    title: "Yearly Appraisal",
    description: "Submit self-appraisals and view evaluation status.",
    cta: "Start appraisal",
    to: "/hr2?tab=appraisal",
  },
  {
    key: "cpda-advance",
    title: "CPDA Advance",
    description: "Request advances for approved professional activities.",
    cta: "Request advance",
    to: "/hr2?tab=cpda-advance",
  },
  {
    key: "ltc",
    title: "Apply for LTC",
    description: "Create a Leave Travel Concession request in minutes.",
    cta: "Request LTC",
    to: "/hr2?tab=ltc",
  },
  {
    key: "nominee",
    title: "Nominee Dashboard",
    description: "Accept or decline leave handover nominations.",
    cta: "Review nominations",
    to: "/hr2?tab=nominee",
  },
];

const roleActions = {
  hod: [
    {
      key: "hod-leave-approvals",
      title: "Approve Leave Requests",
      description: "Review and approve leave requests from your department.",
      cta: "Review leave",
      to: "/hr2/hod/leave-approvals",
    },
    {
      key: "hod-appraisals",
      title: "Appraisal Reviews",
      description: "Check pending appraisals and add reviewer feedback.",
      cta: "Open appraisals",
      to: "/hr2/hod/appraisal-reviews",
    },
  ],
  director: [
    {
      key: "director-leave",
      title: "Leave Approvals",
      description: "Review leave requests forwarded by HODs.",
      cta: "Review leaves",
      to: "/hr2/director/leave-approvals",
    },
    {
      key: "director-appraisals",
      title: "Appraisal Reviews",
      description: "Approve or reject reviewed appraisals.",
      cta: "Review appraisals",
      to: "/hr2/director/appraisal-reviews",
    },
    {
      key: "director-cpda",
      title: "CPDA Approvals",
      description: "Approve or reject CPDA advance requests.",
      cta: "Review CPDA",
      to: "/hr2/director/cpda-approvals",
    },
  ],
  registrar: [
    {
      key: "registrar-leave",
      title: "Leave Approvals",
      description:
        "Approve, reject, or forward leave requests from HR Admins and Accountants.",
      cta: "Review leaves",
      to: "/hr2/registrar/leave-approvals",
    },
    {
      key: "registrar-queue",
      title: "Registrar Queue",
      description: "Track files awaiting registrar-level processing.",
      cta: "Open queue",
      disabled: true,
    },
    {
      key: "registrar-compliance",
      title: "Compliance Review",
      description: "Verify documentation and service history compliance.",
      cta: "Review compliance",
      disabled: true,
    },
  ],
  accountant: [
    {
      key: "accountant-ltc",
      title: "LTC Accountant Review",
      description: "Finalize LTC requests forwarded by HR.",
      cta: "Review LTC",
      to: "/hr2/accountant/ltc-review",
    },
    {
      key: "accountant-cpda",
      title: "CPDA Accountant Review",
      description: "Finalize CPDA advances forwarded by HR.",
      cta: "Review CPDA",
      to: "/hr2/accountant/cpda-review",
    },
  ],
  hr_admin: [
    {
      key: "hr-ltc-review",
      title: "LTC Document Check",
      description: "Review LTC submissions and forward to accountant.",
      cta: "Review LTC",
      to: "/hr2/hr-admin/ltc-review",
    },
    {
      key: "hr-cpda-review",
      title: "CPDA Document Check",
      description: "Review CPDA advances and forward to accountant.",
      cta: "Review CPDA",
      to: "/hr2/hr-admin/cpda-review",
    },
    {
      key: "hr-records",
      title: "Employee Records",
      description: "Maintain employee profiles and service records.",
      cta: "Manage records",
      disabled: true,
    },
  ],
};

function RoleDashboard() {
  const navigate = useNavigate();
  const username = useSelector((state) => state.user.username);
  const role = useSelector((state) => state.user.role);

  const resolvedRole = useMemo(() => {
    const match = roleMatchers.find((matcher) => matcher.match(role || ""));
    return match || { key: "employee", label: "Employee" };
  }, [role]);

  const employeeActionsToShow = useMemo(() => {
    const canSeeAppraisal = ["employee", "hod", "director"].includes(
      resolvedRole.key,
    );
    const hideFinanceActions = ["hr_admin", "accountant", "registrar"].includes(
      resolvedRole.key,
    );
    return employeeActions.filter((action) => {
      if (action.key === "appraisal") return canSeeAppraisal;
      if (action.key === "nominee") return resolvedRole.key === "employee";
      if (hideFinanceActions && ["cpda-advance", "ltc"].includes(action.key))
        return false;
      return true;
    });
  }, [resolvedRole.key]);

  const actionsForRole = roleActions[resolvedRole.key] || [];

  const handleAction = (action) => {
    if (action.disabled || !action.to) {
      return;
    }
    navigate(action.to);
  };

  return (
    <div className="fusion-page">
      <div className="fusion-card">
        <div className="fusion-actions">
          <div>
            <p className="fusion-subtitle">Role workspace</p>
            <h1 className="fusion-heading">Welcome, {username}</h1>
            <p className="fusion-subtitle">
              Active role: <strong>{resolvedRole.label}</strong>
            </p>
          </div>
          <div className="fusion-grid" style={{ minWidth: "240px" }}>
            <div className="fusion-stat">
              <p className="fusion-stat-label">Quick access</p>
              <p className="fusion-stat-value" style={{ fontSize: "18px" }}>
                Leave, Appraisal, CPDA, LTC
              </p>
            </div>
            <div className="fusion-stat">
              <p className="fusion-stat-label">Notifications</p>
              <button
                type="button"
                className="fusion-button-primary"
                onClick={() => navigate("/dashboard/notifications")}
              >
                Open notifications
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fusion-card">
        <h2 className="fusion-heading" style={{ fontSize: "20px" }}>
          Employee dashboard
        </h2>
        <p className="fusion-subtitle">
          All employee actions are available for every role.
        </p>
        <div className="fusion-grid" style={{ marginTop: "16px" }}>
          {employeeActionsToShow.map((action) => (
            <button
              key={action.key}
              type="button"
              className="fusion-card"
              onClick={() => handleAction(action)}
            >
              <div>
                <p className="fusion-heading" style={{ fontSize: "16px" }}>
                  {action.title}
                </p>
                <p className="fusion-subtitle">{action.description}</p>
              </div>
              <span
                className="fusion-subtitle"
                style={{ color: "#2563eb", fontWeight: 600 }}
              >
                {action.cta}
              </span>
            </button>
          ))}
        </div>
      </div>

      {actionsForRole.length > 0 && (
        <div className="fusion-card">
          <h2 className="fusion-heading" style={{ fontSize: "20px" }}>
            Role dashboard
          </h2>
          <p className="fusion-subtitle">
            Tools specific to {resolvedRole.label.toLowerCase()} duties.
          </p>
          <div className="fusion-grid" style={{ marginTop: "16px" }}>
            {actionsForRole.map((action) => {
              const isDisabled = Boolean(action.disabled);
              return (
                <button
                  key={action.key}
                  type="button"
                  className="fusion-card"
                  onClick={() => handleAction(action)}
                  disabled={isDisabled}
                >
                  <div>
                    <p className="fusion-heading" style={{ fontSize: "16px" }}>
                      {action.title}
                    </p>
                    <p className="fusion-subtitle">{action.description}</p>
                  </div>
                  <span
                    className="fusion-subtitle"
                    style={{
                      color: isDisabled ? "#94a3b8" : "#2563eb",
                      fontWeight: 600,
                    }}
                  >
                    {isDisabled ? "Coming soon" : action.cta}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleDashboard;

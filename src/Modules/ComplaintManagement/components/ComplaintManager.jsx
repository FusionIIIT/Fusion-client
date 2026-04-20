import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Alert, Button, Container, Paper, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import ComplaintTableSectioned from "./ComplaintTableSectioned";
import ComplaintFormModal from "./ComplaintFormModal";
import ComplaintDetailModal from "./ComplaintDetailModal";
import ResolutionModal from "./ResolutionModal";
import EscalationModal from "./EscalationModal";
import ResolutionVerificationModal from "./ResolutionVerificationModal";
import ReopenRequestModal from "./ReopenRequestModal";
import ComplaintFeedbackModal from "./ComplaintFeedbackModal";
import ComplaintNotificationsPanel from "./ComplaintNotificationsPanel";
import ComplaintOversightPanel from "./ComplaintOversightPanel";
import ComplaintReportingPanel from "./ComplaintReportingPanel";
import ComplaintMasterDataPanel from "./ComplaintMasterDataPanel";
import { fetchComplaintDetail, fetchComplaints } from "../selectors";
import {
  createComplaint,
  caretakerAction,
  deleteComplaint,
  reopenComplaint,
  submitComplaintFeedback,
  submitDraftComplaint,
  verifyComplaint,
  updateComplaint,
  escalateComplaint,
} from "../services";
import CustomBreadcrumbs from "../../../components/Breadcrumbs";
import ModuleTabs from "../../../components/moduleTabs";
import classes from "../ComplaintManagement.module.css";

const getApiErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data) {
    return JSON.stringify(error.response.data);
  }

  return error?.message || "Something went wrong";
};

export default function ComplaintManager({ defaultMode }) {
  const location = useLocation();
  const queryTab = new URLSearchParams(location.search).get("tab");
  const role = useSelector((state) => state.user.role || "");
  const normalizedRole = String(role).toLowerCase();
  const canSeeOversight =
    normalizedRole.includes("supervisor") ||
    normalizedRole.includes("admin") ||
    normalizedRole.includes("convener") ||
    normalizedRole.includes("superuser");
  const canSeeMasterData =
    normalizedRole.includes("caretaker") ||
    normalizedRole.includes("supervisor") ||
    normalizedRole.includes("admin") ||
    normalizedRole.includes("superuser") ||
    normalizedRole.includes("convener");
  const tabItems = useMemo(
    () => [
      { key: "complaints", title: "Complaints" },
      { key: "create", title: "Create Complaint" },
      { key: "notifications", title: "Notifications" },
      ...(canSeeOversight
        ? [
            { key: "oversight", title: "Oversight" },
            { key: "reports", title: "Reports" },
          ]
        : []),
      ...(canSeeMasterData
        ? [{ key: "master-data", title: "Master Data" }]
        : []),
    ],
    [canSeeMasterData, canSeeOversight],
  );
  const tabKeys = useMemo(() => tabItems.map((tab) => tab.key), [tabItems]);
  const getTabIndex = useMemo(
    () => (key) => String(Math.max(tabKeys.indexOf(key), 0)),
    [tabKeys],
  );
  const initialTab =
    queryTab && tabKeys.includes(queryTab)
      ? getTabIndex(queryTab)
      : defaultMode === "create"
        ? getTabIndex("create")
        : getTabIndex("complaints");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(defaultMode === "create");
  const [formMode, setFormMode] = useState(defaultMode);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [resolutionOpen, setResolutionOpen] = useState(false);
  const [resolutionTarget, setResolutionTarget] = useState(null);
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [escalationTarget, setEscalationTarget] = useState(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationTarget, setVerificationTarget] = useState(null);
  const [verificationDecision, setVerificationDecision] = useState("approve");
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenTarget, setReopenTarget] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const complaintsTabIndex = getTabIndex("complaints");
  const createTabIndex = getTabIndex("create");
  const notificationsTabIndex = getTabIndex("notifications");
  const oversightTabIndex = getTabIndex("oversight");
  const reportsTabIndex = getTabIndex("reports");
  const masterDataTabIndex = getTabIndex("master-data");
  const canChangeStatus =
    normalizedRole.includes("caretaker") ||
    normalizedRole.includes("supervisor") ||
    normalizedRole.includes("convener") ||
    normalizedRole.includes("admin");
  const isCaretakerRole = normalizedRole.includes("caretaker");
  const isSupervisorRole = normalizedRole.includes("supervisor");
  const canReviewResolution =
    normalizedRole.includes("student") ||
    normalizedRole.includes("faculty") ||
    normalizedRole.includes("staff") ||
    normalizedRole.includes("supervisor") ||
    normalizedRole.includes("convener") ||
    normalizedRole.includes("admin");
  const canSubmitComplaint =
    normalizedRole.includes("student") ||
    normalizedRole.includes("faculty") ||
    normalizedRole.includes("staff");
  const isComplainantReadOnly = canSubmitComplaint;
  const canSubmitFeedback =
    normalizedRole.includes("student") ||
    normalizedRole.includes("faculty") ||
    normalizedRole.includes("staff");
  const slaReminderWindowHours = 4;
  const reminderQueue = useMemo(
    () =>
      complaints.filter((complaint) => {
        if (!complaint?.sla_deadline) {
          return false;
        }

        const deadline = new Date(complaint.sla_deadline).getTime();
        if (!Number.isFinite(deadline)) {
          return false;
        }

        const hoursRemaining = (deadline - Date.now()) / (1000 * 60 * 60);
        const isActive = ![2, 3].includes(Number(complaint.status));
        return (
          isActive &&
          hoursRemaining > 0 &&
          hoursRemaining <= slaReminderWindowHours
        );
      }),
    [complaints],
  );
  const overdueComplaints = useMemo(
    () =>
      complaints.filter((complaint) => {
        if (!complaint?.sla_deadline) {
          return false;
        }

        const deadline = new Date(complaint.sla_deadline).getTime();
        return (
          Number.isFinite(deadline) &&
          deadline < Date.now() &&
          ![2, 3].includes(Number(complaint.status))
        );
      }),
    [complaints],
  );

  const filteredComplaints = useMemo(() => {
    if (normalizedRole.includes("supervisor")) {
      const types = [
        "electricity",
        "carpenter",
        "plumber",
        "garbage",
        "dustbin",
        "internet",
        "other",
      ];
      const activeType = types.find((t) => normalizedRole.includes(t));
      if (activeType) {
        return complaints.filter(
          (c) => c.complaint_type?.toLowerCase() === activeType,
        );
      }
    }
    return complaints;
  }, [complaints, normalizedRole]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await fetchComplaints();
      setComplaints(data);
      setLastRefreshedAt(new Date().toISOString());
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Failed to load complaints",
        message: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();

    const pollId = setInterval(() => {
      loadComplaints();
    }, 30000);

    return () => clearInterval(pollId);
  }, []);

  useEffect(() => {
    if (queryTab && tabKeys.includes(queryTab)) {
      setActiveTab(getTabIndex(queryTab));
    }
  }, [getTabIndex, queryTab, tabKeys]);

  useEffect(() => {
    if (activeTab === createTabIndex) {
      if (!canSubmitComplaint) {
        notifications.show({
          color: "yellow",
          title: "Submission access restricted",
          message:
            "Complaint submission is available only for student/faculty/staff complainant roles.",
        });
        setActiveTab(complaintsTabIndex);
        return;
      }
      setSelected(null);
      setFormMode("create");
      setFormOpen(true);
    }
  }, [activeTab, canSubmitComplaint, complaintsTabIndex, createTabIndex]);

  const openCreate = () => {
    if (!canSubmitComplaint) {
      notifications.show({
        color: "yellow",
        title: "Submission access restricted",
        message: "You do not have access to create complaints from this panel.",
      });
      return;
    }
    setSelected(null);
    setFormMode("create");
    setFormOpen(true);
    setActiveTab(createTabIndex);
  };

  const openEdit = (item) => {
    setSelected(item);
    setFormMode("edit");
    setFormOpen(true);
    setActiveTab("0");
  };

  const handleView = async (id) => {
    try {
      const detail = await fetchComplaintDetail(id);
      setDetailData(detail);
      setDetailOpen(true);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Failed to fetch detail",
        message: getApiErrorMessage(error),
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteComplaint(id);
      notifications.show({
        color: "green",
        title: "Deleted",
        message: `Complaint ${id} deleted`,
      });
      await loadComplaints();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Delete failed",
        message: getApiErrorMessage(error),
      });
    }
  };

  const handleResolve = async (payload) => {
    setLoading(true);
    try {
      await caretakerAction(resolutionTarget.id, {
        status: payload.status,
        remarks: payload.remarks,
        progress_notes: payload.progress_notes,
        estimated_resolution_time: payload.estimated_resolution_time,
        progress_attachment: payload.progress_attachment,
      });
      notifications.show({
        color: "green",
        title: "Success",
        message: `Complaint status updated to ${["Pending", "In Progress", "Resolved", "Closed"][payload.status] || payload.status}`,
      });
      setResolutionOpen(false);
      setResolutionTarget(null);
      setDetailOpen(false);
      await loadComplaints();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Resolution failed",
        message: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async (payload) => {
    setLoading(true);
    try {
      await escalateComplaint(escalationTarget.id, payload.escalation_reason);
      notifications.show({
        color: "green",
        title: "Success",
        message: "Complaint escalated to supervisor",
      });
      setEscalationOpen(false);
      setEscalationTarget(null);
      setDetailOpen(false);
      await loadComplaints();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Escalation failed",
        message: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (payload) => {
    setLoading(true);
    try {
      await verifyComplaint(verificationTarget.id, payload);
      const isApproved = payload.verification_decision === "approve";
      notifications.show({
        color: "green",
        title: isApproved ? "Verified" : "Rejected",
        message: isApproved
          ? "Complaint verified and closed"
          : "Complaint resolution rejected and reopened",
      });
      setVerificationOpen(false);
      setVerificationTarget(null);
      setDetailOpen(false);
      await loadComplaints();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Verification failed",
        message: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReopen = async (payload) => {
    setLoading(true);
    try {
      await reopenComplaint(reopenTarget.id, payload);
      notifications.show({
        color: "green",
        title: "Reopen requested",
        message: "Your reopen request was submitted",
      });
      setReopenOpen(false);
      setReopenTarget(null);
      setDetailOpen(false);
      await loadComplaints();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Reopen request failed",
        message: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const safePayload = { ...payload };
      if (!canChangeStatus) {
        delete safePayload.status;
      }

      if (formMode === "create") {
        const createdComplaint = await createComplaint(safePayload);
        notifications.show({
          color: "green",
          title: "Created",
          message: `Complaint created${createdComplaint?.complaint_ref ? `: ${createdComplaint.complaint_ref}` : ""}`,
        });
      } else {
        await updateComplaint(selected.id, { ...selected, ...safePayload });
        notifications.show({
          color: "green",
          title: "Updated",
          message: "Complaint updated",
        });
      }
      setFormOpen(false);
      setSelected(null);
      setActiveTab(complaintsTabIndex);
      await loadComplaints();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Save failed",
        message: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async (payload) => {
    setLoading(true);
    try {
      const savedDraft = await createComplaint(payload);
      notifications.show({
        color: "blue",
        title: "Draft saved",
        message: savedDraft?.id
          ? `Draft #${savedDraft.id} saved successfully`
          : "Complaint draft saved successfully",
      });
      setFormOpen(false);
      setSelected(null);
      setActiveTab(complaintsTabIndex);
      await loadComplaints();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Draft save failed",
        message: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDraft = async (item) => {
    setLoading(true);
    try {
      await submitDraftComplaint(item.id);
      notifications.show({
        color: "green",
        title: "Draft submitted",
        message: "Draft moved to active complaint workflow",
      });
      await loadComplaints();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Submit draft failed",
        message: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (payload) => {
    setLoading(true);
    try {
      await submitComplaintFeedback(feedbackTarget.id, payload);
      notifications.show({
        color: "green",
        title: "Feedback submitted",
        message: "Thank you for your feedback.",
      });
      setFeedbackOpen(false);
      setFeedbackTarget(null);
      await loadComplaints();
      if (detailData?.complaint_details?.id) {
        const refreshed = await fetchComplaintDetail(
          detailData.complaint_details.id,
        );
        setDetailData(refreshed);
      }
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Feedback submit failed",
        message: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomBreadcrumbs />
      <Container fluid px="lg" py="md" className={classes.page}>
        <ModuleTabs
          tabs={tabItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        {activeTab === complaintsTabIndex && (
          <>
            <div className={classes.headerBlock}>
              <div>
                <Title order={2} className={classes.title}>
                  Complaint Management
                </Title>
                <Text className={classes.subtitle}>
                  Manage your complaints with the same Fusion dashboard
                  workflow.
                </Text>
                <Text className={classes.statusNote} mt={4}>
                  {lastRefreshedAt
                    ? `Last refreshed: ${new Date(lastRefreshedAt).toLocaleString()}`
                    : "Status data will refresh automatically every 30 seconds."}
                </Text>
              </div>
              <div className={classes.actions}>
                <Button
                  variant="default"
                  onClick={loadComplaints}
                  loading={loading}
                >
                  Refresh
                </Button>
                {canSubmitComplaint && (
                  <Button onClick={openCreate}>New Complaint</Button>
                )}
              </div>
            </div>

            {(reminderQueue.length > 0 || overdueComplaints.length > 0) && (
              <Alert
                color={overdueComplaints.length > 0 ? "red" : "yellow"}
                title="SLA attention needed"
                mb="md"
              >
                {overdueComplaints.length > 0 && (
                  <Text size="sm">
                    {`${overdueComplaints.length} complaint${overdueComplaints.length === 1 ? " is" : "s are"} already past SLA and may require immediate intervention.`}
                  </Text>
                )}
                {reminderQueue.length > 0 && (
                  <Text size="sm">
                    {`${reminderQueue.length} complaint${reminderQueue.length === 1 ? " is" : "s are"} approaching the SLA reminder window.`}
                  </Text>
                )}
              </Alert>
            )}

            <Paper
              className={`${classes.tablePanel} ${classes.moduleCard}`}
              withBorder
            >
              <ComplaintTableSectioned
                complaints={filteredComplaints}
                onView={handleView}
                onEdit={openEdit}
                onDelete={handleDelete}
                onSubmitDraft={handleSubmitDraft}
                isCaretaker={canChangeStatus}
                readOnly={isComplainantReadOnly}
              />
            </Paper>
          </>
        )}

        {activeTab === notificationsTabIndex && (
          <ComplaintNotificationsPanel role={role} />
        )}

        {activeTab === oversightTabIndex && canSeeOversight && (
          <ComplaintOversightPanel
            complaints={filteredComplaints}
            onView={handleView}
            onRefresh={loadComplaints}
          />
        )}

        {activeTab === reportsTabIndex && canSeeOversight && (
          <ComplaintReportingPanel
            complaints={filteredComplaints}
            onView={handleView}
            normalizedRole={normalizedRole}
          />
        )}

        {activeTab === masterDataTabIndex && canSeeMasterData && (
          <ComplaintMasterDataPanel normalizedRole={normalizedRole} />
        )}

        <ComplaintFormModal
          opened={formOpen}
          mode={formMode}
          initialData={selected}
          canChangeStatus={canChangeStatus}
          onClose={() => {
            setFormOpen(false);
            setActiveTab(complaintsTabIndex);
          }}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          loading={loading}
        />

        <ComplaintDetailModal
          opened={detailOpen}
          onClose={() => setDetailOpen(false)}
          detail={detailData}
          canResolve={isCaretakerRole}
          canManageEscalated={isSupervisorRole}
          canVerify={canReviewResolution}
          canRequestReopen={canReviewResolution}
          canSubmitFeedback={canSubmitFeedback}
          onResolve={(complaint) => {
            setResolutionTarget(complaint);
            setResolutionOpen(true);
          }}
          onEscalate={(complaint) => {
            setEscalationTarget(complaint);
            setEscalationOpen(true);
          }}
          onVerifyApprove={(complaint) => {
            setVerificationTarget(detailData?.complaint_details || complaint);
            setVerificationDecision("approve");
            setVerificationOpen(true);
          }}
          onVerifyReject={(complaint) => {
            setVerificationTarget(detailData?.complaint_details || complaint);
            setVerificationDecision("reject");
            setVerificationOpen(true);
          }}
          onRequestReopen={(complaint) => {
            setReopenTarget(detailData?.complaint_details || complaint);
            setReopenOpen(true);
          }}
          onSubmitFeedback={(complaint) => {
            setFeedbackTarget(detailData?.complaint_details || complaint);
            setFeedbackOpen(true);
          }}
        />

        <ResolutionModal
          opened={resolutionOpen}
          onClose={() => {
            setResolutionOpen(false);
            setResolutionTarget(null);
          }}
          complaint={resolutionTarget}
          onResolve={handleResolve}
          isLoading={loading}
        />

        <EscalationModal
          opened={escalationOpen}
          onClose={() => {
            setEscalationOpen(false);
            setEscalationTarget(null);
          }}
          complaint={escalationTarget}
          onEscalate={handleEscalate}
          isLoading={loading}
        />

        <ResolutionVerificationModal
          opened={verificationOpen}
          onClose={() => {
            setVerificationOpen(false);
            setVerificationTarget(null);
          }}
          complaint={verificationTarget}
          defaultDecision={verificationDecision}
          verificationSource={
            normalizedRole.includes("supervisor") ||
            normalizedRole.includes("convener") ||
            normalizedRole.includes("admin")
              ? "supervisor"
              : "complainant"
          }
          onVerify={handleVerify}
          isLoading={loading}
        />

        <ReopenRequestModal
          opened={reopenOpen}
          onClose={() => {
            setReopenOpen(false);
            setReopenTarget(null);
          }}
          complaint={reopenTarget}
          reopenDeadline={reopenTarget?.reopen_allowed_until || ""}
          onRequestReopen={handleReopen}
          isLoading={loading}
        />

        <ComplaintFeedbackModal
          opened={feedbackOpen}
          onClose={() => {
            setFeedbackOpen(false);
            setFeedbackTarget(null);
          }}
          complaint={feedbackTarget}
          onSubmit={handleSubmitFeedback}
          loading={loading}
        />
      </Container>
    </>
  );
}

ComplaintManager.propTypes = {
  defaultMode: PropTypes.oneOf(["create", "list"]),
};

ComplaintManager.defaultProps = {
  defaultMode: "list",
};

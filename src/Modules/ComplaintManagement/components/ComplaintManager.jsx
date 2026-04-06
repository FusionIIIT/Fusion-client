import { useEffect, useState } from "react";
import { Button, Container, Paper, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import ComplaintTable from "./ComplaintTable";
import ComplaintFormModal from "./ComplaintFormModal";
import ComplaintDetailModal from "./ComplaintDetailModal";
import ResolutionModal from "./ResolutionModal";
import EscalationModal from "./EscalationModal";
import { fetchComplaintDetail, fetchComplaints } from "../selectors";
import {
  createComplaint,
  deleteComplaint,
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
  const tabItems = [{ title: "Complaints" }, { title: "Create Complaint" }];
  const role = useSelector((state) => state.user.role || "");
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
  const [activeTab, setActiveTab] = useState(
    defaultMode === "create" ? "1" : "0",
  );
  const normalizedRole = String(role).toLowerCase();
  const canChangeStatus =
    normalizedRole.includes("caretaker") ||
    normalizedRole.includes("supervisor") ||
    normalizedRole.includes("convener") ||
    normalizedRole.includes("admin");

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await fetchComplaints();
      setComplaints(data);
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
  }, []);

  useEffect(() => {
    if (activeTab === "1") {
      setSelected(null);
      setFormMode("create");
      setFormOpen(true);
    }
  }, [activeTab]);

  const openCreate = () => {
    setSelected(null);
    setFormMode("create");
    setFormOpen(true);
    setActiveTab("1");
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
      await updateComplaint(resolutionTarget.id, {
        ...resolutionTarget,
        status: payload.status,
        remarks: payload.remarks,
      });
      notifications.show({
        color: "green",
        title: "Success",
        message: `Complaint status updated to ${["Pending", "In Progress", "Completed"][payload.status]}`,
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

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const safePayload = { ...payload };
      if (!canChangeStatus) {
        delete safePayload.status;
      }

      if (formMode === "create") {
        await createComplaint(safePayload);
        notifications.show({
          color: "green",
          title: "Created",
          message: "Complaint created",
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
      setActiveTab("0");
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

  return (
    <>
      <CustomBreadcrumbs />
      <Container fluid px="lg" py="md" className={classes.page}>
        <ModuleTabs
          tabs={tabItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className={classes.headerBlock}>
          <div>
            <Title order={2} className={classes.title}>
              Complaint Management
            </Title>
            <Text className={classes.subtitle}>
              Manage your complaints with the same Fusion dashboard workflow.
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
            {!canChangeStatus && (
              <Button onClick={openCreate}>New Complaint</Button>
            )}
          </div>
        </div>

        <Paper className={classes.tablePanel} withBorder>
          <ComplaintTable
            complaints={complaints}
            onView={handleView}
            onEdit={openEdit}
            onDelete={handleDelete}
            isCaretaker={canChangeStatus}
          />
        </Paper>

        <ComplaintFormModal
          opened={formOpen}
          mode={formMode}
          initialData={selected}
          canChangeStatus={canChangeStatus}
          onClose={() => {
            setFormOpen(false);
            setActiveTab("0");
          }}
          onSubmit={handleSubmit}
          loading={loading}
        />

        <ComplaintDetailModal
          opened={detailOpen}
          onClose={() => setDetailOpen(false)}
          detail={detailData}
          canResolve={canChangeStatus}
          onResolve={(complaint) => {
            setResolutionTarget(complaint);
            setResolutionOpen(true);
          }}
          onEscalate={(complaint) => {
            setEscalationTarget(complaint);
            setEscalationOpen(true);
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

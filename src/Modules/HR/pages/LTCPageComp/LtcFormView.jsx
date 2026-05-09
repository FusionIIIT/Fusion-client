import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Title,
  Text,
  Textarea,
  Button,
  Group,
  Badge,
  Stack,
  Divider,
} from "@mantine/core";
import LoadingComponent from "../../components/common/Loading";
import { EmptyTable } from "../../components/tables/EmptyTable";
import HrBreadcrumbs from "../../components/common/HrBreadcrumbs";
import {
  getLtcForm,
  getMyDetailsHr,
  handleLtcWorkflow,
} from "../../services/api";

const STATUS_LABELS = {
  submitted: "Submitted — with approver (e.g. HR Admin)",
  hr_approved: "Approved by HR",
  hr_rejected: "Rejected by HR",
  forwarded_to_director: "Forwarded to Director",
  forwarded_to_registrar: "Forwarded to Registrar",
  director_approved: "Sanctioned by Director",
  director_rejected: "Rejected by Director",
  registrar_approved: "Sanctioned by Registrar",
  registrar_rejected: "Rejected by Registrar",
  with_accountant: "With Accountant",
};

function pickLtcWorkflowDesignation(workflowStatus, designations) {
  const list = (designations || [])
    .map((x) => (x || "").trim())
    .filter(Boolean);
  if (!workflowStatus || list.length === 0) return list[0] || "";

  if (workflowStatus === "submitted") {
    const hr = list.find((x) => /hr\s*admin/i.test(x));
    if (hr) return hr;
  }
  if (workflowStatus === "forwarded_to_director") {
    const dir = list.find((x) => /director/i.test(x));
    if (dir) return dir;
  }
  if (workflowStatus === "forwarded_to_registrar") {
    const reg = list.find((x) => /registrar/i.test(x));
    if (reg) return reg;
  }
  return list[0] || "";
}

function LtcFormView() {
  const { id: fileId } = useParams();
  const [formData, setFormData] = useState(null);
  const [myDesignations, setMyDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [form, me] = await Promise.all([
        getLtcForm(fileId),
        getMyDetailsHr(),
      ]);
      setFormData(form);
      const fromApi = Array.isArray(me.designations) ? me.designations : [];
      const fallback =
        me.designation && me.designation !== "N/A" ? [me.designation] : [];
      setMyDesignations(fromApi.length ? fromApi : fallback);
    } catch (e) {
      console.error(e);
      setFormData(null);
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    load();
  }, [load]);

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "LTC", path: "/hr/ltc" },
    { title: "View Form", path: `/hr/ltc/view/${fileId}` },
  ];

  const workflowStatus = formData?.workflow_status;
  const statusLabel =
    (workflowStatus && STATUS_LABELS[workflowStatus]) || workflowStatus || "—";

  const workflowDesignation = useMemo(
    () => pickLtcWorkflowDesignation(workflowStatus, myDesignations),
    [workflowStatus, myDesignations],
  );

  const actions = useMemo(() => {
    const d = workflowDesignation;
    const w = workflowStatus;
    const out = [];
    if (/hr\s*admin/i.test(d || "") && w === "submitted") {
      out.push(
        {
          key: "hr_admin_approve",
          label: "Approve & forward to Sanctioning Authority/Accountant",
          action: "hr_admin_approve",
        },
        {
          key: "hr_admin_reject",
          label: "Reject",
          action: "hr_admin_reject",
        },
      );
    }
    if (/director/i.test(d || "") && w === "forwarded_to_director") {
      out.push(
        {
          key: "director_approve",
          label: "Sanction & forward to Accountant",
          action: "director_approve",
        },
        {
          key: "director_reject",
          label: "Reject",
          action: "director_reject",
        },
      );
    }
    if (/registrar/i.test(d || "") && w === "forwarded_to_registrar") {
      out.push(
        {
          key: "registrar_approve",
          label: "Sanction & forward to Accountant",
          action: "registrar_approve",
        },
        {
          key: "registrar_reject",
          label: "Reject",
          action: "registrar_reject",
        },
      );
    }
    return out;
  }, [workflowDesignation, workflowStatus]);

  const runAction = async (action) => {
    if (action === "hr_admin_reject" && !remarks.trim()) {
      alert("Remarks are required when rejecting.");
      return;
    }
    setSubmitting(true);
    try {
      await handleLtcWorkflow(fileId, {
        action,
        designation: workflowDesignation,
        remarks: remarks.trim(),
      });
      setRemarks("");
      await load();
      alert("Action completed.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

  if (!formData || Object.keys(formData).length === 0) {
    return (
      <>
        <HrBreadcrumbs items={exampleItems} />
        <EmptyTable message="No view data found." />
      </>
    );
  }

  return (
    <div style={{ padding: "0 20px 20px 0" }}>
      <HrBreadcrumbs items={exampleItems} />
      <Group position="apart" mt="md" mb="sm">
        <Title order={2} style={{ fontWeight: 500 }}>
          LTC Details
        </Title>
        <Badge size="lg" variant="light" color="blue">
          {statusLabel}
        </Badge>
      </Group>

      {actions.length > 0 && (
        <Stack
          spacing="sm"
          mb="lg"
          p="md"
          style={{ background: "#f8f9fa", borderRadius: 8 }}
        >
          <Text weight={600}>
            Actions (workflow role: {workflowDesignation || "N/A"}
            {myDesignations.length > 1
              ? `; all roles: ${myDesignations.join(", ")}`
              : ""}
            )
          </Text>
          <Textarea
            label="Remarks (required for reject)"
            placeholder="Optional remarks for approval"
            minRows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <Group>
            {actions.map((a) => (
              <Button
                key={a.key}
                loading={submitting}
                onClick={() => runAction(a.action)}
                color={a.action === "hr_admin_reject" ? "red" : "blue"}
              >
                {a.label}
              </Button>
            ))}
          </Group>
        </Stack>
      )}

      <div
        style={{
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}
        >
          <tbody>
            {Object.entries(formData).map(([key, value]) => {
              if (
                key === "file_extra_JSON" ||
                key === "tracking_extra_JSON" ||
                key === "id" ||
                key === "created_by" ||
                key === "approved_by" ||
                key === "workflow_history"
              ) {
                return null;
              }

              let displayValue = value;
              if (typeof value === "boolean") {
                displayValue = value ? "Yes" : "No";
              } else if (typeof value === "object" && value !== null) {
                displayValue = JSON.stringify(value);
              }

              const formattedKey = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
                .trim();

              return (
                <tr key={key} style={{ borderBottom: "1px solid #eee" }}>
                  <td
                    style={{
                      padding: "15px 10px",
                      fontWeight: 600,
                      width: "30%",
                      color: "#333",
                    }}
                  >
                    {formattedKey}
                  </td>
                  <td style={{ padding: "15px 10px", color: "#555" }}>
                    {displayValue?.toString() || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {Array.isArray(formData.workflow_history) &&
        formData.workflow_history.length > 0 && (
          <>
            <Divider my="xl" />
            <Title order={4} mb="sm">
              Workflow log
            </Title>
            <ul style={{ paddingLeft: 20, color: "#444" }}>
              {formData.workflow_history.map((row, idx) => (
                <li key={`${row.at}-${idx}`} style={{ marginBottom: 8 }}>
                  <strong>{STATUS_LABELS[row.status] || row.status}</strong>
                  {row.by ? ` — ${row.by}` : ""}
                  {row.at ? ` — ${row.at}` : ""}
                  {row.remarks ? ` — ${row.remarks}` : ""}
                </li>
              ))}
            </ul>
          </>
        )}
    </div>
  );
}

export default LtcFormView;

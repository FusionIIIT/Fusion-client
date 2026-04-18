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
  getCpdaAdvForm,
  getMyDetailsHr,
  handleCpdaAdvanceWorkflow,
} from "../../services/api";

const STATUS_LABELS = {
  submitted: "Submitted (with HOD)",
  hod_verified: "Verified by HOD",
  hod_not_verified: "Not verified by HOD",
  forwarded_to_director: "With Director",
  director_approved: "Approved — with Accountant",
  director_rejected: "Rejected by Director",
  accountant_processed: "Completed by Accountant",
};

function isHodDesignation(d) {
  return typeof d === "string" && /^HOD \(.+\)$/.test(d.trim());
}

function CPDAAdvanceFormView() {
  const { id: fileId } = useParams();
  const [formData, setFormData] = useState(null);
  const [myDesignation, setMyDesignation] = useState("");
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [form, me] = await Promise.all([
        getCpdaAdvForm(fileId),
        getMyDetailsHr(),
      ]);
      setFormData(form);
      setMyDesignation((me.designation || "").trim());
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
    { title: "CPDA Adv", path: "/hr/cpda_adv" },
    { title: "View Form", path: `/hr/cpda_adv/view/${fileId}` },
  ];

  const workflowStatus = formData?.workflow_status;
  const statusLabel =
    (workflowStatus && STATUS_LABELS[workflowStatus]) || workflowStatus || "—";

  const actions = useMemo(() => {
    const d = myDesignation;
    const w = workflowStatus;
    const out = [];
    if (isHodDesignation(d) && w === "submitted") {
      out.push(
        { key: "hod_verify", label: "Verify", action: "hod_verify" },
        {
          key: "hod_not_verify",
          label: "Not verify",
          action: "hod_not_verify",
        },
      );
    }
    if (isHodDesignation(d) && w === "hod_verified") {
      out.push({
        key: "hod_forward",
        label: "Forward to Director",
        action: "hod_forward",
      });
    }
    if (d.toLowerCase() === "director" && w === "forwarded_to_director") {
      out.push(
        {
          key: "director_approve",
          label: "Approve",
          action: "director_approve",
        },
        { key: "director_reject", label: "Reject", action: "director_reject" },
      );
    }
    if (d.toLowerCase() === "accountant" && w === "director_approved") {
      out.push({
        key: "accountant_complete",
        label: "Mark processing complete",
        action: "accountant_complete",
      });
    }
    return out;
  }, [myDesignation, workflowStatus]);

  const runAction = async (action) => {
    if (action === "director_reject" && !remarks.trim()) {
      alert("Remarks are required when rejecting.");
      return;
    }
    setSubmitting(true);
    try {
      await handleCpdaAdvanceWorkflow(fileId, {
        action,
        designation: myDesignation,
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
          CPDA Advance Details
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
            Actions (your role: {myDesignation || "N/A"})
          </Text>
          <Textarea
            label="Remarks (required for Director reject)"
            placeholder="Optional remarks for this step"
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
                color={
                  a.action === "hod_not_verify" ||
                  a.action === "director_reject"
                    ? "red"
                    : "blue"
                }
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

export default CPDAAdvanceFormView;

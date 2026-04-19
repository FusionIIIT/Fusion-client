import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Title,
  Text,
  Button,
  Group,
  Badge,
  Stack,
  Divider,
  Checkbox,
} from "@mantine/core";
import LoadingComponent from "../../components/common/Loading";
import { EmptyTable } from "../../components/tables/EmptyTable";
import HrBreadcrumbs from "../../components/common/HrBreadcrumbs";
import {
  getCpdaClaimForm,
  getMyDetailsHr,
} from "../../services/api";

/** Helper to call the legacy PUT endpoint for CPDAReimbursement */
async function updateCpdaClaimForm(id, payload) {
  const resp = await fetch(`/api/hr/cpdareim/?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${localStorage.getItem("authToken") || localStorage.getItem("token")}`,
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || "Failed to update form");
  }
  return resp.json();
}

function CPDAClaimFormView() {
  const { id: fileId } = useParams();
  const [formData, setFormData] = useState(null);
  const [myDesignations, setMyDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [form, me] = await Promise.all([
        getCpdaClaimForm(fileId),
        getMyDetailsHr(),
      ]);
      setFormData(form);
      const fromApi = Array.isArray(me.designations) ? me.designations : [];
      const fallback = me.designation && me.designation !== "N/A" ? [me.designation] : [];
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

  const isAccountant = myDesignations.some(d => (d || "").toLowerCase() === "accountant");
  const isApproved = formData?.approved === true;

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      // The backend CPDAReimbursement.put expects [receiver, form_payload]
      const receiver = {
        file_id: fileId,
        receiver: "accountant", // dummy for tracking
        receiver_designation: "Accountant",
        remarks: "Approved by Accountant",
        file_extra_JSON: formData.file_extra_JSON || {},
      };
      
      const form_payload = {
        ...formData,
        approved: true,
      };

      await updateCpdaClaimForm(formData.id, [receiver, form_payload]);
      alert("Claim approved successfully. CPDA balance has been reconciled.");
      await load();
    } catch (err) {
      console.error(err);
      alert(err.message || "Approval failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "CPDA Claim", path: "/hr/cpda_claim" },
    { title: "View Form", path: `/hr/cpda_claim/view/${fileId}` },
  ];

  if (loading) return <LoadingComponent />;

  if (!formData) return (
    <>
      <HrBreadcrumbs items={exampleItems} />
      <EmptyTable message="No claim data found." />
    </>
  );

  return (
    <div style={{ padding: "0 20px 20px 0" }}>
      <HrBreadcrumbs items={exampleItems} />
      <Group position="apart" mt="md" mb="sm">
        <Title order={2} style={{ fontWeight: 500 }}>CPDA Claim Details</Title>
        <Badge size="lg" variant="light" color={isApproved ? "green" : "blue"}>
          {isApproved ? "Approved & Reconciled" : "Pending Approval"}
        </Badge>
      </Group>

      {isAccountant && !isApproved && (
        <Stack spacing="sm" mb="lg" p="md" style={{ background: "#f8f9fa", borderRadius: 8 }}>
          <Text weight={600}>Accountant Actions</Text>
          <Text size="sm">Approving this claim will automatically deduct <b>Rs. {formData.adjustmentSubmitted}</b> from the faculty's CPDA balance.</Text>
          <Group>
            <Button loading={submitting} onClick={handleApprove} color="green">
              Approve & Deduct Balance
            </Button>
          </Group>
        </Stack>
      )}

      <div style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
          <tbody>
            {Object.entries(formData).map(([key, value]) => {
              if (['file_extra_JSON', 'tracking_extra_JSON', 'id', 'created_by', 'approved_by', 'workflow_history'].includes(key)) return null;
              
              let displayValue = value;
              if (typeof value === "boolean") displayValue = value ? "Yes" : "No";
              else if (typeof value === "object" && value !== null) displayValue = JSON.stringify(value);

              const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();

              return (
                <tr key={key} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "15px 10px", fontWeight: 600, width: "30%", color: "#333" }}>{formattedKey}</td>
                  <td style={{ padding: "15px 10px", color: "#555" }}>{displayValue?.toString() || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CPDAClaimFormView;

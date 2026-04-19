import React, { useState, useEffect, useMemo } from "react";
import {
  TextInput,
  Button,
  Title,
  Box,
  Grid,
  Select,
  Textarea,
  Checkbox,
  FileInput,
  Text,
  Alert,
} from "@mantine/core";
import "../../styles/LeaveForm.css";
import { useNavigate } from "react-router-dom";
import {
  getFormInitials,
  submitLeaveForm,
  getLeaveTypesForHr,
  getLeaveBalance,
} from "../../services/api";

function LeaveForm() {
  const [formData, setFormData] = useState({
    leave_type: "",
    leaveStartDate: "",
    leaveEndDate: "",
    start_half: false,
    end_half: false,
    purpose: "",
    leave_info: "",
    addressDuringLeave: "",
    academicResponsibility: "",
    addministrativeResponsibiltyAssigned: "",
  });
  const [leavePdfFile, setLeavePdfFile] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  const [details, setDetails] = useState({
    name: "",
    last_selected_role: "",
    pfno: "",
    department: "",
  });
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balanceSummary, setBalanceSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSubmit, setActiveSubmit] = useState(true);

  const selectedMeta = useMemo(() => {
    const id = formData.leave_type;
    if (!id) return null;
    return leaveTypes.find((t) => String(t.id) === String(id)) || null;
  }, [formData.leave_type, leaveTypes]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [init, types, bal] = await Promise.all([
          getFormInitials(),
          getLeaveTypesForHr(),
          getLeaveBalance().catch(() => null),
        ]);
        setDetails(init);
        setLeaveTypes(types);
        if (bal?.leave_balance) {
          setBalanceSummary(bal.leave_balance);
        }
      } catch (err) {
        setError("Failed to load leave form data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    setActiveSubmit(false);
    setError(null);

    if (!formData.leave_type) {
      alert("Please select a leave type.");
      setActiveSubmit(true);
      return;
    }
    if (!formData.leaveStartDate || !formData.leaveEndDate || !formData.purpose?.trim()) {
      alert("Leave type, start date, end date, and purpose are required.");
      setActiveSubmit(true);
      return;
    }
    if (formData.leaveEndDate < formData.leaveStartDate) {
      alert("Leave end date must be on or after the start date.");
      setActiveSubmit(true);
      return;
    }
    if (selectedMeta?.requires_address && !formData.addressDuringLeave?.trim()) {
      alert(`${selectedMeta.name} requires an address during leave.`);
      setActiveSubmit(true);
      return;
    }
    if (selectedMeta?.requires_proof && !leavePdfFile) {
      alert(`${selectedMeta.name} requires a supporting document (PDF or image).`);
      setActiveSubmit(true);
      return;
    }

    const finalFormData = new FormData();
    finalFormData.append("name", details.name);
    finalFormData.append("designation", details.last_selected_role);
    const pfRaw = details.pfno;
    if (pfRaw !== undefined && pfRaw !== null && `${pfRaw}`.trim() !== "") {
      const n = Number.parseInt(String(pfRaw).trim(), 10);
      if (Number.isFinite(n)) {
        finalFormData.append("pfNo", String(n));
        finalFormData.append("employeeId", String(n));
      }
    }
    finalFormData.append("departmentInfo", details.department || "");
    finalFormData.append("submissionDate", today);
    finalFormData.append("leave_type", String(formData.leave_type));
    finalFormData.append("leaveStartDate", formData.leaveStartDate);
    finalFormData.append("leaveEndDate", formData.leaveEndDate);
    finalFormData.append("start_half", formData.start_half ? "true" : "false");
    finalFormData.append("end_half", formData.end_half ? "true" : "false");
    finalFormData.append("purposeOfLeave", (formData.purpose || "").slice(0, 40));
    finalFormData.append("leave_info", formData.leave_info || "");
    finalFormData.append("addressDuringLeave", formData.addressDuringLeave || "");
    if (formData.academicResponsibility?.trim()) {
      finalFormData.append(
        "academicResponsibility",
        formData.academicResponsibility.trim(),
      );
    }
    if (formData.addministrativeResponsibiltyAssigned?.trim()) {
      finalFormData.append(
        "addministrativeResponsibiltyAssigned",
        formData.addministrativeResponsibiltyAssigned.trim(),
      );
    }
    if (leavePdfFile) {
      finalFormData.append("leave_pdf_file", leavePdfFile);
    }

    try {
      await submitLeaveForm(finalFormData);
      alert("Leave application submitted. It is sent to your HOD for approval.");
      navigate("/hr/leave/leaverequests");
    } catch (err) {
      const msg =
        typeof err?.message === "string" ? err.message : "Submission failed.";
      setError(msg);
      alert(msg);
    } finally {
      setActiveSubmit(true);
    }
  };

  const typeSelectData = leaveTypes.map((t) => ({
    value: String(t.id),
    label: t.name,
  }));

  return (
    <Box style={{ padding: "25px 30px", margin: "20px 5px" }}>
      <Title order={4} mb="md">
        Leave application
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        Uses the same leave types and day rules as the institute leave module
        (including half-days, proof, and address requirements).
      </Text>

      {loading && <p>Loading...</p>}
      {error && (
        <Alert color="red" mb="md" title="Error">
          {error}
        </Alert>
      )}

      {balanceSummary && (
        <Alert color="blue" mb="md" title="Your HR leave balances (summary)">
          <Text size="xs">
            Casual: {balanceSummary.casual_leave?.balance ?? "—"} &nbsp;|&nbsp;
            Earned: {balanceSummary.earned_leave?.balance ?? "—"} &nbsp;|&nbsp;
            Special casual:{" "}
            {balanceSummary.special_casual_leave?.balance ?? "—"}
          </Text>
        </Alert>
      )}

      <Grid mb="md">
        <Grid.Col span={6}>
          <TextInput label="Name" value={details.name} disabled />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Designation"
            value={details.last_selected_role}
            disabled
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Select
            label="Type of leave"
            placeholder="Select leave type"
            required
            data={typeSelectData}
            value={formData.leave_type || null}
            onChange={(v) =>
              setFormData({ ...formData, leave_type: v || "" })
            }
            searchable
          />
        </Grid.Col>

        {selectedMeta && (
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">
              {selectedMeta.requires_proof ? "Requires supporting document. " : ""}
              {selectedMeta.requires_address ? "Requires address during leave. " : ""}
              Max {selectedMeta.max_in_year ?? "—"} per year (catalog).
            </Text>
          </Grid.Col>
        )}

        <Grid.Col span={6}>
          <TextInput
            label="Leave from"
            type="date"
            required
            value={formData.leaveStartDate}
            onChange={(e) =>
              setFormData({ ...formData, leaveStartDate: e.target.value })
            }
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Leave to"
            type="date"
            required
            value={formData.leaveEndDate}
            onChange={(e) =>
              setFormData({ ...formData, leaveEndDate: e.target.value })
            }
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <Checkbox
            label="Half day at start"
            checked={formData.start_half}
            onChange={(e) =>
              setFormData({ ...formData, start_half: e.currentTarget.checked })
            }
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Checkbox
            label="Half day at end"
            checked={formData.end_half}
            onChange={(e) =>
              setFormData({ ...formData, end_half: e.currentTarget.checked })
            }
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Purpose of leave (max 40 characters)"
            required
            maxLength={40}
            autosize
            minRows={2}
            value={formData.purpose}
            onChange={(e) =>
              setFormData({ ...formData, purpose: e.target.value })
            }
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Additional information (e.g. station leave details)"
            autosize
            minRows={2}
            value={formData.leave_info}
            onChange={(e) =>
              setFormData({ ...formData, leave_info: e.target.value })
            }
          />
        </Grid.Col>

        {selectedMeta?.requires_address && (
          <Grid.Col span={12}>
            <Textarea
              label="Address during leave / out of station address"
              required
              autosize
              minRows={2}
              value={formData.addressDuringLeave}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  addressDuringLeave: e.target.value,
                })
              }
            />
          </Grid.Col>
        )}

        <Grid.Col span={6}>
          <TextInput
            label="Academic responsibility assigned to (optional)"
            value={formData.academicResponsibility}
            onChange={(e) =>
              setFormData({
                ...formData,
                academicResponsibility: e.target.value,
              })
            }
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Administrative responsibility assigned to (optional)"
            value={formData.addministrativeResponsibiltyAssigned}
            onChange={(e) =>
              setFormData({
                ...formData,
                addministrativeResponsibiltyAssigned: e.target.value,
              })
            }
          />
        </Grid.Col>

        {selectedMeta?.requires_proof && (
          <Grid.Col span={12}>
            <FileInput
              label="Supporting document"
              placeholder="Upload file"
              accept="application/pdf,image/*"
              value={leavePdfFile}
              onChange={setLeavePdfFile}
              required
            />
          </Grid.Col>
        )}
      </Grid>

      <Button onClick={handleSubmit} disabled={!activeSubmit}>
        Submit
      </Button>
    </Box>
  );
}

export default LeaveForm;

import React, { useEffect, useState } from "react";
import {
  Button,
  Title,
  Box,
  Grid,
  Text,
  Badge,
  Divider,
  Textarea,
  Group,
  Anchor,
  Table,
} from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, XCircle, PaperPlaneRight } from "@phosphor-icons/react";
import HrBreadcrumbs from "../../components/common/HrBreadcrumbs";
import LoadingComponent from "../../components/common/Loading";
import { EmptyTable } from "../../components/tables/EmptyTable";
import SearchAndSelectUser from "../../components/common/SearchAndSelectUser";
import {
  getLeaveFormById,
  getEmployeeInitials,
  getLeaveBalanceForUser,
  handleLeaveFileAction,
  downloadLeavePdf,
  leaveWorkflowDisplayLabel,
} from "../../services/api";
import {
  buildLeaveTypesAppliedRows,
  buildAllLeaveBalanceRows,
  leaveBalanceDefaultsHint,
} from "../../utils/leaveBalanceDisplay";
// import "./LeaveFileHandle.css";

function LeaveFileHandle() {
  const { id } = useParams();
  const [fetchedformData, setFetchedFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [action, setAction] = useState(null); // "accept", "reject", or "forward"
  const [forwardToUser, setForwardToUser] = useState(null); // Selected user for forwarding
  const [fileRemarks, setFileRemarks] = useState(""); // Remarks for the action
  const [submitting, setSubmitting] = useState(false); // Loading state for submission
  /** ``leave_balance`` object from ``/hr2/leave/balance/?name=`` for the applicant. */
  const [balanceSummary, setBalanceSummary] = useState(null);
  const navigate = useNavigate();

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "Leave", path: "/hr/leave" },
    { title: "Handle Leave", path: `/hr/leave/handle/${id}` },
  ];

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const data = await getLeaveFormById(id);
        // API returns form fields directly (not wrapped in leave_form)
        const raw = data.leave_form || data;

        let applicantBalances = null;
        const uname = raw.created_by_username;
        if (uname) {
          try {
            const bal = await getLeaveBalanceForUser(uname);
            applicantBalances = bal.leave_balance ?? null;
          } catch {
            applicantBalances = null;
          }
        } else if (raw.created_by != null) {
          try {
            const emp = await getEmployeeInitials(raw.created_by);
            const bal = await getLeaveBalanceForUser(emp.username);
            applicantBalances = bal.leave_balance ?? null;
          } catch {
            applicantBalances = null;
          }
        }
        setBalanceSummary(applicantBalances);

        // Map serializer field names to what the UI expects
        setFetchedFormData({
          ...raw,
          name: raw.name || "",
          designation: raw.designation || "",
          pfno: raw.pfNo || raw.pfno || "",
          department: raw.departmentInfo || raw.department || "",
          submissionDate: raw.submissionDate || "",
          leaveStartDate: raw.leaveStartDate || "",
          leaveEndDate: raw.leaveEndDate || "",
          purpose: raw.purposeOfLeave || raw.purpose || "",
          remarks: raw.remarks || "",
          applied_leave_days: raw.applied_leave_days,
          natureOfLeave: raw.natureOfLeave,
          leave_balance_category: raw.leave_balance_category,
          leave_type_name: raw.leave_type_name,
          application_type: raw.application_type || "Online",
          status:
            raw.workflow_status != null && raw.workflow_status !== ""
              ? leaveWorkflowDisplayLabel(raw.workflow_status)
              : raw.approved === true
                ? "Accepted"
                : raw.approved === false
                  ? "Rejected"
                  : "Pending",
          workflow_status: raw.workflow_status || "submitted",
          leaveFormPk: raw.id,
          trackingFileId: raw.file_id || id,
        });
      } catch (err) {
        setError("Failed to fetch form data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id]);

  const handleActionSubmit = async () => {
    if (!action) {
      alert("Please select an action (Accept or Reject).");
      return;
    }

    if (action === "reject" && !fileRemarks.trim()) {
      alert("Remarks are required when rejecting.");
      return;
    }

    const fileTrackingId = fetchedformData?.trackingFileId || id;
    if (!fileTrackingId) {
      alert("Missing file id for this leave; cannot submit action.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await handleLeaveFileAction(fileTrackingId, {
        action,
        remarks: fileRemarks,
      });

      alert(result.detail || result.message || "Action completed successfully.");

      setFetchedFormData((prev) => ({
        ...prev,
        workflow_status: result.workflow_status || prev.workflow_status,
        status:
          result.workflow_status != null && result.workflow_status !== ""
            ? leaveWorkflowDisplayLabel(result.workflow_status)
            : action === "accept"
              ? "Accepted"
              : action === "reject"
                ? "Rejected"
                : prev.status,
      }));
    } catch (err) {
      console.error("Failed to handle leave action:", err);
      alert(err.message || "You are not authorized to perform this action.");
      setError("Failed to handle leave action. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async (event) => {
    event?.preventDefault();

    try {
      const formPk = fetchedformData?.leaveFormPk || fetchedformData?.id;
      if (!formPk) {
        setError("Missing leave form id for PDF download.");
        return;
      }
      const blob = await downloadLeavePdf(formPk);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fetchedformData?.attachedPdfName || "leave.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      setError("Failed to download PDF. Please try again.");
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

  if (!fetchedformData) {
    return (
      <>
        <HrBreadcrumbs items={exampleItems} />
        <EmptyTable message="No leave form data found." />
      </>
    );
  }

  return (
    <>
      <HrBreadcrumbs items={exampleItems} />
      {error && (
        <Text color="red" mb="md">
          {error}
        </Text>
      )}
      {/* Title */}
      <Box
        style={{
          padding: "25px 30px",
          margin: "20px 5px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
        }}
      >
        <Title order={2} style={{ fontWeight: "500", marginBottom: "20px" }}>
          Handle Leave Form
        </Title>

        <Grid>
          {/* Left Column: Status Badge */}

          <Grid.Col span={6}>
            <Text>
              <strong>Status:</strong>{" "}
              <Badge
                color={
                  fetchedformData.status === "Accepted" ||
                  (fetchedformData.workflow_status || "").includes("hr_approved")
                    ? "green"
                    : fetchedformData.status === "Rejected" ||
                        (fetchedformData.workflow_status || "").includes("rejected")
                      ? "red"
                      : "yellow"
                }
              >
                {leaveWorkflowDisplayLabel(fetchedformData.workflow_status) ||
                  fetchedformData.status}
              </Badge>
            </Text>
          </Grid.Col>

          {/* Right Column: Track Status Button */}
          {fetchedformData.academicResponsibilityStatus === "Accepted" &&
            fetchedformData.administrativeResponsibilityStatus ===
              "Accepted" && (
              <Grid.Col
                span={6}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    // Add functionality to track status
                    navigate(
                      `../FormView/leaveform_track/${fetchedformData.trackingFileId || id}`,
                    );
                  }}
                >
                  Track Status
                </Button>
              </Grid.Col>
            )}
        </Grid>
        <br />
        {/* Form Data Display */}
        <Box
          sx={{
            maxWidth: "850px",
            margin: "auto",
            padding: "30px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          {/* Section 1: Employee Details */}
          <Title order={4}>Employee Details</Title>
          <Divider my="sm" />
          <Grid gutter="lg" style={{ padding: "0 20px" }}>
            <Grid.Col span={6}>
              <Text>
                <strong>Name:</strong> {fetchedformData.name}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Designation:</strong> {fetchedformData.designation}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Personal File Number:</strong> {fetchedformData.pfno}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Department:</strong> {fetchedformData.department}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Application Type:</strong>{" "}
                <Badge
                  color={
                    fetchedformData.application_type === "Online"
                      ? "blue"
                      : "green"
                  }
                >
                  {fetchedformData.application_type}
                </Badge>
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Submission Date:</strong>{" "}
                {fetchedformData.submissionDate}
              </Text>
            </Grid.Col>
          </Grid>

          {/* Section 2: Leave Details */}
          <Title order={4} mt="xl">
            Leave Details
          </Title>
          <Divider my="sm" />
          <Grid gutter="lg" style={{ padding: "0 20px" }}>
            <Grid.Col span={6}>
              <Text>
                <strong>Leave Start Date:</strong>{" "}
                {fetchedformData.leaveStartDate}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Leave End Date:</strong> {fetchedformData.leaveEndDate}
              </Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Text>
                <strong>Purpose of Leave:</strong> {fetchedformData.purpose}
              </Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Text>
                <strong>Remarks:</strong> {fetchedformData.remarks}
              </Text>
            </Grid.Col>
          </Grid>
          {/* Section 3: Complete Leave Types and Balances */}
          <Title order={4} mt="xl" style={{ marginTop: "30px" }}>
            Leave Details
          </Title>
          <Divider my="sm" />
          <Grid gutter="xl">
            <Grid.Col
              span={6}
              style={{ borderRight: "1px solid #ccc", paddingRight: "24px" }}
            >
              <Title order={5} mb="sm" style={{ textAlign: "center" }}>
                Leave Types Applied
              </Title>
              <Text size="xs" c="dimmed" mb="xs">
                Days applied use this request&apos;s{" "}
                <strong>applied_leave_days</strong> on the selected leave type (
                {fetchedformData.leave_type_name ||
                  fetchedformData.natureOfLeave ||
                  "—"}
                ).
              </Text>
              <Table>
                <thead>
                  <tr style={{ backgroundColor: "#e9ecef" }}>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ccc",
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      Leave Type
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ccc",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      Days Applied
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {buildLeaveTypesAppliedRows(fetchedformData).map((leave, index) => (
                    <tr
                      key={`applied-${index}`}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#e8e8e8",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          textAlign: "left",
                        }}
                      >
                        {leave.type}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          textAlign: "center",
                          fontWeight: leave.applied > 0 ? "bold" : "normal",
                        }}
                      >
                        {leave.applied || "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Grid.Col>

            <Grid.Col span={6} style={{ paddingLeft: "24px" }}>
              <Title order={5} mb="sm" style={{ textAlign: "center" }}>
                All Leave Balances
              </Title>
              <Text size="xs" c="dimmed" mb="xs">
                {leaveBalanceDefaultsHint}
              </Text>
              <Table>
                <thead>
                  <tr style={{ backgroundColor: "#e9ecef" }}>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ccc",
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      Leave Type
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ccc",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      Balance (Days)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {buildAllLeaveBalanceRows(balanceSummary).map((leave, index) => {
                    const numeric =
                      leave.balance === "—"
                        ? NaN
                        : parseFloat(String(leave.balance).replace(/,/g, ""));
                    const balance = Number.isFinite(numeric) ? numeric : NaN;
                    const isNegative = Number.isFinite(balance) && balance < 0;
                    const isPositive = Number.isFinite(balance) && balance > 0;

                    return (
                      <tr
                        key={`balance-${index}`}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#ffffff" : "#e8e8e8",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            textAlign: "left",
                          }}
                        >
                          {leave.type}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            textAlign: "center",
                            color: isNegative
                              ? "#ff0000"
                              : isPositive
                                ? "#28a745"
                                : "inherit",
                            fontWeight:
                              isNegative || isPositive ? "bold" : "normal",
                          }}
                        >
                          {leave.balance}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Grid.Col>
          </Grid>

          {/* Section 4: Station Leave */}
          {fetchedformData.stationLeave && (
            <>
              <Title order={4} mt="xl" style={{ marginTop: "30px" }}>
                Station Leave Details
              </Title>
              <Divider my="sm" />
              <Grid gutter="lg" style={{ padding: "0 20px" }}>
                <Grid.Col span={6}>
                  <Text>
                    <strong>Station Leave Start Date:</strong>{" "}
                    {fetchedformData.stationLeaveStartDate}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text>
                    <strong>Station Leave End Date:</strong>{" "}
                    {fetchedformData.stationLeaveEndDate}
                  </Text>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text>
                    <strong>Address During Station Leave:</strong>{" "}
                    {fetchedformData.stationLeaveAddress}
                  </Text>
                </Grid.Col>
              </Grid>
            </>
          )}

          {/* Section 5: Responsibility Transfer */}
          <Title order={4} mt="xl" style={{ marginTop: "30px" }}>
            Responsibility Transfer
          </Title>
          <Divider my="sm" />
          {!fetchedformData.academicResponsibility &&
          !fetchedformData.administrativeResponsibility ? (
            <Text style={{ padding: "0 20px" }}>Not Applicable</Text>
          ) : (
            <Grid gutter="lg" style={{ padding: "0 20px" }}>
              {fetchedformData.academicResponsibility && (
                <Grid.Col
                  span={fetchedformData.administrativeResponsibility ? 6 : 12}
                >
                  <Text style={{ marginBottom: "10px" }}>
                    <strong>Academic Responsibility:</strong>{" "}
                    {fetchedformData.academicResponsibility}
                  </Text>
                  <Text style={{ marginBottom: "10px" }}>
                    <strong>Academic Responsibility Designation:</strong>{" "}
                    {fetchedformData.academicResponsibilityDesignation}
                  </Text>
                  <Text style={{ marginBottom: "10px" }}>
                    <strong>Academic Responsibility Status:</strong>{" "}
                    <Badge
                      color={
                        fetchedformData.academicResponsibilityStatus ===
                        "Accepted"
                          ? "green"
                          : fetchedformData.academicResponsibilityStatus ===
                              "Rejected"
                            ? "red"
                            : "yellow"
                      }
                    >
                      {fetchedformData.academicResponsibilityStatus}
                    </Badge>
                  </Text>
                </Grid.Col>
              )}
              {fetchedformData.administrativeResponsibility && (
                <Grid.Col
                  span={fetchedformData.academicResponsibility ? 6 : 12}
                >
                  <Text style={{ marginBottom: "10px" }}>
                    <strong>Administrative Responsibility:</strong>{" "}
                    {fetchedformData.administrativeResponsibility}
                  </Text>
                  <Text style={{ marginBottom: "10px" }}>
                    <strong>Administrative Responsibility Designation:</strong>{" "}
                    {fetchedformData.administrativeResponsibilityDesignation}
                  </Text>
                  <Text style={{ marginBottom: "10px" }}>
                    <strong>Administrative Responsibility Status:</strong>{" "}
                    <Badge
                      color={
                        fetchedformData.administrativeResponsibilityStatus ===
                        "Accepted"
                          ? "green"
                          : fetchedformData.administrativeResponsibilityStatus ===
                              "Rejected"
                            ? "red"
                            : "yellow"
                      }
                    >
                      {fetchedformData.administrativeResponsibilityStatus}
                    </Badge>
                  </Text>
                </Grid.Col>
              )}
            </Grid>
          )}

          {/* Section 6: Attachments */}
          <Title order={4} mt="xl">
            Attachments
          </Title>
          <Divider my="sm" />
          <Grid gutter="lg" style={{ padding: "0 20px" }}>
            <Grid.Col span={6}>
              <Text>
                <strong>Attached PDF:</strong>{" "}
                {fetchedformData.attachedPdfName ? (
                  <Anchor component="button" onClick={handleDownloadPdf}>
                    {fetchedformData.attachedPdfName}
                  </Anchor>
                ) : (
                  "No file attached"
                )}
              </Text>
            </Grid.Col>
          </Grid>
          {/* add note that Please Track status of the file before doing any Actions if you don't have current ownership the Action will not be performed */}

          <Title order={4} mt="xl">
            Select Action
          </Title>
          <Text color="red" mt="md" style={{ padding: "0 20px" }}>
            <strong>Note:</strong> Please track the status of the file before
            performing any actions. If you don't have current ownership, the
            action will not be performed.
          </Text>
          <Divider my="sm" />
          <Group position="center" mt="xl">
            <Button
              leftIcon={<CheckCircle size={20} />}
              onClick={() => setAction("accept")}
              variant={action === "accept" ? "filled" : "outline"}
            >
              Accept
            </Button>
            <Button
              leftIcon={<XCircle size={20} />}
              onClick={() => setAction("reject")}
              variant={action === "reject" ? "filled" : "outline"}
            >
              Reject
            </Button>
          </Group>

          {/* Section 5: File Remarks */}
          <Title order={4} mt="xl">
            File Remarks
          </Title>
          <Divider my="sm" />
          <Textarea
            placeholder="Enter remarks for the action"
            value={fileRemarks}
            onChange={(e) => setFileRemarks(e.target.value)}
            style={{ marginBottom: "20px" }}
          />

          {/* Section 6: Submit Button */}
          <Group position="center" mt="xl">
            <Button
              onClick={handleActionSubmit}
              loading={submitting}
              disabled={!action}
            >
              Submit Action
            </Button>
          </Group>
        </Box>
      </Box>
    </>
  );
}

export default LeaveFileHandle;

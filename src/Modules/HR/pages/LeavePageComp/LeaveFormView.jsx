import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Title,
  Box,
  Grid,
  Text,
  Badge,
  Divider,
  Anchor,
  Table,
} from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import HrBreadcrumbs from "../../components/common/HrBreadcrumbs";
import LoadingComponent from "../../components/common/Loading";
import { EmptyTable } from "../../components/tables/EmptyTable";
import {
  getLeaveFormById,
  downloadLeavePdf,
  leaveWorkflowDisplayLabel,
  getEmployeeInitials,
  getLeaveBalanceForUser,
} from "../../services/api";
import {
  buildLeaveTypesAppliedRows,
  buildAllLeaveBalanceRows,
  leaveBalanceDefaultsHint,
} from "../../utils/leaveBalanceDisplay";
import useFetchData from "../../hooks/useFetchData";
import "../../styles/LeaveFormView.css";

function LeaveFormView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const admin = new URLSearchParams(window.location.search).get("admin");
  const [exampleItems, setExampleItems] = useState([]);
  const [balanceSummary, setBalanceSummary] = useState(null);

  // ✅ FETCH USING HOOK
  const { data, loading } = useFetchData(() => getLeaveFormById(id), [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!data) {
        setBalanceSummary(null);
        return;
      }
      const raw = data.leave_form || data;
      const uname = raw.created_by_username;
      if (uname) {
        try {
          const bal = await getLeaveBalanceForUser(uname);
          if (!cancelled) setBalanceSummary(bal.leave_balance ?? null);
        } catch {
          if (!cancelled) setBalanceSummary(null);
        }
        return;
      }
      if (raw.created_by == null) {
        setBalanceSummary(null);
        return;
      }
      try {
        const emp = await getEmployeeInitials(raw.created_by);
        const bal = await getLeaveBalanceForUser(emp.username);
        if (!cancelled) setBalanceSummary(bal.leave_balance ?? null);
      } catch {
        if (!cancelled) setBalanceSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data]);

  // ✅ Adjust data (handle both wrapped and direct response)
  const fetchedformData = data
    ? (() => {
        const raw = data.leave_form || data;
        return {
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
          status:
            raw.workflow_status != null && raw.workflow_status !== ""
              ? leaveWorkflowDisplayLabel(raw.workflow_status)
              : raw.approved === true
                ? "Accepted"
                : raw.approved === false
                  ? "Rejected"
                  : "Pending",
          file_id: raw.file_id || id,
          academicResponsibilityStatus: raw.academicResponsibility
            ? (raw.academicResponsibilityStatus || "Pending")
            : "Accepted",
          administrativeResponsibilityStatus: raw.addministrativeResponsibiltyAssigned
            ? (raw.administrativeResponsibilityStatus || "Pending")
            : "Accepted",
          applied_leave_days: raw.applied_leave_days,
          natureOfLeave: raw.natureOfLeave,
          leave_balance_category: raw.leave_balance_category,
          leave_type_name: raw.leave_type_name,
          application_type: raw.application_type || "Online",
        };
      })()
    : null;

  const leaveTypesApplied = useMemo(
    () =>
      fetchedformData ? buildLeaveTypesAppliedRows(fetchedformData) : [],
    [fetchedformData],
  );

  const leaveBalances = useMemo(
    () => buildAllLeaveBalanceRows(balanceSummary),
    [balanceSummary],
  );

  useEffect(() => {
    if (admin) {
      setExampleItems([
        { title: "Home", path: "/dashboard" },
        { title: "Human Resources", path: "/hr" },
        { title: "Admin Leave Management", path: "/hr/admin_leave" },
        {
          title: "Leave Requests",
          path: "/hr/admin_leave/review_leave_requests",
        },
        { title: "View Form", path: `/hr/leave/view/${id}?admin=true` },
      ]);
    } else {
      setExampleItems([
        { title: "Home", path: "/dashboard" },
        { title: "Human Resources", path: "/hr" },
        { title: "Leave", path: "/hr/leave" },
        { title: "View Form", path: `/hr/leave/view/${id}` },
      ]);
    }
  }, [admin, id]);

  // ✅ Refactored PDF download
  const handleDownloadPdf = async () => {
    try {
      const formPk = fetchedformData?.id;
      if (!formPk) {
        console.error("Missing leave form id for PDF download.");
        return;
      }
      const blob = await downloadLeavePdf(formPk);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fetchedformData?.attachedPdfName || "file.pdf";
      a.click();
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

  if (!fetchedformData) {
    return (
      <>
        <HrBreadcrumbs items={exampleItems} />
        <EmptyTable message="No view data found." />
      </>
    );
  }

  return (
    <>
      <HrBreadcrumbs items={exampleItems} />
      <Box
        style={{
          padding: "25px 30px",
          margin: "20px 5px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
        }}
      >
        <Title order={2} style={{ fontWeight: "500", marginBottom: "20px" }}>
          Leave Form Details
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <Text>
              <strong>Status:</strong>{" "}
              <Badge
                color={
                  fetchedformData.status === "Accepted"
                    ? "green"
                    : fetchedformData.status === "Rejected"
                      ? "red"
                      : "yellow"
                }
              >
                {fetchedformData.status}
              </Badge>
            </Text>
          </Grid.Col>

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
                    if (admin) {
                      navigate(
                        `../FormView/leaveform_track/${fetchedformData.file_id}?admin=true`,
                      );
                    } else {
                      navigate(
                        `../FormView/leaveform_track/${fetchedformData.file_id}`,
                      );
                    }
                  }}
                >
                  Track Status
                </Button>
              </Grid.Col>
            )}
        </Grid>

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
          {/* Employee Details */}
          <Title order={4} style={{ marginTop: "30px" }}>
            Employee Details
          </Title>
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

          {/* Leave Details */}
          <Title order={4} mt="xl" style={{ marginTop: "30px" }}>
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

          {/* Combined Leave Types and Balances Section */}
          <Title order={4} mt="xl" style={{ marginTop: "30px" }}>
            Leave Type Details
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
                Days shown for the type selected on this form (from{" "}
                <strong>applied_leave_days</strong> on the server). All other
                types are 0 for this request.
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
                  {leaveTypesApplied.map((leave, index) => (
                    <tr
                      key={`applied-${index}`}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#e8e8e8",
                        "&:hover": {
                          backgroundColor: "#f1f3f5",
                        },
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
                Leave Balances
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
                  {leaveBalances.map((leave, index) => {
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
                          "&:hover": {
                            backgroundColor: "#f1f3f5",
                          },
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

          {/* Station Leave */}
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

          {/* Responsibility Transfer - Only show if at least one exists */}
          {(fetchedformData.academicResponsibility ||
            fetchedformData.administrativeResponsibility) && (
            <>
              <Title order={4} mt="xl" style={{ marginTop: "30px" }}>
                Responsibility Transfer
              </Title>
              <Divider my="sm" />
              <Grid gutter="lg" style={{ padding: "0 20px" }}>
                {fetchedformData.academicResponsibility && (
                  <Grid.Col span={6}>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>Academic Responsibility:</strong>{" "}
                      {fetchedformData.academicResponsibility}
                    </Text>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>Designation:</strong>{" "}
                      {fetchedformData.academicResponsibilityDesignation}
                    </Text>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>Status:</strong>{" "}
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
                  <Grid.Col span={6}>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>Administrative Responsibility:</strong>{" "}
                      {fetchedformData.administrativeResponsibility}
                    </Text>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>Designation:</strong>{" "}
                      {fetchedformData.administrativeResponsibilityDesignation}
                    </Text>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>Status:</strong>{" "}
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
            </>
          )}

          {/* Attachments */}
          <Title order={4} mt="xl">
            Attachments
          </Title>
          <Divider my="sm" />
          <Grid gutter="lg" style={{ padding: "0 20px" }}>
            <Grid.Col span={6}>
              <Text>
                <strong>Attached PDF:</strong>{" "}
                {fetchedformData.attachedPdfName ? (
                  <Anchor onClick={handleDownloadPdf} download>
                    {fetchedformData.attachedPdfName}
                  </Anchor>
                ) : (
                  "No file attached"
                )}
              </Text>
            </Grid.Col>
          </Grid>

          {/* Forward Application */}
          {fetchedformData.status === "Pending" &&
            (fetchedformData.academicResponsibilityStatus === "Pending" ||
              fetchedformData.administrativeResponsibilityStatus ===
                "Pending") && (
              <>
                <Title order={4} style={{ marginTop: "30px" }}>
                  Forward Application
                </Title>
                <Divider my="sm" />
                <Grid gutter="lg" style={{ padding: "0 20px" }}>
                  <Grid.Col span={6}>
                    <Text>
                      <strong>Next receiver:</strong>{" "}
                      {fetchedformData.firstRecievedBy}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <strong>Next receiver's Designation:</strong>{" "}
                      {fetchedformData.firstRecievedByDesignation}
                    </Text>
                  </Grid.Col>
                </Grid>
              </>
            )}

          {/* Approval */}
          {fetchedformData.status === "Accepted" &&
            fetchedformData.approvedBy && (
              <>
                <Title order={4} mt="xl">
                  Approval
                </Title>
                <Divider my="sm" />
                <Grid gutter="lg" style={{ padding: "0 20px" }}>
                  <Grid.Col span={6}>
                    <Text>
                      <strong>Approved By:</strong> {fetchedformData.approvedBy}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <strong>Designation:</strong>{" "}
                      {fetchedformData.approvedByDesignation}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <strong>Approved Date:</strong>{" "}
                      {fetchedformData.approvedDate}
                    </Text>
                  </Grid.Col>
                </Grid>
              </>
            )}
        </Box>
      </Box>
    </>
  );
}

export default LeaveFormView;

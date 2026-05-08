import React, { useState, useEffect } from "react";
import {
  Table,
  Paper,
  Switch,
  Button,
  Modal,
  Text,
  Grid,
  Divider,
} from "@mantine/core";
import axios from "axios";
import {
  Fetch_Pending_Request,
  Update_Leave_Status,
} from "../../../routes/otheracademicRoutes/index";
import { mediaRoute } from "../../../routes/globalRoutes/index";

const resolveMediaUrl = (url) =>
  url && url.startsWith("http")
    ? url
    : `${mediaRoute}${String(url).replace(/^\/?media\//, "")}`;

function ApproveLeave() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [status, setStatus] = useState([]);
  const [opened, setOpened] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  // const [loading,setLoading]=useState()
  // const [error,setError]=useState()

  const authToken = localStorage.getItem("authToken");

  const fetchPendingLeaves = async () => {
    try {
      const response = await axios.get(Fetch_Pending_Request, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      // console.log(response);

      setLeaveRequests(response.data);
      // Initialize status for each leave request
      const initialStatus = response.data.map(() => ({
        approveCheck: false,
        rejectCheck: false,
        submitted: false,
      }));
      setStatus(initialStatus);

      // setLoading(false);
    } catch (err) {
      // setError("Error fetching leave requests");
      // setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const handleToggle = (index, stat) => {
    setStatus((prevStatus) =>
      prevStatus.map((item, i) => {
        if (i === index) {
          if (stat.type === "approve") {
            if (stat.value && item.rejectCheck) {
              return { ...item, approveCheck: true, rejectCheck: false };
            }
            return { ...item, approveCheck: stat.value };
          }
          if (stat.value && item.approveCheck) {
            return { ...item, approveCheck: false, rejectCheck: true };
          }
          return { ...item, rejectCheck: stat.value };
        }
        return item;
      }),
    );
  };

  const handleViewForm = (index) => {
    setSelectedStudent(leaveRequests[index]);
    setOpened(true);
  };

  const handleSubmit = async () => {
    const updatedStatus = status.map((entry) => {
      if (entry.approveCheck || entry.rejectCheck) {
        return { ...entry, submitted: true };
      }
      return entry;
    });

    setStatus(updatedStatus);

    const approvedLeaves = leaveRequests.filter(
      (_, index) => status[index]?.approveCheck,
    );
    const rejectedLeaves = leaveRequests.filter(
      (_, index) => status[index]?.rejectCheck,
    );

    console.log("Approved Leaves:", approvedLeaves);
    console.log("Rejected Leaves:", rejectedLeaves);

    // Submit data to the server if required
    try {
      const response = await axios.post(
        Update_Leave_Status,
        {
          approvedLeaves: approvedLeaves.map((leave) => leave.id), // Sending only the ids
          rejectedLeaves: rejectedLeaves.map((leave) => leave.id), // Sending only the ids
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );
      console.log("Status updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating leave status:", error);
    }

    fetchPendingLeaves();
  };

  return (
    <>
      <Paper className="responsive-table-container">
        <div className="table-wrapper" style={{ marginTop: "50px" }}>
          <Table striped highlightOnHover className="status-table">
            <thead>
              <tr>
                <th
                  style={{
                    borderRight: "1px solid white",
                    textAlign: "center",
                  }}
                >
                  Roll No
                </th>
                <th
                  style={{
                    borderRight: "1px solid white",
                    textAlign: "center",
                  }}
                >
                  Student Name
                </th>
                <th
                  style={{
                    borderRight: "1px solid white",
                    textAlign: "center",
                  }}
                >
                  Approve/Reject
                </th>
                <th
                  style={{
                    borderRight: "1px solid white",
                    textAlign: "center",
                  }}
                >
                  View Form
                </th>
                <th style={{ textAlign: "center" }}>Current Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((item, index) => (
                <tr key={index}>
                  <td
                    style={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {item.rollNo}
                  </td>
                  <td
                    style={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {item.name}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      maxWidth: "130px",
                    }}
                  >
                    {!status[index]?.submitted ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-evenly",
                        }}
                      >
                        <Switch
                          label="Approve"
                          checked={status[index]?.approveCheck}
                          onChange={(event) =>
                            handleToggle(index, {
                              type: "approve",
                              value: event.currentTarget.checked,
                            })
                          }
                        />
                        <Switch
                          label="Reject"
                          checked={status[index]?.rejectCheck}
                          onChange={(event) =>
                            handleToggle(index, {
                              type: "reject",
                              value: event.currentTarget.checked,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <Text>
                        {status[index]?.approveCheck
                          ? "Approved"
                          : status[index]?.rejectCheck
                            ? "Rejected"
                            : ""}
                      </Text>
                    )}
                  </td>
                  <td
                    style={{ border: "1px solid black", textAlign: "center" }}
                  >
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: "blue",
                      }}
                      onClick={() => handleViewForm(index)}
                    >
                      View Form
                    </button>
                  </td>
                  <td
                    style={{
                      color: `${
                        status[index]?.approveCheck
                          ? "green"
                          : status[index]?.rejectCheck
                            ? "red"
                            : "orange"
                      }`,
                      border: "1px solid black",
                      textAlign: "center",
                    }}
                  >
                    {status[index]?.approveCheck
                      ? "Approved"
                      : status[index]?.rejectCheck
                        ? "Rejected"
                        : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <center>
          <Button onClick={handleSubmit} mt="md">
            Submit
          </Button>
        </center>
      </Paper>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Text style={{ fontSize: "25px", fontWeight: 700 }}>
            Leave Form Details
          </Text>
        }
        centered
        overlaycolor="rgba(0, 0, 0, 0.6)"
        overlayblur={3}
        size="lg"
      >
        {selectedStudent && (
          <Paper
            withBorder
            radius="md"
            p="md"
            shadow="sm"
            style={{ background: "#fafafa" }}
          >
            <Text style={{ fontSize: "18px", fontWeight: 700 }}>
              {selectedStudent.name || "Student"}
            </Text>
            <Text size="sm" c="dimmed">
              Roll No: {selectedStudent.rollNo || "N/A"}
            </Text>

            <Divider my="sm" />

            <Grid gutter="sm">
              {[
                ["Date From", selectedStudent.details.dateFrom],
                ["Date To", selectedStudent.details.dateTo],
                ["Leave Type", selectedStudent.details.leaveType],
                ["Semester", selectedStudent.details.semester],
                ["Academic Year", selectedStudent.details.academicYear],
                ["Mobile Number", selectedStudent.details.mobileNumber],
                [
                  "Parents' Mobile Number",
                  selectedStudent.details.parentsMobile,
                ],
                [
                  "Mobile During Leave",
                  selectedStudent.details.mobileDuringLeave,
                ],
                ["HOD Credential", selectedStudent.details.hodCredential],
              ].map(([label, value]) => (
                <Grid.Col span={{ base: 12, sm: 6 }} key={label}>
                  <div
                    style={{
                      background: "white",
                      border: "1px solid #e9ecef",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      minHeight: "70px",
                    }}
                  >
                    <Text size="xs" c="dimmed" style={{ marginBottom: "4px" }}>
                      {label}
                    </Text>
                    <Text fw={600}>{value || "N/A"}</Text>
                  </div>
                </Grid.Col>
              ))}

              <Grid.Col span={12}>
                <div
                  style={{
                    background: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "12px",
                    padding: "12px 14px",
                  }}
                >
                  <Text size="xs" c="dimmed" style={{ marginBottom: "4px" }}>
                    Address
                  </Text>
                  <Text fw={600}>
                    {selectedStudent.details.address || "N/A"}
                  </Text>
                </div>
              </Grid.Col>

              <Grid.Col span={12}>
                <div
                  style={{
                    background: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "12px",
                    padding: "12px 14px",
                  }}
                >
                  <Text size="xs" c="dimmed" style={{ marginBottom: "4px" }}>
                    Purpose
                  </Text>
                  <Text fw={600}>
                    {selectedStudent.details.purpose || "N/A"}
                  </Text>
                </div>
              </Grid.Col>

              <Grid.Col span={12}>
                <div
                  style={{
                    background: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "12px",
                    padding: "12px 14px",
                  }}
                >
                  <Text size="xs" c="dimmed" style={{ marginBottom: "4px" }}>
                    Supporting Document
                  </Text>
                  <Text fw={600}>
                    {selectedStudent.form ? (
                      <a
                        href={resolveMediaUrl(selectedStudent.form)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </Text>
                </div>
              </Grid.Col>

              <Grid.Col span={12}>
                <div
                  style={{
                    background: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "12px",
                    padding: "12px 14px",
                  }}
                >
                  <Text size="xs" c="dimmed" style={{ marginBottom: "4px" }}>
                    Date of Application
                  </Text>
                  <Text fw={600}>
                    {selectedStudent.details.dateOfApplication || "N/A"}
                  </Text>
                </div>
              </Grid.Col>
            </Grid>
          </Paper>
        )}
      </Modal>
    </>
  );
}

export default ApproveLeave;

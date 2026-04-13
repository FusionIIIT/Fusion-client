import React, { useState, useEffect } from "react";
import { Table, Paper, Switch, Button, Modal, Text, Textarea, Group } from "@mantine/core";
import axios from "axios";
import {
  Fetch_Pending_Bonafide_Request,
  Update_Bonafide_Status,
} from "../../../routes/otheracademicRoutes/index"; // Adjust API paths if needed

function ApproveBonafide() {
  const [bonafideRequests, setBonafideRequests] = useState([]);
  const [status, setStatus] = useState([]);
  const [opened, setOpened] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [remarksOpened, setRemarksOpened] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [remarksAction, setRemarksAction] = useState(null); // "approve" or "reject"

  const authToken = localStorage.getItem("authToken");

  const fetchPendingBonafides = async () => {
    try {
      const response = await axios.get(Fetch_Pending_Bonafide_Request, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      setBonafideRequests(response.data);

      // Initialize status for each Bonafide request
      const initialStatus = response.data.map(() => ({
        approveCheck: false,
        rejectCheck: false,
        submitted: false,
      }));
      setStatus(initialStatus);
    } catch (err) {
      console.error("Error fetching Bonafide requests", err);
    }
  };

  useEffect(() => {
    fetchPendingBonafides();
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
    setSelectedStudent(bonafideRequests[index]);
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

    const approvedBonafides = bonafideRequests.filter(
      (_, index) => status[index]?.approveCheck,
    );
    const rejectedBonafides = bonafideRequests.filter(
      (_, index) => status[index]?.rejectCheck,
    );

    // Submit data to the server if required
    try {
      const response = await axios.post(
        Update_Bonafide_Status,
        {
          approvedRequests: approvedBonafides.map((bonafide) => bonafide.id),
          rejectedRequests: rejectedBonafides.map((bonafide) => bonafide.id),
          remarks: rejectionRemarks, // Include rejection remarks
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );
      console.log("Status updated successfully:", response.data);
      setRejectionRemarks(""); // Clear remarks after submission
    } catch (error) {
      console.error("Error updating Bonafide status:", error);
    }

    fetchPendingBonafides();
  };

  const handleRejectClick = (index) => {
    if (!status[index]?.rejectCheck) {
      setStatus((prevStatus) =>
        prevStatus.map((item, i) => {
          if (i === index) {
            return { ...item, rejectCheck: true, approveCheck: false };
          }
          return item;
        }),
      );
    }
    // Open remarks modal for rejection
    setSelectedIndex(index);
    setRemarksAction("reject");
    setRemarksOpened(true);
  };

  const handleApproveClick = (index) => {
    if (!status[index]?.approveCheck) {
      setStatus((prevStatus) =>
        prevStatus.map((item, i) => {
          if (i === index) {
            return { ...item, approveCheck: true, rejectCheck: false };
          }
          return item;
        }),
      );
    }
  };

  const handleRemarksSubmit = () => {
    // Remarks are stored in rejectionRemarks state
    setRemarksOpened(false);
    // The remarks will be sent with handleSubmit
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
              {bonafideRequests.map((item, index) => (
                <tr key={index}>
                  <td
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      minWidth: "100px",
                    }}
                  >
                    {item.rollNo}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      minWidth: "140px",
                    }}
                  >
                    {item.name}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      minWidth: "245px",
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
                          onChange={(event) => {
                            handleToggle(index, {
                              type: "reject",
                              value: event.currentTarget.checked,
                            });
                            if (event.currentTarget.checked) {
                              handleRejectClick(index);
                            }
                          }}
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
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      minWidth: "100px",
                    }}
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
                      minWidth: "100px",
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
        opened={remarksOpened}
        onClose={() => setRemarksOpened(false)}
        title={<Text style={{ fontSize: "20px" }}>Rejection Remarks</Text>}
        centered
        size="md"
      >
        <Textarea
          placeholder="Enter remarks for rejection..."
          label="Remarks (Optional)"
          minRows={4}
          value={rejectionRemarks}
          onChange={(e) => setRejectionRemarks(e.currentTarget.value)}
        />
        <Group position="right" mt="md">
          <Button variant="light" onClick={() => setRemarksOpened(false)}>
            Cancel
          </Button>
          <Button onClick={handleRemarksSubmit}>
            Confirm
          </Button>
        </Group>
      </Modal>
    </>
  );
}

export default ApproveBonafide;

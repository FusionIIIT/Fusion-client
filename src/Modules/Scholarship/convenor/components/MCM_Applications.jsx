/* eslint-disable react/jsx-pascal-case */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from "react";
import { Table, Button } from "@mantine/core";
import axios from "axios";
import styles from "./MCM_applications.module.css";
import Medal_applications from "./medal_applications";

function MCMApplications() {
  const [activeTab, setActiveTab] = useState("MCM");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://127.0.0.1:8000/spacs/scholarship-details/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setApplications(data); // Assuming data is an array of application objects
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch scholarship details:", error);
      setLoading(false);
    }
  };
  // Fetch scholarship details from the API
  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle MCM status update
  const handleApproval = async (id, action) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.log("No authorization token found in localStorage.");
        return;
      }

      const apiUrl = "http://127.0.0.1:8000/spacs/mcm/status-update/";
      const payload = {
        id,
        status:
          action === "approved"
            ? "ACCEPTED"
            : action === "rejected"
              ? "REJECTED"
              : "UNDER_REVIEW",
      };

      console.log("Sending payload:", payload);

      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert("Status updated successfully");
        console.log("Status updated successfully");
        fetchApplications(); // Refresh application list
      } else {
        console.error("Error updating status:", response);
      }
    } catch (error) {
      console.error("Error updating status:", error.response || error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.whiteBox}>
        <div className={styles.tabs}>
          <div
            role="button"
            tabIndex={0}
            className={activeTab === "MCM" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("MCM")}
            style={{
              borderBottom: activeTab === "MCM" ? "4px solid #1e90ff" : "none",
              color: activeTab === "MCM" ? "#1e90ff" : "#000",
            }}
          >
            Merit-cum-Means Scholarship
          </div>

          <div
            role="button"
            tabIndex={0}
            className={activeTab === "Medals" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("Medals")}
            style={{
              borderBottom:
                activeTab === "Medals" ? "4px solid #1e90ff" : "none",
              color: activeTab === "Medals" ? "#1e90ff" : "#000",
            }}
          >
            Convocation Medals
          </div>
        </div>

        {activeTab === "MCM" && (
          <>
            <h2>Merit-cum-Means Scholarship</h2>
            {loading ? (
              <p>Loading applications...</p>
            ) : (
              <div className={styles.tableWrapper}>
                <Table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Income</th>
                      <th>File</th>
                      <th>Accept</th>
                      <th>Reject</th>
                      <th>Under Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(
                      (app, index) =>
                        app.status !== "REJECTED" && (
                          <tr key={index}>
                            <td>{app.student}</td>
                            <td>{app.annual_income}</td>
                            <td>
                              <Button color="blue">Files</Button>
                            </td>
                            <td>
                              <Button
                                color="green"
                                onClick={() =>
                                  handleApproval(app.id, "approved")
                                }
                              >
                                Accept
                              </Button>
                            </td>
                            <td>
                              <Button
                                color="red"
                                onClick={() =>
                                  handleApproval(app.id, "rejected")
                                }
                              >
                                Reject
                              </Button>
                            </td>
                            <td>
                              <Button
                                color="gray"
                                onClick={() =>
                                  handleApproval(app.id, "under_review")
                                }
                              >
                                Under Review
                              </Button>
                            </td>
                          </tr>
                        ),
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        )}

        {activeTab === "Medals" && <Medal_applications />}
      </div>
    </div>
  );
}

export default MCMApplications;

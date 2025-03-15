/* eslint-disable react/jsx-pascal-case */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from "react";
import { Table, Button } from "@mantine/core";
import styles from "./MCM_applications.module.css";
import Medal_applications from "./medal_applications";

function MCMApplications() {
  const [activeTab, setActiveTab] = useState("MCM");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch scholarship details from the API
  useEffect(() => {
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

    fetchApplications();
  }, []);

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
                    {applications.map((app, index) => (
                      <tr key={index}>
                        <td>{app.student}</td>
                        <td>{app.annual_income}</td>
                        <td>
                          <Button color="blue">Files</Button>
                        </td>
                        <td>
                          <Button color="green">Accept</Button>
                        </td>
                        <td>
                          <Button color="red">Reject</Button>
                        </td>
                        <td>
                          <Button color="grey">Under Review</Button>
                        </td>
                      </tr>
                    ))}
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

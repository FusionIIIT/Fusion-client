/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./medal_applications.module.css"; // Ensure this file is present with correct styles

function MedalApplications() {
  const [selectedAward, setSelectedAward] = useState("Director's Silver Medal");
  const [medals, setMedals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch medals data based on the selected award
  const fetchMedalsData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.log("No authorization token found in localStorage.");
        setError("No authorization token found.");
        setIsLoading(false);
        return;
      }

      let apiUrl = "";
      // Select the API based on the selected award
      if (selectedAward === "Director's Silver Medal") {
        apiUrl = "http://127.0.0.1:8000/spacs/director-silver/";
      } else if (selectedAward === "Director's Gold Medal") {
        apiUrl = "http://127.0.0.1:8000/spacs/director_gold_list/";
      } else if (selectedAward === "D&M Proficiency Gold Medal") {
        apiUrl = "http://127.0.0.1:8000/spacs/dm-proficiency-list/";
      }

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        const incompleteMedals = response.data.filter(
          (medal) => medal.status === "INCOMPLETE",
        );
        setMedals(incompleteMedals);
      } else {
        setError("No data received from the API.");
      }

      setIsLoading(false);
      // eslint-disable-next-line no-shadow
    } catch (error) {
      console.error("Error fetching medals data:", error);
      setError("Error fetching medals data.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedalsData();
  }, [selectedAward]);

  const handleApproval = async (medalId, action) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.log("No authorization token found in localStorage.");
        setError("No authorization token found.");
        return;
      }

      let apiUrl = "";
      let payload = {};

      if (selectedAward === "Director's Gold Medal") {
        apiUrl = "http://127.0.0.1:8000/spacs/director-gold/accept-reject/";
        // For Gold Medal, send "accept" or "reject" as action
        payload = {
          id: medalId,
          action: action === "approved" ? "accept" : "reject", // Ensure it's 'accept' or 'reject'
        };
      } else if (selectedAward === "Director's Silver Medal") {
        apiUrl = "http://127.0.0.1:8000/spacs/api/director_silver/decision/";
        // For Silver Medal, send 'ACCEPTED' or 'REJECTED'
        payload = {
          id: medalId,
          status: action === "approved" ? "ACCEPTED" : "REJECTED",
        };
      } else if (selectedAward === "D&M Proficiency Gold Medal") {
        apiUrl = "http://127.0.0.1:8000/spacs/api/dm-proficiency/decsion/";
        payload = {
          id: medalId,
          status: action === "approved" ? "ACCEPTED" : "REJECTED",
        };
      }

      console.log("Sending payload:", payload); // Log payload for debugging

      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        fetchMedalsData(); // Refresh the list of medals
        setError(null);
      } else {
        setError("Error updating status.");
      }
      // eslint-disable-next-line no-shadow
    } catch (error) {
      console.error("Error updating status:", error.response || error.message);
      setError(
        `Error updating status: ${error.response ? error.response.data : error.message}`,
      );
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Medal Applications</h2>

      <div className={styles.awardSelector}>
        <label htmlFor="award-select">Select Award:</label>
        <select
          id="award-select"
          value={selectedAward}
          onChange={(e) => setSelectedAward(e.target.value)}
          className={styles.select}
        >
          <option value="Director's Silver Medal">
            Director's Silver Medal
          </option>
          <option value="Director's Gold Medal">Director's Gold Medal</option>
          <option value="D&M Proficiency Gold Medal">
            D&M Proficiency Gold Medal
          </option>
        </select>
      </div>

      {isLoading && <p>Loading medals...</p>}

      {!isLoading && !error && medals.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Award</th>
              <th>File</th>
              <th>Accept</th>
              <th>Reject</th>
            </tr>
          </thead>
          <tbody>
            {medals.map((medal, index) => (
              <tr key={index}>
                <td>{medal.student}</td>
                <td>{selectedAward}</td>
                <td>
                  <button
                    className={`${styles.button} ${styles.fileButton}`}
                    // eslint-disable-next-line no-undef
                    onClick={() => handleView(medal.id)}
                  >
                    View
                  </button>
                </td>
                <td>
                  <button
                    className={`${styles.button} ${styles.acceptButton}`}
                    onClick={() => handleApproval(medal.id, "approved")}
                  >
                    Approve
                  </button>
                </td>
                <td>
                  <button
                    className={`${styles.button} ${styles.rejectButton}`}
                    onClick={() => handleApproval(medal.id, "rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!isLoading && !error && medals.length === 0 && <p>No medals found.</p>}
    </div>
  );
}

export default MedalApplications;

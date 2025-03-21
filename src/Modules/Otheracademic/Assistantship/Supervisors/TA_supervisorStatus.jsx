import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Paper, Loader } from "@mantine/core";
import axios from "axios";
import { Get_Assistantship_Status } from "../../../../routes/otheracademicRoutes/index";

function AssistantshipStatus() {
  const roll = useSelector((state) => state.user.roll_no);
  const name = useSelector((state) => state.user.username);
  const authToken = localStorage.getItem("authToken");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssistantshipStatus = async () => {
      try {
        const response = await axios.post(
          Get_Assistantship_Status,
          { roll_no: roll, username: name },
          { headers: { Authorization: `Token ${authToken}` } },
        );
        console.log("API Response:", response.data); // Log response data

        setData(
          response.data.map((item) => {
            let status = "Pending";
            if (item.Acad_rejected) status = "Rejected by Academic Admin";
            else if (item.HOD_rejected) status = "Rejected by HOD";
            else if (item.TA_rejected) status = "Rejected by TA Supervisor";
            else if (item.Acad_approved) status = "Approved";

            return {
              ...item,
              status,
            };
          }),
        );
      } catch (err) {
        setError("Failed to fetch Assistantship requests. Please try again.");
        console.error("Error fetching assistantship status:", err);
      } finally {
        setLoading(false);
      }
    };

    if (roll && name) {
      fetchAssistantshipStatus();
    }
  }, [roll, name]);

  if (loading) {
    return (
      <div className="loader-container">
        <Loader color="blue" size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <Paper className="status-paper">
      <div className="table-wrapper">
        <Table striped highlightOnHover className="status-table">
          <thead>
            <tr>
              <th>Date Applied</th>
              <th>Applicability</th>
              <th>TA Supervisor</th>
              <th>Thesis Supervisor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.dateApplied}</td>
                <td>{item.applicability}</td>
                <td>{item.ta_supervisor}</td>
                <td>{item.thesis_supervisor}</td>
                <td
                  className={`status-${item.status.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Paper>
  );
}

export default AssistantshipStatus;

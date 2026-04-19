import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Paper, Button, Loader } from "@mantine/core";
import axios from "axios"; // Import axios for API requests
import {
  Get_PG_Leave_Requests,
  Withdraw_PG_Leave,
} from "../../../routes/otheracademicRoutes/index";

function LeavePGStatus() {
  // Get roll_no and username from Redux state
  const roll = useSelector((state) => state.user.roll_no);
  const name = useSelector((state) => state.user.username);

  const authToken = localStorage.getItem("authToken");

  const [data, setData] = useState([]); // State to store fetched leave requests
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(Get_PG_Leave_Requests, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
        params: {
          roll_no: roll,
          username: name,
        },
      });

      setData(response.data.reverse());
    } catch (err) {
      setError("Failed to fetch PG leave requests. Please try again.");
      console.error("Error fetching leave requests!", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (leaveId) => {
    try {
      await axios.post(
        `${Withdraw_PG_Leave}${leaveId}/`,
        {},
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );
      await fetchLeaveRequests();
    } catch (err) {
      console.error("Error withdrawing PG leave request!", err);
    }
  };

  useEffect(() => {
    if (roll && name) {
      fetchLeaveRequests(); // Fetch leave requests if roll_no and username are available
    }
  }, [roll, name]); // Re-run effect if roll_no or username changes

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
              <th>Date From</th>
              <th>Date To</th>
              <th>Leave Type</th>
              <th>Attachment</th>
              <th>Date Applied</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.dateFrom}</td>
                <td>{item.dateTo}</td>
                <td>{item.leaveType}</td>
                <td>
                  {item.attachment ? (
                    <a href={item.attachment} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{item.dateApplied}</td>
                <td>{item.purpose}</td>
                <td className={`status-${String(item.action).toLowerCase()}`}>
                  {item.action}
                </td>
                <td>
                  {item.canWithdraw ? (
                    <Button
                      color="red"
                      size="xs"
                      variant="outline"
                      onClick={() => handleWithdraw(item.id)}
                    >
                      Withdraw
                    </Button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Paper>
  );
}

export default LeavePGStatus;

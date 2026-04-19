import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Paper, Loader, Button } from "@mantine/core";
import axios from "axios";
import {
  Get_Assistantship_Status,
  Withdraw_Assistantship,
} from "../../../../routes/otheracademicRoutes/index";

function AssistantshipStatus() {
  const roll = useSelector((state) => state.user.roll_no);
  const name = useSelector((state) => state.user.username);
  const authToken = localStorage.getItem("authToken");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    if (!roll || !name || !authToken) return;

    const fetchAssistantshipStatus = async () => {
      try {
        const response = await axios.post(
          Get_Assistantship_Status,
          { roll_no: roll, username: name },
          { headers: { Authorization: `Token ${authToken}` } },
        );
        console.log("API Response:", response.data);
        setData(response.data.reverse());
      } catch (err) {
        setError("Failed to fetch Assistantship requests. Please try again.");
        console.error("Error fetching assistantship status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssistantshipStatus();
  }, [roll, name, authToken]);

  if (loading)
    return (
      <div className="loader-container">
        <Loader color="blue" size="lg" />
      </div>
    );

  if (error) return <div className="error-message">{error}</div>;

  const handleWithdraw = async (formId) => {
    setWithdrawingId(formId);
    try {
      await axios.post(
        `${Withdraw_Assistantship}${formId}/`,
        {},
        { headers: { Authorization: `Token ${authToken}` } },
      );
      setData((prev) => prev.filter((item) => item.id !== formId));
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        "Failed to withdraw assistantship form. Please try again.";
      setError(message);
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <Paper className="status-paper">
      <div className="table-wrapper">
        <Table striped highlightOnHover className="status-table">
          <thead>
            <tr>
              <th>Date Applied</th>
              <th>Faculty Supervisor</th>
              <th>Department Admin</th>
              <th>HOD</th>
              <th>Acad Admin Audit</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.dateApplied || "N/A"}</td>
                <td>{item.approvalStages.Faculty_Supervisor}</td>
                <td>{item.approvalStages.Department_Admin}</td>
                <td>{item.approvalStages.HOD}</td>
                <td>{item.approvalStages.Acad_Admin_Audit}</td>
                <td className={`status-${item.status.toLowerCase()}`}>
                  {item.status}
                </td>
                <td>
                  {item.canWithdraw ? (
                    <Button
                      size="xs"
                      color="red"
                      variant="outline"
                      loading={withdrawingId === item.id}
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

export default AssistantshipStatus;

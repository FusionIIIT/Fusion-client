import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Paper, Loader, Button } from "@mantine/core";
import axios from "axios";
import {
  Get_Bonafide_Status,
  Withdraw_Bonafide,
} from "../../../routes/otheracademicRoutes/index";
import "./BonafideFormStatus.css";

function BonafideFormStatus() {
  const roll = useSelector((state) => state.user.roll_no);
  const name = useSelector((state) => state.user.username);
  const authToken = localStorage.getItem("authToken");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    const fetchBonafideStatus = async () => {
      try {
        const response = await axios.post(
          Get_Bonafide_Status,
          { roll_no: roll, username: name },
          { headers: { Authorization: `Token ${authToken}` } },
        );

        // Reverse the order of data to show the most recent first
        setData(response.data.reverse());
      } catch (err) {
        setError("Failed to fetch Bonafide requests. Please try again.");
        console.error("Error fetching bonafide status:", err);
      } finally {
        setLoading(false);
      }
    };

    if (roll && name) {
      fetchBonafideStatus();
    }
  }, [roll, name]);

  const handleWithdraw = async (id) => {
    setError("");
    setWithdrawingId(id);
    try {
      await axios.post(
        `${Withdraw_Bonafide}${id}/`,
        {},
        { headers: { Authorization: `Token ${authToken}` } },
      );
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        "Failed to withdraw bonafide request. Please try again.";
      setError(message);
    } finally {
      setWithdrawingId(null);
    }
  };

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
              <th>Semester</th>
              <th>Purpose</th>
              <th>Date Applied</th>
              <th>Status</th>
              <th>Certificate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.semester}</td>
                <td>{item.purpose}</td>
                <td>{item.dateApplied}</td>
                <td className={`status-${item.status.toLowerCase()}`}>
                  {item.status}
                </td>
                <td>
                  {item.status === "Approved" && item.downloadUrl ? (
                    <a href={item.downloadUrl} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  ) : (
                    "-"
                  )}
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

export default BonafideFormStatus;

import React, { useState, useEffect } from "react";
import { Title, Select, TextInput, Alert, Divider } from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { Eye } from "@phosphor-icons/react";
import LoadingComponent from "../../components/common/Loading";
import { EmptyTable } from "../../components/tables/EmptyTable";
import SearchEmployee from "../../components/common/SearchEmployee";
import HrBreadcrumbs from "../../components/common/HrBreadcrumbs";
import { getAdminLeaveRequests } from "../../services/api";
import "../../styles/LeaveRequests.css";

function AdminLeaveRequests() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestData, setRequestData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchParams] = useSearchParams();
  const [accessError, setAccessError] = useState(null);
  const [autoSearchCompleted, setAutoSearchCompleted] = useState(false);

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "Admin Leave Management", path: "/hr/admin_leave" },
    { title: "Leave Requests", path: "/hr/admin_leave/review_leave_requests" },
  ];

  useEffect(() => {
    const empUsername = searchParams.get("emp");
    if (empUsername && !autoSearchCompleted) {
      setAccessError(null);
    }
  }, [searchParams, autoSearchCompleted]);

  // ✅ REFACTORED API CALL
  useEffect(() => {
    if (!selectedUser) return;

    const fetchLeaveRequests = async () => {
      setLoading(true);
      setAccessError(null);

      try {
        const data = await getAdminLeaveRequests(selectedUser.id, selectedDate);

        const sortedData =
          data.leave_requests?.sort(
            (a, b) => new Date(b.submissionDate) - new Date(a.submissionDate),
          ) || [];

        setRequestData(sortedData);
        setFilteredData(sortedData);
      } catch (error) {
        if (error.message === "403") {
          setAccessError(
            "You do not have access to this employee's leave requests",
          );
        } else {
          console.error("Failed to fetch leave requests:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [selectedUser, selectedDate]);

  const handleViewClick = (view) => {
    window.open(`../leave/view/${view}?admin=true`, "_blank");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFD700";
      case "Accepted":
        return "#32CD32";
      case "Rejected":
        return "#FF0000";
      default:
        return "#333";
    }
  };

  const handleStatusFilterChange = (value) => {
    setSelectedStatus(value);
    if (value === "All") {
      setFilteredData(requestData);
    } else {
      setFilteredData(requestData.filter((item) => item.status === value));
    }
  };

  const handleDateFilterChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleSearchError = (error) => {
    if (error.includes("403") || error.includes("access")) {
      setAccessError("You do not have access to this page");
    } else {
      setAccessError(error);
    }
    setAutoSearchCompleted(true);
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedUser(employee);
    setAccessError(null);
    setAutoSearchCompleted(true);
  };

  const headers = [
    "ID",
    "Submission Date",
    "Status",
    "Leave Start Date",
    "Leave End Date",
    "View",
  ];

  return (
    <div className="app-container">
      <HrBreadcrumbs items={exampleItems} />
      <Title order={2} style={{ marginTop: "40px", marginLeft: "15px" }}>
        Admin Leave Requests
      </Title>

      {accessError && (
        <Alert title="Access Error" color="red" style={{ margin: "20px 15px" }}>
          {accessError}
        </Alert>
      )}

      <div
        style={{
          margin: "20px 15px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <SearchEmployee
          onEmployeeSelect={handleEmployeeSelect}
          initialSearch={searchParams.get("emp") || ""}
          onSearchError={handleSearchError}
          disabled={loading}
        />

        {selectedUser && !accessError && (
          <Title order={4}>
            Selected Employee:{" "}
            <span style={{ fontWeight: 500 }}>{selectedUser.username}</span>
          </Title>
        )}
      </div>

      <Divider my="sm" />

      {selectedUser && !accessError && (
        <div
          style={{
            margin: "20px 15px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            <TextInput
              label="Filter by Date"
              type="date"
              value={selectedDate}
              onChange={handleDateFilterChange}
            />
            <Select
              label="Filter by Status"
              value={selectedStatus}
              onChange={handleStatusFilterChange}
              data={[
                { value: "All", label: "All" },
                { value: "Pending", label: "Pending" },
                { value: "Accepted", label: "Accepted" },
                { value: "Rejected", label: "Rejected" },
              ]}
            />
          </div>
        </div>
      )}

      {selectedUser &&
        !accessError &&
        (loading ? (
          <LoadingComponent />
        ) : filteredData.length === 0 ? (
          <EmptyTable message="No Leave Requests Found" />
        ) : (
          <div className="form-table-container">
            <table className="form-table">
              <thead>
                <tr>
                  {headers.map((header, i) => (
                    <th key={i}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => (
                  <tr key={i} onClick={() => handleViewClick(item.id)}>
                    <td>{item.id}</td>
                    <td>{item.submissionDate}</td>
                    <td style={{ color: getStatusColor(item.status) }}>
                      {item.status}
                    </td>
                    <td>{item.leaveStartDate}</td>
                    <td>{item.leaveEndDate}</td>
                    <td>
                      <Eye size={20} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}

export default AdminLeaveRequests;

import React, { useState, useEffect } from "react";
import { Title, Select, TextInput, Container, Loader } from "@mantine/core";
import { Eye } from "@phosphor-icons/react";
import LoadingComponent from "../../components/Loading";
import { EmptyTable } from "../../components/tables/EmptyTable";
import SearchEmployee from "../../components/SearchEmployee";
import HrBreadcrumbs from "../../components/HrBreadcrumbs";
import "./LeaveRequests.css";
import { admin_get_leave_requests } from "../../../../routes/hr";

function AdminLeaveRequests() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestData, setRequestData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "Admin Leave Management", path: "/hr/admin_leave" },
    { title: "Leave Requests", path: "/hr/admin_leave/review_leave_requests" },
  ];

  // Fetch leave requests for the selected user
  useEffect(() => {
    if (!selectedUser) return;

    const fetchLeaveRequests = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found!");
        return;
      }
      try {
        const queryParams = new URLSearchParams();
        if (selectedDate) {
          queryParams.append("date", selectedDate);
        }

        const response = await fetch(
          `${admin_get_leave_requests}/${selectedUser.id}?${queryParams.toString()}`,
          {
            headers: { Authorization: `Token ${token}` },
          },
        );
        const data = await response.json();

        // Sort the data by submissionDate in descending order (latest first)
        const sortedData = data.leave_requests.sort((a, b) => {
          return new Date(b.submissionDate) - new Date(a.submissionDate);
        });

        setRequestData(sortedData); // Set fetched and sorted data
        setFilteredData(sortedData); // Initialize filtered data
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch leave requests:", error);
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, [selectedUser, selectedDate]);

  // Handle "View" button click
  const handleViewClick = (view) => {
    window.open(`../leave/view/${view}?admin=true`, "_blank");
  };

  // Function to determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFD700"; // Yellow
      case "Accepted":
        return "#32CD32"; // Green
      case "Rejected":
        return "#FF0000"; // Red
      default:
        return "#333"; // Default color
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setSelectedStatus(value);
    if (value === "All") {
      setFilteredData(requestData); // Show all data
    } else {
      const filtered = requestData.filter((item) => item.status === value);
      setFilteredData(filtered); // Filter by status
    }
  };

  // Handle date filter change
  const handleDateFilterChange = (event) => {
    setSelectedDate(event.target.value);
  };

  // Table headers
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
      <Title
        order={2}
        style={{ fontWeight: "500", marginTop: "40px", marginLeft: "15px" }}
      >
        Admin Leave Requests
      </Title>

      {/* Search and Select Employee */}
      <div style={{ margin: "20px 15px" }}>
        <SearchEmployee
          onEmployeeSelect={(employee) => setSelectedUser(employee)}
        />
      </div>

      {/* Filter Section (only visible if a user is selected) */}
      {selectedUser && (
        <div style={{ margin: "20px 15px", display: "flex", gap: "20px" }}>
          <TextInput
            label="Filter by Date"
            placeholder="Select or enter a date"
            type="date"
            value={selectedDate}
            onChange={handleDateFilterChange}
            style={{ maxWidth: "300px" }}
          />
          <Select
            label="Filter by Status"
            placeholder="Select a status"
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
      )}

      {/* Display Leave Requests Table (only visible if a user is selected) */}
      {selectedUser && (
        <>
          {loading ? (
            <LoadingComponent loadingMsg="Fetching Leave Requests..." />
          ) : filteredData.length === 0 ? (
            <EmptyTable
              title="No Leave Requests Found"
              message="There are no leave requests available for the selected user."
            />
          ) : (
            <div className="form-table-container">
              <table className="form-table">
                <thead>
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index} className="table-header">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr
                      className="table-row"
                      key={index}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleViewClick(item.id)}
                    >
                      <td>{item.id}</td>
                      <td>{item.submissionDate}</td>
                      <td>
                        <span
                          style={{
                            color: getStatusColor(item.status),
                            fontWeight: "bold",
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>{item.leaveStartDate}</td>
                      <td>{item.leaveEndDate}</td>
                      <td>
                        <span className="text-link">
                          <Eye size={20} />
                          View
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminLeaveRequests;

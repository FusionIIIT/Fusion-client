import React, { useEffect, useState } from "react";
import { Title, Select, TextInput } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Eye } from "@phosphor-icons/react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { EmptyTable } from "../../components/tables/EmptyTable";
import useFetchData from "../../hooks/useFetchData";
import { getLeaveRequests } from "../../services/api";
import "../../styles/LeaveRequests.css";

function LeaveRequests() {
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch data from service
  const { data: requestData, loading } = useFetchData(
    () => getLeaveRequests(selectedDate),
    [selectedDate],
  );

  // ✅ Sync filtered data when API data changes
  useEffect(() => {
    if (requestData && requestData.length > 0) {
      // Sort by latest first
      const sortedData = [...requestData].sort(
        (a, b) => new Date(b.submissionDate) - new Date(a.submissionDate),
      );
      setFilteredData(sortedData);
    } else {
      setFilteredData([]);
    }
  }, [requestData]);

  // ✅ Navigation
  const handleViewClick = (view) => {
    navigate(`./view/${view}`);
  };

  // ✅ Status color helper
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

  // ✅ Filter by status
  const handleStatusFilterChange = (value) => {
    setSelectedStatus(value);

    if (value === "All") {
      setFilteredData(requestData);
    } else {
      const filtered = requestData.filter((item) => item.status === value);
      setFilteredData(filtered);
    }
  };

  // ✅ Filter by date
  const handleDateFilterChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const headers = [
    "ID",
    "Submission Date",
    "Status",
    "Leave Start Date",
    "Leave End Date",
    "View",
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app-container">
      <Title
        order={2}
        style={{ fontWeight: "500", marginTop: "40px", marginLeft: "15px" }}
      >
        Leave Requests
      </Title>

      {/* Filters */}
      <div
        style={{
          margin: "20px 15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "20px" }}>
          <TextInput
            label="Filter by Date"
            type="date"
            value={selectedDate}
            onChange={handleDateFilterChange}
            style={{ maxWidth: "300px" }}
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

        <Title order={4} style={{ fontWeight: "400" }}>
          {selectedDate
            ? `Filtered results as of ${new Date(
                selectedDate,
              ).toLocaleDateString()}`
            : `Filtered results as of ${new Date(
                Date.now() - 365 * 24 * 60 * 60 * 1000,
              ).toLocaleDateString()}`}
        </Title>
      </div>

      {/* Table */}
      {filteredData.length === 0 ? (
        <EmptyTable
          title="No Leave Requests Found"
          message="There are no leave requests available."
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
                  key={index}
                  className="table-row"
                  onClick={() => handleViewClick(item.id)}
                  style={{ cursor: "pointer" }}
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
                      <Eye size={20} /> View
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LeaveRequests;

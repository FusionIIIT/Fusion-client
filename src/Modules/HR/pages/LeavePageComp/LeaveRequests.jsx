import React, { useEffect, useState } from "react";
import { Title, Select, TextInput, Button, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Eye, Footprints } from "@phosphor-icons/react";
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

  const { data: requestData, loading } = useFetchData(
    () => getLeaveRequests(selectedDate),
    [selectedDate],
  );

  useEffect(() => {
    if (!requestData || requestData.length === 0) {
      setFilteredData([]);
      return;
    }
    const sortedData = [...requestData].sort(
      (a, b) => new Date(b.submissionDate) - new Date(a.submissionDate),
    );
    if (selectedStatus === "All") {
      setFilteredData(sortedData);
    } else {
      setFilteredData(
        sortedData.filter((item) => item.status === selectedStatus),
      );
    }
  }, [requestData, selectedStatus]);

  const handleViewClick = (formId) => {
    navigate(`/hr/leave/view/${formId}`);
  };

  const handleTrackClick = (e, fileId) => {
    e.stopPropagation();
    if (!fileId) {
      alert(
        "Tracking is available after the application is filed. File id was not found — open from Leave Inbox or refresh the list.",
      );
      return;
    }
    navigate(`/hr/FormView/leaveform_track/${fileId}`);
  };

  const getStatusColor = (status) => {
    const s = (status || "").toString();
    if (s.includes("Rejected")) return "#FF0000";
    if (s.includes("Approved by HR")) return "#32CD32";
    if (s.includes("HOD approved")) return "#daa520";
    if (s.includes("Submitted")) return "#1e90ff";
    return "#333";
  };

  const handleStatusFilterChange = (value) => {
    setSelectedStatus(value || "All");
  };

  const handleDateFilterChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const headers = [
    "ID",
    "Submission Date",
    "Status",
    "Leave Start Date",
    "Leave End Date",
    "Actions",
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
              { value: "Submitted", label: "Submitted" },
              {
                value: "HOD approved (pending HR)",
                label: "HOD approved (pending HR)",
              },
              { value: "Rejected by HOD", label: "Rejected by HOD" },
              { value: "Approved by HR", label: "Approved by HR" },
              { value: "Rejected by HR", label: "Rejected by HR" },
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
                <tr key={index} className="table-row">
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
                    <Group spacing="xs" noWrap>
                      <Button
                        variant="subtle"
                        size="xs"
                        leftIcon={<Eye size={16} />}
                        onClick={() => handleViewClick(item.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="subtle"
                        size="xs"
                        color="teal"
                        leftIcon={<Footprints size={16} />}
                        onClick={(e) => handleTrackClick(e, item.file_id)}
                      >
                        Track
                      </Button>
                    </Group>
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

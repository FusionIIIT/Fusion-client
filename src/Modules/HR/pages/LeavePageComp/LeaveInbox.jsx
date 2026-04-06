import React, { useEffect, useState } from "react";
import { Title, Select, TextInput, Badge } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Eye } from "@phosphor-icons/react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { EmptyTable } from "../../components/tables/EmptyTable";
import useFetchData from "../../hooks/useFetchData";
import { getLeaveInbox } from "../../services/api";
import "../../styles/LeaveInbox.css";

function LeaveInbox() {
  const [inboxData, setInboxData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filtering, setFiltering] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [fromDate, setFromDate] = useState("");

  const navigate = useNavigate();

  // ✅ Fetch data from service
  const { data, loading } = useFetchData(
    () => getLeaveInbox(fromDate),
    [fromDate],
  );

  // ✅ Filter logic (unchanged)
  function applyFilters(status, type, date, baseData = inboxData) {
    setFiltering(true);

    let filtered = baseData;

    if (status !== "All") {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (type !== "All") {
      filtered = filtered.filter((item) => item.type === type);
    }

    if (date) {
      const selectedDate = new Date(date);
      filtered = filtered.filter((item) => new Date(item.date) >= selectedDate);
    }

    setFilteredData(filtered);
    setFiltering(false);
  }

  // ✅ Transform + combine data
  // ✅ Transform + combine data
  useEffect(() => {
    if (!data) return;

    const combinedData = [
      ...(data.leave_inbox || []).map((item) => ({
        ...item,
        type: "Leave Request",
        date: item.upload_date?.split("T")[0],
      })),
      ...(data.academic_res_inbox || []).map((item) => ({
        ...item,
        type: "Academic Responsibility",
        date: item.submissionDate,
      })),
      ...(data.administrative_res_inbox || []).map((item) => ({
        ...item,
        type: "Administrative Responsibility",
        date: item.submissionDate,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    setInboxData(combinedData);
    applyFilters(selectedStatus, selectedType, fromDate, combinedData);
  }, [data]);

  // ✅ Navigation handlers
  const handleLeaveClick = (item) => {
    switch (item.type) {
      case "Academic Responsibility":
        navigate(`./handle_responsibility/${item.id}?query=academic`);
        break;
      case "Administrative Responsibility":
        navigate(`./handle_responsibility/${item.id}?query=administrative`);
        break;
      default:
        navigate(`./file_handler/${item.src_object_id}`);
    }
  };

  // ✅ UI helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge color="yellow">Pending</Badge>;
      case "Accepted":
        return <Badge color="green">Accepted</Badge>;
      case "Rejected":
        return <Badge color="red">Rejected</Badge>;
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Leave Request":
        return "#9ACD32";
      case "Academic Responsibility":
        return "#0d98ba";
      case "Administrative Responsibility":
        return "#2ecc71";
      default:
        return "#333";
    }
  };

  // ✅ Filters
  const handleStatusFilterChange = (value) => {
    setSelectedStatus(value);
    applyFilters(value, selectedType, fromDate);
  };

  const handleTypeFilterChange = (value) => {
    setSelectedType(value);
    applyFilters(selectedStatus, value, fromDate);
  };

  const handleDateFilterChange = (event) => {
    const { value } = event.target;
    setFromDate(value);
    applyFilters(selectedStatus, selectedType, value);
  };

  const headers = [
    "Type",
    "ID",
    "Submission Date",
    "Name",
    "Designation",
    "Status",
    "View",
  ];

  return (
    <div className="app-container">
      <Title order={2} style={{ margin: "40px 15px" }}>
        Leave Inbox
      </Title>

      {/* Filters */}
      <div style={{ display: "flex", gap: "20px", margin: "20px 15px" }}>
        <TextInput
          label="Filter from Date"
          type="date"
          value={fromDate}
          onChange={handleDateFilterChange}
        />

        <Select
          label="Status"
          value={selectedStatus}
          onChange={handleStatusFilterChange}
          data={["All", "Pending", "Accepted", "Rejected"]}
        />

        <Select
          label="Type"
          value={selectedType}
          onChange={handleTypeFilterChange}
          data={[
            "All",
            "Leave Request",
            "Academic Responsibility",
            "Administrative Responsibility",
          ]}
        />
      </div>

      {/* Loading */}
      {(loading || filtering) && <LoadingSpinner />}

      {/* Empty */}
      {!loading && filteredData.length === 0 && (
        <EmptyTable title="No Records Found" />
      )}

      {/* Table */}
      {!loading && filteredData.length > 0 && (
        <div className="form-table-container">
          <table className="form-table">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, i) => (
                <tr key={i} onClick={() => handleLeaveClick(item)}>
                  <td style={{ color: getTypeColor(item.type) }}>
                    {item.type}
                  </td>
                  <td>{item.id}</td>
                  <td>{item.date}</td>
                  <td>{item.name || item.sent_by_user}</td>
                  <td>{item.designation || item.sent_by_designation}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>
                    <Eye size={20} /> View
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

export default LeaveInbox;

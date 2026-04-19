import React, { useEffect, useState } from "react";
import { Title, Select, TextInput, Badge, Button, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Eye, Footprints } from "@phosphor-icons/react";
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
  useEffect(() => {
    if (!data) return;

    // data is already a flat array from getLeaveInbox (normalizeInboxRow applied)
    const leaveItems = Array.isArray(data) ? data : (data.leave_inbox || []);

    const combinedData = [
      ...leaveItems.map((item) => ({
        ...item,
        type: "Leave Request",
        date: item.upload_date?.split("T")[0] || item.date,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    setInboxData(combinedData);
    applyFilters(selectedStatus, selectedType, fromDate, combinedData);
  }, [data, fromDate, selectedStatus, selectedType]);

  // ✅ Navigation handlers
  const handleLeaveClick = (item) => {
    switch (item.type) {
      case "Academic Responsibility":
        navigate(`/hr/leave/handle_responsibility/${item.id}?query=academic`);
        break;
      case "Administrative Responsibility":
        navigate(`/hr/leave/handle_responsibility/${item.id}?query=administrative`);
        break;
      default:
        navigate(`/hr/leave/file_handler/${item.id}`);
    }
  };

  const handleTrackInbox = (e, fileId) => {
    e.stopPropagation();
    navigate(`/hr/FormView/leaveform_track/${fileId}`);
  };

  // ✅ UI helpers
  const getStatusBadge = (status) => {
    const s = (status || "").toString();
    if (s.includes("Rejected")) {
      return <Badge color="red">{s}</Badge>;
    }
    if (s.includes("Approved by HR") || s === "Accepted") {
      return <Badge color="green">{s}</Badge>;
    }
    if (s.includes("Submitted") || s.includes("pending HR")) {
      return <Badge color="yellow">{s}</Badge>;
    }
    return <Badge color="gray">{s || "Unknown"}</Badge>;
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
    "Actions",
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
          data={[
            "All",
            "Submitted",
            "HOD approved (pending HR)",
            "Rejected by HOD",
            "Approved by HR",
            "Rejected by HR",
          ]}
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
                <tr key={i}>
                  <td style={{ color: getTypeColor(item.type) }}>
                    {item.type}
                  </td>
                  <td>{item.id}</td>
                  <td>{item.date}</td>
                  <td>{item.name || item.sent_by_user}</td>
                  <td>{item.designation || item.sent_by_designation}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Group spacing="xs" noWrap>
                      <Button
                        variant="subtle"
                        size="xs"
                        leftIcon={<Eye size={16} />}
                        onClick={() => handleLeaveClick(item)}
                      >
                        Open
                      </Button>
                      {item.type === "Leave Request" && (
                        <Button
                          variant="subtle"
                          size="xs"
                          color="teal"
                          leftIcon={<Footprints size={16} />}
                          onClick={(e) => handleTrackInbox(e, item.id)}
                        >
                          Track
                        </Button>
                      )}
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

export default LeaveInbox;

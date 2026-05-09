import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Paper, Badge, Button, Flex, Divider, Text, Grid, Title, Center, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getReportNew, exportReport } from "../routes/api";
import "../styles/GenerateReport.css";
import ComplaintDetails from "./ComplaintDetails";

const complaintTypes = [
  "Electricity",
  "Carpenter",
  "Plumber",
  "Garbage",
  "Dustbin",
  "Internet",
  "Other",
];

const locations = [
  "Hall-1",
  "Hall-3",
  "Hall-4",
  "Nagarjun Hostel",
  "Maa Saraswati Hostel",
  "Panini Hostel",
  "LHTC",
  "CORE LAB",
  "CC1",
  "CC2",
  "Rewa Residency",
  "NR2",
];

const calculateDaysElapsed = (complaintDate) => {
  const lodgeDate = new Date(complaintDate);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - lodgeDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

function GenerateReport({ roleOverride }) {
  const [complaintsData, setComplaintsData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [filters, setFilters] = useState({
    location: "",
    complaintType: "",
    status: "",
    priority: "",
    startDate: "",
    endDate: "",
    sortBy: "mostRecent",
  });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const apiFilters = {};
        if (filters.location) apiFilters.location = filters.location;
        if (filters.complaintType) apiFilters.complaint_type = filters.complaintType;
        if (filters.status) apiFilters.status = filters.status;
        if (filters.priority) apiFilters.priority = filters.priority;
        if (filters.startDate) apiFilters.start_date = filters.startDate;
        if (filters.endDate) apiFilters.end_date = filters.endDate;

        const { success, data } = await getReportNew(apiFilters, token);
        if (success) {
          setComplaintsData(data.results || []);
          setSummary(data.summary || null);
        } else {
          notifications.show({ title: "Error", message: "Error fetching report.", color: "red" });
        }
      } catch (error) {
        notifications.show({ title: "Error", message: "Unexpected error.", color: "red" });
      }
      setIsLoading(false);
    }
    fetchData();
  }, [filters, token]);

  const handleDetailsClick = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleBackClick = () => {
    setSelectedComplaint(null);
  };

  // Compute filtered data using useMemo to avoid unnecessary state updates.
  const filteredData = useMemo(() => {
    let filtered = [...complaintsData];

    // Location filter – applied if role includes "supervisor"
    if (filters.location) {
      filtered = filtered.filter(
        (complaint) =>
          complaint.location?.toLowerCase() === filters.location.toLowerCase(),
      );
    }
    // Complaint type filter – applied if role includes "caretaker" or "convener"
    if (filters.complaintType) {
      filtered = filtered.filter(
        (complaint) =>
          complaint.complaint_type?.toLowerCase() ===
          filters.complaintType.toLowerCase(),
      );
    }
    // Status filter
    if (filters.status) {
      filtered = filtered.filter(
        (complaint) => String(complaint.status) === filters.status,
      );
    }
    // Date filters
    if (filters.startDate) {
      filtered = filtered.filter(
        (complaint) =>
          new Date(complaint.complaint_date) >= new Date(filters.startDate),
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (complaint) =>
          new Date(complaint.complaint_date) <= new Date(filters.endDate),
      );
    }
    // Sorting
    if (filters.sortBy) {
      if (filters.sortBy === "status") {
        filtered.sort((a, b) => a.status - b.status);
      } else if (filters.sortBy === "mostRecent") {
        filtered.sort(
          (a, b) => new Date(b.complaint_date) - new Date(a.complaint_date),
        );
      } else if (filters.sortBy === "mostOlder") {
        filtered.sort(
          (a, b) => new Date(a.complaint_date) - new Date(b.complaint_date),
        );
      }
    }
    if (filters.sortBy === "severity") {
      filtered.sort((a, b) => {
        const severityA = calculateDaysElapsed(a.complaint_date);
        const severityB = calculateDaysElapsed(b.complaint_date);
        return severityB - severityA; // Higher severity first
      });
    }
    if (filters.severity) {
      filtered = filtered.filter((complaint) => {
        const daysElapsed = calculateDaysElapsed(complaint.complaint_date);
        if (filters.severity === "high") return daysElapsed > 5;
        if (filters.severity === "medium")
          return daysElapsed > 2 && daysElapsed <= 5;
        if (filters.severity === "low") return daysElapsed <= 2;
        return true;
      });
    }
    return filtered;
  }, [complaintsData, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleExport = async () => {
    const apiFilters = {};
    if (filters.location) apiFilters.location = filters.location;
    if (filters.complaintType) apiFilters.complaint_type = filters.complaintType;
    if (filters.status) apiFilters.status = filters.status;
    if (filters.priority) apiFilters.priority = filters.priority;
    if (filters.startDate) apiFilters.start_date = filters.startDate;
    if (filters.endDate) apiFilters.end_date = filters.endDate;
    const result = await exportReport(apiFilters, exportFormat, token);
    if (!result.success) {
      notifications.show({ title: "Error", message: "Failed to export report.", color: "red" });
    }
  };

  const formatDateTime = (datetimeStr) => {
    const date = new Date(datetimeStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year}, ${hours}:${minutes}`; // Format: DD-MM-YYYY HH:MM
  };

  return (
    <div className="full-width-container">
      <Paper
        p="xl"
        shadow="sm"
        radius="md"
        mt="xl"
        style={{
          borderLeft: "5px solid #15abff",
          width: "60vw",
          minHeight: "45vh",
          maxHeight: "78vh",
          display: "flex",
          flexDirection: "column",
        }}
        withBorder
      >
        {!selectedComplaint ? (
          <Flex direction="column" gap="md" p="md" style={{ flexGrow: 1, overflow: "hidden" }}>
            {/* KPI Panel */}
            {summary && (
              <Grid>
                <Grid.Col span={3}>
                  <Paper p="sm" withBorder style={{ backgroundColor: "#f8f9fa", textAlign: "center" }}>
                    <Text size="xs" color="dimmed" transform="uppercase" weight={700}>Total Complaints</Text>
                    <Text size="xl" weight={700}>{summary.total}</Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Paper p="sm" withBorder style={{ backgroundColor: "#f8f9fa", textAlign: "center" }}>
                    <Text size="xs" color="dimmed" transform="uppercase" weight={700}>Avg Resolution Time</Text>
                    <Text size="xl" weight={700}>{summary.avg_resolution_hours ? `${summary.avg_resolution_hours} hrs` : "N/A"}</Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Paper p="sm" withBorder style={{ backgroundColor: "#f8f9fa", textAlign: "center" }}>
                    <Text size="xs" color="dimmed" transform="uppercase" weight={700}>Reopen Rate</Text>
                    <Text size="xl" weight={700}>{summary.reopen_rate}%</Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Paper p="sm" withBorder style={{ backgroundColor: "#f8f9fa", textAlign: "center" }}>
                    <Text size="xs" color="dimmed" transform="uppercase" weight={700}>SLA Compliance</Text>
                    <Text size="xl" weight={700}>{summary.sla_compliance}%</Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            )}

            {/* List */}
            <div style={{ flexGrow: 1, overflowY: "auto", paddingRight: "10px" }}>
            {isLoading ? (
              <Center style={{ minHeight: "20vh" }}>
                <Loader size="xl" variant="bars" />
              </Center>
            ) : filteredData.length > 0 ? (
              filteredData.map((complaint, index) => {
                const isOverdue = complaint.sla_deadline && new Date(complaint.sla_deadline) < new Date() && ![2, 3, 5].includes(complaint.status);
                return (
                  <Paper key={index} radius="md" px="lg" pt="sm" pb="xl" style={{ width: "100%", margin: "10px 0" }} withBorder>
                    <Flex direction="column" style={{ width: "100%" }}>
                      <Flex direction="row" justify="space-between">
                        <Flex direction="row" gap="xs" align="center">
                          <Text size="14px" style={{ fontWeight: "bold" }}>Complaint Id: {complaint.id}</Text>
                          <Badge size="lg" color="blue">{complaint.complaint_type}</Badge>
                          {complaint.priority && (
                           <Badge size="sm" color={complaint.priority === "URGENT" ? "red" : complaint.priority === "LOW" ? "gray" : "blue"} variant="outline">
                             {complaint.priority}
                           </Badge>
                          )}
                          {isOverdue && <Badge size="sm" color="red" variant="filled">OVERDUE</Badge>}
                        </Flex>
                      </Flex>
                      <Flex direction="column" gap="xs" mt="xs">
                        <Text size="14px"><strong>Date:</strong> {formatDateTime(complaint.complaint_date)}</Text>
                        <Text size="14px"><strong>Location:</strong> {complaint.specific_location}, {complaint.location}</Text>
                      </Flex>
                      <Divider my="md" size="sm" />
                      <Flex direction="row" justify="space-between" align="center">
                        <Text size="14px"><strong>Description:</strong> {complaint.details}</Text>
                        <Button variant="outline" size="xs" onClick={() => handleDetailsClick(complaint)}>Details</Button>
                      </Flex>
                    </Flex>
                  </Paper>
                );
              })
            ) : (
              <Center style={{ minHeight: "20vh" }}>
                <Text size="14px">No complaints found.</Text>
              </Center>
            )}
            </div>
          </Flex>
        ) : (
          <ComplaintDetails complaintId={selectedComplaint.id} onBack={handleBackClick} />
        )}
      </Paper>

      {!selectedComplaint ? (
        <div className="filter-card-container mt-5">
          <h2>Filters</h2>
          <div className="filter-label" style={{ fontWeight: "bold" }}>Location</div>
          <select name="location" onChange={handleFilterChange} value={filters.location}>
            <option value="">All Locations</option>
            {locations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
          </select>
          <div className="filter-label" style={{ fontWeight: "bold" }}>Complaint Type</div>
          <select name="complaintType" onChange={handleFilterChange} value={filters.complaintType}>
            <option value="">All Types</option>
            {complaintTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
          </select>
          <div className="filter-label" style={{ fontWeight: "bold" }}>Status</div>
          <select name="status" onChange={handleFilterChange} value={filters.status}>
            <option value="">All Statuses</option>
            <option value="0">Pending</option>
            <option value="1">In Progress</option>
            <option value="2">Resolved</option>
            <option value="3">Declined</option>
            <option value="4">Escalated</option>
            <option value="5">Closed</option>
            <option value="6">Reopened</option>
          </select>
          <div className="filter-label" style={{ fontWeight: "bold" }}>Priority</div>
          <select name="priority" onChange={handleFilterChange} value={filters.priority}>
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="STANDARD">Standard</option>
            <option value="LOW">Low</option>
          </select>
          <div className="filter-label" style={{ fontWeight: "bold" }}>From Date</div>
          <input type="date" name="startDate" onChange={handleFilterChange} value={filters.startDate} />
          <div className="filter-label" style={{ fontWeight: "bold" }}>To Date</div>
          <input type="date" name="endDate" onChange={handleFilterChange} value={filters.endDate} />

          <Divider my="md" />
          <Flex gap="sm" direction="column">
            <Text weight="bold" size="sm">Export Report</Text>
            <Flex gap="xs" align="stretch" style={{ width: "100%" }}>
              <select
                name="exportFormat"
                value={exportFormat}
                onChange={(event) => setExportFormat(event.target.value)}
                style={{
                  width: "120px",
                  height: "34px",
                  minHeight: "34px",
                  fontSize: "12px",
                  lineHeight: "34px",
                  padding: "0 28px 0 10px",
                  marginBottom: 0,
                  boxSizing: "border-box",
                }}
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
              <Button
                onClick={handleExport}
                size="xs"
                variant="filled"
                style={{ flexGrow: 1, height: "34px", minHeight: "34px" }}
              >
                Export
              </Button>
            </Flex>
          </Flex>
        </div>
      ) : null}
    </div>
  );
}

GenerateReport.defaultProps = {
  roleOverride: "",
};

GenerateReport.propTypes = {
  roleOverride: PropTypes.string,
};

export default GenerateReport;

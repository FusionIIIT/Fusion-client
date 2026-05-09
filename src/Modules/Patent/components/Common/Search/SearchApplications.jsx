import React, { useState } from "react";
import {
  Card,
  Text,
  TextInput,
  Button,
  Group,
  Select,
  Grid,
  Loader,
  Badge,
  Box,
  Pagination,
  Divider,
} from "@mantine/core";
import { MagnifyingGlass, Funnel, Calendar, FileText } from "@phosphor-icons/react";
import axios from "axios";
import { host } from "../../../../../routes/globalRoutes/index.jsx";
import { getStatusColor } from "../../../utils/statusColors.js";

const API_BASE_URL = `${host}/patentsystem`;

const SearchApplications = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [department, setDepartment] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [departments, setDepartments] = useState([]);

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Draft", label: "Draft" },
    { value: "Submitted", label: "Submitted" },
    { value: "Under Review", label: "Under Review" },
    { value: "Reviewed by PCC Admin", label: "Reviewed by PCC Admin" },
    { value: "Forwarded for Director's Review", label: "Forwarded for Director's Review" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "Appeal", label: "Appeal" },
    { value: "Appeal Under Review", label: "Appeal Under Review" },
    { value: "Appeal Approved", label: "Appeal Approved" },
    { value: "Appeal Rejected", label: "Appeal Rejected" },
    { value: "Needs Revision", label: "Needs Revision" },
    { value: "Resubmitted", label: "Resubmitted" },
    { value: "Patent Filed", label: "Patent Filed" },
    { value: "Patent Granted", label: "Patent Granted" },
    { value: "Patent Refused", label: "Patent Refused" },
    { value: "Withdrawn", label: "Withdrawn" },
    { value: "Expired", label: "Expired" },
  ];

  const decisionOptions = [
    { value: "", label: "All Decisions" },
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "Needs Revision", label: "Needs Revision" },
  ];

  React.useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(`${API_BASE_URL}/pccAdmin/departments/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setDepartments(
        response.data.departments.map((dept) => ({ value: dept, label: dept }))
      );
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const handleSearch = async (page = 1) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (statusFilter) params.append("status", statusFilter);
      if (decisionFilter) params.append("decision", decisionFilter);
      if (dateFrom) params.append("date_from", dateFrom.toISOString().split("T")[0]);
      if (dateTo) params.append("date_to", dateTo.toISOString().split("T")[0]);
      if (department) params.append("department", department);

      const limit = 10;
      const offset = (page - 1) * limit;
      params.append("limit", limit);
      params.append("offset", offset);

      const response = await axios.get(`${API_BASE_URL}/search/?${params}`, {
        headers: { Authorization: `Token ${token}` },
      });

      setResults(response.data.applications);
      setTotalResults(response.data.total);
      setCurrentPage(page);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("");
    setDecisionFilter("");
    setDateFrom(null);
    setDateTo(null);
    setDepartment("");
    setResults(null);
    setTotalResults(0);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalResults / 10);

  return (
    <Box p="lg">
      <Text size="xl" weight={600} mb="lg">
        <MagnifyingGlass size={24} style={{ marginRight: "10px", verticalAlign: "middle" }} />
        Search Patent Applications
      </Text>

      {/* Search Filters */}
      <Card p="lg" mb="lg" withBorder>
        <Group mb="md">
          <Funnel size={20} />
          <Text weight={500}>Search Filters</Text>
        </Group>

        <Grid>
          <Grid.Col span={12} md={6}>
            <TextInput
              label="Search Query"
              placeholder="Search by title, token number, or applicant name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftSection={<MagnifyingGlass size={16} />}
            />
          </Grid.Col>

          <Grid.Col span={12} md={6}>
            <Select
              label="Status"
              placeholder="Select status"
              value={statusFilter}
              onChange={setStatusFilter}
              data={statusOptions}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={12} md={6}>
            <Select
              label="Decision"
              placeholder="Select decision"
              value={decisionFilter}
              onChange={setDecisionFilter}
              data={decisionOptions}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={12} md={6}>
            <Select
              label="Department"
              placeholder="Select department"
              value={department}
              onChange={setDepartment}
              data={[{ value: "", label: "All Departments" }, ...departments]}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={12} md={6}>
            <TextInput
              label="From Date"
              placeholder="YYYY-MM-DD"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              leftSection={<Calendar size={16} />}
            />
          </Grid.Col>

          <Grid.Col span={12} md={6}>
            <TextInput
              label="To Date"
              placeholder="YYYY-MM-DD"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              leftSection={<Calendar size={16} />}
            />
          </Grid.Col>
        </Grid>

        <Group mt="md">
          <Button
            onClick={() => handleSearch(1)}
            loading={loading}
            leftSection={<MagnifyingGlass size={16} />}
          >
            Search Applications
          </Button>
          <Button variant="light" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Group>
      </Card>

      {/* Search Results */}
      {loading && (
        <Box ta="center" py="xl">
          <Loader size="lg" />
          <Text mt="md">Searching applications...</Text>
        </Box>
      )}

      {results !== null && !loading && (
        <Card p="lg" withBorder>
          <Group mb="md" position="apart">
            <Text weight={500}>
              Search Results ({totalResults} applications found)
            </Text>
            {totalPages > 1 && (
              <Text size="sm" color="dimmed">
                Page {currentPage} of {totalPages}
              </Text>
            )}
          </Group>

          {results.length === 0 ? (
            <Box ta="center" py="xl">
              <FileText size={48} color="gray" />
              <Text mt="md" color="dimmed">
                No applications found matching your search criteria.
              </Text>
            </Box>
          ) : (
            <>
              {results.map((app, index) => (
                <Box key={app.id} mb="md">
                  <Card p="md" withBorder>
                    <Group position="apart" mb="sm">
                      <Text weight={600} size="lg">
                        {app.title}
                      </Text>
                      <Badge color={getStatusColor(app.status)} size="lg">
                        {app.status}
                      </Badge>
                    </Group>

                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="sm" color="dimmed">Application ID</Text>
                        <Text weight={500}>{app.id}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" color="dimmed">Token Number</Text>
                        <Text weight={500}>{app.token_no || "Not assigned"}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" color="dimmed">Primary Applicant</Text>
                        <Text weight={500}>{app.primary_applicant}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" color="dimmed">Submitted Date</Text>
                        <Text weight={500}>
                          {app.submitted_date
                            ? new Date(app.submitted_date).toLocaleDateString()
                            : "Not submitted"}
                        </Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" color="dimmed">Decision Status</Text>
                        <Badge color={app.decision_status === "Approved" ? "green" : app.decision_status === "Rejected" ? "red" : "gray"}>
                          {app.decision_status}
                        </Badge>
                      </Grid.Col>
                    </Grid>
                  </Card>
                  {index < results.length - 1 && <Divider my="md" />}
                </Box>
              ))}

              {totalPages > 1 && (
                <Group position="center" mt="lg">
                  <Pagination
                    value={currentPage}
                    onChange={(page) => handleSearch(page)}
                    total={totalPages}
                    size="md"
                  />
                </Group>
              )}
            </>
          )}
        </Card>
      )}
    </Box>
  );
};

export default SearchApplications;
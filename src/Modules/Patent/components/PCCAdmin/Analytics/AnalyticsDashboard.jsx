import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Grid,
  Select,
  Group,
  Loader,
  Box,
  Progress,
  Badge,
  SimpleGrid,
  RingProgress,
  Center,
} from "@mantine/core";
import {
  TrendUp,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChartBar,
  Calendar,
} from "@phosphor-icons/react";
import axios from "axios";
import { host } from "../../../../../routes/globalRoutes/index.jsx";

const API_BASE_URL = `${host}/patentsystem`;

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchAnalytics();
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

  const fetchAnalytics = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear) params.append("year", selectedYear);
      if (selectedDepartment) params.append("department", selectedDepartment);

      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/analytics/summary/?${params}`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setAnalytics(response.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear, selectedDepartment]);

  const yearOptions = [
    { value: "", label: "All Years" },
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
    { value: "2021", label: "2021" },
  ];

  const StatCard = ({ icon, title, value, color = "blue", description }) => (
    <Card p="lg" withBorder>
      <Group position="apart" mb="xs">
        <Box style={{ color: `var(--mantine-color-${color}-6)` }}>
          {icon}
        </Box>
        <Text size="xl" weight={700}>
          {value}
        </Text>
      </Group>
      <Text size="sm" weight={500} mb="xs">
        {title}
      </Text>
      {description && (
        <Text size="xs" color="dimmed">
          {description}
        </Text>
      )}
    </Card>
  );

  if (loading && !analytics) {
    return (
      <Box p="lg">
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      </Box>
    );
  }

  return (
    <Box p="lg">
      <Group position="apart" mb="lg">
        <Text size="xl" weight={600}>
          <ChartBar size={24} style={{ marginRight: "10px", verticalAlign: "middle" }} />
          Patent Analytics Dashboard
        </Text>
        <Group>
          <Select
            placeholder="Select Year"
            value={selectedYear}
            onChange={setSelectedYear}
            data={yearOptions}
            w={120}
          />
          <Select
            placeholder="Select Department"
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            data={[{ value: "", label: "All Departments" }, ...departments]}
            w={200}
          />
        </Group>
      </Group>

      {analytics && (
        <>
          {/* Overview Stats */}
          <SimpleGrid cols={4} spacing="lg" mb="lg">
            <StatCard
              icon={<FileText size={24} />}
              title="Total Applications"
              value={analytics.total_applications}
              color="blue"
              description="All patent applications"
            />
            <StatCard
              icon={<CheckCircle size={24} />}
              title="Approved"
              value={analytics.approved}
              color="green"
              description="Successfully approved applications"
            />
            <StatCard
              icon={<XCircle size={24} />}
              title="Rejected"
              value={analytics.rejected}
              color="red"
              description="Applications that were rejected"
            />
            <StatCard
              icon={<Clock size={24} />}
              title="Pending"
              value={analytics.pending}
              color="orange"
              description="Applications under review"
            />
          </SimpleGrid>

          <Grid>
            {/* Approval Rate */}
            <Grid.Col span={12} md={4}>
              <Card p="lg" withBorder>
                <Text size="lg" weight={600} mb="md">
                  Approval Rate
                </Text>
                <Center>
                  <RingProgress
                    size={120}
                    thickness={8}
                    sections={[
                      {
                        value: analytics.approval_rate,
                        color: analytics.approval_rate > 70 ? 'green' : analytics.approval_rate > 50 ? 'yellow' : 'red'
                      }
                    ]}
                    label={
                      <Center>
                        <Text size="xl" weight={700}>
                          {analytics.approval_rate}%
                        </Text>
                      </Center>
                    }
                  />
                </Center>
              </Card>
            </Grid.Col>

            {/* Status Distribution */}
            <Grid.Col span={12} md={8}>
              <Card p="lg" withBorder>
                <Text size="lg" weight={600} mb="md">
                  Status Distribution
                </Text>
                <Box>
                  {analytics.status_distribution.slice(0, 8).map((item, index) => (
                    <Box key={index} mb="sm">
                      <Group position="apart" mb={4}>
                        <Text size="sm">{item.status}</Text>
                        <Badge size="sm">{item.count}</Badge>
                      </Group>
                      <Progress
                        value={(item.count / analytics.total_applications) * 100}
                        color={
                          item.status.includes("Approved") || item.status.includes("Granted")
                            ? "green"
                            : item.status.includes("Rejected") || item.status.includes("Refused")
                            ? "red"
                            : item.status.includes("Appeal")
                            ? "violet"
                            : "blue"
                        }
                        size="sm"
                      />
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid.Col>

            {/* Monthly Submissions */}
            <Grid.Col span={12} md={6}>
              <Card p="lg" withBorder>
                <Text size="lg" weight={600} mb="md">
                  <Calendar size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                  Monthly Submissions
                </Text>
                <Box>
                  {analytics.monthly_submissions.slice(-6).map((item, index) => (
                    <Box key={index} mb="sm">
                      <Group position="apart" mb={4}>
                        <Text size="sm">{item.month || "Unknown"}</Text>
                        <Text size="sm" weight={500}>{item.count}</Text>
                      </Group>
                      <Progress
                        value={(item.count / Math.max(...analytics.monthly_submissions.map(m => m.count))) * 100}
                        color="blue"
                        size="sm"
                      />
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid.Col>

            {/* Department Distribution */}
            <Grid.Col span={12} md={6}>
              <Card p="lg" withBorder>
                <Text size="lg" weight={600} mb="md">
                  <TrendUp size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                  Department Distribution
                </Text>
                <Box>
                  {analytics.department_distribution.slice(0, 8).map((item, index) => (
                    <Box key={index} mb="sm">
                      <Group position="apart" mb={4}>
                        <Text size="sm">{item.department}</Text>
                        <Badge size="sm">{item.count}</Badge>
                      </Group>
                      <Progress
                        value={(item.count / analytics.total_applications) * 100}
                        color="cyan"
                        size="sm"
                      />
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid.Col>

            {/* Decision Distribution */}
            <Grid.Col span={12}>
              <Card p="lg" withBorder>
                <Text size="lg" weight={600} mb="md">
                  Decision Status Breakdown
                </Text>
                <SimpleGrid cols={3} spacing="lg">
                  {analytics.decision_distribution.map((item, index) => (
                    <Card key={index} p="md" withBorder>
                      <Group position="apart" mb="xs">
                        <Text size="sm" color="dimmed">
                          {item.decision_status}
                        </Text>
                        <Badge
                          color={
                            item.decision_status === "Approved"
                              ? "green"
                              : item.decision_status === "Rejected"
                              ? "red"
                              : "gray"
                          }
                        >
                          {item.count}
                        </Badge>
                      </Group>
                      <Progress
                        value={(item.count / analytics.total_applications) * 100}
                        color={
                          item.decision_status === "Approved"
                            ? "green"
                            : item.decision_status === "Rejected"
                            ? "red"
                            : "gray"
                        }
                        size="lg"
                      />
                      <Text size="xs" color="dimmed" mt="xs">
                        {((item.count / analytics.total_applications) * 100).toFixed(1)}% of total
                      </Text>
                    </Card>
                  ))}
                </SimpleGrid>
              </Card>
            </Grid.Col>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;
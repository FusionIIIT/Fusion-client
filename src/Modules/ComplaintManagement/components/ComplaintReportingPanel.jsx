import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import JsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Badge,
  Button,
  Card,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ComplaintTable from "./ComplaintTable";
import { fetchComplaintAnalyticsReport } from "../services";
import classes from "../ComplaintManagement.module.css";

const STATUS_LABELS = new Map([
  [0, "Pending"],
  [1, "In Progress"],
  [2, "Resolved"],
  [3, "Closed"],
  [4, "Escalated"],
  [5, "Reopened"],
]);

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "0", label: "Pending" },
  { value: "1", label: "In Progress" },
  { value: "2", label: "Resolved" },
  { value: "3", label: "Closed" },
  { value: "4", label: "Escalated" },
  { value: "5", label: "Reopened" },
];

const buildCsvValue = (value) => {
  const next = String(value ?? "").replace(/"/g, '""');
  return `"${next}"`;
};

const getApiErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data) {
    return JSON.stringify(error.response.data);
  }
  return error?.message || "Failed to generate report";
};

export default function ComplaintReportingPanel({ complaints, onView }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [status, setStatus] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportRequested, setReportRequested] = useState(false);
  const [reportData, setReportData] = useState({
    complaints,
    status_logs: [],
    totals: {
      complaint_count: complaints.length,
      total_matched_count: complaints.length,
      is_truncated: false,
      resolved_count: 0,
      feedback_count: 0,
    },
    kpis: {
      avg_resolution_time_hours: 0,
      sla_compliance_rate: 0,
      reopen_rate: 0,
      feedback_response_rate: 0,
    },
    analytics: {
      category_hotspots: [],
      location_hotspots: [],
      recurring_issue_clusters: [],
      time_series: [],
    },
  });

  const categoryOptions = useMemo(() => {
    const values = Array.from(
      new Set(complaints.map((item) => item.complaint_type).filter(Boolean)),
    );
    return [
      { value: "all", label: "All categories" },
      ...values.map((value) => ({ value, label: value })),
    ];
  }, [complaints]);

  const locationOptions = useMemo(() => {
    const values = Array.from(
      new Set(complaints.map((item) => item.location).filter(Boolean)),
    );
    return [
      { value: "all", label: "All locations" },
      ...values.map((value) => ({ value, label: value })),
    ];
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const source = reportData.complaints || complaints;
    return source.filter((item) => {
      if (category !== "all" && item.complaint_type !== category) {
        return false;
      }
      if (location !== "all" && item.location !== location) {
        return false;
      }
      if (status !== "all" && String(item.status) !== status) {
        return false;
      }
      return true;
    });
  }, [category, complaints, location, reportData.complaints, status]);

  const stats = useMemo(() => {
    const computed = {
      total: filteredComplaints.length,
      open: filteredComplaints.reduce(
        (count, item) =>
          count + (![2, 3].includes(Number(item.status)) ? 1 : 0),
        0,
      ),
      escalated: filteredComplaints.reduce(
        (count, item) => count + (Number(item.status) === 4 ? 1 : 0),
        0,
      ),
      closed: filteredComplaints.reduce(
        (count, item) => count + (Number(item.status) === 3 ? 1 : 0),
        0,
      ),
    };
    return computed;
  }, [filteredComplaints]);

  const exportRows = filteredComplaints.map((item) => ({
    ref: item.complaint_ref || item.id,
    type: item.complaint_type || "",
    location: item.location || "",
    priority: item.priority || "Standard",
    status: STATUS_LABELS.get(Number(item.status)) || item.status,
    assigned: item.assigned_to_name || item.worker_id || "",
    created: item.complaint_date || "",
    sla: item.sla_deadline || "",
    remarks: item.remarks || "",
  }));

  const handleExcelExport = () => {
    const rows = exportRows.map((row) => ({
      Reference: row.ref,
      Category: row.type,
      Location: row.location,
      Priority: row.priority,
      Status: row.status,
      "Assigned To": row.assigned,
      "Created At": row.created,
      "SLA Deadline": row.sla,
      Remarks: row.remarks,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Complaint Report");
    XLSX.writeFile(workbook, "complaint-report.xlsx");
  };

  const handleCsvExport = () => {
    const header = [
      "Reference",
      "Category",
      "Location",
      "Priority",
      "Status",
      "Assigned To",
      "Created At",
      "SLA Deadline",
      "Remarks",
    ];

    const rows = exportRows.map((row) => [
      row.ref,
      row.type,
      row.location,
      row.priority,
      row.status,
      row.assigned,
      row.created,
      row.sla,
      row.remarks,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(buildCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "complaint-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = async () => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      notifications.show({
        color: "red",
        title: "Invalid date range",
        message: "From date cannot be after To date.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const payload = {
        date_from: dateFrom,
        date_to: dateTo,
        category: category === "all" ? "" : category,
        location: location === "all" ? "" : location,
      };
      const response = await fetchComplaintAnalyticsReport(payload);
      setReportData({
        complaints: response?.complaints || [],
        status_logs: response?.status_logs || [],
        totals: response?.totals || {
          complaint_count: 0,
          total_matched_count: 0,
          is_truncated: false,
          resolved_count: 0,
          feedback_count: 0,
        },
        kpis: response?.kpis || {
          avg_resolution_time_hours: 0,
          sla_compliance_rate: 0,
          reopen_rate: 0,
          feedback_response_rate: 0,
        },
        analytics: response?.analytics || {
          category_hotspots: [],
          location_hotspots: [],
          recurring_issue_clusters: [],
          time_series: [],
        },
      });
      setReportRequested(true);
      notifications.show({
        color: "green",
        title: "Report generated",
        message: "Dataset prepared and KPI insights computed.",
      });
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Report generation failed",
        message: getApiErrorMessage(error),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePdfExport = () => {
    const doc = new JsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Complaint Report", 14, 16);
    doc.setFontSize(10);
    doc.text(
      `Filters: ${category === "all" ? "All categories" : category} | ${
        location === "all" ? "All locations" : location
      } | ${status === "all" ? "All statuses" : STATUS_LABELS.get(Number(status)) || status}`,
      14,
      24,
    );

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "Reference",
          "Category",
          "Location",
          "Priority",
          "Status",
          "Assigned To",
          "Created At",
          "SLA Deadline",
          "Remarks",
        ],
      ],
      body: exportRows.map((row) => [
        row.ref,
        row.type,
        row.location,
        row.priority,
        row.status,
        row.assigned,
        row.created,
        row.sla,
        row.remarks,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [46, 95, 170] },
    });

    doc.save("complaint-report.pdf");
  };

  return (
    <Stack gap="md">
      <Paper className={classes.reportHeader} withBorder>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Text fw={700} className={classes.title}>
              Reporting
            </Text>
            <Text className={classes.subtitle}>
              Filter complaints by date, category, and location, then export the
              current view for review or sharing.
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="default"
              onClick={handleGenerateReport}
              loading={isGenerating}
            >
              Generate Report
            </Button>
            <Button
              variant="default"
              onClick={handleCsvExport}
              disabled={filteredComplaints.length === 0 || !reportRequested}
            >
              Export CSV
            </Button>
            <Button
              variant="default"
              onClick={handleExcelExport}
              disabled={filteredComplaints.length === 0 || !reportRequested}
            >
              Export Excel
            </Button>
            <Button
              onClick={handlePdfExport}
              disabled={filteredComplaints.length === 0 || !reportRequested}
            >
              Export PDF
            </Button>
          </Group>
        </Group>
      </Paper>

      <Group grow align="stretch">
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            Matching Complaints
          </Text>
          <Text fw={700} size="xl">
            {stats.total}
          </Text>
        </Card>
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            Avg Resolution (hrs)
          </Text>
          <Text fw={700} size="xl" c="blue">
            {reportData.kpis?.avg_resolution_time_hours ?? 0}
          </Text>
        </Card>
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            SLA Compliance
          </Text>
          <Text fw={700} size="xl" c="teal">
            {reportData.kpis?.sla_compliance_rate ?? 0}%
          </Text>
        </Card>
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            Reopen Rate
          </Text>
          <Text fw={700} size="xl" c="orange">
            {reportData.kpis?.reopen_rate ?? 0}%
          </Text>
        </Card>
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            Feedback Response
          </Text>
          <Text fw={700} size="xl" c="grape">
            {reportData.kpis?.feedback_response_rate ?? 0}%
          </Text>
        </Card>
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            Open
          </Text>
          <Text fw={700} size="xl" c="blue">
            {stats.open}
          </Text>
        </Card>
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            Escalated
          </Text>
          <Text fw={700} size="xl" c="orange">
            {stats.escalated}
          </Text>
        </Card>
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            Closed
          </Text>
          <Text fw={700} size="xl" c="green">
            {stats.closed}
          </Text>
        </Card>
      </Group>

      <Paper className={classes.reportToolbar} withBorder>
        <Group grow align="flex-end" wrap="wrap">
          <TextInput
            type="date"
            label="From"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.currentTarget.value)}
          />
          <TextInput
            type="date"
            label="To"
            value={dateTo}
            onChange={(event) => setDateTo(event.currentTarget.value)}
          />
          <Select
            label="Category"
            data={categoryOptions}
            value={category}
            onChange={(value) => setCategory(value || "all")}
          />
          <Select
            label="Location"
            data={locationOptions}
            value={location}
            onChange={(value) => setLocation(value || "all")}
          />
          <Select
            label="Status"
            data={STATUS_OPTIONS}
            value={status}
            onChange={(value) => setStatus(value || "all")}
          />
        </Group>
        <Group justify="space-between" mt="md" wrap="wrap">
          <Badge variant="light">
            {filteredComplaints.length} complaint
            {filteredComplaints.length === 1 ? "" : "s"} in report
          </Badge>
          <Text size="sm" c="dimmed">
            Generate report after selecting filters to refresh analytics.
          </Text>
        </Group>
      </Paper>

      <Paper className={classes.reportToolbar} withBorder>
        <Group justify="space-between" align="center" wrap="wrap">
          <Text fw={600}>Status Log Summary</Text>
          {isGenerating && <Loader size="sm" />}
        </Group>
        <Group gap="xs" mt="sm">
          {(reportData.status_logs || []).length === 0 && (
            <Text size="sm" c="dimmed">
              No status logs available for the selected filters.
            </Text>
          )}
          {(reportData.status_logs || []).map((entry) => (
            <Badge key={`${entry.action}-${entry.count}`} variant="light">
              {entry.action}: {entry.count}
            </Badge>
          ))}
        </Group>
        <Group justify="space-between" mt="md" wrap="wrap">
          <Text size="sm" c="dimmed">
            Matched records: {reportData.totals?.total_matched_count ?? 0}
          </Text>
          {reportData.totals?.is_truncated && (
            <Badge color="yellow" variant="light">
              Report capped to 1000 rows for stability
            </Badge>
          )}
        </Group>
      </Paper>

      <Paper className={classes.reportToolbar} withBorder>
        <Text fw={600} mb="sm">
          Category Hotspots
        </Text>
        <Group gap="xs">
          {(reportData.analytics?.category_hotspots || []).length === 0 && (
            <Text size="sm" c="dimmed">
              No category hotspot data.
            </Text>
          )}
          {(reportData.analytics?.category_hotspots || []).map((item) => (
            <Badge key={`${item.category}-${item.count}`} variant="light">
              {item.category}: {item.count}
            </Badge>
          ))}
        </Group>
      </Paper>

      <Paper className={classes.reportToolbar} withBorder>
        <Text fw={600} mb="sm">
          Location Hotspots
        </Text>
        <Group gap="xs">
          {(reportData.analytics?.location_hotspots || []).length === 0 && (
            <Text size="sm" c="dimmed">
              No location hotspot data.
            </Text>
          )}
          {(reportData.analytics?.location_hotspots || []).map((item) => (
            <Badge key={`${item.location}-${item.count}`} variant="light">
              {item.location}: {item.count}
            </Badge>
          ))}
        </Group>
      </Paper>

      <Paper className={classes.reportToolbar} withBorder>
        <Text fw={600} mb="sm">
          Recurring Issue Clusters
        </Text>
        <Stack gap="xs">
          {(reportData.analytics?.recurring_issue_clusters || []).length ===
            0 && (
            <Text size="sm" c="dimmed">
              No recurring cluster detected.
            </Text>
          )}
          {(reportData.analytics?.recurring_issue_clusters || []).map(
            (item) => (
              <Text
                key={`${item.complaint_type}-${item.location}-${item.count}`}
                size="sm"
              >
                {item.complaint_type} at {item.location}: {item.count}{" "}
                complaints
              </Text>
            ),
          )}
        </Stack>
      </Paper>

      <Paper className={classes.reportToolbar} withBorder>
        <Text fw={600} mb="sm">
          Time-series Trend
        </Text>
        {(reportData.analytics?.time_series || []).length > 0 && (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart
                data={(reportData.analytics?.time_series || []).slice(-30)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#2e5faa"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#2f9e44"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="closed"
                  stroke="#12b886"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="escalated"
                  stroke="#f08c00"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <Stack gap="xs">
          {(reportData.analytics?.time_series || []).length === 0 && (
            <Text size="sm" c="dimmed">
              No trend data in this range.
            </Text>
          )}
          {(reportData.analytics?.time_series || []).slice(-10).map((item) => (
            <Text key={item.date} size="sm">
              {item.date}: created {item.created}, resolved {item.resolved},
              closed {item.closed}, escalated {item.escalated}
            </Text>
          ))}
        </Stack>
      </Paper>

      <ComplaintTable
        complaints={filteredComplaints}
        onView={onView}
        onEdit={() => {}}
        onDelete={() => {}}
        readOnly
      />
    </Stack>
  );
}

ComplaintReportingPanel.propTypes = {
  complaints: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onView: PropTypes.func.isRequired,
};

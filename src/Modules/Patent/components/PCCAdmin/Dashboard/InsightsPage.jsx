import React, { useState, useEffect } from "react";
import { Table, Select, Button, Text, Container, Loader, Alert } from "@mantine/core";
import { DownloadSimple } from "@phosphor-icons/react";
import axios from "axios";
import "../../../style/Pcc_Admin/InsightsPage.css";
import { host } from "../../../../../routes/globalRoutes/index.jsx";

const API_BASE_URL = `${host}/patentsystem`;

// Map backend status names to display-friendly colors
const STATUS_COLORS = {
  Submitted: "#0056b3",
  "Reviewed by PCC Admin": "#17a2b8",
  Resubmitted: "#6f42c1",
  "Forwarded for Director's Review": "#fd7e14",
  Approved: "#32cd32",
  Rejected: "#ff6347",
  "Needs Revision": "#ffc107",
  Draft: "#6c757d",
  Withdrawn: "#adb5bd",
  "Patentability Check Started": "#20c997",
  "Patentability Check Completed": "#198754",
  "Search Report Generated": "#0dcaf0",
  "Patent Filed": "#0d6efd",
  "Patent Published": "#6610f2",
  "Patent Granted": "#28a745",
  "Patent Refused": "#dc3545",
};

function getStatusColor(status) {
  return STATUS_COLORS[status] || "#6c757d";
}

function InsightsPage() {
  const [selectedYear, setSelectedYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authToken = localStorage.getItem("authToken");

  const fetchAnalytics = async (year) => {
    try {
      setLoading(true);
      setError(null);
      const params = year && year !== "all" ? `?year=${year}` : "";
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/analytics/${params}`,
        {
          headers: { Authorization: `Token ${authToken}` },
        },
      );

      const stats = response.data.stats || [];
      const mapped = stats.map((item) => ({
        label: item.status,
        count: item.count,
        color: getStatusColor(item.status),
      }));
      setApplications(mapped);

      if (response.data.available_years) {
        setAvailableYears(response.data.available_years.map(String));
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedYear);
  }, [selectedYear]);

  const totalApplications = applications.reduce(
    (sum, app) => sum + app.count,
    0,
  );

  const handleDownload = () => {
    if (totalApplications === 0) return;
    const csvContent = `Status,Count,Percentage\n${applications
      .map(
        (app) =>
          `"${app.label}",${app.count},${(
            (app.count / totalApplications) *
            100
          ).toFixed(2)}%`,
      )
      .join("\n")}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Applications_${selectedYear === "all" ? "All_Years" : selectedYear}.csv`,
    );
    link.click();
  };

  const yearOptions = [
    { value: "all", label: "All Years" },
    ...availableYears.map((y) => ({ value: y, label: y })),
  ];

  return (
    <Container id="pms-insights-page">
      <Text order={2} align="left" id="pms-page-title">
        Applications Overview{" "}
        {selectedYear !== "all" ? `- ${selectedYear}` : ""}
      </Text>
      <Text align="left" size="sm" mb="lg" id="pms-description">
        Select a year from the dropdown below to view the statistics of
        applications for that year. You can also download the data as a CSV file
        for further analysis.
      </Text>

      <div id="pms-filter">
        <Text size="sm" weight={600}>
          Select Year:
        </Text>
        <Select
          id="pms-year-select"
          data={yearOptions}
          value={selectedYear}
          onChange={(value) => setSelectedYear(value)}
          radius="md"
          size="sm"
        />
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          <Loader size="lg" variant="dots" />
        </div>
      ) : error ? (
        <Alert color="red" title="Error" mt="md">
          {error}
        </Alert>
      ) : totalApplications === 0 ? (
        <Alert color="blue" title="No Data" mt="md">
          No applications found
          {selectedYear !== "all" ? ` for ${selectedYear}` : ""}.
        </Alert>
      ) : (
        <>
          <div id="pms-insights-content">
            <div id="pms-chart-section">
              <svg
                width="100%"
                height="300"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
              >
                {
                  applications.reduce(
                    (acc, app) => {
                      const { startAngle } = acc;
                      const sweepAngle =
                        (app.count / totalApplications) * 360;
                      const endAngle = startAngle + sweepAngle;

                      const largeArcFlag = sweepAngle > 180 ? 1 : 0;
                      const [startX, startY] = [
                        50 + 40 * Math.cos((Math.PI * startAngle) / 180),
                        50 + 40 * Math.sin((Math.PI * startAngle) / 180),
                      ];
                      const [endX, endY] = [
                        50 + 40 * Math.cos((Math.PI * endAngle) / 180),
                        50 + 40 * Math.sin((Math.PI * endAngle) / 180),
                      ];

                      const midAngle = startAngle + sweepAngle / 2;
                      const [textX, textY] = [
                        50 + 25 * Math.cos((Math.PI * midAngle) / 180),
                        50 + 25 * Math.sin((Math.PI * midAngle) / 180),
                      ];

                      acc.slices.push(
                        <g key={app.label}>
                          <path
                            d={`M50,50 L${startX},${startY} A40,40 0 ${largeArcFlag} 1 ${endX},${endY} Z`}
                            fill={app.color}
                          />
                          {sweepAngle > 15 && (
                            <text
                              x={textX}
                              y={textY}
                              fontSize="3.5"
                              fill="#fff"
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {(
                                (app.count / totalApplications) *
                                100
                              ).toFixed(1)}
                              %
                            </text>
                          )}
                        </g>,
                      );

                      acc.startAngle = endAngle;
                      return acc;
                    },
                    { slices: [], startAngle: 0 },
                  ).slices
                }
              </svg>

              <div id="pms-legend">
                {applications.map((app) => (
                  <div key={app.label} id="pms-legend-item">
                    <div
                      id="pms-legend-color"
                      style={{ backgroundColor: app.color }}
                    />
                    <span id="pms-legend-label">{app.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div id="pms-table-section">
              <Text id="pms-table-title" align="center" mb="md">
                Applications Data
              </Text>
              <Table highlightOnHover>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.label}>
                      <td>{app.label}</td>
                      <td>{app.count}</td>
                      <td>
                        {((app.count / totalApplications) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: "bold", borderTop: "2px solid #dee2e6" }}>
                    <td>Total</td>
                    <td>{totalApplications}</td>
                    <td>100.00%</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>

          <div id="pms-download-csv-button">
            <Button
              radius="md"
              size="md"
              variant="outline"
              leftIcon={<DownloadSimple size={16} />}
              onClick={handleDownload}
              id="pms-download-button"
            >
              Download CSV
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}

export default InsightsPage;

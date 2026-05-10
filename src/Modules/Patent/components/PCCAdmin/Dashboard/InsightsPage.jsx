import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Table, Select, Text, Container } from "@mantine/core";
import "../../../style/Pcc_Admin/InsightsPage.css";
import { fetchPccInsightsReport } from "../../../services/pccAdminService";

function InsightsPage({ fetchInsightsReport = fetchPccInsightsReport }) {
  InsightsPage.propTypes = {
    fetchInsightsReport: PropTypes.func,
  };
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearOptions, setYearOptions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalApplications = useMemo(
    () => applications.reduce((sum, app) => sum + app.count, 0),
    [applications],
  );

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchInsightsReport(selectedYear);
        setApplications(data.applications || []);

        const options = (data.available_years || []).map((year) =>
          String(year),
        );
        setYearOptions(options);

        const resolvedYear = String(data.selected_year);
        setSelectedYear(resolvedYear);
      } catch (err) {
        setError("Unable to load insights right now.");
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [selectedYear, fetchInsightsReport]);

  return (
    <Container id="pms-insights-page">
      <Text order={2} align="left" id="pms-page-title">
        Applications Overview - {selectedYear}
      </Text>
      <Text align="left" size="sm" mb="lg" id="pms-description">
        Select a year from the dropdown below to view the statistics of
        applications for that year.
      </Text>

      <div id="pms-filter">
        <Text size="sm" weight={600}>
          Select Year:
        </Text>
        <Select
          id="pms-year-select"
          data={yearOptions}
          value={selectedYear}
          onChange={setSelectedYear}
          radius="md"
          size="sm"
        />
      </div>

      {error && (
        <Text c="red" size="sm" mb="sm">
          {error}
        </Text>
      )}

      {loading ? (
        <Text size="sm">Loading insights...</Text>
      ) : (
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
                  (acc, app, index) => {
                    const { startAngle } = acc;
                    const sweepAngle = totalApplications
                      ? (app.count / totalApplications) * 360
                      : 0;
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
                      <g key={index}>
                        <path
                          d={`M50,50 L${startX},${startY} A40,40 0 ${largeArcFlag} 1 ${endX},${endY} Z`}
                          fill={app.color}
                        />
                        <text
                          x={textX}
                          y={textY}
                          fontSize="4"
                          fill="#fff"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {totalApplications
                            ? `${((app.count / totalApplications) * 100).toFixed(1)}%`
                            : "0.0%"}
                        </text>
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
              {applications.map((app, index) => (
                <div key={index} id="pms-legend-item">
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
                {applications.map((app, index) => (
                  <tr key={index}>
                    <td>{app.label}</td>
                    <td>{app.count}</td>
                    <td>
                      {totalApplications
                        ? `${((app.count / totalApplications) * 100).toFixed(2)}%`
                        : "0.00%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}
    </Container>
  );
}

export default InsightsPage;

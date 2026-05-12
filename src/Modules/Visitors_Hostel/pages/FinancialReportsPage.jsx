import React, { useMemo, useRef, useState } from "react";
import {
  Box,
  Table,
  MantineProvider,
  Text,
  Button,
  Group,
  Alert,
  NumberInput,
  Select,
  Divider,
  SimpleGrid,
} from "@mantine/core";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { reportsAPI } from "../services/visitorHostelApi";

const REPORT_TYPES = [
  { value: "bookings", label: "Booking Report" },
  { value: "inventory", label: "Inventory Report" },
];

const CHART_COLORS = ["#1C7ED6", "#2F9E44", "#F08C00", "#E03131", "#5F3DC4", "#0B7285"];

const chartBoxStyle = {
  border: "1px solid #E0E0E0",
  borderRadius: "8px",
  padding: "12px",
  backgroundColor: "#FFFFFF",
};

function FinancialManagement() {
  const [reportType, setReportType] = useState("bookings");
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingReport, setBookingReport] = useState({
    total_bookings: 0,
    offline_audit_count: 0,
    records: [],
  });
  const [inventoryReport, setInventoryReport] = useState({
    total_requests: 0,
    critical_items_count: 0,
    pending_replenishment_count: 0,
    request_records: [],
    inventory_snapshot: [],
  });
  const bookingStatusChartRef = useRef(null);
  const bookingSourceChartRef = useRef(null);
  const bookingTrendChartRef = useRef(null);
  const inventoryStatusChartRef = useRef(null);
  const inventoryUrgencyChartRef = useRef(null);
  const inventoryHealthChartRef = useRef(null);
  const inventoryStockChartRef = useRef(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      if (reportType === "bookings") {
        const data = await reportsAPI.getBookingsReport(days);
        if (data?.error || data?.detail) {
          throw data;
        }
        setBookingReport({
          total_bookings: data?.total_bookings || 0,
          offline_audit_count: data?.offline_audit_count || 0,
          records: data?.records || [],
        });
      } else {
        const data = await reportsAPI.getInventoryReport(days);
        if (data?.error || data?.detail) {
          throw data;
        }
        setInventoryReport({
          total_requests: data?.total_requests || 0,
          critical_items_count: data?.critical_items_count || 0,
          pending_replenishment_count: data?.pending_replenishment_count || 0,
          request_records: data?.request_records || [],
          inventory_snapshot: data?.inventory_snapshot || [],
        });
      }
    } catch (err) {
      setError(err?.detail || err?.error || "Failed to fetch report data.");
    } finally {
      setLoading(false);
    }
  };

  const bookingExportRows = useMemo(
    () =>
      (bookingReport.records || []).map((r) => ({
        booking_id: r.booking_id,
        booking_date: r.booking_date,
        booking_from: r.booking_from,
        booking_to: r.booking_to,
        status: r.status,
        source: r.source,
        audit_flag: r.audit_flag,
        intender: r.intender,
      })),
    [bookingReport.records]
  );

  const inventoryExportRows = useMemo(
    () =>
      (inventoryReport.request_records || []).map((r) => ({
        request_id: r.request_id,
        item_name: r.item_name,
        requested_quantity: r.requested_quantity,
        approved_quantity: r.approved_quantity,
        status: r.status,
        urgency: r.urgency,
        requested_by: r.requested_by,
        approved_by: r.approved_by,
        created_at: r.created_at,
      })),
    [inventoryReport.request_records]
  );

  const inventorySnapshotExportRows = useMemo(
    () =>
      (inventoryReport.inventory_snapshot || []).map((r) => ({
        item_id: r.item_id,
        item_name: r.item_name,
        quantity: r.quantity,
        threshold_quantity: r.threshold_quantity,
        is_critical: r.is_critical ? "YES" : "NO",
        pending_replenishment: r.pending_replenishment ? "YES" : "NO",
        category: r.category || "-",
      })),
    [inventoryReport.inventory_snapshot]
  );

  const bookingStatusData = useMemo(() => {
    const statusCount = {};
    (bookingReport.records || []).forEach((item) => {
      const key = item.status || "Unknown";
      statusCount[key] = (statusCount[key] || 0) + 1;
    });
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [bookingReport.records]);

  const bookingSourceData = useMemo(() => {
    const sourceCount = {};
    (bookingReport.records || []).forEach((item) => {
      const key = item.source || "unknown";
      sourceCount[key] = (sourceCount[key] || 0) + 1;
    });
    return Object.entries(sourceCount).map(([name, value]) => ({ name, value }));
  }, [bookingReport.records]);

  const bookingTrendData = useMemo(() => {
    const byDate = {};
    (bookingReport.records || []).forEach((item) => {
      const key = item.booking_date || "N/A";
      byDate[key] = (byDate[key] || 0) + 1;
    });
    return Object.entries(byDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [bookingReport.records]);

  const inventoryRequestStatusData = useMemo(() => {
    const statusCount = {};
    (inventoryReport.request_records || []).forEach((item) => {
      const key = item.status || "Unknown";
      statusCount[key] = (statusCount[key] || 0) + 1;
    });
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [inventoryReport.request_records]);

  const inventoryUrgencyData = useMemo(() => {
    const urgencyCount = {};
    (inventoryReport.request_records || []).forEach((item) => {
      const key = item.urgency || "Unknown";
      urgencyCount[key] = (urgencyCount[key] || 0) + 1;
    });
    return Object.entries(urgencyCount).map(([name, value]) => ({ name, value }));
  }, [inventoryReport.request_records]);

  const inventoryHealthData = useMemo(() => {
    const totalItems = (inventoryReport.inventory_snapshot || []).length;
    const criticalItems = Number(inventoryReport.critical_items_count || 0);
    const nonCriticalItems = Math.max(totalItems - criticalItems, 0);
    return [
      { name: "Critical", value: criticalItems },
      { name: "Non-Critical", value: nonCriticalItems },
    ];
  }, [inventoryReport.inventory_snapshot, inventoryReport.critical_items_count]);

  const lowStockItemsData = useMemo(() => {
    return (inventoryReport.inventory_snapshot || [])
      .filter((item) => Number(item.threshold_quantity || 0) > 0)
      .sort((a, b) => Number(a.quantity || 0) - Number(b.quantity || 0))
      .slice(0, 8)
      .map((item) => ({
        name: item.item_name,
        quantity: Number(item.quantity || 0),
        threshold: Number(item.threshold_quantity || 0),
      }));
  }, [inventoryReport.inventory_snapshot]);

  const getChartPngFromRef = async (chartRef) => {
    const container = chartRef?.current;
    if (!container) return null;

    const svgElement = container.querySelector("svg");
    if (!svgElement) return null;

    const bounds = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(bounds.width));
    const height = Math.max(1, Math.floor(bounds.height));

    const clonedSvg = svgElement.cloneNode(true);
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const serializedSvg = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });

      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const context = canvas.getContext("2d");
      if (!context) return null;
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png", 1.0);
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const exportVisualReport = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 32;
    const contentWidth = pageWidth - 2 * margin;
    const chartHeight = 185;
    let y = 36;

    const addSectionTitle = (title) => {
      if (y > pageHeight - 80) {
        doc.addPage();
        y = 36;
      }
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text(title, margin, y);
      y += 18;
    };

    const addChartImage = async (title, ref) => {
      const dataUrl = await getChartPngFromRef(ref);
      if (!dataUrl) return;

      if (y + chartHeight + 28 > pageHeight - 30) {
        doc.addPage();
        y = 36;
      }

      doc.setFontSize(11);
      doc.text(title, margin, y);
      y += 8;
      doc.addImage(dataUrl, "PNG", margin, y, contentWidth, chartHeight);
      y += chartHeight + 16;
    };

    doc.setFontSize(16);
    doc.setTextColor(14, 61, 99);
    doc.text(
      `${reportType === "bookings" ? "Booking" : "Inventory"} Report with Visuals`,
      margin,
      y
    );
    y += 20;
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Generated for last ${days} day(s)`, margin, y);
    y += 20;

    if (reportType === "bookings") {
      addSectionTitle("Key Metrics");
      doc.setFontSize(11);
      doc.text(`Total Bookings: ${bookingReport.total_bookings}`, margin, y);
      y += 14;
      doc.text(`Offline Audit Flag Count: ${bookingReport.offline_audit_count}`, margin, y);
      y += 18;

      addSectionTitle("Charts");
      await addChartImage("Bookings by Status", bookingStatusChartRef);
      await addChartImage("Bookings by Source", bookingSourceChartRef);
      await addChartImage("Booking Trend (By Date)", bookingTrendChartRef);

      addSectionTitle("Booking Records");
      autoTable(doc, {
        startY: y,
        head: [["Booking ID", "Date", "From", "To", "Status", "Source", "Audit", "Intender"]],
        body: bookingExportRows.map((r) => [
          r.booking_id,
          r.booking_date,
          r.booking_from,
          r.booking_to,
          r.status,
          r.source,
          r.audit_flag ? "TRUE" : "FALSE",
          r.intender,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [28, 126, 214] },
      });

      doc.save(`Booking_Report_with_Charts_Last_${days}_Days.pdf`);
      return;
    }

    addSectionTitle("Key Metrics");
    doc.setFontSize(11);
    doc.text(`Replenishment Requests: ${inventoryReport.total_requests}`, margin, y);
    y += 14;
    doc.text(`Critical Items: ${inventoryReport.critical_items_count}`, margin, y);
    y += 14;
    doc.text(`Pending Replenishment: ${inventoryReport.pending_replenishment_count}`, margin, y);
    y += 18;

    addSectionTitle("Charts");
    await addChartImage("Replenishment Requests by Status", inventoryStatusChartRef);
    await addChartImage("Request Urgency Distribution", inventoryUrgencyChartRef);
    await addChartImage("Inventory Health", inventoryHealthChartRef);
    await addChartImage("Lowest Stock Items (Top 8)", inventoryStockChartRef);

    addSectionTitle("Replenishment Request Records");
    autoTable(doc, {
      startY: y,
      head: [["Request ID", "Item", "Req Qty", "Appr Qty", "Status", "Urgency", "Requested By", "Created At"]],
      body: inventoryExportRows.map((r) => [
        r.request_id,
        r.item_name,
        r.requested_quantity,
        r.approved_quantity ?? "-",
        r.status,
        r.urgency,
        r.requested_by,
        r.created_at,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [240, 140, 0] },
    });

    const nextY = (doc.lastAutoTable?.finalY || y) + 16;
    autoTable(doc, {
      startY: nextY,
      head: [["Item ID", "Item", "Qty", "Threshold", "Critical", "Pending Repl.", "Category"]],
      body: inventorySnapshotExportRows.map((r) => [
        r.item_id,
        r.item_name,
        r.quantity,
        r.threshold_quantity,
        r.is_critical,
        r.pending_replenishment,
        r.category,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [12, 114, 133] },
    });

    doc.save(`Inventory_Report_with_Charts_Last_${days}_Days.pdf`);
  };

  const renderBookingsTable = (rows) => (
    <Table
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #E0E0E0",
        marginTop: "20px",
      }}
    >
      <thead>
        <tr>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Booking ID</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Date</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>From</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>To</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Status</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Source</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Audit Flag</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Intender</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item) => (
          <tr key={item.booking_id}>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.booking_id}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.booking_date}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.booking_from}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.booking_to}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.status}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.source}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.audit_flag ? "TRUE" : "FALSE"}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.intender}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const renderInventoryRequestsTable = (rows) => (
    <Table
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #E0E0E0",
        marginTop: "20px",
      }}
    >
      <thead>
        <tr>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Request ID</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Item</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Requested Qty</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Approved Qty</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Status</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Urgency</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Requested By</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Created At</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item) => (
          <tr key={item.request_id}>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.request_id}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.item_name}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.requested_quantity}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.approved_quantity ?? "-"}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.status}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.urgency}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.requested_by}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.created_at}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const renderInventorySnapshotTable = (rows) => (
    <Table
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #E0E0E0",
        marginTop: "20px",
      }}
    >
      <thead>
        <tr>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Item</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Quantity</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Threshold</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Critical</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Pending Replenishment</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Item ID</th>
          <th style={{ backgroundColor: "#E6F3FF", padding: "12px" }}>Category</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item) => (
          <tr key={item.item_id}>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.item_name}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.quantity}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.threshold_quantity}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.is_critical ? "YES" : "NO"}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.pending_replenishment ? "YES" : "NO"}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.item_id}</td>
            <td style={{ padding: "12px", borderBottom: "1px solid #E0E0E0", textAlign: "center" }}>{item.category || "-"}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Box
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Group mb="md" justify="space-between">
          <Group>
            <Select
              label="Report Type"
              data={REPORT_TYPES}
              value={reportType}
              onChange={(value) => setReportType(value || "bookings")}
              w={220}
            />
            <NumberInput
              label="Number of days"
              min={1}
              max={365}
              value={days}
              onChange={(value) => setDays(Number(value || 1))}
              w={180}
            />
            <Button onClick={fetchReport} loading={loading} mt={24}>Generate Report</Button>
          </Group>
          <Button
            onClick={exportVisualReport}
            disabled={
              loading ||
              (reportType === "bookings" && bookingExportRows.length === 0) ||
              (reportType === "inventory" && inventoryExportRows.length === 0 && inventorySnapshotExportRows.length === 0)
            }
          >
            Export Report
          </Button>
        </Group>

        {error && (
          <Alert type="error" mb="md">
            {error}
          </Alert>
        )}

        {loading ? (
          <Text mt="md">Generating report...</Text>
        ) : reportType === "bookings" ? (
          <>
            <Group mt="md" gap="lg">
              <Text fw={700}>Total Bookings: {bookingReport.total_bookings}</Text>
              <Text fw={700}>Offline Audit Flag Count: {bookingReport.offline_audit_count}</Text>
            </Group>

            {bookingReport.records.length > 0 && (
              <SimpleGrid cols={{ base: 1, md: 2 }} mt="md" spacing="md">
                <Box style={chartBoxStyle} ref={bookingStatusChartRef}>
                  <Text fw={600} mb="xs">Bookings by Status</Text>
                  <Box h={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={bookingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                          {bookingStatusData.map((entry, index) => (
                            <Cell key={`booking-status-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                <Box style={chartBoxStyle} ref={bookingSourceChartRef}>
                  <Text fw={600} mb="xs">Bookings by Source</Text>
                  <Box h={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingSourceData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Bookings" fill="#1C7ED6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                <Box style={{ ...chartBoxStyle, gridColumn: "1 / -1" }} ref={bookingTrendChartRef}>
                  <Text fw={600} mb="xs">Booking Trend (By Date)</Text>
                  <Box h={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bookingTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" name="Bookings" stroke="#2F9E44" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </SimpleGrid>
            )}

            {bookingReport.records.length === 0 ? (
              <Alert type="info" mt="md">No booking records found for selected days.</Alert>
            ) : (
              renderBookingsTable(bookingReport.records)
            )}
          </>
        ) : (
          <>
            <Group mt="md" gap="lg">
              <Text fw={700}>Replenishment Requests: {inventoryReport.total_requests}</Text>
              <Text fw={700}>Critical Items: {inventoryReport.critical_items_count}</Text>
              <Text fw={700}>Pending Replenishment: {inventoryReport.pending_replenishment_count}</Text>
            </Group>

            {(inventoryReport.request_records.length > 0 || inventoryReport.inventory_snapshot.length > 0) && (
              <SimpleGrid cols={{ base: 1, md: 2 }} mt="md" spacing="md">
                <Box style={chartBoxStyle} ref={inventoryStatusChartRef}>
                  <Text fw={600} mb="xs">Replenishment Requests by Status</Text>
                  <Box h={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inventoryRequestStatusData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Requests" fill="#F08C00" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                <Box style={chartBoxStyle} ref={inventoryUrgencyChartRef}>
                  <Text fw={600} mb="xs">Request Urgency Distribution</Text>
                  <Box h={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={inventoryUrgencyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                          {inventoryUrgencyData.map((entry, index) => (
                            <Cell key={`inventory-urgency-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                <Box style={chartBoxStyle} ref={inventoryHealthChartRef}>
                  <Text fw={600} mb="xs">Inventory Health</Text>
                  <Box h={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={inventoryHealthData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                          {inventoryHealthData.map((entry, index) => (
                            <Cell key={`inventory-health-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                <Box style={chartBoxStyle} ref={inventoryStockChartRef}>
                  <Text fw={600} mb="xs">Lowest Stock Items (Top 8)</Text>
                  <Box h={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lowStockItemsData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" hide />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantity" name="Quantity" fill="#1C7ED6" />
                        <Bar dataKey="threshold" name="Threshold" fill="#E03131" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </SimpleGrid>
            )}

            <Divider my="md" label="Recent Replenishment Requests" />
            {inventoryReport.request_records.length === 0 ? (
              <Alert type="info" mt="md">No inventory request records found for selected days.</Alert>
            ) : (
              renderInventoryRequestsTable(inventoryReport.request_records)
            )}

            <Divider my="md" label="Current Inventory Snapshot" />
            {inventoryReport.inventory_snapshot.length === 0 ? (
              <Alert type="info" mt="md">No inventory items available.</Alert>
            ) : (
              renderInventorySnapshotTable(inventoryReport.inventory_snapshot)
            )}
          </>
        )}
      </Box>
    </MantineProvider>
  );
}

export default FinancialManagement;

import React, { useEffect, useState } from "react";
import { Select, TextInput, Badge, Button, Loader, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Eye } from "@phosphor-icons/react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { EmptyTable } from "../../components/tables/EmptyTable";
import useFetchData from "../../hooks/useFetchData";
import { getOutbox } from "../../services/api";
import "../../styles/OutboxTable.css";

function OutboxTable() {
  const [outboxData, setOutboxData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filtering, setFiltering] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [fromDate, setFromDate] = useState("");

  const navigate = useNavigate();

  // ✅ Fetch data from service
  const { data, loading } = useFetchData(() => getOutbox(fromDate), [fromDate]);

  // ✅ Filter logic
  function applyFilters(status, type, date, baseData = outboxData) {
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

  // ✅ Transform incoming data
  useEffect(() => {
    if (!data) return;

    const combinedData = [
      ...(data.outbox_items || []).map((item) => ({
        ...item,
        type: item.type || "Document",
        date: item.submission_date?.split("T")[0] || item.date,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    setOutboxData(combinedData);
    applyFilters(selectedStatus, selectedType, fromDate, combinedData);
  }, [data]);

  // ✅ Navigation handlers
  const handleOutboxClick = (item) => {
    if (item.id) {
      navigate(`./view/${item.id}`);
    }
  };

  // ✅ UI helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge color="yellow">Pending</Badge>;
      case "Sent":
        return <Badge color="green">Sent</Badge>;
      case "Rejected":
        return <Badge color="red">Rejected</Badge>;
      case "Expired":
        return <Badge color="gray">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (outboxData.length === 0) {
    return <EmptyTable message="No items in outbox" />;
  }

  return (
    <div className="outbox-container">
      <div className="outbox-filters">
        <Group grow>
          <Select
            label="Filter by Status"
            placeholder="Select status"
            data={["All", "Pending", "Sent", "Rejected", "Expired"]}
            value={selectedStatus}
            onChange={(value) => {
              setSelectedStatus(value || "All");
              applyFilters(value || "All", selectedType, fromDate);
            }}
          />
          <Select
            label="Filter by Type"
            placeholder="Select type"
            data={["All", "Leave Request", "Document", "Report"]}
            value={selectedType}
            onChange={(value) => {
              setSelectedType(value || "All");
              applyFilters(selectedStatus, value || "All", fromDate);
            }}
          />
          <TextInput
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.currentTarget.value)}
          />
        </Group>
      </div>

      <div className="outbox-table">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Type</th>
              <th>Recipient</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item.id || index}>
                <td>{item.subject || item.title || "Document"}</td>
                <td>{item.type}</td>
                <td>{item.recipient || item.to || "-"}</td>
                <td>{getStatusBadge(item.status)}</td>
                <td>{item.date}</td>
                <td>
                  <Group spacing="xs">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => handleOutboxClick(item)}
                      leftIcon={<Eye size={14} />}
                    >
                      View
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtering && <Loader />}
    </div>
  );
}

export default OutboxTable;

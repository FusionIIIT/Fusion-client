import { useState, useEffect } from "react";
import axios from "axios";
import { Card, Title } from "@mantine/core";
import FusionTable from "../../components/FusionTable";
import { StatusBadge } from "../../ui/components/StatusBadge";
import * as URLS from "../../routes/academicRoutes";

const COLUMNS = ["Month", "Status", "Remark"];

const STATUS_LABEL = {
  approved_by_faculty: "pending_hod",
  approved_by_hod: "approved",
};

export function TADashboard() {
  const [stipends, setStipends] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    axios
      .get(URLS.TA_STIPENDS_URL, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((r) => setStipends(r.data.stipends));
  }, []);

  const rows = stipends.map((s, index) => ({
    id: s.id ?? `${s.month}-${s.year}-${index}`,
    Month: `${s.month}/${s.year}`,
    Status: (
      <StatusBadge status={STATUS_LABEL[s.status] ?? "pending_faculty"} />
    ),
    Remark: s.faculty_remark || "—",
  }));

  return (
    <Card shadow="sm" p={{ base: "md", sm: "lg" }} radius="md" withBorder>
      <Title order={3} mb="md">
        My Stipend Status
      </Title>
      <FusionTable
        columnNames={COLUMNS}
        elements={rows}
        ariaLabel="TA stipend status"
        emptyMessage="No stipend records yet."
      />
    </Card>
  );
}

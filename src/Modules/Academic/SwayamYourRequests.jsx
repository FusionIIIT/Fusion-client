import React, { useState, useEffect } from "react";
import { Alert, Loader, Center } from "@mantine/core";
import axios from "axios";
import { StatusBadge } from "../../ui/components/StatusBadge";
import FusionTable from "../../components/FusionTable";
import { courseLabel } from "../../lib/course";
import { formatDate } from "../../lib/datetime";
import { studentSwayamRequestsRoute } from "../../routes/academicRoutes";

export default function SwayamYourRequests({ requestType, refreshKey = 0 }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [requestType, refreshKey]);

  const fetchRequests = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(studentSwayamRequestsRoute, {
        params: { request_type: requestType },
        headers: { Authorization: `Token ${token}` },
      });
      setRequests(response.data.requests || []);
    } catch (err) {
      const errorMsg = err?.response?.data?.error || "Failed to load requests.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" mb="md" withCloseButton onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  if (requests.length === 0) {
    return (
      <Alert color="blue" mb="md">
        No {requestType === "Swayam_Replace" ? "replacement" : "extra credit"}{" "}
        requests found.
      </Alert>
    );
  }

  const isReplace = requestType === "Swayam_Replace";

  const columnNames = [
    "Requested",
    "Semester",
    ...(isReplace ? ["Source course"] : []),
    "New course",
    "Slot",
    "Status",
  ];

  const rows = requests.map((req) => ({
    id: req.id,
    Requested: formatDate(req.submitted_at),
    Semester: req.semester_no ? `Semester ${req.semester_no}` : "—",
    ...(isReplace
      ? { "Source course": req.old_course ? courseLabel(req.old_course) : "—" }
      : {}),
    "New course": courseLabel(req.new_course),
    Slot: req.slot.name,
    Status: <StatusBadge status={req.status} />,
  }));

  return (
    <FusionTable
      columnNames={columnNames}
      elements={rows}
      ariaLabel={`Your ${isReplace ? "replacement" : "extra credit"} requests`}
      emptyMessage="No requests found."
    />
  );
}

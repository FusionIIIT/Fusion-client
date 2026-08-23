import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Text,
  Badge,
  Center,
  Loader,
  Notification,
  Table,
} from "@mantine/core";
import axios from "axios";
import { examinerHonorariumListRoute } from "../../routes/academicRoutes";

const CATEGORY_COLOR = {
  indian: "grape",
  foreign: "cyan",
};

export default function HonorariumDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(examinerHonorariumListRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      setRows(res.data || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return <Notification color="red">Error: {error.message}</Notification>;
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      {rows.length === 0 ? (
        <Text c="dimmed" ta="center">
          No examiner has completed a review yet.
        </Text>
      ) : (
        <Table
          highlightOnHover
          aria-label="Examiner bank details for honorarium"
        >
          <thead>
            <tr>
              <th scope="col">Examiner</th>
              <th scope="col">Category</th>
              <th scope="col">Thesis</th>
              <th scope="col">Student</th>
              <th scope="col">Beneficiary</th>
              <th scope="col">Bank</th>
              <th scope="col">Account No.</th>
              <th scope="col">IFSC / IBAN</th>
              <th scope="col">PAN / SWIFT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.invitation_id}>
                <td>{r.examiner_name}</td>
                <td>
                  <Badge color={CATEGORY_COLOR[r.examiner_type]}>
                    {r.examiner_type === "indian" ? "Indian" : "Foreign"}
                  </Badge>
                </td>
                <td>{r.thesis_title}</td>
                <td>
                  {r.student_name} ({r.student_roll})
                </td>
                <td>{r.beneficiary_name || "N/A"}</td>
                <td>{r.bank_name || "N/A"}</td>
                <td>{r.account_no || "N/A"}</td>
                <td>
                  {r.examiner_type === "foreign"
                    ? r.iban_no || "N/A"
                    : r.ifsc_code || "N/A"}
                </td>
                <td>
                  {r.examiner_type === "foreign"
                    ? r.swift_code || "N/A"
                    : r.pan_no || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

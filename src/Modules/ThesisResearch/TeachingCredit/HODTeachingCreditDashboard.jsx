import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Tabs,
  Table,
  Button,
  Center,
  Loader,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { hodTeachingCreditDashboardRoute } from "../../../routes/academicRoutes";
import { authHeaders } from "./teachingCreditShared";
import HODDecideTeachingCreditModal from "./HODDecideTeachingCreditModal";
import HODCompleteTeachingCreditModal from "./HODCompleteTeachingCreditModal";

export default function HODTeachingCreditDashboard() {
  const [data, setData] = useState({ pending: [], awaiting_completion: [] });
  const [loading, setLoading] = useState(true);
  const [decideSel, setDecideSel] = useState(null);
  const [completeSel, setCompleteSel] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(hodTeachingCreditDashboardRoute, {
        headers: authHeaders(),
      });
      setData(res.data || { pending: [], awaiting_completion: [] });
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to load dashboard.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setDecideSel(null);
    setCompleteSel(null);
    fetchData();
  };

  if (loading)
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md">
        Teaching Credit — HOD
      </Title>

      <Tabs defaultValue="pending">
        <Tabs.List>
          <Tabs.Tab value="pending">
            Pending Decisions ({data.pending.length})
          </Tabs.Tab>
          <Tabs.Tab value="completion">
            Awaiting Completion ({data.awaiting_completion.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pending" pt="md">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Choices</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.pending.length === 0 && (
                <tr>
                  <td colSpan={4}>No registrations pending a decision.</td>
                </tr>
              )}
              {data.pending.map((r) => (
                <tr key={r.id}>
                  <td>{r.student_roll}</td>
                  <td>{r.student_name}</td>
                  <td>
                    {r.choices
                      .filter(Boolean)
                      .map((c) => c.code)
                      .join(", ")}
                  </td>
                  <td>
                    <Button size="xs" onClick={() => setDecideSel(r)}>
                      Decide
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="completion" pt="md">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Allocated Course</th>
                <th>Evaluations</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.awaiting_completion.length === 0 && (
                <tr>
                  <td colSpan={5}>No allocations awaiting completion.</td>
                </tr>
              )}
              {data.awaiting_completion.map((r) => (
                <tr key={r.id}>
                  <td>{r.student_roll}</td>
                  <td>{r.student_name}</td>
                  <td>
                    {r.allocated_course?.code} — {r.allocated_course?.name}
                  </td>
                  <td>{r.evaluation_count}</td>
                  <td>
                    <Button size="xs" onClick={() => setCompleteSel(r)}>
                      Mark Completion
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      {decideSel && (
        <HODDecideTeachingCreditModal
          registration={decideSel}
          onClose={() => setDecideSel(null)}
          refresh={handleRefresh}
        />
      )}
      {completeSel && (
        <HODCompleteTeachingCreditModal
          registration={completeSel}
          onClose={() => setCompleteSel(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}

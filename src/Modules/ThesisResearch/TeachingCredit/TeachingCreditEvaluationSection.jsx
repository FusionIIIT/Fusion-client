import React, { useState, useEffect, useCallback } from "react";
import { Text, Table, Button, Center, Loader } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { studentTeachingCreditEvaluationTargetsRoute } from "../../../routes/academicRoutes";
import { authHeaders } from "./teachingCreditShared";
import StudentEvaluationModal from "./StudentEvaluationModal";

/**
 * Self-contained "evaluate a Research Scholar" block -- shown to every
 * student regardless of programme_type, since the respondents are whichever
 * students are registered for the allocated course (usually UG), not just
 * PhD/PG students who see the rest of the Teaching Credit tab.
 */
export default function TeachingCreditEvaluationSection() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluateReg, setEvaluateReg] = useState(null);

  const fetchTargets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(studentTeachingCreditEvaluationTargetsRoute, {
        headers: authHeaders(),
      });
      setTargets(res.data.targets || []);
    } catch (e) {
      showNotification({
        title: "Error",
        message:
          e.response?.data?.error || "Failed to load evaluation targets.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const handleRefresh = () => {
    setEvaluateReg(null);
    fetchTargets();
  };

  if (loading) {
    return (
      <Center style={{ height: 100 }}>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Text fw={500} mb="xs">
        Evaluate a Research Scholar
      </Text>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Course</th>
            <th>Research Scholar</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {targets.length === 0 && (
            <tr>
              <td colSpan={3}>
                No pending evaluations for courses you&apos;re registered in.
              </td>
            </tr>
          )}
          {targets.map((t) => (
            <tr key={t.id}>
              <td>
                {t.allocated_course?.code} — {t.allocated_course?.name}
              </td>
              <td>{t.student_name}</td>
              <td>
                <Button size="xs" onClick={() => setEvaluateReg(t)}>
                  Evaluate
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {evaluateReg && (
        <StudentEvaluationModal
          registration={evaluateReg}
          onClose={() => setEvaluateReg(null)}
          refresh={handleRefresh}
        />
      )}
    </>
  );
}

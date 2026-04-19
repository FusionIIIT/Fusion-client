import React, { useEffect, useMemo, useState } from "react";
import { Button, Loader, Paper, Select, Table, Text } from "@mantine/core";
import axios from "axios";
import {
  Faculty_Supervisor_Assignment_Options,
  Faculty_Supervisor_Assignment_Update,
} from "../../../../routes/otheracademicRoutes";

function FacultySupervisorAssignment() {
  const authToken = localStorage.getItem("authToken");

  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedByRoll, setSelectedByRoll] = useState({});
  const [initialByRoll, setInitialByRoll] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const facultyOptions = useMemo(
    () => faculties.map((faculty) => ({ value: String(faculty.id), label: faculty.label })),
    [faculties],
  );

  const fetchOptions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(Faculty_Supervisor_Assignment_Options, {
        headers: { Authorization: `Token ${authToken}` },
      });

      const fetchedStudents = response?.data?.students || [];
      const fetchedFaculties = response?.data?.faculties || [];

      const selected = {};
      fetchedStudents.forEach((student) => {
        selected[student.roll_no] = student.assigned_faculty_id
          ? String(student.assigned_faculty_id)
          : null;
      });

      setStudents(fetchedStudents);
      setFaculties(fetchedFaculties);
      setSelectedByRoll(selected);
      setInitialByRoll(selected);
    } catch (err) {
      setError("Failed to fetch PG students/faculties for supervisor assignment.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchOptions();
    } else {
      setLoading(false);
      setError("Authentication token missing. Please login again.");
    }
  }, [authToken]);

  const handleFacultyChange = (rollNo, value) => {
    setSelectedByRoll((prev) => ({ ...prev, [rollNo]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    const assignments = students
      .filter((student) => selectedByRoll[student.roll_no])
      .filter(
        (student) =>
          String(selectedByRoll[student.roll_no]) !==
          String(initialByRoll[student.roll_no] || ""),
      )
      .map((student) => ({
        roll_no: student.roll_no,
        faculty_user_id: Number(selectedByRoll[student.roll_no]),
      }));

    if (!assignments.length) {
      setSaving(false);
      setMessage("No changes to save.");
      return;
    }

    try {
      const response = await axios.post(
        Faculty_Supervisor_Assignment_Update,
        { assignments },
        {
          headers: { Authorization: `Token ${authToken}` },
        },
      );

      setMessage(
        response?.data?.message || "Faculty supervisor assignments updated successfully.",
      );
      await fetchOptions();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Failed to update faculty supervisor assignments.",
      );
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <Loader color="blue" size="lg" />
      </div>
    );
  }

  return (
    <Paper className="responsive-table-container">
      <div className="table-wrapper" style={{ marginTop: "30px" }}>
        {error ? <Text c="red">{error}</Text> : null}
        {message ? <Text c="green">{message}</Text> : null}

        <Table striped highlightOnHover className="status-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Programme</th>
              <th>Faculty Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.roll_no}>
                <td>{student.roll_no}</td>
                <td>{student.name}</td>
                <td>{student.programme}</td>
                <td style={{ minWidth: "340px" }}>
                  <Select
                    placeholder="Select faculty supervisor"
                    searchable
                    clearable
                    data={facultyOptions}
                    value={selectedByRoll[student.roll_no] || null}
                    onChange={(value) =>
                      handleFacultyChange(student.roll_no, value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <center>
        <Button onClick={handleSave} mt="md" loading={saving}>
          Save Assignments
        </Button>
      </center>
    </Paper>
  );
}

export default FacultySupervisorAssignment;

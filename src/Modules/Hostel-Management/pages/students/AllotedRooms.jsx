import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Alert, Box, Group, Loader, Text } from "@mantine/core";
import StudentInfoCard from "../../components/cards/StudentInfoCard";
import StudentInfo from "../all-actors/StudentInfo";
import { studentService } from "../../services";
import { getApiErrorMessage } from "../../utils";

export default function StudentDashboard() {
  const [allStudents, setAllStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRollNo = useSelector((state) => state.user.roll_no);
  const requestRef = useRef(0);

  const fetchAllStudentsInfo = async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    try {
      setLoading(true);
      const response = await studentService.getStudentsInfo();
      if (requestId !== requestRef.current) return;

      setAllStudents(response.data);

      // Filter to find the current student
      const currentStudentData = response.data.find(
        (student) => student.id__user__username === userRollNo,
      );

      if (currentStudentData) {
        setCurrentStudent(currentStudentData);
        setError(null);
      } else {
        setError("Current student information not found.");
      }
    } catch (err) {
      if (requestId !== requestRef.current) return;
      setError(
        getApiErrorMessage(
          err,
          "Failed to fetch student information. Please try again later.",
        ),
      );
      setAllStudents([]);
      setCurrentStudent(null);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    fetchAllStudentsInfo();
  }, []);

  return (
    <Box style={{ overflow: "hidden" }}>
      {error && (
        <Alert title="Error" color="red" mb="sm">
          {error}
        </Alert>
      )}
      <Group align="flex-start" style={{ height: "78vh" }}>
        <Box style={{ height: "100%" }}>
          {loading ? (
            <Loader size="md" />
          ) : error ? (
            <Text color="red">{error}</Text>
          ) : currentStudent ? (
            <StudentInfoCard
              name={currentStudent.id__user__username}
              programme={currentStudent.programme}
              batch={currentStudent.batch}
              cpi={currentStudent.cpi}
              category={currentStudent.category}
              hall_id={currentStudent.hall_id}
              room_no={currentStudent.room_no}
            />
          ) : (
            <Text>No student information available</Text>
          )}
        </Box>
        <Box style={{ height: "100%", flex: 1 }}>
          <StudentInfo students={allStudents} />
        </Box>
      </Group>
    </Box>
  );
}

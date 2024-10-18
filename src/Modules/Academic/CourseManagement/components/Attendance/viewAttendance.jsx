import React from "react";
import { Table } from "@mantine/core";
import "./View_Attendance.css";

function Viewattendance() {
  const attendanceData = [
    { rollNo: "22BCS001", totalPresent: 7, percentage: "70%" },
    { rollNo: "22BCS002", totalPresent: 7, percentage: "70%" },
    { rollNo: "22BCS003", totalPresent: 8, percentage: "80%" },
    { rollNo: "22BCS004", totalPresent: 7, percentage: "70%" },
    { rollNo: "22BCS005", totalPresent: 7, percentage: "70%" },
    { rollNo: "22BCS006", totalPresent: 8, percentage: "80%" },
    { rollNo: "22BCS007", totalPresent: 7, percentage: "70%" },
  ];

  return (
    <div className="attendance-page">
      <h2>View Attendance</h2>
      <p>Total Attendance = 80%</p>
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>Roll No.</th>
            <th>Total Present</th>
            <th>Attendance Percentage</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((student) => (
            <tr key={student.rollNo}>
              <td>{student.rollNo}</td>
              <td>{student.totalPresent}</td>
              <td>{student.percentage}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Viewattendance;

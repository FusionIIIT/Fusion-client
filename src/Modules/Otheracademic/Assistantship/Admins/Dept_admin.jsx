import React, { useState } from "react";
import { Table } from "@mantine/core";

function DeptAdminPage() {
  const [requests] = useState([
    {
      id: 1,
      studentName: "Alice",
      rollNumber: "2021007",
      status: "Approved by HoD",
    },
    {
      id: 2,
      studentName: "Bob",
      rollNumber: "2021008",
      status: "Approved by Academic Admin",
    },
  ]);

  return (
    <div>
      <h2>Department Admin - Assistantship Requests</h2>
      <Table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Roll Number</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.studentName}</td>
              <td>{request.rollNumber}</td>
              <td>{request.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default DeptAdminPage;
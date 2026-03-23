/**
 * Approve Leave Component - Refactored to use reusable ApprovalTable.
 */
import React from 'react';
import { Text } from '@mantine/core';
import ApprovalTable from '../components/tables/ApprovalTable';
import { leaveService } from '../api';

function ApproveLeave() {
  const columns = [
    { field: 'name', label: 'Student Name' },
  ];

  const renderModalContent = (selectedStudent) => {
    if (!selectedStudent) return null;

    const details = selectedStudent.details || {};

    return (
      <div>
        <Text><strong>Date From:</strong> {details.dateFrom}</Text>
        <Text><strong>Date To:</strong> {details.dateTo}</Text>
        <Text><strong>Leave Type:</strong> {details.leaveType}</Text>
        <Text><strong>Address:</strong> {details.address}</Text>
        <Text><strong>Purpose:</strong> {details.purpose}</Text>
        <Text><strong>HOD Credential:</strong> {details.hodCredential}</Text>
        <Text><strong>Mobile Number:</strong> {details.mobileNumber}</Text>
        <Text><strong>Parents' Mobile Number:</strong> {details.parentsMobile}</Text>
        <Text><strong>Mobile During Leave:</strong> {details.mobileDuringLeave}</Text>
        <Text><strong>Semester:</strong> {details.semester}</Text>
        <Text><strong>Academic Year:</strong> {details.academicYear}</Text>
        <Text><strong>Date of Application:</strong> {details.dateOfApplication}</Text>
      </div>
    );
  };

  return (
    <ApprovalTable
      title="Approve Leave Requests"
      fetchData={leaveService.getPendingLeaves}
      updateStatus={leaveService.updateLeaveStatus}
      columns={columns}
      renderModalContent={renderModalContent}
      idField="id"
      rollNoField="rollNo"
    />
  );
}

export default ApproveLeave;

/**
 * Leave Status Component - Refactored to use centralized services.
 */
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import StatusTable from '../components/tables/StatusTable';
import { leaveService } from '../api';

function LeaveStatus() {
  const roll = useSelector((state) => state.user.roll_no);
  const name = useSelector((state) => state.user.username);

  const fetchLeaveData = useCallback(async () => {
    return await leaveService.getLeaveRequests(roll, name);
  }, [roll, name]);

  const columns = [
    { field: 'rollNo', label: 'Roll No' },
    { field: 'name', label: 'Name' },
    { field: 'dateFrom', label: 'Date From' },
    { field: 'dateTo', label: 'Date To' },
    { field: 'leaveType', label: 'Leave Type' },
    {
      field: 'attachment',
      label: 'Attachment',
      render: (item) => item.attachment || 'N/A'
    },
    { field: 'purpose', label: 'Purpose' },
    { field: 'address', label: 'Address' },
    { field: 'action', label: 'Status' },
  ];

  return (
    <StatusTable
      title="Leave Request Status"
      fetchData={fetchLeaveData}
      columns={columns}
      statusField="action"
      emptyMessage="No leave requests found."
    />
  );
}

export default LeaveStatus;

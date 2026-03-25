/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Box, Text } from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";

export default function AttendanceRecordsTable({ isFaculty, records }) {
  // Faculty gets a map: { "2026-03-25": [ {student_id, name, present}, ... ] }
  // Student gets a list: [ {date, present}, ... ]
  const tableData = React.useMemo(() => {
    if (isFaculty) {
      const out = [];
      const map =
        records && typeof records === "object" && !Array.isArray(records)
          ? records
          : {};
      Object.keys(map)
        .sort()
        .forEach((date) => {
          (map[date] || []).forEach((r) => {
            out.push({
              date,
              student_id: r.student_id,
              name: r.name,
              present: r.present ? "Present" : "Absent",
            });
          });
        });
      return out;
    }
    const list = Array.isArray(records) ? records : [];
    return list.map((r) => ({
      date: r.date,
      present: r.present ? "Present" : "Absent",
    }));
  }, [records, isFaculty]);

  const columns = React.useMemo(() => {
    if (isFaculty) {
      return [
        { accessorKey: "date", header: "Date" },
        { accessorKey: "student_id", header: "Student" },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "present", header: "Status" },
      ];
    }
    return [
      { accessorKey: "date", header: "Date" },
      { accessorKey: "present", header: "Status" },
    ];
  }, [isFaculty]);

  return (
    <Box p="md">
      <Text size="xl" mb="md">
        Attendance Records
      </Text>
      <MantineReactTable columns={columns} data={tableData} />
    </Box>
  );
}

AttendanceRecordsTable.propTypes = {
  isFaculty: PropTypes.bool,
  records: PropTypes.any,
};

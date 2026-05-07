/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Box, Text } from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";

export default function AttendanceRecordsTable({ isFaculty, records }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };
  // Both faculty and students get a map: { "2026-03-25": [ {student_id?, name?, present}, ... ] }
  // For students, each date has one entry with just {present}
  const tableData = React.useMemo(() => {
    const out = [];

    if (isFaculty) {
      const map =
        records && typeof records === "object" && !Array.isArray(records)
          ? records
          : {};
      Object.keys(map)
        .sort()
        .forEach((date) => {
          (map[date] || []).forEach((r) => {
            out.push({
              date: formatDate(date),
              student_id: r.student_id,
              name: r.name,
              present: r.present ? "Present" : "Absent",
            });
          });
        });
      return out;
    }

    // Student view: may receive a map or a list
    if (Array.isArray(records)) {
      records
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach((r) => {
          out.push({
            date: formatDate(r.date),
            present: r.present ? "Present" : "Absent",
          });
        });
      return out;
    }

    const map =
      records && typeof records === "object" && Object.keys(records).length
        ? records
        : {};
    Object.keys(map)
      .sort()
      .forEach((date) => {
        (map[date] || []).forEach((r) => {
          out.push({
            date: formatDate(date),
            present: r.present ? "Present" : "Absent",
          });
        });
      });
    return out;
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

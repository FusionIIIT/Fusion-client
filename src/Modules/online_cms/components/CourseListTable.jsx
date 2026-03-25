/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Box, Text } from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";
import { useNavigate } from "react-router-dom";

export default function CourseListTable({ data = [] }) {
  const navigate = useNavigate();
  const columns = React.useMemo(
    () => [
      { accessorKey: "courseCode", header: "Course Code" },
      { accessorKey: "courseName", header: "Course Name" },
      { accessorKey: "semester", header: "Semester" },
      { accessorKey: "credits", header: "Credits" },
    ],
    [],
  );

  return (
    <Box p="md">
      <Text size="xl" mb="md">
        My Courses
      </Text>
      <MantineReactTable
        columns={columns}
        data={data}
        mantineTableBodyRowProps={({ row }) => ({
          onClick: () => navigate(`/online-cms/${row.original.courseCode}`),
          sx: { cursor: "pointer" },
        })}
      />
    </Box>
  );
}

CourseListTable.propTypes = {
  data: PropTypes.array,
};

/* eslint-disable */
import React, { useEffect, useState } from "react";
import CourseListTable from "./components/CourseListTable";
import { getCourses } from "./api";

export default function CourseList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getCourses().then((data) => {
      if (Array.isArray(data)) setCourses(data);
    });
  }, []);

  return <CourseListTable data={courses} />;
}

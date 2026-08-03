/* eslint-disable */
import React from "react";
import { useParams } from "react-router-dom";
import CourseDashboard from "./components/CourseDashboard";

export default function CourseHome() {
  const { courseCode } = useParams();
  return <CourseDashboard courseCode={courseCode} />;
}

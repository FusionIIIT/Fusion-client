/* eslint-disable */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import AttendanceForm from "./components/AttendanceForm";
import AttendanceRecordsTable from "./components/AttendanceRecordsTable";
import {
  getAttendanceRecords,
  getAttendanceRoster,
  submitAttendance,
} from "./api";

const isFacultyRole = (role) => {
  const roleStr = String(role || "");
  return roleStr === "faculty" || roleStr === "staff";
};

export default function AttendanceFeature({ courseCode: courseCodeProp }) {
  const role = useSelector((state) => state.user.role);
  const isFaculty = isFacultyRole(role);

  const courseCode = courseCodeProp;
  const [records, setRecords] = useState([]);
  const [roster, setRoster] = useState([]);

  const load = () => {
    if (!courseCode) return;
    getAttendanceRecords(courseCode).then((data) => setRecords(data || []));
    if (isFaculty) {
      getAttendanceRoster(courseCode).then((data) => setRoster(data || []));
    }
  };

  useEffect(() => {
    load();
  }, [courseCode, isFaculty]);

  const handleSubmit = async (data) => {
    await submitAttendance(courseCode, data);
    load();
  };

  return (
    <div>
      <AttendanceForm
        courseCode={courseCode}
        isFaculty={isFaculty}
        roster={roster}
        onSubmit={handleSubmit}
      />
      <AttendanceRecordsTable isFaculty={isFaculty} records={records} />
    </div>
  );
}

AttendanceFeature.propTypes = {
  courseCode: PropTypes.string,
};

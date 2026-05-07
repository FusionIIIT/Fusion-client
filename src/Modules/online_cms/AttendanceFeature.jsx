/* eslint-disable */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Loader, Center, Stack, Alert } from "@mantine/core";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import { setCurrentModule, setActiveTab_ } from "../../redux/moduleslice";
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
  const dispatch = useDispatch();
  const isFaculty = isFacultyRole(role);

  useEffect(() => {
    dispatch(setCurrentModule("Course Management"));
    dispatch(setActiveTab_("Attendance"));
  }, [dispatch]);

  const courseCode = courseCodeProp;
  const [records, setRecords] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!courseCode) return;
    setLoading(true);
    try {
      const recordsData = await getAttendanceRecords(courseCode);
      console.log("[AttendanceFeature] recordsData:", recordsData);

      let normalized = recordsData || [];

      if (!isFaculty) {
        // Student branch: normalize to map by date if getting array
        if (Array.isArray(recordsData)) {
          const map = {};
          recordsData.forEach((item) => {
            const dateKey = item?.date || item?.day || item?.dateString || "";
            if (dateKey) {
              if (!map[dateKey]) map[dateKey] = [];
              map[dateKey].push(item);
            }
          });
          if (Object.keys(map).length > 0) {
            normalized = map;
          } else {
            normalized = recordsData;
          }
        } else if (recordsData && typeof recordsData === "object") {
          normalized = recordsData;
        }
      }

      setRecords(normalized);

      if (isFaculty) {
        const rosterData = await getAttendanceRoster(courseCode);
        setRoster(rosterData || []);
        if (!rosterData || rosterData.length === 0) {
          setError("No students found in roster for this course");
        } else {
          setError(null);
        }
      }
    } catch (err) {
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [courseCode, isFaculty]);

  const handleSubmit = async (data) => {
    try {
      await submitAttendance(courseCode, data);
      setError(null);
      await load();
    } catch (err) {
      setError("Failed to submit attendance");
    }
  };

  return (
    <Stack gap="md">
      <CustomBreadcrumbs />
      {error && (
        <Alert color="orange" title="Notice">
          {error}
        </Alert>
      )}
      {loading && (
        <Center p="lg">
          <Loader />
        </Center>
      )}
      {!loading && (
        <>
          <AttendanceForm
            courseCode={courseCode}
            isFaculty={isFaculty}
            roster={roster}
            records={records}
            onSubmit={handleSubmit}
          />
          <AttendanceRecordsTable isFaculty={isFaculty} records={records} />
        </>
      )}
    </Stack>
  );
}

AttendanceFeature.propTypes = {
  courseCode: PropTypes.string,
};

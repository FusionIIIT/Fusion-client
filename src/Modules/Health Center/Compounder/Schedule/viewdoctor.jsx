/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { Badge, Button, Group, Loader, Paper, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import NavCom from "../NavCom";
import ScheduleNavBar from "./schedulePath";
import {
  fetchCompounderDoctorSchedule,
  fetchDoctorAttendance,
  markDoctorAttendance,
} from "../../services/api";
import CustomBreadcrumbs from "../../components/common/Breadcrumbs";

function Dropdown({ doctorName, selectedDay, onDayChange }) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return (
    <select
      value={selectedDay}
      onChange={(e) => onDayChange(doctorName, e.target.value)}
    >
      <option value="">Select Day</option>
      {days.map((day) => (
        <option key={day} value={day}>
          {day}
        </option>
      ))}
    </select>
  );
}

function Time({ selectedDay, schedule }) {
  const availableTime =
    schedule.find((slot) => slot.day === selectedDay)?.time || "Not Available";
  return <div>{availableTime}</div>;
}

function Viewdoctor() {
  const [selectedDays, setSelectedDays] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [attendanceByDoctor, setAttendanceByDoctor] = useState({});
  const [markingDoctorId, setMarkingDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const todayDate = new Date().toISOString().slice(0, 10);

  const handleDayChange = (doctorName, day) => {
    setSelectedDays((prevSelectedDays) => ({
      ...prevSelectedDays,
      [doctorName]: day,
    }));
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetchDoctorAttendance(todayDate);
      const map = {};
      (response.data || []).forEach((row) => {
        map[row.doctor_id] = row.is_present;
      });
      setAttendanceByDoctor(map);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await fetchCompounderDoctorSchedule();
      setSchedule(response.data.schedule || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceMark = async (doctorId, isPresent) => {
    if (!doctorId) {
      notifications.show({
        title: "Mark Attendance Failed",
        message: "Doctor ID missing. Refresh and try again.",
        color: "red",
      });
      return;
    }

    setMarkingDoctorId(doctorId);
    try {
      await markDoctorAttendance({
        doctor_id: doctorId,
        attendance_date: todayDate,
        is_present: isPresent,
      });
      setAttendanceByDoctor((prev) => ({
        ...prev,
        [doctorId]: isPresent,
      }));
      notifications.show({
        title: "Attendance Updated",
        message: isPresent
          ? "Doctor marked present for today."
          : "Doctor marked absent for today.",
        color: "teal",
      });
    } catch (err) {
      console.log(err);
      notifications.show({
        title: "Mark Attendance Failed",
        message: err?.response?.data?.detail || "Unable to update attendance.",
        color: "red",
      });
    } finally {
      setMarkingDoctorId(null);
    }
  };

  useEffect(() => {
    const hydrate = async () => {
      await Promise.all([fetchSchedule(), fetchAttendance()]);
    };
    hydrate();
  }, []);

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <ScheduleNavBar />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
        <Title
          order={3}
          style={{
            textAlign: "center",
            margin: "0 auto",
            color: "#15abff",
          }}
        >
          View Doctor Schedule
        </Title>
        <br />
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Loader size={50} color="#15abff" />
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ccc",
              textAlign: "center",
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Doctor Name
                </th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Specialization
                </th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Day
                </th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Time
                </th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Today Status
                </th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Mark Attendance
                </th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, index) => (
                <tr
                  key={item.id || `${item.name}-${index}`}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#FAFAFA",
                    minHeight: "60px",
                  }}
                >
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {item.name}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {item.specialization}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <Dropdown
                      doctorName={item.name}
                      selectedDay={selectedDays[item.name] || ""}
                      onDayChange={handleDayChange}
                    />
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <Time
                      doctorName={item.name}
                      selectedDay={selectedDays[item.name] || ""}
                      schedule={item.availability}
                    />
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {attendanceByDoctor[item.id] === true && (
                      <Badge color="teal">Present</Badge>
                    )}
                    {attendanceByDoctor[item.id] === false && (
                      <Badge color="red">Absent</Badge>
                    )}
                    {attendanceByDoctor[item.id] === undefined && (
                      <Badge color="gray">Not Marked</Badge>
                    )}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <Group justify="center" gap="xs">
                      <Button
                        size="xs"
                        color="teal"
                        loading={markingDoctorId === item.id}
                        onClick={() => handleAttendanceMark(item.id, true)}
                      >
                        Present
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        loading={markingDoctorId === item.id}
                        onClick={() => handleAttendanceMark(item.id, false)}
                      >
                        Absent
                      </Button>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Paper>
    </>
  );
}

export default Viewdoctor;

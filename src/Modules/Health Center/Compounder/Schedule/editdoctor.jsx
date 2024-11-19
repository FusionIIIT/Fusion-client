/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Paper } from "@mantine/core";
import NavCom from "../NavCom";
import ScheduleNavBar from "./schedulePath";
import { compounderRoute } from "../../../../routes/health_center";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";

function Editdoctor() {
  const [doctorName, setDoctorName] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [dayToAdd, setDayToAdd] = useState("");
  const [doctorToRemove, setDoctorToRemove] = useState("");
  const [dayToRemove, setDayToRemove] = useState("");
  const [roomToAdd, setRoom] = useState("");
  const [doctors, setDoctors] = useState([]);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "20px",
    backgroundColor: "#f0f0f0",
    gap: "20px",
  };

  const boxStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    flex: "1",
    minWidth: "300px",
  };

  const titleStyle = {
    fontSize: "20px",
    marginBottom: "10px",
    color: "#333",
  };

  const formGroupStyle = {
    marginBottom: "10px",
    display: "flex",
    gap: "20px",
  };

  const buttonStyle = {
    padding: "5px 10px",
    backgroundColor: "#15abff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  const selectStyle = {
    padding: "10px",
    width: "30%",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  };

  const responsiveContainerStyle = {
    ...containerStyle,
    "@media (min-width: 768px)": {
      flexDirection: "row",
    },
  };

  const fetchDoctors = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        compounderRoute,
        { get_doctors: 1 },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      console.log(response);
      setDoctors(response.data.doctors);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const editSchedule = async () => {
    if (timeIn > timeOut) {
      alert("Enter Valid Time");
      return false;
    }
    if (roomToAdd === "") {
      alert("Enter Room Number");
      return false;
    }
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        compounderRoute,
        {
          doctor: doctorName,
          day: dayToAdd,
          room: roomToAdd,
          time_in: timeIn,
          time_out: timeOut,
          edit_1: 1,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      console.log(response);
      alert("schedule added successfully");
    } catch (err) {
      console.log(err);
    }
  };

  const removeSchedule = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        compounderRoute,
        {
          doctor: doctorToRemove,
          day: dayToRemove,
          rmv: 1,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      console.log(response);
      alert("schedule removed successfully");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <ScheduleNavBar />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
        <div style={responsiveContainerStyle}>
          <div style={boxStyle}>
            <h3 style={titleStyle}>Add Doctor Schedule</h3>
            <div style={formGroupStyle}>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                style={selectStyle}
              >
                <option value="" disabled>
                  Select Doctor
                </option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.doctor_name}
                  </option>
                ))}
              </select>
              <select
                value={dayToAdd}
                onChange={(e) => setDayToAdd(e.target.value)}
                style={selectStyle}
              >
                <option value="" disabled>
                  Select Day
                </option>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <input
                type="time"
                value={timeIn}
                onChange={(e) => setTimeIn(e.target.value)}
                placeholder="Time In"
                style={{ marginRight: "10px", marginBottom: "10px" }}
              />
              <input
                type="time"
                value={timeOut}
                onChange={(e) => setTimeOut(e.target.value)}
                placeholder="Time Out"
                style={{ marginRight: "10px", marginBottom: "10px" }}
              />
              <input
                type="number"
                placeholder="Room No"
                style={{ marginRight: "10px", marginBottom: "10px" }}
                value={roomToAdd}
                onChange={(e) => setRoom(e.target.value)}
              />
              <button style={buttonStyle} onClick={editSchedule}>
                Add Schedule
              </button>
            </div>
          </div>

          <div style={boxStyle}>
            <h3 style={titleStyle}>Remove Doctor Schedule</h3>
            <div style={formGroupStyle}>
              <select
                value={doctorToRemove}
                onChange={(e) => setDoctorToRemove(e.target.value)}
                style={selectStyle}
              >
                <option value="" disabled>
                  Select Doctor
                </option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.doctor_name}
                  </option>
                ))}
              </select>
              <select
                value={dayToRemove}
                onChange={(e) => setDayToRemove(e.target.value)}
                style={selectStyle}
              >
                <option value="" disabled>
                  Select Day
                </option>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <button style={buttonStyle} onClick={removeSchedule}>
                Remove Schedule
              </button>
            </div>
          </div>
        </div>
      </Paper>
    </>
  );
}

export default Editdoctor;

/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Paper } from "@mantine/core";
import NavCom from "../NavCom";
import ScheduleNavBar from "./schedulePath";

function Editdoctor() {
  const [doctorName, setDoctorName] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [dayToAdd, setDayToAdd] = useState("");
  const [doctorToRemove, setDoctorToRemove] = useState("");
  const [dayToRemove, setDayToRemove] = useState("");

  const doctors = ["Dr GS Sandhu", "Dr Aditya Shivi", "Dr Sonali Verma"];

  const handleAddSchedule = () => {
    console.log("Added Schedule:", { doctorName, timeIn, timeOut, dayToAdd });
  };

  const handleRemoveSchedule = () => {
    console.log("Removed Schedule:", { doctorToRemove, dayToRemove });
  };

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

  return (
    <div>
      <NavCom />
      <ScheduleNavBar />
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
                  <option key={doctor} value={doctor}>
                    {doctor}
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
              <button style={buttonStyle} onClick={handleAddSchedule}>
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
                  <option key={doctor} value={doctor}>
                    {doctor}
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
              <button style={buttonStyle} onClick={handleRemoveSchedule}>
                Remove Schedule
              </button>
            </div>
          </div>
        </div>
      </Paper>
    </div>
  );
}

export default Editdoctor;

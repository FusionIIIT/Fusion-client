/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Radio } from "@mantine/core";
import NavCom from "../NavCom";

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

function Viewpath() {
  const [selectedDays, setSelectedDays] = useState({});

  const handleDayChange = (doctorName, day) => {
    setSelectedDays((prevSelectedDays) => ({
      ...prevSelectedDays,
      [doctorName]: day,
    }));
  };

  const pathologistSchedule = [
    {
      name: "Dr Rajiv Kapoor",
      specialization: "Hematology",
      availability: [{ day: "Monday", time: "9:00 am - 12:00 pm" }],
    },
    {
      name: "Dr Shreya Sen",
      specialization: "Cytology",
      availability: [{ day: "Wednesday", time: "11:00 am - 3:00 pm" }],
    },
    {
      name: "Dr Anjali Deshmukh",
      specialization: "Histology",
      availability: [{ day: "Saturday", time: "10:00 am - 1:00 pm" }],
    },
    {
      name: "Dr Shefali Verma",
      specialization: "Histology",
      availability: [{ day: "Sunday", time: "1:00 pm - 5:00 pm" }],
    },
  ];

  return (
    <div>
      <NavCom />
      <br />
      <div
        style={{
          display: "flex",
          padding: "0.5rem",
          border: "1px solid",
          backgroundColor: "white",
          borderRadius: "9999px",
          width: "50rem",
          gap: "1rem",
        }}
      >
        <NavLink
          to="/compounder/viewdoctor"
          style={{
            textDecoration: "none",
            color: "black",
          }}
        >
          <Radio label="View doctor Schedule" color="grape" variant="outline" />
        </NavLink>

        <NavLink
          to="/compounder/editdoctor"
          style={{
            textDecoration: "none",
            color: "black",
          }}
        >
          <Radio label="Edit doctor schedule" color="grape" variant="outline" />
        </NavLink>
        <NavLink
          to="/compounder/viewpath"
          style={{
            textDecoration: "none",
            color: "black",
          }}
        >
          <Radio
            label="View pathologist schedule"
            color="grape"
            variant="outline"
            defaultChecked
          />
        </NavLink>
        <NavLink
          to="/compounder/editpath"
          style={{
            textDecoration: "none",
            color: "black",
          }}
        >
          <Radio
            label="Edit pathologist schedule"
            color="grape"
            variant="outline"
          />
        </NavLink>
      </div>

      <br />
      <table
        style={{
          backgroundColor: "#e9d8fd",
          borderRadius: "10px",
          overflow: "hidden",
          width: "100%",
          minWidth: "320px",
        }}
      >
        <thead
          style={{
            backgroundColor: "#6D28D9",
            color: "#fff",
            textAlign: "left",
          }}
        >
          <tr>
            <th style={{ padding: "15px", fontSize: "18px" }}>Doctor Name</th>
            <th style={{ padding: "15px", fontSize: "18px" }}>
              Specialization
            </th>
            <th style={{ padding: "15px", fontSize: "18px" }}>Day</th>
            <th style={{ padding: "15px", fontSize: "18px" }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {pathologistSchedule.map((item, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? "#ede9fe" : "#faf5ff",
                minHeight: "60px",
              }}
            >
              <td style={{ padding: "15px" }}>{item.name}</td>
              <td style={{ padding: "15px" }}>{item.specialization}</td>
              <td style={{ padding: "15px" }}>
                <Dropdown
                  doctorName={item.name}
                  selectedDay={selectedDays[item.name] || ""}
                  onDayChange={handleDayChange}
                />
              </td>
              <td style={{ padding: "15px" }}>
                <Time
                  doctorName={item.name}
                  selectedDay={selectedDays[item.name] || ""}
                  schedule={item.availability}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Viewpath;

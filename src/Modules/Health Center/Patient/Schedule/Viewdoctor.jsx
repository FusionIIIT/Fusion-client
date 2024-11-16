/* eslint-disable react/prop-types */

import React, { useState } from "react";
import { Radio, ScrollArea } from "@mantine/core";
import Navigation from "../Navigation";

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
      style={{
        padding: "0.5rem",
        borderRadius: "0.5rem",
        border: "1px solid #ccc",
      }}
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

function ViewSchedule() {
  const [selectedDays, setSelectedDays] = useState({});
  const [viewPathologists, setViewPathologists] = useState(false);

  const handleDayChange = (doctorName, day) => {
    setSelectedDays((prevSelectedDays) => ({
      ...prevSelectedDays,
      [doctorName]: day,
    }));
  };

  const doctorSchedule = [
    {
      name: "Dr GS Sandhu",
      specialization: "Teeth Specialist",
      availability: [
        { day: "Monday", time: "3:00 pm - 5:00 pm" },
        { day: "Tuesday", time: "3:00 pm - 5:00 pm" },
        { day: "Thursday", time: "3:00 pm - 5:00 pm" },
      ],
    },
    {
      name: "Dr Aditya Shivi",
      specialization: "Oral Surgeon",
      availability: [
        { day: "Wednesday", time: "10:00 am - 2:00 pm" },
        { day: "Friday", time: "10:00 am - 2:00 pm" },
      ],
    },
    {
      name: "Dr Sonali Verma",
      specialization: "Ortho Specialist",
      availability: [
        { day: "Saturday", time: "1:00 pm - 5:00 pm" },
        { day: "Sunday", time: "1:00 pm - 5:00 pm" },
      ],
    },
  ];

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

  const renderTable = (schedule) => {
    return (
      <table
        style={{
          backgroundColor: "#e9d8fd",
          borderRadius: "10px",
          overflow: "hidden",
          width: "100%",
          minWidth: "600px",
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
          {schedule.map((item, index) => (
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
                  selectedDay={selectedDays[item.name] || ""}
                  schedule={item.availability}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <Navigation />
      <div style={{ margin: "2rem" }}>
        {/* Radio buttons to toggle between Doctor and Pathologist */}
        <div
          style={{
            display: "flex",
            padding: "0.5rem",
            border: "1px solid",
            backgroundColor: "white",
            borderRadius: "9999px",
            width: "27rem",
          }}
        >
          <Radio
            label="View doctors schedule"
            color="grape"
            variant="outline"
            checked={!viewPathologists}
            onChange={() => setViewPathologists(false)}
          />
          <Radio
            label="View pathologists schedule"
            color="grape"
            variant="outline"
            checked={viewPathologists}
            onChange={() => setViewPathologists(true)}
            style={{ marginLeft: "20px" }}
          />
        </div>

        <br />

        {/* Conditionally render Doctor or Pathologist table */}
        {viewPathologists ? (
          renderTable(pathologistSchedule)
        ) : doctorSchedule.length > 5 ? (
          <ScrollArea style={{ maxWidth: "100%" }}>
            {renderTable(doctorSchedule)}
          </ScrollArea>
        ) : (
          renderTable(doctorSchedule)
        )}
      </div>
    </div>
  );
}

export default ViewSchedule;

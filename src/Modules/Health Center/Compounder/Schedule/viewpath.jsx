/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Paper, Title } from "@mantine/core";
import NavCom from "../NavCom";
import ScheduleNavBar from "./schedulePath";

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
    <>
      <NavCom />
      <ScheduleNavBar />

      <Paper shadow="xl" p="xl" withBorder>
        <Title
          order={5}
          style={{
            textAlign: "center",
            margin: "0 auto",
            color: "#15abff",
          }}
        >
          View Pathologist Schedule
        </Title>
        <br />
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccc",
            textAlign: "left",
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
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Day</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {pathologistSchedule.map((item, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#fff" : "#FAFAFA",
                  minHeight: "60px",
                }}
              >
                <td style={{ padding: "15px", border: "1px solid #ccc" }}>
                  {item.name}
                </td>
                <td style={{ padding: "15px", border: "1px solid #ccc" }}>
                  {item.specialization}
                </td>
                <td style={{ padding: "15px", border: "1px solid #ccc" }}>
                  <Dropdown
                    doctorName={item.name}
                    selectedDay={selectedDays[item.name] || ""}
                    onDayChange={handleDayChange}
                  />
                </td>
                <td style={{ padding: "15px", border: "1px solid #ccc" }}>
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
      </Paper>
    </>
  );
}

export default Viewpath;

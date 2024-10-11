import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup localization for date-fns (can use moment if preferred)
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function PlacementCalendar() {
  // Sample events with company names and round numbers
  const [events] = useState([
    {
      title: "Company A - Round 1",
      start: new Date(2024, 9, 1),
      end: new Date(2024, 9, 1),
    },
    {
      title: "Company B - Round 2",
      start: new Date(2024, 9, 2),
      end: new Date(2024, 9, 2),
    },
    {
      title: "Company C - Round 1",
      start: new Date(2024, 9, 5),
      end: new Date(2024, 9, 5),
    },
    {
      title: "Company D - Round 3",
      start: new Date(2024, 9, 7),
      end: new Date(2024, 9, 7),
    },
  ]);

  return (
    <div style={{ height: "50vh", width: "80%", margin: "20px auto" }}>
      {" "}
      {/* Reduce height and width */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%", fontSize: "0.85rem" }} // Adjust font size for better view
        views={["month", "week", "day"]}
        defaultView="month"
      />
    </div>
  );
}

export default PlacementCalendar
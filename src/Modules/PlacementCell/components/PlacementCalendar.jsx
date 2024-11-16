import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import { Container, Title } from "@mantine/core";

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
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchScheduleData() {
      const token = localStorage.getItem("authToken");
      console.log("Auth Token:", token);
      
      try {
        const response = await axios.get("http://127.0.0.1:8000/placement/api/calender/", {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        
        console.log("API Response:", response.data); 
        
        const scheduleData = response.data.schedule_data;
    
        if (Array.isArray(scheduleData)) {
          const calendarEvents = scheduleData.map((item) => ({
            title: `${item.company_name} - Round ${item.round}`,
            start: new Date(item.date),  
            end: new Date(item.date),    
            description: item.description,
            type: item.type,
          }));
          
          setEvents(calendarEvents);
          console.log("Mapped Events:", calendarEvents); 
        } else {
          console.error("Schedule data is not an array:", scheduleData);
        }
      } catch (error) {
        console.error("Error fetching schedule data:", error);
      }
    }
    

    fetchScheduleData();
    
  }, []);

  return (
    <div style={{ height: "50vh", width: "80%", margin: "20px auto" }}>
      <Container fluid style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} my={16} >
        <Title>Placement Calendar</Title>
      </Container>
      {" "}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%", fontSize: "0.85rem" }}
        views={["month", "week", "day"]}
        defaultView="month"
        tooltipAccessor="description" 
      />
    </div>
  );
}

export default PlacementCalendar;

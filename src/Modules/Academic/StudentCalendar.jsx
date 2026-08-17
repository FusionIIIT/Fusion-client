import { useEffect, useState } from "react";
import { Card, Loader, Center } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import FusionTable from "../../components/FusionTable";
import { formatWhen } from "../../lib/datetime";
import { studentCalenderRoute } from "../../routes/academicRoutes";

const COLUMNS = ["Event", "Starts", "Ends"];

function StudentCalendar() {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await axios.get(studentCalenderRoute, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        setCalendarEvents(response.data.calendar_events || []);
      } catch (error) {
        showNotification({
          title: "Error",
          message: "Failed to fetch calendar data. Please try again.",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  if (loading) {
    return (
      <Center py="xl">
        <Loader variant="dots" />
      </Center>
    );
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <FusionTable
        columnNames={COLUMNS}
        ariaLabel="Academic calendar"
        emptyMessage="No calendar events found."
        elements={calendarEvents.map((event, index) => ({
          id: event.id ?? index,
          Event: event.description,
          Starts: formatWhen(event.from_date, event.from_time),
          Ends: formatWhen(event.to_date, event.to_time),
        }))}
      />
    </Card>
  );
}

export default StudentCalendar;

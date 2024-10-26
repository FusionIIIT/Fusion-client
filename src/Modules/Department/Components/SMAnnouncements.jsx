/* eslint-disable no-restricted-globals */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import SpecialTable from "./SpecialTable";

// Date formatting function
function formatDateWithPeriod(dateString) {
  if (!dateString) return ""; // Check if dateString exists
  const date = new Date(dateString);
  if (isNaN(date)) return dateString; // Check if the date is valid

  const options = { year: "numeric", month: "short", day: "numeric" };
  let formattedDate = date.toLocaleDateString("en-US", options);

  // Add a period after the abbreviated month
  formattedDate = formattedDate.replace(/(\w+)\s/, "$1. ");

  return formattedDate;
}

const columns = [
  {
    accessorKey: "ann_date",
    header: "Announcement Date",
  },
  {
    accessorKey: "maker_id",
    header: "Announcement By",
  },
  {
    accessorKey: "programme",
    header: "Programme",
  },
  {
    accessorKey: "batch",
    header: "Batch",
  },
  {
    accessorKey: "message",
    header: "Message",
  },
  {
    accessorKey: "upload_announcement",
    header: "File",
  },
];

export default function SMAnnouncements({ department }) {
  const [AnnouncementsData, setAnnouncementsData] = useState([]);
  const authToken = ""; // Replace this with your actual auth token

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dep/api/dep-main/", {
      method: "GET",
      headers: {
        Authorization: `Token ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const combinedAnnouncementsData = data.announcements[department].map(
          (announcement) => {
            return {
              ...announcement,
              ann_date: formatDateWithPeriod(announcement.ann_date), // Format the date
            };
          },
        );
        setAnnouncementsData(combinedAnnouncementsData);
      })
      .catch((error) => {
        console.error("Error fetching announcements data:", error);
      });
  }, [authToken, department]);

  return (
    <SpecialTable
      title="SM Announcements"
      columns={columns}
      data={AnnouncementsData}
      rowOptions={["10", "20", "30"]}
    />
  );
}

SMAnnouncements.propTypes = {
  department: PropTypes.string.isRequired,
};

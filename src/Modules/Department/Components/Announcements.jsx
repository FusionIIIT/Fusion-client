/* eslint-disable no-restricted-globals */
import React, { useEffect, useState, Suspense, lazy } from "react";
import PropTypes from "prop-types";

// Lazy load the SpecialTable component
const SpecialTable = lazy(() => import("./SpecialTable"));

// Function to format the date with a period after the month
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
  { accessorKey: "ann_date", header: "Announcement Date" },
  { accessorKey: "maker_id", header: "Announcement By" },
  { accessorKey: "programme", header: "Programme" },
  { accessorKey: "batch", header: "Batch" },
  { accessorKey: "message", header: "Message" },
  { accessorKey: "upload_announcement", header: "File" },
];

export default function Announcements({ branch }) {
  const [announcementsData, setAnnouncementsData] = useState([]);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const lowercaseDepartment = branch.toLowerCase();
    fetch("http://127.0.0.1:8000/dep/api/dep-main/", {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const combinedAnnouncementsData =
          data.announcements[lowercaseDepartment]?.map((announcement) => ({
            ...announcement,
            ann_date: formatDateWithPeriod(announcement.ann_date),
          })) || [];
        setAnnouncementsData(combinedAnnouncementsData);
      })
      .catch((error) => {
        console.error("Error fetching announcements data:", error);
      });
  }, [authToken, branch]);

  return (
    <Suspense fallback={<p>Loading announcements...</p>}>
      <SpecialTable
        title={`${branch} Announcements`}
        columns={columns}
        data={announcementsData}
        rowOptions={["10", "15", "20"]}
      />
    </Suspense>
  );
}

Announcements.propTypes = {
  branch: PropTypes.string.isRequired,
};

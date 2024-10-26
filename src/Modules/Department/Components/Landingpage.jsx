import React, { useRef, useState, useEffect } from "react";
import { Container, Grid, Loader } from "@mantine/core";
import { useSelector } from "react-redux";
import classes from "../styles/Departmentmodule.module.css";
import MakeAnnouncement from "./new.jsx";
import CSEDepartmentTabs from "./CSEDeptartmetTabs.jsx";
import BrowseAnnouncements from "./BrowseAnnouncements.jsx";
import ECEDepartmentTabs from "./ECEDepartmentTabs.jsx";
import MEDepartmentTabs from "./MEDepartmentTabs.jsx";
import SMDepartmentTabs from "./SMDepartmentTabs.jsx";
import FeedbackForm from "./FeedbackForm";

export default function LandingPage() {
  const role = useSelector((state) => state.user.role); // Get user role from Redux
  const department = useSelector((state) => state.user.department); // Assuming department is stored in Redux
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);

  // Update the active tab once the role is available
  useEffect(() => {
    if (role === "student") {
      setActiveTab("3"); // Set to "CSE Department" tab for students
    }
  }, [role]); // Dependency on role

  // Tab items, "Make Announcement" and "Browse Announcements" are removed for students
  const tabItems = [
    ...(role !== "student"
      ? [
          { title: "Make Announcement", id: "0" },
          { title: "Browse Announcements", id: "1" },
          { title: "Provide Feedback", id: "2" },
        ]
      : []),
    { title: "CSE Department", id: "3" },
    { title: "ECE Department", id: "4" },
    { title: "ME Department", id: "5" },
    { title: "SM Department", id: "6" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "0":
        return <MakeAnnouncement />;
      case "1":
        return <BrowseAnnouncements />;
      case "2":
        return <FeedbackForm department="CSE" />;
      case "3":
        return <CSEDepartmentTabs />;
      case "4":
        return <ECEDepartmentTabs />;
      case "5":
        return <MEDepartmentTabs />;
      case "6":
        return <SMDepartmentTabs />;
      default:
        return <Loader />;
    }
  };

  return (
    <Container className={`${classes.flex} ${classes.w_full}`}>
      <Grid>
        {/* Top section showing the department of the user */}
        <Grid.Col span={12}>
          <h1>Department Portal: {department}</h1>
        </Grid.Col>

        {/* Left Column for Tabs */}
        <Grid.Col span={2.5}>
          <div
            ref={tabsListRef}
            style={{
              whiteSpace: "nowrap",
              display: "flex",
              flexDirection: "column",
              width: "200px", // Fixed width for left column to prevent movement
            }}
          >
            {tabItems.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  backgroundColor: activeTab === tab.id ? "lightblue" : "white",
                  cursor: "pointer",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  textAlign: "center",
                  width: "100%", // Full width to prevent content shift
                }}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </Grid.Col>

        {/* Right Column for Content */}
        <Grid.Col span={9.5}>
          <div
            style={{
              padding: "20px",
              border: "1px solid #ccc",
              backgroundColor: "white",
              borderRadius: "5px",
              minHeight: "300px", // Set a consistent height for content to avoid shifting
            }}
          >
            {renderTabContent()}
          </div>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

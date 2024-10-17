import React, { useRef, useState, useEffect } from "react";
import { Container, Grid, Loader } from "@mantine/core";
import { useSelector } from "react-redux";
import classes from "../styles/Departmentmodule.module.css";
import MakeAnnouncement from "./MakeAnnouncement.jsx";
import Announcement from "./Announcement.jsx";
import DepartmentTabs from "./DeptartmetTabs.jsx";
import FeedbackForm from "./FeedbackForm";

export default function Exp() {
  const role = useSelector((state) => state.user.role); // Get user role from Redux
  const department = useSelector((state) => state.user.department); // Assuming department is stored in Redux
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);

  // Update the active tab once the role is available
  useEffect(() => {
    if (role === "student") {
      setActiveTab("2"); // Set to "CSE Department" tab for students
    }
  }, [role]); // Dependency on role

  // Tab items, "Make Announcement" and "Browse Announcements" are removed for students
  const tabItems = [
    ...(role !== "student"
      ? [
          { title: "Make Announcement", id: "0" },
          { title: "Browse Announcements", id: "1" },
          { title: "Provide Feedback", id: "6" },
        ]
      : []),
    { title: "CSE Department", id: "2" },
    { title: "ECE Department", id: "3" },
    { title: "ME Department", id: "4" },
    { title: "SM Department", id: "5" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "0":
        return <MakeAnnouncement />;
      case "1":
        return <Announcement />;
      case "2":
        return <DepartmentTabs />;
      case "3":
        return <p>ECE Department</p>;
      case "4":
        return <p>ME Department</p>;
      case "5":
        return <p>SM Department</p>;
      case "6":
        return <FeedbackForm department="CSE" />;

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
        <Grid.Col span={3}>
          <div
            ref={tabsListRef}
            style={{ display: "flex", flexDirection: "column" }}
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
                  textAlign: "left",
                }}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </Grid.Col>

        {/* Right Column for Content */}
        <Grid.Col span={9}>
          <div
            style={{
              padding: "20px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            {renderTabContent()}
          </div>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

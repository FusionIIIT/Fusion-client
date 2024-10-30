import React, { useRef, useState, useEffect, lazy, Suspense } from "react";
import { Container, Grid } from "@mantine/core";
import { useSelector } from "react-redux";
import classes from "../styles/Departmentmodule.module.css";

// Lazy load components
const MakeAnnouncement = lazy(() => import("./MakeAnnouncement"));
const BrowseAnnouncements = lazy(() => import("./BrowseAnnouncements"));
const FeedbackForm = lazy(() => import("./FeedbackForm"));
const DeptTabs = lazy(() => import("./DeptTabs"));

export default function LandingPage() {
  const role = useSelector((state) => state.user.role);
  const branch = useSelector((state) => state.user.department);
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);

  useEffect(() => {
    if (role === "student") {
      setActiveTab("3");
    }
  }, [role]);

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
    return (
      <Suspense>
        {activeTab === "0" && <MakeAnnouncement />}
        {activeTab === "1" && <BrowseAnnouncements />}
        {activeTab === "2" && <FeedbackForm branch="CSE" />}
        {activeTab === "3" && <DeptTabs branch="CSE" />}
        {activeTab === "4" && <DeptTabs branch="ECE" />}
        {activeTab === "5" && <DeptTabs branch="ME" />}
        {activeTab === "6" && <DeptTabs branch="SM" />}
      </Suspense>
    );
  };

  return (
    <Container className={`${classes.flex} ${classes.w_full}`}>
      <Grid>
        <Grid.Col span={12}>
          <h1>Department Portal: {branch}</h1>
        </Grid.Col>

        {/* Left Column for Tabs */}
        <Grid.Col span={2.5}>
          <div
            ref={tabsListRef}
            style={{
              whiteSpace: "nowrap",
              display: "flex",
              flexDirection: "column",
              width: "200px",
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
                  width: "100%",
                }}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </Grid.Col>

        {/* Right Column for Content */}
        <Grid.Col span={9.5}>
          <div className={`${classes.flex}`}>{renderTabContent()}</div>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

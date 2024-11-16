// import React, { useRef, useState, useEffect, lazy, Suspense } from "react";
// import { Container, Grid } from "@mantine/core";
// import { useSelector } from "react-redux";
// import axios from "axios";
// import classes from "../styles/Departmentmodule.module.css";

// // Lazy load components
// const MakeAnnouncement = lazy(() => import("./MakeAnnouncement"));
// const BrowseAnnouncements = lazy(() => import("./BrowseAnnouncements"));
// const FeedbackForm = lazy(() => import("./FeedbackForm"));
// const DeptTabs = lazy(() => import("./DeptTabs"));

// export default function LandingPage() {
//   const role = useSelector((state) => state.user.role);
//   const branch = useSelector((state) => state.user.department);
//   const [activeTab, setActiveTab] = useState("0");
//   const tabsListRef = useRef(null);

//   useEffect(() => {
//     if (role === "student") {
//       setActiveTab("3");
//     }
//   }, [role]);

//   const tabItems = [
//     ...(role !== "student"
//       ? [
//           { title: "Make Announcement", id: "0" },
//           { title: "Browse Announcements", id: "1" },
//         ]
//       : []),
//     { title: "Provide Feedback", id: "2" },
//     { title: "CSE Department", id: "3" },
//     { title: "ECE Department", id: "4" },
//     { title: "ME Department", id: "5" },
//     { title: "SM Department", id: "6" },
//     { title: "Design Department", id: "7" },
//     { title: "Liberal Arts Department", id: "8" },
//   ];

//   const renderTabContent = () => {
//     return (
//       <Suspense>
//         {activeTab === "0" && <MakeAnnouncement />}
//         {activeTab === "1" && <BrowseAnnouncements />}
//         {activeTab === "2" && <FeedbackForm branch="CSE" />}
//         {activeTab === "3" && <DeptTabs branch="CSE" />}
//         {activeTab === "4" && <DeptTabs branch="ECE" />}
//         {activeTab === "5" && <DeptTabs branch="ME" />}
//         {activeTab === "6" && <DeptTabs branch="SM" />}
//         {activeTab === "7" && <DeptTabs branch="DS" />}
//         {activeTab === "8" && <DeptTabs branch="LA" />}
//       </Suspense>
//     );
//   };

//   return (
//     <Container className={`${classes.flex} ${classes.w_full}`}>
//       <Grid>
//         <Grid.Col span={12}>
//           <h1>Department Portal: {branch}</h1>
//         </Grid.Col>

//         {/* Left Column for Tabs */}
//         <Grid.Col span={2.5}>
//           <div
//             ref={tabsListRef}
//             style={{
//               whiteSpace: "nowrap",
//               display: "flex",
//               flexDirection: "column",
//               width: "200px",
//             }}
//           >
//             {tabItems.map((tab, index) => (
//               <button
//                 key={index}
//                 onClick={() => setActiveTab(tab.id)}
//                 style={{
//                   marginBottom: "10px",
//                   padding: "10px",
//                   backgroundColor: activeTab === tab.id ? "lightblue" : "white",
//                   cursor: "pointer",
//                   border: "1px solid #ccc",
//                   borderRadius: "5px",
//                   textAlign: "center",
//                   width: "100%",
//                 }}
//               >
//                 {tab.title}
//               </button>
//             ))}
//           </div>
//         </Grid.Col>

//         {/* Right Column for Content */}
//         <Grid.Col span={9.5}>
//           <div className={`${classes.flex}`}>{renderTabContent()}</div>
//         </Grid.Col>
//       </Grid>
//     </Container>
//   );
// }

import React, { useRef, useState, useEffect, lazy, Suspense } from "react";
import { Container, Grid } from "@mantine/core";
import { useSelector } from "react-redux";
import axios from "axios";
import classes from "../styles/Departmentmodule.module.css";

// Lazy load components
const MakeAnnouncement = lazy(() => import("./MakeAnnouncement"));
const BrowseAnnouncements = lazy(() => import("./BrowseAnnouncements"));
const FeedbackForm = lazy(() => import("./FeedbackForm"));
const DeptTabs = lazy(() => import("./DeptTabs"));

export default function LandingPage() {
  const role = useSelector((state) => state.user.role); // Get user role from Redux
  const branch = useSelector((state) => state.user.department); // Get user department from Redux
  const [activeTab, setActiveTab] = useState(null); // State for active tab
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const tabsListRef = useRef(null); // Reference for tabs list

  const handleTabSwitch = (department, isFacultyOrStaff = false) => {
    // Map departments to specific tab IDs
    const tabMap = {
      CSE: "3",
      ECE: "4",
      ME: "5",
      SM: "6",
      DS: "7",
      LA: "8",
    };

    // Switch tab based on department and role
    setActiveTab(tabMap[department] || (isFacultyOrStaff ? "0" : "3"));
  };

  useEffect(() => {
    const fetchUserDepartment = async () => {
      const token = localStorage.getItem("authToken");

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/dep/api/dep-main/", // Ensure the endpoint matches your backend route
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log(response.data);
        const { user_designation, department } = response.data;
        setLoading(false); // Stop loading once data is fetched
        console.log("User Designation:", user_designation);
        console.log("Department:", department);

        // Switch tabs based on user designation and department
        if (user_designation === "student") {
          handleTabSwitch(department);
        } else {
          handleTabSwitch(department, true);
        }
      } catch (error) {
        console.error("Error fetching user department:", error);
        setLoading(false); // Stop loading in case of error
        setError("Failed to fetch department data");
      }
    };

    fetchUserDepartment();
  }, [role]); // Re-fetch when the role changes

  const tabItems = [
    ...(role !== "student"
      ? [
          { title: "Make Announcement", id: "0" },
          { title: "Browse Announcements", id: "1" },
        ]
      : []),
    { title: "Provide Feedback", id: "2" },
    { title: "CSE Department", id: "3" },
    { title: "ECE Department", id: "4" },
    { title: "ME Department", id: "5" },
    { title: "SM Department", id: "6" },
    { title: "Design Department", id: "7" },
    { title: "Liberal Arts Department", id: "8" },
  ];

  const renderTabContent = () => (
    <Suspense fallback={<div>Loading...</div>}>
      {activeTab === "0" && <MakeAnnouncement />}
      {activeTab === "1" && <BrowseAnnouncements />}
      {activeTab === "2" && <FeedbackForm branch={branch} />}
      {activeTab === "3" && <DeptTabs branch="CSE" />}
      {activeTab === "4" && <DeptTabs branch="ECE" />}
      {activeTab === "5" && <DeptTabs branch="ME" />}
      {activeTab === "6" && <DeptTabs branch="SM" />}
      {activeTab === "7" && <DeptTabs branch="DS" />}
      {activeTab === "8" && <DeptTabs branch="LA" />}
    </Suspense>
  );

  if (loading) {
    return <div>Loading user department and data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

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
            {tabItems.map((tab) => (
              <button
                key={tab.id}
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
          <div className={`${classes.flex}`}>
            {activeTab !== null ? (
              renderTabContent()
            ) : (
              <div>Select a tab to view content</div>
            )}
          </div>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

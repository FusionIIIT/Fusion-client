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

import React, { lazy, Suspense, useState, useEffect } from "react";
import {
  Container,
  Grid,
  Menu,
  Button,
  Group,
  Title,
  Loader,
  Text,
} from "@mantine/core";

import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Import from react-icons

import { useSelector } from "react-redux";
import axios from "axios";

// Lazy load components
const MakeAnnouncement = lazy(() => import("./MakeAnnouncement"));
const BrowseAnnouncements = lazy(() => import("./BrowseAnnouncements"));
const FeedbackForm = lazy(() => import("./FeedbackForm"));
const DeptTabs = lazy(() => import("./DeptTabs"));

const departments = [
  { title: "CSE Department", id: "3", code: "CSE" },
  { title: "ECE Department", id: "4", code: "ECE" },
  { title: "ME Department", id: "5", code: "ME" },
  { title: "SM Department", id: "6", code: "SM" },
  { title: "Design Department", id: "7", code: "DS" },
  { title: "Liberal Arts Department", id: "8", code: "LA" },
];

export default function LandingPage() {
  const [role, setRole] = useState(null);
  const [branch, setBranch] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(null);

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

        setRole(user_designation);
        setBranch(department);

        // Set the active tab to the user's department
        const deptTab = departments.find((d) => d.code === department)?.id;
        setActiveTab(deptTab || "3"); // Default to CSE if department not found
      } catch (error) {
        console.error("Error fetching user department:", error);
        setLoading(false); // Stop loading in case of error
        setError("Failed to fetch department data");
      }
    };

    fetchUserDepartment();
  }, []); // Empty dependency array to run only once on mount

  const renderTabContent = () => (
    <Suspense fallback={<Loader />}>
      {activeTab === "0" && <MakeAnnouncement />}
      {activeTab === "1" && <BrowseAnnouncements />}
      {activeTab === "2" && <FeedbackForm branch={branch} />}
      {activeTab === "3" && <DeptTabs branch="CSE" initialTab="about" />}
      {activeTab === "4" && <DeptTabs branch="ECE" initialTab="about" />}
      {activeTab === "5" && <DeptTabs branch="ME" initialTab="about" />}
      {activeTab === "6" && <DeptTabs branch="SM" initialTab="about" />}
      {activeTab === "7" && <DeptTabs branch="DS" initialTab="about" />}
      {activeTab === "8" && <DeptTabs branch="LA" initialTab="about" />}
    </Suspense>
  );

  if (loading) return <Loader />;
  if (error) return <Text color="red">{error}</Text>;

  const currentDept = departments.find((d) => d.code === branch);

  const handleDepartmentSelect = (deptId) => {
    setActiveTab(deptId);
    setIsDropdownOpen(false); // Close dropdown when a department is selected
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev); // Toggle dropdown state
  };

  return (
    <Container fluid>
      <Grid>
        <Grid.Col span={12}>
          <Group
            position="apart"
            align="center"
            mb="lg"
            style={{ flexWrap: "nowrap" }}
          >
            <Title order={2}>Department Portal</Title>

            <Group spacing="sm" style={{ marginLeft: "auto" }}>
              {/* Action Buttons for non-students */}
              {role !== "student" && (
                <>
                  <Button
                    variant={activeTab === "0" ? "filled" : "light"}
                    onClick={() => setActiveTab("0")}
                  >
                    Make Announcement
                  </Button>
                  <Button
                    variant={activeTab === "1" ? "filled" : "light"}
                    onClick={() => setActiveTab("1")}
                  >
                    Browse Announcements
                  </Button>
                </>
              )}

              {/* Feedback Button - shown to everyone */}
              <Button
                variant={activeTab === "2" ? "filled" : "light"}
                onClick={() => setActiveTab("2")}
              >
                Provide Feedback
              </Button>

              {/* Department Selector Dropdown */}

              {/* Department Selector Dropdown */}
              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <Button
                    variant="subtle"
                    style={{ marginRight: "50px", fontSize: "16px" }}
                    onClick={handleDropdownToggle} // Toggle dropdown state
                  >
                    {currentDept?.title || "Select Department"}
                    {/* Display arrow icon depending on the dropdown state */}
                    {isDropdownOpen ? (
                      <FaChevronUp size={20} style={{ marginLeft: "10px" }} />
                    ) : (
                      <FaChevronDown size={20} style={{ marginLeft: "10px" }} />
                    )}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {departments.map((dept) => (
                    <Menu.Item
                      key={dept.id}
                      onClick={() => handleDepartmentSelect(dept.id)} // Select department
                      fw={activeTab === dept.id ? 700 : 400}
                    >
                      {dept.title}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Grid.Col>

        {/* Content Area */}
        <Grid.Col span={12}>
          {activeTab !== null ? (
            renderTabContent()
          ) : (
            <Text>Select a department or action to view content</Text>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}

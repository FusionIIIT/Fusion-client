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

import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";

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
  { title: "NaturalScience", id: "9", code: "NS" },
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
          `${host}/dep/api/dep-main/`, // Ensure the endpoint matches your backend route
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
      } catch (err) {
        console.error("Error fetching user department:", err);
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
      {activeTab === "9" && (
        <DeptTabs branch="Natural Science" initialTab="about" />
      )}
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

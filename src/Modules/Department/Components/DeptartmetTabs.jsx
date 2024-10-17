import {
  Button,
  Container,
  Flex,
  Grid,
  Loader,
  Tabs,
  Text,
} from "@mantine/core";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import classes from "../styles/Departmentmodule.module.css";
import Faculty from "./Faculty.jsx";
import Alumnicat from "./Alumnicat.jsx";
import Studentcat from "./Studentcat.jsx";
import Dept from "./Dept.jsx";
import Announcement from "./Announcement.jsx";
import MakeAnnouncement from "./MakeAnnouncement.jsx";
import Facilties from "./Facilities.jsx";

function DepartmentTabs() {
  const role = useSelector((state) => state.user.role); // Get user role from Redux
  // console.log(role);
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);

  // Conditionally add 'Make Announcements' tab based on user role
  const tabItems = [
    { title: "About Us" },
    { title: "Facilities" },
    { title: "Faculties" },
    { title: "Students" },
    ...(role === "Professor" || role === "HOD (CSE)"
      ? [{ title: "Make Announcements" }]
      : []), // Only for faculty
    { title: "Announcements" },
    { title: "Alumni" },
    { title: "Stock" },
  ];

  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, tabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    setActiveTab(String(newIndex));
    tabsListRef.current.scrollBy({
      left: direction === "next" ? 50 : -50,
      behavior: "smooth",
    });
  };

  // Function to render content based on active tab
  const renderTabContent = () => {
    const facultyOffset = role === "Professor" || role === "HOD (CSE)" ? 1 : 0;

    switch (activeTab) {
      case "0":
        return <Dept />;
      case "1":
        return <Facilties />;
      case "2":
        return <Faculty />;
      case "3":
        return <Studentcat />;
      case `4`:
        return facultyOffset === 1 ? <MakeAnnouncement /> : <Announcement />;
      case `5`:
        return facultyOffset === 1 ? <Announcement /> : <Alumnicat />;
      case `6`:
        return facultyOffset === 1 ? <Alumnicat /> : <p>Stock</p>;
      case `7`:
        return facultyOffset === 1 ? <p>Stock</p> : <Loader />;
      default:
        return <Loader />;
    }
  };

  return (
    <>
      {/* Navbar contents */}
      <div
        style={{
          display: "flex",
          justifyContent: "center", // Centers horizontally
          height: "auto", // Adjust height based on content
        }}
      >
        <h1>Welcome to CSE Department</h1>
      </div>

      <Flex justify="space-between" align="center">
        <Flex justify="flex-start" align="center" gap="1rem" mt="0.1rem">
          <Button
            onClick={() => handleTabChange("prev")}
            variant="default"
            p={0}
            style={{ border: "none" }}
          >
            <CaretCircleLeft
              className={classes.fusionCaretCircleIcon}
              weight="light"
            />
          </Button>

          <div className={classes.fusionTabsContainer} ref={tabsListRef}>
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
                {tabItems.map((item, index) => (
                  <Tabs.Tab
                    value={String(index)}
                    key={index}
                    className={
                      activeTab === String(index)
                        ? classes.fusionActiveRecentTab
                        : ""
                    }
                  >
                    <Flex gap="4px">
                      <Text>{item.title}</Text>
                    </Flex>
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
          </div>

          <Button
            onClick={() => handleTabChange("next")}
            variant="default"
            p={0}
            style={{ border: "none" }}
          >
            <CaretCircleRight
              className={classes.fusionCaretCircleIcon}
              weight="light"
            />
          </Button>
        </Flex>
      </Flex>

      {/* Main content */}
      <Grid mt="xl">
        <Container py="xl">{renderTabContent()}</Container>
      </Grid>
    </>
  );
}

export default DepartmentTabs;

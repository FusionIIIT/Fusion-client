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
import classes from "../styles/Departmentmodule.module.css";
import Faculty from "./Faculty.jsx";
import Alumnicat from "./Alumnicat.jsx";
import Studentcat from "./Studentcat.jsx";
import AboutUs from "./AboutUs.jsx";
import Facilities from "./Facilities.jsx";
import Stock from "./Stock.jsx";
import SMAnnouncements from "./SMAnnouncements";

function SMDepartmentTabs() {
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);

  // Conditionally add 'Make Announcements' tab based on user role
  const tabItems = [
    { title: "About Us" },
    { title: "Facilities" },
    { title: "Faculties" },
    { title: "Students" },
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
    switch (activeTab) {
      case "0":
        return <AboutUs branch="SM" />;
      case "1":
        return <Facilities />;
      case "2":
        return <Faculty department="sm_f" />;
      case "3":
        return <Studentcat />;
      case "4":
        return <SMAnnouncements department="sm" />;
      case "5":
        return <Alumnicat />;
      case "6":
        return <Stock />;
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
        <h1>Welcome to SM Department</h1>
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

export default SMDepartmentTabs;

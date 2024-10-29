import { Button, Container, Flex, Grid, Tabs, Text } from "@mantine/core";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import { useRef, useState, Suspense, lazy } from "react";
import PropTypes from "prop-types";
import classes from "../styles/Departmentmodule.module.css";

// Lazy load components
const AboutUs = lazy(() => import("./AboutUs.jsx"));
const Facilities = lazy(() => import("./Facilities.jsx"));
const Faculty = lazy(() => import("./Faculty.jsx"));
const Studentcat = lazy(() => import("./Studentcat.jsx"));
const Announcements = lazy(() => import("./Announcements.jsx"));
const Alumnicat = lazy(() => import("./Alumnicat.jsx"));
const Stock = lazy(() => import("./Stock.jsx"));

function DeptTabs({ branch }) {
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);

  let faculty = "";
  if (branch === "CSE") faculty = "cse_f";
  if (branch === "ECE") faculty = "ece_f";
  if (branch === "ME") faculty = "me_f";
  if (branch === "SM") faculty = "sm_f";

  const tabItems = [
    { title: "About Us" },
    { title: "Faculties", id: "2", department: faculty },
    { title: "Students", id: "3", department: branch },
    { title: "Announcements", id: "4", department: branch },
    { title: "Alumni" },
    { title: "Facilities" },
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "0":
        return <AboutUs branch={`${branch}`} />;
      case "1":
        return <Faculty branch={branch} faculty={faculty} />;
      case "2":
        return <Studentcat branch={branch} />;
      case "3":
        return <Announcements branch={branch} />;
      case "4":
        return <Alumnicat />;
      case "5":
        return <Facilities />;
      case "6":
        return <Stock />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Navbar contents */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "auto",
        }}
      >
        <h1>Welcome to {branch} Department</h1>
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

      {/* Main content with Suspense fallback for lazy-loaded component */}
      <Grid mt="xl">
        <Container py="xl">
          <Suspense>{renderTabContent()}</Suspense>
        </Container>
      </Grid>
    </div>
  );
}

export default DeptTabs;

DeptTabs.propTypes = {
  branch: PropTypes.string.isRequired,
};

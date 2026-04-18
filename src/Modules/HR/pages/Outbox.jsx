import React, { useEffect, useState, useRef } from "react";
import { Tabs, Button, Flex, Text, Container } from "@mantine/core";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import { useNavigate, useLocation } from "react-router-dom";
import classes from "../styles/LeavePage.module.css";
import OutboxTable from "./OutboxPageComp/OutboxTable";
import HrBreadcrumbs from "../components/common/HrBreadcrumbs";

const tabItems = [{ title: "Outbox", path: "/hr/outbox" }];

function Outbox() {
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "Outbox", path: "/hr/outbox" },
  ];

  // Set active tab based on the current URL
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingTab = tabItems.findIndex((tab) =>
      currentPath.includes(tab.path.split("/").pop()),
    );
    setActiveTab(matchingTab !== -1 ? String(matchingTab) : "0");
  }, [location.pathname]);

  // Function to handle tab change by clicking on a tab
  const handleTabChange = (index) => {
    setActiveTab(index);
    navigate(tabItems[index].path);
  };

  const handleButtonChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, tabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    handleTabChange(String(newIndex));
    tabsListRef.current?.scrollBy({
      left: direction === "next" ? 50 : -50,
      behavior: "smooth",
    });
  };

  return (
    <Container size="xl" py="md">
      <HrBreadcrumbs items={exampleItems} />
      <Text component="h1" size="lg" fw={700} my="md">
        Outbox
      </Text>

      <Flex gap="md" align="center" mb="lg" wrap="wrap">
        <Button
          onClick={() => handleButtonChange("prev")}
          variant="light"
          disabled={+activeTab === 0}
        >
          <CaretCircleLeft size={20} />
        </Button>

        <Tabs
          ref={tabsListRef}
          value={activeTab}
          onTabChange={handleTabChange}
          className={classes.tabsList}
        >
          <Tabs.List>
            {tabItems.map((tab, index) => (
              <Tabs.Tab key={index} value={String(index)} label={tab.title} />
            ))}
          </Tabs.List>
        </Tabs>

        <Button
          onClick={() => handleButtonChange("next")}
          variant="light"
          disabled={+activeTab === tabItems.length - 1}
        >
          <CaretCircleRight size={20} />
        </Button>
      </Flex>

      <Tabs.Panel value="0">
        <OutboxTable />
      </Tabs.Panel>
    </Container>
  );
}

export default Outbox;

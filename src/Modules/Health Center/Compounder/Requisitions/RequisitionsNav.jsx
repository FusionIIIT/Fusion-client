import React, { useState, useEffect } from "react";
import { Flex, Button, Tabs, Text } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import classes from "../../../Dashboard/Dashboard.module.css";

function RequisitionsNav() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const tabItems = [
    { title: "My Requisitions", path: "/requisitions" },
    { title: "Create Requisition", path: "/requisitions/create" },
    { title: "Pending Approvals (Authority)", path: "/requisitions/pending" },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = tabItems.findIndex(
      (item) => currentPath === `/healthcenter/compounder${item.path}`
    );

    if (activeIndex !== -1) {
      setActiveTab(activeIndex);
    }
  }, [location.pathname]);

  const handleNavigation = (index) => {
    const basePath = "/healthcenter/compounder";
    const path = tabItems[index]?.path;

    if (path && location.pathname !== `${basePath}${path}`) {
      navigate(`${basePath}${path}`);
    }
  };

  return (
    <Flex
      justify="flex-start"
      align="center"
      gap="1rem"
      mt="1.5rem"
      ml="lg"
      style={{ overflowX: "auto" }}
    >
      <Tabs
        value={`${activeTab}`}
        onChange={(value) => {
          const newIndex = parseInt(value, 10);
          setActiveTab(newIndex);
          handleNavigation(newIndex);
        }}
      >
        <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
          {tabItems.map((item, index) => (
            <Tabs.Tab
              value={`${index}`}
              key={index}
              className={
                activeTab === index ? classes.fusionActiveRecentTab : ""
              }
            >
              <Text>{item.title}</Text>
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
    </Flex>
  );
}

export default RequisitionsNav;

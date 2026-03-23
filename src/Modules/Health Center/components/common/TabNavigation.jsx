import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Flex, Button, Tabs, Text } from "@mantine/core";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * TabNavigation Component
 * Reusable tab navigation that works with React Router
 *
 * Props:
 *   tabItems: Array of {title, path}
 *   basePath: Base path for navigation (e.g., "/healthcenter/compounder")
 *   roleFilter: Optional filter function for conditional tab display
 */
function TabNavigation({ tabItems, basePath = "", roleFilter = null }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabsListRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Filter tabs if roleFilter provided
  let displayItems = tabItems;
  if (roleFilter) {
    displayItems = tabItems.filter(roleFilter);
  }

  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = displayItems.findIndex((item) =>
      currentPath.startsWith(`${basePath}${item.path}`),
    );

    if (activeIndex !== -1) {
      setActiveTab(activeIndex);
    }
  }, [location.pathname, displayItems, basePath]);

  const handleNavigation = (index) => {
    const path = displayItems[index]?.path;
    if (path && !location.pathname.startsWith(`${basePath}${path}`)) {
      navigate(`${basePath}${path}`);
    }
  };

  const scrollToTab = () => {
    if (tabsListRef.current) {
      const activeTabElement = tabsListRef.current.querySelector(
        '[role="tab"][aria-selected="true"]',
      );
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(activeTab + 1, displayItems.length - 1)
        : Math.max(activeTab - 1, 0);

    if (newIndex !== activeTab) {
      setActiveTab(newIndex);
      handleNavigation(newIndex);
      scrollToTab();
    }
  };

  const canScrollLeft = activeTab > 0;
  const canScrollRight = activeTab < displayItems.length - 1;

  return (
    <Flex
      direction="row"
      align="center"
      gap="sm"
      style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
    >
      <Button
        variant="subtle"
        disabled={!canScrollLeft}
        onClick={() => handleTabChange("prev")}
        p={0}
        w="auto"
      >
        <CaretCircleLeft size={24} />
      </Button>

      <Tabs
        ref={tabsListRef}
        value={displayItems[activeTab]?.title || null}
        onTabChange={(title) => {
          const index = displayItems.findIndex((item) => item.title === title);
          if (index !== -1) {
            setActiveTab(index);
            handleNavigation(index);
          }
        }}
        style={{ flex: 1, overflow: "hidden" }}
      >
        <Tabs.List>
          {displayItems.map((item) => (
            <Tabs.Tab key={item.title} value={item.title}>
              <Text fw={activeTab === displayItems.indexOf(item) ? 600 : 400}>
                {item.title}
              </Text>
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <Button
        variant="subtle"
        disabled={!canScrollRight}
        onClick={() => handleTabChange("next")}
        p={0}
        w="auto"
      >
        <CaretCircleRight size={24} />
      </Button>
    </Flex>
  );
}

TabNavigation.propTypes = {
  tabItems: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }),
  ).isRequired,
  basePath: PropTypes.string,
  roleFilter: PropTypes.func,
};

export default TabNavigation;

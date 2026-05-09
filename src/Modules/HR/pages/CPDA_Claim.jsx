import React, { useEffect, useState, useRef } from "react";
import { Tabs, Button, Flex, Text, Loader, Container } from "@mantine/core";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import classes from "../styles/CPDA_ClaimPage.module.css";
import CPDAClaimForm from "./CPDA_ClaimPageComp/CPDA_ClaimForm";
import CPDAClaimRequests from "./CPDA_ClaimPageComp/CPDA_ClaimRequests";
import CPDAClaimInbox from "./CPDA_ClaimPageComp/CPDA_ClaimInbox";
import CPDAClaimArchive from "./CPDA_ClaimPageComp/CPDA_ClaimArchive";
import HrBreadcrumbs from "../components/common/HrBreadcrumbs";
import CPDABalanceButton from "../components/common/CPDABalanceButton";

// Define paths for each tab
const tabItems = [
  { title: "CPDA claim Form", path: "/hr/cpda_claim/cpdaform" },
  { title: "CPDA claim Requests", path: "/hr/cpda_claim/cpda_requests" },
  { title: "CPDA claim Inbox", path: "/hr/cpda_claim/cpda_inbox" },
  { title: "CPDA claim Archive", path: "/hr/cpda_claim/cpda_archive" },
];

function CPDA_Claim() {
  const [activeTab, setActiveTab] = useState("0");
  const [loading, setLoading] = useState(false);
  const tabsListRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update active tab based on current URL
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
    navigate(tabItems[index].path); // Ensure navigate is called with correct path
  };

  const handleButtonChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, tabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    handleTabChange(String(newIndex)); // Use handleTabChange to update tab and URL
    tabsListRef.current.scrollBy({
      left: direction === "next" ? 50 : -50,
      behavior: "smooth",
    });
  };

  // Fetch any necessary CPDA_Claim data
  useEffect(() => {
    const fetchCPDA_ClaimData = async () => {
      setLoading(true);
      try {
        // Fetch CPDA_Claim data here if needed
      } catch (error) {
        console.error("Error fetching CPDA_Claim data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCPDA_ClaimData();
  }, []);
  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "CPDA Claim Management", path: "/hr/cpda_claim" },
  ];

  return (
    <>
      <HrBreadcrumbs items={exampleItems} />
      <CPDABalanceButton />
      <Flex justify="flex-start" align="center" mt="lg">
        <Button
          style={{ marginRight: "20px" }}
          onClick={() => handleButtonChange("prev")}
          variant="default"
          p={0}
        >
          <CaretCircleLeft
            className={classes.fusionCaretCircleIcon}
            weight="light"
          />
        </Button>
        <div
          className={`${classes.fusionTabsContainer} ${classes.limitedWidthTabs}`}
          ref={tabsListRef}
        >
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
              {tabItems.map((item, index) => (
                <Tabs.Tab
                  value={`${index}`}
                  key={index}
                  className={
                    activeTab === `${index}`
                      ? classes.fusionActiveRecentTab
                      : ""
                  }
                  onClick={() => handleTabChange(String(index))} // Ensure this triggers correctly
                >
                  <Text>{item.title}</Text>
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        </div>
        <Button
          style={{ marginLeft: "385px" }}
          onClick={() => handleButtonChange("next")}
          variant="default"
          p={0}
        >
          <CaretCircleRight
            className={classes.fusionCaretCircleIcon}
            weight="light"
          />
        </Button>
      </Flex>
      {loading ? (
        <Container py="xl">
          <Loader size="lg" />
        </Container>
      ) : (
        <div className="fullWidthGrid">
          <Routes>
            <Route path="cpdaform" element={<CPDAClaimForm />} />
            <Route path="cpda_requests" element={<CPDAClaimRequests />} />
            <Route path="cpda_inbox" element={<CPDAClaimInbox />} />
            <Route path="cpda_archive" element={<CPDAClaimArchive />} />
            <Route path="*" element={<Navigate to="cpdaform" replace />} />
          </Routes>
        </div>
      )}
    </>
  );
}

export default CPDA_Claim;

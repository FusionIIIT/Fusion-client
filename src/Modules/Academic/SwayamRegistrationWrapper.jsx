import React, { useState } from "react";
import { Tabs, Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import tabClasses from "../../ui/styles/tabs.module.css";
import SwayamExtraCredit from "./SwayamExtraCredit";
import SwayamReplace from "./SwayamReplace";
import SwayamYourRequests from "./SwayamYourRequests";

function SwayamRegistrationWrapper() {
  const compact = useMediaQuery("(max-width: 575px)");
  const [activeMainTab, setActiveMainTab] = useState("replace");
  const [activeRequestsTab, setActiveRequestsTab] = useState("replace");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (value) => {
    setActiveMainTab(value);
    setRefreshKey((prev) => prev + 1);
  };

  const handleRequestsSubTabChange = (value) => {
    setActiveRequestsTab(value);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSubmitSuccess = (requestType) => {
    setActiveMainTab("requests");
    setActiveRequestsTab(requestType === "replace" ? "replace" : "extra");
    setRefreshKey((prev) => prev + 1);
  };

  return (
    /* Card wrapper */
    <Box
      style={{
        border: "1px solid #dde3ea",
        borderRadius: 10,
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <Tabs
        value={activeMainTab}
        onChange={handleTabChange}
        variant="pills"
        color="blue"
        keepMounted={false}
      >
        {/* Main Tab Bar */}
        <Box
          px={{ base: "xs", sm: "md" }}
          py="xs"
          style={{
            background: "#f4f7fb",
            borderBottom: "1px solid #e6eaef",
          }}
        >
          <Tabs.List className={tabClasses.list}>
            <Tabs.Tab value="replace" className={tabClasses.tab}>
              Replace
            </Tabs.Tab>
            <Tabs.Tab value="extra" className={tabClasses.tab}>
              {compact ? "Extra" : "Extra Credits"}
            </Tabs.Tab>
            <Tabs.Tab value="requests" className={tabClasses.tab}>
              {compact ? "Requests" : "Your Requests"}
            </Tabs.Tab>
          </Tabs.List>
        </Box>

        {/* Replace Panel */}
        <Tabs.Panel value="replace">
          <Box p={{ base: "md", sm: "xl" }} style={{ background: "#fff" }}>
            <SwayamReplace
              showOnlyForm
              onSubmitSuccess={() => handleSubmitSuccess("replace")}
              refreshKey={refreshKey}
            />
          </Box>
        </Tabs.Panel>

        {/* Extra Credits Panel */}
        <Tabs.Panel value="extra">
          <Box p={{ base: "md", sm: "xl" }} style={{ background: "#fff" }}>
            <SwayamExtraCredit
              showOnlyForm
              onSubmitSuccess={() => handleSubmitSuccess("extra")}
              refreshKey={refreshKey}
            />
          </Box>
        </Tabs.Panel>

        {/* Your Requests Panel */}
        <Tabs.Panel value="requests" style={{ background: "#fff" }}>
          <Tabs
            value={activeRequestsTab}
            onChange={handleRequestsSubTabChange}
            variant="unstyled"
            keepMounted={false}
          >
            <Box
              style={{
                background: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
                padding: "0 12px",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <Tabs.List
                className={tabClasses.list}
                style={{ gap: 0, border: "none" }}
              >
                {[
                  { value: "replace", label: "Replacements" },
                  { value: "extra", label: "Extra credits" },
                ].map(({ value, label }) => {
                  const isActive = activeRequestsTab === value;
                  return (
                    <Tabs.Tab
                      key={value}
                      value={value}
                      className={tabClasses.tab}
                      style={{
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "#228be6" : "#6c757d",
                        borderBottom: isActive
                          ? "2px solid #228be6"
                          : "2px solid transparent",
                        marginBottom: -2,
                        background: "transparent",
                        borderRadius: 0,
                      }}
                    >
                      {label}
                    </Tabs.Tab>
                  );
                })}
              </Tabs.List>
            </Box>

            <Tabs.Panel value="replace">
              <Box p={{ base: "md", sm: "lg" }} style={{ background: "#fff" }}>
                <SwayamYourRequests
                  requestType="Swayam_Replace"
                  refreshKey={refreshKey}
                />
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="extra">
              <Box p={{ base: "md", sm: "lg" }} style={{ background: "#fff" }}>
                <SwayamYourRequests
                  requestType="Extra_Credits"
                  refreshKey={refreshKey}
                />
              </Box>
            </Tabs.Panel>
          </Tabs>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

export default SwayamRegistrationWrapper;

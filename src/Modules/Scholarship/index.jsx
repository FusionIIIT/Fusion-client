import React, { useEffect, useState } from "react";
import { Box, Text } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@mantine/core";
import { CaretRight } from "@phosphor-icons/react";

import MCMStudentDashboard from "./components/MCMStudentDashboard";
import MCMAssistantDashboard from "./components/MCMAssistantDashboard";
import SPACSConvenorDashboard from "./components/SPACSConvenorDashboard";

import { setActiveTab_ } from "../../redux/moduleslice";
import classes from "../Dashboard/Dashboard.module.css";

const SCHOLARSHIP_LABELS = {
  mcm: "MCM Scholarship",
  single_parent: "Single Parent Scholarship"
};

function ScholarshipPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.user.role);
  const [activeTab] = useState("0");

  // selectedScholarship is lifted here so the breadcrumb can react to it
  const [selectedScholarship, setSelectedScholarship] = useState("mcm");

  let tabComponents = [];

  if (role === "spacsassistant") {
    tabComponents = [MCMAssistantDashboard];
  } else if (role === "spacsconvenor") {
    tabComponents = [SPACSConvenorDashboard];
  } else {
    tabComponents = [MCMStudentDashboard];
  }

  useEffect(() => {
    dispatch(setActiveTab_("Scholarship Portal"));
  }, [dispatch]);

  const ActiveComponent = tabComponents[parseInt(activeTab, 10)] || (() => <div>Loading...</div>);

  // Build breadcrumb items dynamically
  const isStudent = role !== "spacsassistant" && role !== "spacsconvenor";

  const breadcrumbItems = [
    <Text
      key="home"
      component="a"
      href="/dashboard"
      className={classes.fusionText}
      fw={600}
      style={{ cursor: "pointer", color: "#1a1a1a", textDecoration: "none" }}
    >
      Home
    </Text>,
    <Text key="scholarship" fw={600} className={classes.fusionText}>
      Scholarship
    </Text>,
    ...(isStudent
      ? [
          <Text key="type" fw={600} className={classes.fusionText}>
            {SCHOLARSHIP_LABELS[selectedScholarship] || "MCM Scholarship"}
          </Text>
        ]
      : [])
  ];

  return (
    <>
      <Breadcrumbs
        separator={<CaretRight className={classes.fusionCaretIcon} weight="bold" />}
        mt="xs"
        ml={{ md: "lg" }}
      >
        {breadcrumbItems}
      </Breadcrumbs>

      <Box mt="md">
        {isStudent ? (
          <ActiveComponent
            selectedScholarship={selectedScholarship}
            setSelectedScholarship={setSelectedScholarship}
          />
        ) : (
          <ActiveComponent />
        )}
      </Box>
    </>
  );
}

export default ScholarshipPage;

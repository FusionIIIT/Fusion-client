import React, { useEffect, useState } from "react";
import { Box, Text } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { Breadcrumbs } from "@mantine/core";
import { CaretRight } from "@phosphor-icons/react";
import { setActiveTab_ } from "../../redux/moduleslice";
import classes from "../Dashboard/Dashboard.module.css";

import AwardsStudentDashboard from "./components/AwardsStudentDashboard";
import AwardsAssistantDashboard from "./components/AwardsAssistantDashboard";
import AwardsConvenorDashboard from "./components/AwardsConvenorDashboard";

function AwardsPage() {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.user.role);

  useEffect(() => {
    dispatch(setActiveTab_("Awards Portal"));
  }, [dispatch]);

  const renderDashboard = () => {
    if (role === "spacsassistant") return <AwardsAssistantDashboard />;
    if (role === "spacsconvenor") return <AwardsConvenorDashboard />;
    return <AwardsStudentDashboard />;
  };

  return (
    <>
      <Breadcrumbs
        separator={<CaretRight className={classes.fusionCaretIcon} weight="bold" />}
        mt="xs"
        ml={{ md: "lg" }}
      >
        <Text
          component="a"
          href="/dashboard"
          className={classes.fusionText}
          fw={600}
          style={{ cursor: "pointer", color: "#1a1a1a", textDecoration: "none" }}
        >
          Home
        </Text>
        <Text fw={600} className={classes.fusionText}>
          Awards Portal
        </Text>
      </Breadcrumbs>

      <Box mt="md">{renderDashboard()}</Box>
    </>
  );
}

export default AwardsPage;

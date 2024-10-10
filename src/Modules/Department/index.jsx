import React from "react";
import { Text } from "@mantine/core";
import { Route, Routes } from "react-router-dom"; // Remove BrowserRouter
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import DepartmentPage from "./DepartmentPage"; // Correct capitalization
import MakeAnnouncementPage from "./MakeAnnouncementPage"; // Make sure to import correctly
import { Layout } from "../../components/layout";

function Department() {
  return (
    <>
      <CustomBreadcrumbs />
      <Text>Owais is my friend</Text>
      <Routes>
        {/* Route for the DepartmentPage */}
        <Route path="/" element={<DepartmentPage />} />

        {/* Route for the MakeAnnouncementPage */}
        <Route path="/makeAnnouncement" element={<MakeAnnouncementPage />} />
      </Routes>
    </>
  );
}

export default Department;

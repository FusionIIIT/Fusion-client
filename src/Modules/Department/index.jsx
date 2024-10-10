import React from "react";
import { Text } from "@mantine/core";
import { Route, Routes } from "react-router-dom";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import DepartmentPage from "./DepartmentPage"; // Correct capitalization

function Department() {
  return (
    <>
      <CustomBreadcrumbs />
      <Text>Owais is my friend</Text>
      {/* <DepartmentPage /> */}
      <Routes>
        <Route path="/" element={<DepartmentPage />} />
      </Routes>
    </>
  );
}

export default Department;

import React from "react";
import { Text } from "@mantine/core";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import DepartmentPage from "./DepartmentPage"; // Correct capitalization

function Department() {
  return (
    <>
      <CustomBreadcrumbs />
      <Text>Owais is my friend</Text>
      <DepartmentPage />
    </>
  );
}

export default Department;

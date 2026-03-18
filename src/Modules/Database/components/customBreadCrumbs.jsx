import { Breadcrumbs, Text } from "@mantine/core";
import { CaretRight } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";


const breadcrumbMap = {
  "/database/view": "Course-wise Student Enrollment",
};

function CustomBreadDatabase() {
  const location = useLocation();
  const categoryFromUrl = new URLSearchParams(location.search).get("category");
  const safeCategory = ["ug", "pg", "phd"].includes(categoryFromUrl)
    ? categoryFromUrl
    : "ug";

  const pathSegments = location.pathname.split("/").filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const fullPath = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const targetPath = fullPath.startsWith("/database")
      ? `${fullPath}?category=${safeCategory}`
      : fullPath;
    let title = breadcrumbMap[fullPath] || segment;

    title = title.charAt(0).toUpperCase() + title.slice(1);

    return (
      <Text
        key={index}
        component={Link}
        to={targetPath}
        size="1.2rem"
        fw={600}
        style={{ textDecoration: "none", color: "black" }}
      >
        {title}
      </Text>
    );
  });

  return (
    <Breadcrumbs
      separator={<CaretRight size={16} weight="bold" />}
      mt="xs"
      ml={{ md: "lg" }}
      style={{ margin: "20px 10px" }}
    >
      <Text
        component={Link}
        to="/dashboard"
        size="1.2rem"
        fw={600}
        style={{ textDecoration: "none", color: "black" }}
      >
        Home
      </Text>
      {breadcrumbs}
    </Breadcrumbs>
  );
}

export default CustomBreadDatabase;

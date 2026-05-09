import { Breadcrumbs as MantineBreadcrumbs, Text } from "@mantine/core";
import { CaretRight } from "@phosphor-icons/react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import classes from "../../../Dashboard/Dashboard.module.css";

const routeBreadcrumbs = [
  { match: "/healthcenter/student/medical-profile", items: ["HealthCare Center", "Medical Profile"] },
  { match: "/healthcenter/student/medical-relief/approval", items: ["HealthCare Center", "Medical Relief", "Approval"] },
  { match: "/healthcenter/student/medical-relief", items: ["HealthCare Center", "Medical Relief"] },
  { match: "/healthcenter/student/announcements", items: ["HealthCare Center", "Announcements"] },
  { match: "/healthcenter/student/feedback", items: ["HealthCare Center", "Feedback"] },
  { match: "/healthcenter/student/schedule/pathologists", items: ["HealthCare Center", "Schedule", "Pathologists Info"] },
  { match: "/healthcenter/student/schedule/viewpath", items: ["HealthCare Center", "Schedule", "View Pathologist Schedule"] },
  { match: "/healthcenter/student/schedule/doctors", items: ["HealthCare Center", "Schedule", "Doctors Info"] },
  { match: "/healthcenter/student/schedule", items: ["HealthCare Center", "Schedule"] },
  { match: "/healthcenter/student/history", items: ["HealthCare Center", "Medical History"] },
  { match: "/healthcenter/student", items: ["HealthCare Center", "Dashboard"] },
];

const formatLabel = (value) =>
  value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const resolveBreadcrumbs = (pathname) => {
  const match = routeBreadcrumbs.find((item) => pathname.startsWith(item.match));

  if (match) {
    return match.items;
  }

  if (pathname.startsWith("/healthcenter")) {
    const segments = pathname
      .split("/")
      .filter(Boolean)
      .filter((segment) => segment !== "healthcenter");

    return ["HealthCare Center", ...segments.map(formatLabel)];
  }

  return null;
};

// eslint-disable-next-line react/prop-types
function CustomBreadcrumbs({ breadCrumbs }) {
  const location = useLocation();
  const currentModule = useSelector((state) => state.module.current_module);
  const activeTab = useSelector((state) => state.module.active_tab);

  const routeItems = resolveBreadcrumbs(location.pathname);

  const items1 = routeItems
    ? routeItems.map((item, index) => (
        <Text key={index} className={classes.fusionText} fw={600}>
          {item}
        </Text>
      ))
    : [{ title: currentModule }, { title: activeTab }].map((item, index) => (
        <Text key={index} className={classes.fusionText} fw={600}>
          {item.title}
        </Text>
      ));

  const items = breadCrumbs || items1;

  return (
    <MantineBreadcrumbs
      separator={
        <CaretRight className={classes.fusionCaretIcon} weight="bold" />
      }
      mt="xs"
      ml={{ md: "lg" }}
    >
      {items}
    </MantineBreadcrumbs>
  );
}

export default CustomBreadcrumbs;
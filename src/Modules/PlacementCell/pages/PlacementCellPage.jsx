import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";

import React, { useEffect, useState } from "react";
import { Container } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";
import CustomBreadcrumbs from "../../../components/Breadcrumbs";
import ModuleTabs from "../../../components/moduleTabs";
import { setActiveTab_ } from "../../../redux/moduleslice";
import DownloadCV from "../components/common/DownloadCV";
import PlacementCalendar from "../components/common/PlacementCalendar";
import PlacementSchedule from "../components/common/PlacementSchedule";
import AlumniRegistrationForm from "../components/forms/AlumniRegistrationForm";
import CompanyRegistrationForm from "../components/forms/CompanyRegistrationForm";
import FieldsForm from "../components/forms/FieldsForm";
import SendNotificationForm from "../components/forms/SendNotificationForm";
import AlumniMentorshipSessions from "../components/tables/AlumniMentorshipSessions";
import AlumniNetworkHub from "../components/tables/AlumniNetworkHub";
import AlumniReferrals from "../components/tables/AlumniReferrals";
import AlumniVerificationTable from "../components/tables/AlumniVerificationTable";
import AnnouncementsPanel from "../components/tables/AnnouncementsPanel";
import DebarredStudents from "../components/tables/DebarredStudents";
import HigherStudiesTab from "../components/tables/HigherStudiesTab";
import OffCampusPlacements from "../components/tables/OffCampusPlacements";
import PlacementAppealsPanel from "../components/tables/PlacementAppealsPanel";
import PlacementAppealsReviewTable from "../components/tables/PlacementAppealsReviewTable";
import PlacementPoliciesTab from "../components/tables/PlacementPoliciesTab";
import PlacementRecordsTable from "../components/tables/PlacementRecordsTable";
import PlacementReportsPanel from "../components/tables/PlacementReportsPanel";
import RestrictionsTab from "../components/tables/RestrictionsTab";
import StudentApplicationsTable from "../components/tables/StudentApplicationsTable";
import StudentCpiTab from "../components/tables/StudentCpiTab";
import StudentOffersTable from "../components/tables/StudentOffersTable";
import "../styles/module.css";

const studentTabs = [
  {
    value: "schedule",
    label: "Placement Schedule",
    component: <PlacementSchedule />,
  },
  {
    value: "announcements",
    label: "Announcements",
    component: <AnnouncementsPanel />,
  },
  {
    value: "stats",
    label: "Placement Stats",
    component: <PlacementRecordsTable />,
  },
  {
    value: "applications",
    label: "My Applications",
    component: <StudentApplicationsTable />,
  },
  {
    value: "offers",
    label: "My Offers",
    component: <StudentOffersTable />,
  },
  {
    value: "appeals",
    label: "Placement Appeals",
    component: <PlacementAppealsPanel />,
  },
  { value: "download-cv", label: "Download CV", component: <DownloadCV /> },
  {
    value: "placement-calendar",
    label: "Placement Calendar",
    component: <PlacementCalendar />,
  },
  {
    value: "alumni-network",
    label: "Alumni Network",
    component: <AlumniNetworkHub />,
  },
  {
    value: "alumni-referrals",
    label: "Alumni Referrals",
    component: <AlumniReferrals />,
  },
  {
    value: "mentorship",
    label: "Mentorship Sessions",
    component: <AlumniMentorshipSessions />,
  },
];

const defaultTabs = [
  {
    value: "schedule",
    label: "Placement Schedule",
    component: <PlacementSchedule />,
  },
  {
    value: "announcements",
    label: "Announcements",
    component: <AnnouncementsPanel />,
  },
  {
    value: "stats",
    label: "Placement Stats",
    component: <PlacementRecordsTable />,
  },
  {
    value: "placement-calendar",
    label: "Placement Calendar",
    component: <PlacementCalendar />,
  },
  {
    value: "alumni-registration",
    label: "Alumni Registration",
    component: <AlumniRegistrationForm />,
  },
];

const alumniTabs = [
  {
    value: "alumni-registration",
    label: "Alumni Profile",
    component: <AlumniRegistrationForm />,
  },
  {
    value: "alumni-referrals",
    label: "Job Referrals",
    component: <AlumniReferrals />,
  },
  {
    value: "mentorship",
    label: "Mentorship Sessions",
    component: <AlumniMentorshipSessions />,
  },
  {
    value: "alumni-network",
    label: "Student Network",
    component: <AlumniNetworkHub />,
  },
];

const chairmanTabs = [
  {
    value: "student-cpi",
    label: "Student CPI",
    component: <StudentCpiTab />,
  },
  {
    value: "stats",
    label: "Placement Stats",
    component: <PlacementRecordsTable />,
  },
  {
    value: "offcampus",
    label: "Off-Campus Placements",
    component: <OffCampusPlacements />,
  },
  {
    value: "announcements",
    label: "Announcements",
    component: <AnnouncementsPanel />,
  },
  {
    value: "schedule",
    label: "Placement Schedule",
    component: <PlacementSchedule />,
  },
  {
    value: "reports",
    label: "Placement Reports",
    component: <PlacementReportsPanel />,
  },
  {
    value: "policies",
    label: "Placement Policies",
    component: <PlacementPoliciesTab />,
  },
  {
    value: "appeals-review",
    label: "Placement Appeals",
    component: <PlacementAppealsReviewTable />,
  },
  {
    value: "debarred-students",
    label: "Debarred Students",
    component: <DebarredStudents />,
  },
  {
    value: "higher-studies",
    label: "Higher Studies",
    component: <HigherStudiesTab />,
  },
  {
    value: "alumni-verification",
    label: "Alumni Verification",
    component: <AlumniVerificationTable />,
  },
  {
    value: "placement-calendar",
    label: "Placement Calendar",
    component: <PlacementCalendar />,
  },
];

const tpoTabs = [
  {
    value: "student-cpi",
    label: "Student CPI",
    component: <StudentCpiTab />,
  },
  {
    value: "schedule",
    label: "Placement Schedule",
    component: <PlacementSchedule />,
  },
  {
    value: "offcampus",
    label: "Off-Campus Placements",
    component: <OffCampusPlacements />,
  },
  {
    value: "announcements",
    label: "Announcements",
    component: <AnnouncementsPanel />,
  },
  {
    value: "stats",
    label: "Placement Stats",
    component: <PlacementRecordsTable />,
  },
  {
    value: "send-notifications",
    label: "Send Notifications",
    component: <SendNotificationForm />,
  },
  {
    value: "company-registration",
    label: "Company Registration",
    component: <CompanyRegistrationForm />,
  },
  {
    value: "reports",
    label: "Placement Reports",
    component: <PlacementReportsPanel />,
  },
  {
    value: "debarred-students",
    label: "Debarred Students",
    component: <DebarredStudents />,
  },
  {
    value: "restrictions",
    label: "Restrictions",
    component: <RestrictionsTab />,
  },
  {
    value: "fields",
    label: "Fields",
    component: <FieldsForm />,
  },
  {
    value: "appeals-review",
    label: "Placement Appeals",
    component: <PlacementAppealsReviewTable />,
  },
  {
    value: "higher-studies",
    label: "Higher Studies",
    component: <HigherStudiesTab />,
  },
  {
    value: "placement-calendar",
    label: "Placement Calendar",
    component: <PlacementCalendar />,
  },
  {
    value: "alumni-registration",
    label: "Alumni Request",
    component: <AlumniRegistrationForm />,
  },
  {
    value: "alumni-verification",
    label: "Alumni Verification",
    component: <AlumniVerificationTable />,
  },
  {
    value: "alumni-referrals",
    label: "Alumni Referrals",
    component: <AlumniReferrals />,
  },
];

function PlacementCellPage() {
  const role = useSelector((state) => state.user.role);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("0");

  let tabs = defaultTabs;
  if (role === "student") {
    tabs = studentTabs;
  } else if (role === "alumni") {
    tabs = alumniTabs;
  } else if (role === "placement chairman") {
    tabs = chairmanTabs;
  } else if (role === "placement officer") {
    tabs = tpoTabs;
  }

  const tabItems = tabs.map((tab) => ({ title: tab.label }));
  const activeIndex = parseInt(activeTab, 10);

  useEffect(() => {
    if (tabs[activeIndex]) {
      dispatch(setActiveTab_(tabs[activeIndex].label));
    }
  }, [activeTab, role]);

  return (
    <div className="placementCellPage">
      <CustomBreadcrumbs />
      <Container fluid mt={48}>
        <ModuleTabs
          tabs={tabItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="tabContent">{tabs[activeIndex]?.component}</div>
      </Container>
    </div>
  );
}

export default PlacementCellPage;

import { Box, Group, Stack, Text } from "@mantine/core";
import { useState, lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import ModuleTabs from "../../../components/moduleTabs";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";

// Import from new structure
import EventApprovalsWithProviders from "../tables/EventApprovalsTable";
import CoordinatorMembersWithProviders from "../tables/CoordinatorMembersTable";
import BudgetApprovalsWithProviders from "../tables/BudgetApprovalTable";
import FestForm from "../forms/FestForm";
import { useCurrentLoginRoleRelatedClub } from "../../hooks/useClubs";
import DataTable from "../tables/DataTable";
import DownloadNewsletter from "../common/DownloadNewsletter";
import ReportForm from "../forms/EventReportForm";
import EventReportTable from "../tables/EventReportTable";
import YearlyplanButton from "../forms/YearlyplanButton";
import YearlyplanTable from "../tables/YearlyplanTable";
import GalleryForm from "../forms/GalleryForm";
import GalleryView from "../tables/GalleryView";

// Lazy imports
const RegistrationForm = lazy(() => import("../forms/RegistrationForm"));
const EventForm = lazy(() => import("../forms/EventForm"));
const BudgetForm = lazy(() => import("../forms/BudgetForm"));
const NewsLetterForm = lazy(() => import("../forms/NewsLetterForm"));

function ClubViewComponent({
  AboutClub,
  clubName,
  membersData,
  achievementsData,
  eventsData,
  membersColumns,
  achievementsColumns,
  eventsColumns,
}) {
  const user = useSelector((state) => state.user);
  const token = localStorage.getItem("authToken");
  const userRole = user.role;
  const [activeclubfeature, setactiveclubfeature] = useState("0");

  const { data: CurrentLogginedRelatedClub = [] } =
    useCurrentLoginRoleRelatedClub(user.roll_no, token);

  const VisibleClubArray = [];
  CurrentLogginedRelatedClub.forEach((c) => {
    VisibleClubArray.push(c.club);
  });

  const tabs = [{ title: "About" }];

  if (
    user.role === "co-ordinator" &&
    CurrentLogginedRelatedClub.length > 0 &&
    CurrentLogginedRelatedClub[0].club === clubName
  ) {
    tabs.push({ title: `${clubName} Members` });
  } else {
    tabs.push({ title: "Members" });
  }

  tabs.push({ title: "Achievements" });

  if (user.role === "co-ordinator") {
    tabs.push({ title: `${clubName} Events` });
  } else {
    tabs.push({ title: "Events" });
  }

  if (user.role === "student") {
    tabs.push({ title: "Register" });
  }

  if (userRole === "Dean_s") {
    tabs.push(
      { title: "Events Approval" },
      { title: "Budget Approval" },
      { title: "YearlyPlanner Table" },
    );
  }

  if (
    [
      "FIC",
      "Counsellor",
      "Professor",
      "Tech_Counsellor",
      "Sports_Counsellor",
      "Cultural_Counsellor",
    ].includes(userRole) &&
    CurrentLogginedRelatedClub.length > 0 &&
    VisibleClubArray.includes(clubName)
  ) {
    tabs.push(
      { title: "Events Approval" },
      { title: "Budget Approval" },
      { title: "YearlyPlanner Table" },
    );
  }

  if (
    user.role === "co-ordinator" &&
    CurrentLogginedRelatedClub.length > 0 &&
    CurrentLogginedRelatedClub[0].club === clubName
  ) {
    tabs.push(
      { title: "Events Approval" },
      { title: "Budget Approval" },
      { title: "Events Approval Form" },
      { title: "Budget Approval Form" },
      { title: "Fest Form" },
      { title: "Upload for Newsletter" },
      { title: "Event Report Form" },
      { title: "YearlyPlanner Upload" },
      { title: "YearlyPlanner Table" },
      { title: "Upload Club Images" },
    );
  }

  tabs.push({ title: "Download Newsletter" });
  tabs.push({ title: "View Gallery" });

  if (user.role === "Counsellor") {
    tabs.push({ title: "Event Reports" });
  }

  const renderActiveContent = () => {
    switch (tabs[parseInt(activeclubfeature, 10)]?.title) {
      case "About":
        return (
          <div className="gymkhana-section">
            <Box className="gymkhana-section-body">
              <Text className="gymkhana-section-title" mb="sm">
                About {clubName}
              </Text>
              <Text className="gymkhana-club-copy">
                Welcome to {clubName}. {AboutClub}
              </Text>
            </Box>
          </div>
        );
      case "Members":
        return (
          <DataTable
            data={membersData}
            columns={membersColumns}
            TableName="Members"
          />
        );
      case "Achievements":
        return (
          <DataTable
            columns={achievementsColumns}
            data={achievementsData}
            TableName="Achievements"
          />
        );
      case "Events":
        return (
          <DataTable
            columns={eventsColumns}
            data={eventsData}
            TableName="Events"
          />
        );
      case "Events Approval":
        return (
          <Suspense fallback={<div>Loading Table component</div>}>
            <EventApprovalsWithProviders clubName={clubName} />
          </Suspense>
        );
      case "Budget Approval":
        return (
          <Suspense fallback={<div>Loading Table component</div>}>
            <BudgetApprovalsWithProviders clubName={clubName} />
          </Suspense>
        );
      case "Fest Form":
        return (
          <Suspense fallback={<div>Loading Table component</div>}>
            <FestForm clubName={clubName} />
          </Suspense>
        );
      case `${clubName} Members`:
        return (
          <Suspense fallback={<div>Loading Members Table</div>}>
            <CoordinatorMembersWithProviders clubName={clubName} />
          </Suspense>
        );
      case `${clubName} Events`:
        return (
          <Suspense fallback={<div>Loading Table component</div>}>
            <DataTable data={eventsData} columns={eventsColumns} />
          </Suspense>
        );
      case "Events Approval Form":
        return (
          <Suspense fallback={<div>Loading Events Approval Form...</div>}>
            <EventForm clubName={clubName} />
          </Suspense>
        );
      case "Budget Approval Form":
        return (
          <Suspense fallback={<div>Loading Budget Approval Form...</div>}>
            <BudgetForm clubName={clubName} />
          </Suspense>
        );
      case "Upload for Newsletter":
        return (
          <Suspense fallback={<div>Loading Newsletter Form...</div>}>
            <NewsLetterForm clubName={clubName} />
          </Suspense>
        );
      case "Download Newsletter":
        return (
          <Suspense fallback={<div>Loading options</div>}>
            <DownloadNewsletter clubName={clubName} />
          </Suspense>
        );
      case "Event Report Form":
        return (
          <Suspense fallback={<div>Loading Event Report Form</div>}>
            <ReportForm clubName={clubName} />
          </Suspense>
        );
      case "Event Reports":
        return (
          <Suspense fallback={<div>Loading Event Reports</div>}>
            <EventReportTable clubName={clubName} />
          </Suspense>
        );
      case "Upload Club Images":
        return (
          <Suspense fallback={<div>Loading Form</div>}>
            <GalleryForm clubName={clubName} />
          </Suspense>
        );
      case "View Gallery":
        return (
          <Suspense fallback={<div>Loading Images</div>}>
            <GalleryView clubName={clubName} />
          </Suspense>
        );
      case "YearlyPlanner Upload":
        return (
          <Suspense fallback={<div>Loading Yearly Planner Upload</div>}>
            <YearlyplanButton clubName={clubName} />
          </Suspense>
        );
      case "YearlyPlanner Table":
        return (
          <Suspense fallback={<div>Loading Yearly Planner Upload</div>}>
            <YearlyplanTable clubName={clubName} />
          </Suspense>
        );
      default:
        return (
          <Stack align="center">
            <Suspense fallback={<div>Loading Registration Form...</div>}>
              <RegistrationForm clubName={clubName} />
            </Suspense>
          </Stack>
        );
    }
  };

  return (
    <Box className="gymkhana-club-shell gymkhana-shell gymkhana-shell--full">
      <div className="gymkhana-section">
        <Box className="gymkhana-section-body">
          <div className="gymkhana-club-header">
            <Stack gap={4}>
              <Text className="gymkhana-club-title">{clubName}</Text>
              <Text className="gymkhana-subtle-text" size="sm">
                Gymkhana club workspace inside Fusion
              </Text>
            </Stack>
            <ModuleTabs
              tabs={tabs}
              activeTab={activeclubfeature}
              setActiveTab={setactiveclubfeature}
            />
          </div>
        </Box>
      </div>
      <Box>{renderActiveContent()}</Box>
    </Box>
  );
}

ClubViewComponent.propTypes = {
  clubName: PropTypes.string.isRequired,
  AboutClub: PropTypes.string.isRequired,
  membersData: PropTypes.array.isRequired,
  achievementsData: PropTypes.array.isRequired,
  eventsData: PropTypes.array.isRequired,
  membersColumns: PropTypes.array.isRequired,
  achievementsColumns: PropTypes.array.isRequired,
  eventsColumns: PropTypes.array.isRequired,
};

export default ClubViewComponent;

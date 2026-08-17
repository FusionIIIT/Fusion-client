import { lazy, useMemo } from "react";
import { useSelector } from "react-redux";

import { ModuleRoutes } from "../../ui/routing/ModuleRoutes";
import { pagesForRole } from "../../ui/nav/roles";
import { FPS_BASE, FPS_PAGES } from "./pages";

const COMPONENTS = {
  publications: lazy(() => import("./Profile/Publications/PublicationsMaster")),
  projects: lazy(() => import("./Profile/Projects/ProjectMaster")),
  thesisSupervision: lazy(
    () => import("./Profile/ThesisSupervision/ThesisSupervisionMaster"),
  ),
  conference: lazy(() => import("./Profile/Conference/ConferenceMaster")),
  others: lazy(() => import("./Profile/Others/OtherMaster")),
  events: lazy(() => import("./Profile/EventsOrganised/EventMaster")),
  visits: lazy(() => import("./Profile/Visits/VisitsMaster")),
  myProfile: lazy(() => import("./Profile/MyProfile/MyProfileMaster")),
  aboutMe: lazy(() => import("./Profile/AboutMe/AboutMe")),
  qualifications: lazy(() => import("./Profile/Qualifications/Qualifications")),
  honors: lazy(() => import("./Profile/Honors/Honors")),
  professionalExperience: lazy(
    () => import("./Profile/ProfessionalExperience/ProfessionalExperience"),
  ),
  administrativePosition: lazy(
    () => import("./Profile/AdministrativePosition/AdministrativePosition"),
  ),
};

export default function FacultyProfessionalProfile() {
  const role = useSelector((state) => state.user.role);

  const pages = useMemo(() => pagesForRole(FPS_PAGES, role), [role]);

  return (
    <ModuleRoutes
      pages={pages}
      components={COMPONENTS}
      basePath={FPS_BASE}
      emptyMessage="The professional profile is not available for your role."
    />
  );
}

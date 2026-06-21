import { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import AuthorizationError from "../../Modules/PlacementCell/components/common/AuthorizationError";
import { PLACEMENT_OFFICER_ROLES } from "../../Modules/PlacementCell/utils/authorization";
// The landing page is imported eagerly (like the other ERP modules) so opening
// the module from the sidebar renders immediately for every role instead of
// flashing a loading state while a separate chunk downloads.
import PlacementCellPage from "../../Modules/PlacementCell";
import {
  placementCellApplicationDetailRoute,
  placementCellApplyRoute,
  placementCellOfferDetailRoute,
  placementCellRoute,
  placementCellTimelineRoute,
  placementCellViewRoute,
} from ".";

const ApplyForPlacementPage = lazy(
  () => import("../../Modules/PlacementCell/ApplyForPlacement"),
);
const PlacementEventPage = lazy(
  () => import("../../Modules/PlacementCell/PlacementEvent"),
);
const ApplicationTimelinePage = lazy(
  () => import("../../Modules/PlacementCell/ApplicationTimeline"),
);
const OfferDetailPage = lazy(
  () => import("../../Modules/PlacementCell/OfferDetail"),
);
const ApplicationDetailPage = lazy(
  () => import("../../Modules/PlacementCell/pages/ApplicationDetailPage"),
);

function PlacementOfficerRoute({ children }) {
  const role = useSelector((state) => state.user.role);

  if (!PLACEMENT_OFFICER_ROLES.includes(role)) {
    return (
      <AuthorizationError message="Only placement officer users can access applicant-management features." />
    );
  }

  return children;
}

PlacementOfficerRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function PlacementCellRoutes() {
  return (
    <Suspense
      fallback={
        <Center h="60vh">
          <Loader />
        </Center>
      }
    >
      <Routes>
        <Route index element={<PlacementCellPage />} />
        <Route
          path={placementCellApplyRoute}
          element={<ApplyForPlacementPage />}
        />
        <Route
          path={placementCellViewRoute}
          element={
            <PlacementOfficerRoute>
              <PlacementEventPage />
            </PlacementOfficerRoute>
          }
        />
        <Route
          path={placementCellTimelineRoute}
          element={<ApplicationTimelinePage />}
        />
        <Route
          path={placementCellOfferDetailRoute}
          element={<OfferDetailPage />}
        />
        <Route
          path={placementCellApplicationDetailRoute}
          element={
            <PlacementOfficerRoute>
              <ApplicationDetailPage />
            </PlacementOfficerRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to={placementCellRoute} replace />}
        />
      </Routes>
    </Suspense>
  );
}

export default PlacementCellRoutes;

import PropTypes from "prop-types";
import { databaseRemainingCoreGradesRoute } from "../../../routes/academicRoutes";
import CoreCourseGradesReport from "./CoreCourseGradesReport";

export default function RemainingCoreGradesReport({ filters }) {
  return (
    <CoreCourseGradesReport
      filters={filters}
      route={databaseRemainingCoreGradesRoute}
      filePrefix="remaining_core_grades"
    />
  );
}

RemainingCoreGradesReport.propTypes = {
  filters: PropTypes.shape({}).isRequired,
};

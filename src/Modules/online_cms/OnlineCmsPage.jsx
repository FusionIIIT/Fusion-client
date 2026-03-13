import PropTypes from "prop-types";
import StudentDashboard from "./components/Student/StudentDashboard";
import FacultyDashboard from "./components/Faculty/FacultyDashboard";

export default function OnlineCmsPage({ isFaculty }) {
  return isFaculty ? <FacultyDashboard /> : <StudentDashboard />;
}

OnlineCmsPage.propTypes = {
  isFaculty: PropTypes.bool.isRequired,
};

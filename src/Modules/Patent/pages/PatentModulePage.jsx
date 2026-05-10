import React from "react";
import PropTypes from "prop-types";
import ApplicantMainDashboard from "../components/Applicant/ApplicantMainDashboard";
import AttorneyMainDashboard from "../components/Attorney/AttorneyMainDashboard";
import DirectorMainDashboard from "../components/Director/DirectorMainDashboard";
import PCCAdminMainDashboard from "../components/PCCAdmin/PCCAdminMainDashboard";

function PatentModulePage({ role }) {
  if (
    [
      "student",
      "alumini",
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Research Engineer",
    ].includes(role)
  ) {
    return <ApplicantMainDashboard />;
  }

  if (role === "Director") {
    return <DirectorMainDashboard />;
  }

  if (role === "PCC Admin") {
    return <PCCAdminMainDashboard />;
  }

  if (role === "Attorney") {
    return <AttorneyMainDashboard />;
  }

  return null;
}

PatentModulePage.propTypes = {
  role: PropTypes.string,
};

export default PatentModulePage;

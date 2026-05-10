import { useSelector } from "react-redux";
import ApplicantMainDashboard from "./components/Applicant/ApplicantMainDashboard";
import DirectorMainDashboard from "./components/Director/DirectorMainDashboard";
import PCCAdminMainDashboard from "./components/PCCAdmin/PCCAdminMainDashboard";

export default function PatentModulePage() {
  const role = useSelector((state) => state.user.role);

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

  return null;
}

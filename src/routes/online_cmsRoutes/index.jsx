import { Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import OnlineCmsPage from "../../Modules/online_cms/OnlineCmsPage";

const FACULTY_ROLES = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Head of Department",
];

export default function OnlineCmsRoutes() {
  const role = useSelector((state) => state.user.role);
  const isStaff = useSelector((state) => state.user.isStaff);
  const isFaculty = Boolean(isStaff) || FACULTY_ROLES.includes(role);

  return (
    <Routes>
      <Route index element={<OnlineCmsPage isFaculty={isFaculty} />} />
      <Route path="*" element={<OnlineCmsPage isFaculty={isFaculty} />} />
    </Routes>
  );
}


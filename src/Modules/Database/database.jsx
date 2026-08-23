import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import { ModulePage } from "../../ui/components/ModulePage";
import ViewDatabase from "./ViewDatabase.jsx";

export default function Database() {
  const userRole = useSelector((state) => state.user.role);

  if (userRole === undefined || userRole === null) return null;

  return (
    <Routes>
      <Route index element={<Navigate to="/database/view" replace />} />
      <Route
        path="view"
        element={
          <ModulePage title="Database">
            <ViewDatabase />
          </ModulePage>
        }
      />
      <Route path="*" element={<Navigate to="/database/view" replace />} />
    </Routes>
  );
}

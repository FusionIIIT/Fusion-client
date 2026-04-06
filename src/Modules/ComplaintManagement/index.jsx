import { Navigate, Route, Routes } from "react-router-dom";
import ComplaintList from "./ComplaintList";
import ComplaintCreate from "./ComplaintCreate";

export default function ComplaintManagementModule() {
  return (
    <Routes>
      <Route path="/" element={<ComplaintList />} />
      <Route path="/new" element={<ComplaintCreate />} />
      <Route path="*" element={<Navigate to="/complaint" replace />} />
    </Routes>
  );
}

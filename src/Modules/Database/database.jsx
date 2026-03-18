import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Nav from "./components/nav.jsx";
import { Layout } from "../../components/layout.jsx";
import CustomBreadDatabase from "./components/customBreadCrumbs.jsx";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import CourseWiseStudentEnrollment from "./CourseWiseStudentEnrollment.jsx";
import StudentCoursesDetail from "./StudentCoursesDetail.jsx";
import StudentsGradeInfo from "./StudentsGradeInfo.jsx";


export default function Database() {
  const userRole = useSelector((state) => state.user.role);
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (userRole !== undefined && userRole !== null) {
      setIsLoaded(true);
    }
  }, [userRole]);

  if (!isLoaded) return null;

  const defaultRedirectPath = () => {
    const categoryFromUrl = new URLSearchParams(location.search).get("category");
    const safeCategory = ["ug", "pg", "phd"].includes(categoryFromUrl)
      ? categoryFromUrl
      : "ug";

    switch (userRole) {
      case "acadadmin":
        return `/database/view?category=${safeCategory}`;
      default:
        return `/database/view?category=${safeCategory}`;
    }
  };

  return (
    <div>
      <Layout>
        <CustomBreadDatabase />
        <Nav />
        <Routes key={`${location.pathname}${location.search}`}>
          <Route
            path="/"
            element={<Navigate to={defaultRedirectPath()} replace />}
          />
          <Route path="/view" element={<CourseWiseStudentEnrollment key={`${location.pathname}${location.search}`} />} />
          <Route path="/student-courses" element={<StudentCoursesDetail key={`${location.pathname}${location.search}`} />} />
          <Route path="/students-grade" element={<StudentsGradeInfo key={`${location.pathname}${location.search}`} />} />
        </Routes>
      </Layout>
    </div>
  );
}

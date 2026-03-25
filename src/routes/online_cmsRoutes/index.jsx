import React from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import OnlineCmsPage from "../../Modules/online_cms/index";
import DocumentsFeature from "../../Modules/online_cms/DocumentsFeature";
import AssignmentFeature from "../../Modules/online_cms/AssignmentFeature";
import ForumFeature from "../../Modules/online_cms/ForumFeature";
import QuizFeature from "../../Modules/online_cms/QuizFeature";
import AttendanceFeature from "../../Modules/online_cms/AttendanceFeature";
import QuestionBankFeature from "../../Modules/online_cms/QuestionBankFeature";
import GradingFeature from "../../Modules/online_cms/GradingFeature";

function WithCourseCode({ Component }) {
  const { courseCode } = useParams();
  return <Component courseCode={courseCode} />;
}

WithCourseCode.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

function OnlineCmsPageWithParam() {
  const { courseCode } = useParams();
  return <OnlineCmsPage initialCourseCode={courseCode} />;
}

const online_cmsRoutes = [
  { path: "/online-cms", element: <OnlineCmsPage /> },
  { path: "/online-cms/:courseCode", element: <OnlineCmsPageWithParam /> },
  { path: "/online-cms/:courseCode/documents", element: <DocumentsFeature /> },
  {
    path: "/online-cms/:courseCode/assignments",
    element: <WithCourseCode Component={AssignmentFeature} />,
  },
  {
    path: "/online-cms/:courseCode/forum",
    element: <WithCourseCode Component={ForumFeature} />,
  },
  {
    path: "/online-cms/:courseCode/quiz",
    element: <WithCourseCode Component={QuizFeature} />,
  },
  {
    path: "/online-cms/:courseCode/attendance",
    element: <WithCourseCode Component={AttendanceFeature} />,
  },
  {
    path: "/online-cms/:courseCode/questionbank",
    element: <WithCourseCode Component={QuestionBankFeature} />,
  },
  {
    path: "/online-cms/:courseCode/grading",
    element: <WithCourseCode Component={GradingFeature} />,
  },
];

export default online_cmsRoutes;

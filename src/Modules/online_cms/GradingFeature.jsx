/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import GradingSchemeTable from "./components/GradingSchemeTable";
import AddGradingSchemeForm from "./components/AddGradingSchemeForm";
import StudentEvaluationTable from "./components/StudentEvaluationTable";
import StudentGradesTable from "./components/StudentGradesTable";
import {
  getGradingScheme,
  createGradingScheme,
  saveEvaluation,
  getStudentGrades,
} from "./api";

const FACULTY_ROLES = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Research Engineer",
  "HOD (CSE)",
  "HOD (ECE)",
  "HOD (ME)",
  "HOD (NS)",
  "HOD (Design)",
  "HOD (Liberal Arts)",
  "Dean Academic",
  "dean_s",
  "dean_rspc",
];

export default function GradingFeature() {
  const { courseCode } = useParams();
  const role = useSelector((state) => state.user.role);
  const isFaculty = FACULTY_ROLES.includes(role);
  const [schemes, setSchemes] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [studentGrades, setStudentGrades] = useState(null);

  const load = () => {
    if (courseCode) {
      if (isFaculty) {
        getGradingScheme(courseCode).then((data) => {
          setSchemes(data?.schemes || []);
          setEvaluations(data?.evaluations || []);
        });
      } else {
        getStudentGrades(courseCode).then((data) => setStudentGrades(data));
      }
    }
  };

  useEffect(() => {
    load();
  }, [courseCode, isFaculty]);

  const handleCreateScheme = async (data) => {
    await createGradingScheme(courseCode, data);
    load();
  };

  const handleSaveEvaluation = async (data) => {
    await saveEvaluation(courseCode, data);
    load();
  };

  return (
    <div>
      {isFaculty ? (
        <>
          <AddGradingSchemeForm
            courseCode={courseCode}
            onSubmit={handleCreateScheme}
          />
          <GradingSchemeTable schemes={schemes} />
          <StudentEvaluationTable
            evaluations={evaluations}
            schemes={schemes}
            onSave={handleSaveEvaluation}
          />
        </>
      ) : (
        <StudentGradesTable data={studentGrades} />
      )}
    </div>
  );
}

/* eslint-disable */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import QuizCreateForm from "./components/QuizCreateForm";
import QuizListTable from "./components/QuizListTable";
import QuizAttemptView from "./components/QuizAttemptView";
import {
  getQuizzes,
  createQuiz,
  removeQuiz,
  takeQuiz,
  submitQuiz,
} from "./api";

const isFacultyRole = (role) => {
  const roleStr = String(role || "");
  return roleStr === "faculty" || roleStr === "staff";
};

export default function QuizFeature({ courseCode }) {
  const role = useSelector((state) => state.user.role);
  const isFaculty = isFacultyRole(role);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const loadQuizzes = () => {
    if (courseCode)
      getQuizzes(courseCode).then((data) => setQuizzes(data || []));
  };

  useEffect(() => {
    loadQuizzes();
  }, [courseCode, isFaculty]);

  const handleCreate = async (data) => {
    await createQuiz(courseCode, data);
    loadQuizzes();
  };

  const handleRemove = async (id) => {
    await removeQuiz(courseCode, id);
    loadQuizzes();
  };

  const handleStartQuiz = async (quiz) => {
    const data = await takeQuiz(courseCode, quiz.id);
    if (data) setActiveQuiz(data);
  };

  const handleSubmitQuiz = async (answers) => {
    if (!activeQuiz) return;
    const res = await submitQuiz(courseCode, activeQuiz.id, { answers });
    setActiveQuiz(null);
    loadQuizzes();
    if (res) {
      alert(`Score: ${res.score} / ${res.totalMarks}`);
    }
  };

  if (activeQuiz) {
    return (
      <QuizAttemptView
        quiz={activeQuiz}
        onSubmit={handleSubmitQuiz}
        onCancel={() => setActiveQuiz(null)}
      />
    );
  }

  return (
    <div>
      {isFaculty && (
        <QuizCreateForm courseCode={courseCode} onSubmit={handleCreate} />
      )}
      <QuizListTable
        quizzes={quizzes}
        onRemove={isFaculty ? handleRemove : undefined}
        onStart={!isFaculty ? handleStartQuiz : undefined}
        isFaculty={isFaculty}
      />
    </div>
  );
}

QuizFeature.propTypes = {
  courseCode: PropTypes.string,
};

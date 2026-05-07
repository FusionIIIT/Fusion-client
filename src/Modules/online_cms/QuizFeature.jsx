/* eslint-disable */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Loader, Center, Stack, Alert } from "@mantine/core";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import { setCurrentModule, setActiveTab_ } from "../../redux/moduleslice";
import QuizCreateForm from "./components/QuizCreateForm";
import QuizListTable from "./components/QuizListTable";
import { getQuizzes, createQuiz, removeQuiz } from "./api";

const isFacultyRole = (role) => {
  const roleStr = String(role || "");
  return roleStr === "faculty" || roleStr === "staff";
};

export default function QuizFeature({ courseCode }) {
  const role = useSelector((state) => state.user.role);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCurrentModule("Course Management"));
    dispatch(setActiveTab_("Quiz"));
  }, [dispatch]);
  const isFaculty = isFacultyRole(role);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadQuizzes = async () => {
    if (courseCode) {
      setLoading(true);
      try {
        const data = await getQuizzes(courseCode);
        setQuizzes(data || []);
        setError(null);
      } catch (err) {
        setError("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [courseCode, isFaculty]);

  const handleCreate = async (data) => {
    setLoading(true);
    try {
      const result = await createQuiz(courseCode, data);
      if (result) {
        setError(null);
        await loadQuizzes();
      }
    } catch (err) {
      setError("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    setLoading(true);
    try {
      await removeQuiz(courseCode, id);
      setError(null);
      await loadQuizzes();
    } catch (err) {
      setError("Failed to delete quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <CustomBreadcrumbs />
      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}
      {loading && (
        <Center p="lg">
          <Loader />
        </Center>
      )}
      {!loading && (
        <>
          {isFaculty && (
            <QuizCreateForm courseCode={courseCode} onSubmit={handleCreate} />
          )}
          <QuizListTable
            quizzes={quizzes}
            onRemove={isFaculty ? handleRemove : undefined}
            isFaculty={isFaculty}
          />
        </>
      )}
    </Stack>
  );
}

QuizFeature.propTypes = {
  courseCode: PropTypes.string,
};

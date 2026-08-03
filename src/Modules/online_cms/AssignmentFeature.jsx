/* eslint-disable */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Loader, Center, Stack } from "@mantine/core";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import { setCurrentModule, setActiveTab_ } from "../../redux/moduleslice";
import AssignmentTable from "./components/AssignmentTable";
import AddAssignmentForm from "./components/AddAssignmentForm";
import AssignmentUploadForm from "./components/AssignmentUploadForm";
import {
  getAssignments,
  addAssignment,
  uploadAssignment,
  deleteAssignment,
  gradeAssignment,
} from "./api";

const isFacultyRole = (role) => {
  const roleStr = String(role || "");
  return roleStr === "faculty" || roleStr === "staff";
};

export default function AssignmentFeature({ courseCode }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const role = useSelector((state) => state.user.role);
  const dispatch = useDispatch();
  const isFaculty = isFacultyRole(role);

  useEffect(() => {
    dispatch(setCurrentModule("Course Management"));
    dispatch(setActiveTab_("Assignments"));
  }, [dispatch]);

  const load = async () => {
    if (courseCode) {
      setLoading(true);
      try {
        const data = await getAssignments(courseCode);
        setAssignments(data || []);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    load();
  }, [courseCode]);

  const handleAdd = async (data) => {
    setLoading(true);
    try {
      const result = await addAssignment(courseCode, data);
      if (result) {
        await load();
      }
    } catch (err) {
      console.error("Add assignment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (data) => {
    setLoading(true);
    try {
      const result = await uploadAssignment(courseCode, {
        assignment_id: data.assignment_id,
        submission_link: data.submission_link,
      });
      if (result) {
        await load();
      }
    } catch (err) {
      console.error("Upload assignment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async ({ pk, score, feedback }) => {
    setLoading(true);
    try {
      const result = await gradeAssignment(courseCode, pk, { score, feedback });
      if (result) {
        await load();
      }
    } catch (err) {
      console.error("Grade error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const result = await deleteAssignment(courseCode, id);
      if (result) {
        await load();
      }
    } catch (err) {
      console.error("Delete assignment error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center p="lg">
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <CustomBreadcrumbs />
      {isFaculty ? (
        <AddAssignmentForm courseCode={courseCode} onSuccess={handleAdd} />
      ) : (
        <AssignmentUploadForm
          courseCode={courseCode}
          assignments={assignments}
          onSuccess={handleUpload}
        />
      )}
      <AssignmentTable
        courseCode={courseCode}
        assignments={assignments}
        onDelete={isFaculty ? handleDelete : undefined}
        onGrade={isFaculty ? handleGrade : undefined}
        isFaculty={isFaculty}
      />
    </Stack>
  );
}

AssignmentFeature.propTypes = {
  courseCode: PropTypes.string,
};

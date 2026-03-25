/* eslint-disable */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
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
  const role = useSelector((state) => state.user.role);
  const isFaculty = isFacultyRole(role);

  const load = () => {
    if (courseCode)
      getAssignments(courseCode).then((data) => setAssignments(data || []));
  };

  useEffect(() => {
    load();
  }, [courseCode]);

  const handleAdd = async (data) => {
    await addAssignment(courseCode, data);
    load();
  };

  const handleUpload = async (data) => {
    await uploadAssignment(courseCode, {
      assignment_id: data.assignment_id,
      submission_link: data.submission_link,
    });
    load();
  };

  const handleGrade = async ({ pk, score, feedback }) => {
    await gradeAssignment(courseCode, pk, { score, feedback });
    load();
  };

  const handleDelete = async (id) => {
    await deleteAssignment(courseCode, id);
    load();
  };

  return (
    <div>
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
    </div>
  );
}

AssignmentFeature.propTypes = {
  courseCode: PropTypes.string,
};

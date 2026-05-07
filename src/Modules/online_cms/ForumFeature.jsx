/* eslint-disable */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import { setCurrentModule, setActiveTab_ } from "../../redux/moduleslice";
import ForumThreadTable from "./components/ForumThreadTable";
import ForumQuestionForm from "./components/ForumQuestionForm";
import {
  getForum,
  postForumQuestion,
  postForumReply,
  removeForumEntry,
} from "./api";

const isFacultyRole = (role) => {
  const roleStr = String(role || "");
  return roleStr === "faculty" || roleStr === "staff";
};

export default function ForumFeature({ courseCode }) {
  const [threads, setThreads] = useState([]);
  const role = useSelector((state) => state.user.role);
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.user.username || "");
  const isFaculty = isFacultyRole(role);

  useEffect(() => {
    dispatch(setCurrentModule("Course Management"));
    dispatch(setActiveTab_("Forum"));
  }, [dispatch]);

  const load = () => {
    if (courseCode) getForum(courseCode).then((data) => setThreads(data || []));
  };

  useEffect(() => {
    load();
  }, [courseCode]);

  const handlePost = async (data) => {
    await postForumQuestion(courseCode, data);
    load();
  };

  const handleReply = async (data) => {
    await postForumReply(courseCode, data);
    load();
  };

  const handleDelete = async (id) => {
    await removeForumEntry(courseCode, id);
    load();
  };

  return (
    <div>
      <CustomBreadcrumbs />
      <ForumQuestionForm courseCode={courseCode} onSubmit={handlePost} />
      <ForumThreadTable
        courseCode={courseCode}
        threads={threads}
        onReply={handleReply}
        onDelete={handleDelete}
        isFaculty={isFaculty}
        currentUserId={currentUserId}
      />
    </div>
  );
}

ForumFeature.propTypes = {
  courseCode: PropTypes.string,
};

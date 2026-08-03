/* eslint-disable */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import { setCurrentModule, setActiveTab_ } from "../../redux/moduleslice";
import DocumentsTable from "./components/DocumentsTable";
import DocumentUploadForm from "./components/DocumentUploadForm";
import { getDocuments, uploadDocument, deleteDocument } from "./api";

const isFacultyRole = (role) => {
  const roleStr = String(role || "");
  return roleStr === "faculty" || roleStr === "staff";
};

export default function DocumentsFeature({ courseCode: courseCodeProp }) {
  const { courseCode: courseCodeParam } = useParams();
  const courseCode = courseCodeProp || courseCodeParam;
  const [documents, setDocuments] = useState([]);
  const role = useSelector((state) => state.user.role);
  const dispatch = useDispatch();
  const isFaculty = isFacultyRole(role);

  useEffect(() => {
    dispatch(setCurrentModule("Course Management"));
    dispatch(setActiveTab_("Materials"));
  }, [dispatch]);

  const load = () => {
    if (courseCode)
      getDocuments(courseCode).then((data) => setDocuments(data || []));
  };

  useEffect(() => {
    load();
  }, [courseCode]);

  const handleUpload = async (data) => {
    await uploadDocument(courseCode, {
      title: data.title,
      description: data.description,
      url: data.url,
    });
    load();
  };

  const handleDelete = async (id) => {
    await deleteDocument(courseCode, id);
    load();
  };

  return (
    <div>
      <CustomBreadcrumbs />
      {isFaculty && <DocumentUploadForm onSubmit={handleUpload} />}
      <DocumentsTable
        documents={documents}
        onDelete={isFaculty ? handleDelete : undefined}
        isFaculty={isFaculty}
      />
    </div>
  );
}

DocumentsFeature.propTypes = {
  courseCode: PropTypes.string,
};

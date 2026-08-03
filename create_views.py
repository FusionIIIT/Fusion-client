import os

base_dir = "/mnt/c/Users/indra/Desktop/Fusion/Fusion-client/src/Modules/online_cms/"

files = {
    "CourseList.jsx": """import React, { useEffect, useState } from 'react';
import CourseListTable from './components/CourseListTable';
import { getCourses } from './api';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  
  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  return <CourseListTable courses={courses} />;
}
""",
    "CourseHome.jsx": """import React from 'react';
import { useParams } from 'react-router-dom';
import CourseDashboard from './components/CourseDashboard';

export default function CourseHome() {
  const { courseCode } = useParams();
  return <CourseDashboard courseCode={courseCode} />;
}
""",
    "DocumentsFeature.jsx": """import React, { useEffect, useState } from 'react';
import DocumentsTable from './components/DocumentsTable';
import DocumentUploadForm from './components/DocumentUploadForm';
import { getDocuments, deleteDocument } from './api';
import { useParams } from 'react-router-dom';

export default function DocumentsFeature() {
  const { courseCode } = useParams();
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (courseCode) getDocuments(courseCode).then(setDocuments);
  }, [courseCode]);

  return (
    <div>
      <DocumentUploadForm courseCode={courseCode} onSuccess={() => getDocuments(courseCode).then(setDocuments)} />
      <DocumentsTable documents={documents} onDelete={(pk) => deleteDocument(courseCode, pk)} />
    </div>
  );
}
""",
    "AssignmentFeature.jsx": """import React, { useEffect, useState } from 'react';
import AssignmentTable from './components/AssignmentTable';
import AddAssignmentForm from './components/AddAssignmentForm';
import AssignmentUploadForm from './components/AssignmentUploadForm';
import GradeSubmissionForm from './components/GradeSubmissionForm';
import { getAssignments } from './api';
import { useParams } from 'react-router-dom';

export default function AssignmentFeature() {
  const { courseCode } = useParams();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    if (courseCode) getAssignments(courseCode).then(setAssignments);
  }, [courseCode]);

  return (
    <div>
      <AddAssignmentForm courseCode={courseCode} onSuccess={() => getAssignments(courseCode).then(setAssignments)} />
      <AssignmentUploadForm courseCode={courseCode} assignments={assignments} onSuccess={() => getAssignments(courseCode).then(setAssignments)} />
      <AssignmentTable assignments={assignments} studentAssignments={[]} />
    </div>
  );
}
""",
    "ForumFeature.jsx": """import React from 'react';
import ForumWorkspace from './components/ForumWorkspace';
import { useParams } from 'react-router-dom';

export default function ForumFeature() {
  const { courseCode } = useParams();
  return <ForumWorkspace courseCode={courseCode} />;
}
""",
    "QuizFeature.jsx": """import React from 'react';
import QuizWorkspace from './components/QuizWorkspace';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function QuizFeature() {
  const { courseCode } = useParams();
  const role = useSelector((state) => state.user?.role || 'student');
  return <QuizWorkspace courseCode={courseCode} role={role} />;
}
""",
    "AttendanceFeature.jsx": """import React, { useState, useEffect } from 'react';
import AttendanceForm from './components/AttendanceForm';
import AttendanceRecordsTable from './components/AttendanceRecordsTable';
import { useParams } from 'react-router-dom';
import { getAttendanceRecords } from './api';

export default function AttendanceFeature() {
  const { courseCode } = useParams();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (courseCode) getAttendanceRecords(courseCode).then(setRecords);
  }, [courseCode]);

  return (
    <div>
      <AttendanceForm courseCode={courseCode} students={[]} onSuccess={() => getAttendanceRecords(courseCode).then(setRecords)} />
      <AttendanceRecordsTable records={records} students={[]} />
    </div>
  );
}
""",
    "QuestionBankFeature.jsx": """import React, { useState, useEffect } from 'react';
import QuestionBankTable from './components/QuestionBankTable';
import CreateBankForm from './components/CreateBankForm';
import TopicTable from './components/TopicTable';
import AddQuestionForm from './components/AddQuestionForm';
import { useParams } from 'react-router-dom';
import { getQuestionBank } from './api';

export default function QuestionBankFeature() {
  const { courseCode } = useParams();
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    if (courseCode) getQuestionBank(courseCode).then(setBanks);
  }, [courseCode]);

  return (
    <div>
      <CreateBankForm courseCode={courseCode} onSuccess={() => getQuestionBank(courseCode).then(setBanks)} />
      <QuestionBankTable banks={banks} courseCode={courseCode} />
      <TopicTable topics={[]} bankId={null} />
      <AddQuestionForm courseCode={courseCode} bankId={null} topicId={null} />
    </div>
  );
}
""",
    "GradingFeature.jsx": """import React, { useEffect, useState } from 'react';
import GradingSchemeTable from './components/GradingSchemeTable';
import AddGradingSchemeForm from './components/AddGradingSchemeForm';
import StudentEvaluationTable from './components/StudentEvaluationTable';
import StudentGradesTable from './components/StudentGradesTable';
import { useParams } from 'react-router-dom';
import { getGradingScheme } from './api';

export default function GradingFeature() {
  const { courseCode } = useParams();
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    if (courseCode) getGradingScheme(courseCode).then(setSchemes);
  }, [courseCode]);

  return (
    <div>
      <AddGradingSchemeForm courseCode={courseCode} onSuccess={() => getGradingScheme(courseCode).then(setSchemes)} />
      <GradingSchemeTable schemes={schemes} />
      <StudentEvaluationTable evaluations={[]} students={[]} schemes={schemes} />
      <StudentGradesTable grades={[]} />
    </div>
  );
}
"""
}

for name, content in files.items():
    with open(os.path.join(base_dir, name), "w") as f:
        f.write(content)


import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { PageHeader } from "../../ui/components/PageHeader";
import { RouteTrail } from "../../ui/components/RouteTrail";
import { pagesForRole } from "../../ui/nav/roles";
import { sidebarPageFor, trailFor } from "../../lib/routeTrail";
import { CURRICULUM_BASE, CURRICULUM_PAGES, CURRICULUM_TRAILS } from "./pages";
import AdminViewAllCourses from "./Acad_admin/Admin_view_all_courses";
import AdminViewACourse from "./Acad_admin/Admin_view_a_course";
import AdminViewAllBatches from "./Acad_admin/Admin_view_all_batches";
import AdminViewSemestersOfACurriculum from "./Acad_admin/Admin_view_semesters_of_a_curriculum";
import FacultyViewAllCourses from "./Faculty/Faculty_view_all_courses";
import FacultyViewACourse from "./Faculty/Faculty_view_a_course";
import FacultyViewACourseProposalForm from "./Faculty/Faculty_view_a_course_proposal_form";
import FacultyViewAllBatches from "./Faculty/Faculty_view_all_batches";
import FacultyViewAllWorkingCurriculums from "./Faculty/Faculty_view_all_working_curriculums";
import FacultyAddCourseProposalForm from "./Faculty/Faculty_add_course_proposal_form";
import FacultyCourseForwardForm from "./Faculty/Faculty_course_forward_form";
import FacultyCourseProposalFinalForm from "./Faculty/Faculty_Course_Proposal_Final_Form";
import ViewAllCourses from "./View_all_courses";
import ViewAllBatches from "./View_all_batches";
import ViewACourse from "./View_a_course";
import ViewAllWorkingCurriculums from "./View_all_working_curriculums";
import ViewAllProgrammes from "./View_all_programmes";
import ProgrammeCurriculumView from "./Acad_admin/ProgrammeCurriculumView";
import ProgrammeCurriculumStudView from "./Student/ProgrammeCurriculumStudView";
import DisciplineAcad from "./Acad_admin/DisciplineAcad";
import DisciplineStud from "./Student/DisciplineStud";
import FacultyCourseProposal from "./Faculty/Faculty_course_proposal";
import VCourseProposalForm from "./Faculty/VCourseProposalForm";
import CourseSlotDetails from "./CourseSlotDetails";
import ThesisSlotDetails from "./ThesisSlotDetails";
import SeminarSlotDetails from "./SeminarSlotDetails";
import TeachingCreditSlotDetails from "./TeachingCreditSlotDetails";
import SemesterInfo from "./SemesterInfo";
import AdminViewAllProgrammes from "./Acad_admin/Admin_view_all_programmes";
import AdminViewAllWorkingCurriculum from "./Acad_admin/Admin_view_all_working_curriculums";
import AdminViewAllCourseInstructors from "./Acad_admin/Admin_view_all_course_instructors";
import AdminUpcomingBatch from "./Acad_admin/Admin_Upcoming_Batches";
import AdminViewAllTheses from "./Acad_admin/Admin_view_all_theses";
import ViewInwardFile from "./Faculty/ViewInwardFile";
import ViewSemesterOfACurriculum from "./ViewSemesterOfACurriculum";
import InwardFile from "./Faculty/InwardFiles";
import OutwardFile from "./Faculty/OutwardFiles";
import ProgrammeCurriculumFacultyView from "./Faculty/ProgrammeCurriculumFacultyView";
import Discipline from "./Faculty/Discipline";
import StudCourseSlotDetails from "./Student/StudCourseSlotDetails";
import StudSemesterInfo from "./Student/StudSemesterinfo";
import FacultyEditCourseProposalForm from "./Faculty/Faculty_edit_course_proposal_form";

// forms
import AdminAddBatchForm from "./Acad_admin/Admin_add_batch_form";
import AdminAddCourseProposalForm from "./Acad_admin/Admin_add_course_proposal_form";
import AdminAddCourseSlotForm from "./Acad_admin/Admin_add_course_slot_form";
import AdminAddThesisSlotForm from "./Acad_admin/Admin_add_thesis_slot_form";
import AdminAddSeminarSlotForm from "./Acad_admin/Admin_add_seminar_slot_form";
import AdminAddTeachingCreditSlotForm from "./Acad_admin/Admin_add_teaching_credit_slot_form";
import AdminAddCurriculumForm from "./Acad_admin/Admin_add_curriculum_form";
import AdminAddCourseInstructor from "./Acad_admin/Admin_add_course_instructor_form";
import AdminAddThesisForm from "./Acad_admin/Admin_add_thesis_form";
import AdminAddSeminarForm from "./Acad_admin/Admin_add_seminar_form";
import AdminAddTeachingCreditForm from "./Acad_admin/Admin_add_teaching_credit_form";
import AdminAddDisciplineForm from "./Acad_admin/Admin_add_discipline_form";
import AdminAddProgrammeForm from "./Acad_admin/Admin_add_programme_form";
import InstigateForm from "./Acad_admin/Instigate_form";
import AdminEditProgrammeForm from "./Acad_admin/Admin_edit_programme_form";
import AdminEditCurriculumForm from "./Acad_admin/Admin_edit_curriculum_form";
import AdminReplicateCurriculumform from "./Acad_admin/Acad_admin_replicate_curriculum";
import AdminEditCourseSlotForm from "./Acad_admin/Admin_edit_course_slot_form";
import AdminEditThesisSlotForm from "./Acad_admin/Admin_edit_thesis_slot_form";
import AdminEditSeminarSlotForm from "./Acad_admin/Admin_edit_seminar_slot_form";
import AdminEditTeachingCreditSlotForm from "./Acad_admin/Admin_edit_teaching_credit_slot_form";
import AdminEditDisciplineForm from "./Acad_admin/Admin_edit_discipline_form";
import AdminEditCourseForm from "./Acad_admin/Admin_edit_course_form";
import AdminEditThesisForm from "./Acad_admin/Admin_edit_thesis_form";
import AdminEditSeminarForm from "./Acad_admin/Admin_edit_seminar_form";
import AdminEditTeachingCreditForm from "./Acad_admin/Admin_edit_teaching_credit_form";
import AdminEditBatchForm from "./Acad_admin/Admin_edit_batch_form";
import AdminEditCourseInstructor from "./Acad_admin/Admin_edit_course_instructor_form";
import "./programCurriculum.shared.css";

// breadcrumb

// Define role groups outside component
const ADMIN_ROLES = ["acadadmin", "studentacadadmin"];
const FACULTY_ROLES = [
  "Professor",
  "Assistant Professor",
  "Associate Professor",
  "Dean Academic",
  "HOD (CSE)",
  "HOD (ECE)",
  "HOD (ME)",
  "HOD (NS)",
  "HOD (Design)",
  "HOD (Liberal Arts)",
];
const STUDENT_ROLES = ["student", "Guest-User"];

// Protected route component moved outside
function ProtectedRoute({ allowedRoles, children }) {
  const role = useSelector((state) => state.user.role);
  const [isLoading, setIsLoading] = useState(role === "Guest-User");
  const [hasAccess, setHasAccess] = useState(allowedRoles.includes(role));

  useEffect(() => {
    let timer;
    if (role === "Guest-User") {
      timer = setTimeout(() => {
        setHasAccess(allowedRoles.includes(role));
        setIsLoading(false);
      }, 2000);
    } else {
      setHasAccess(allowedRoles.includes(role));
      setIsLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [role, allowedRoles]);

  if (isLoading) return <div>Loading...</div>;
  return hasAccess ? children : <Navigate to="/dashboard" />;
}

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};

function NavTab() {
  const role = useSelector((state) => state.user.role);
  const { pathname } = useLocation();
  const pages = pagesForRole(CURRICULUM_PAGES, role);
  const options = { base: CURRICULUM_BASE, pages };
  const current = sidebarPageFor(pathname, options);

  if (current) return <PageHeader title={current.title} />;

  return (
    <RouteTrail
      items={trailFor(pathname, { ...options, trails: CURRICULUM_TRAILS })}
    />
  );
}

export default function ProgrammeCurriculumRoutes() {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route
        path="/admin_courses"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminViewAllCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_course/:id"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminViewACourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_batches"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminViewAllBatches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view_curriculum"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminViewSemestersOfACurriculum />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_view"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <ProgrammeCurriculumView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_discipline_view"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <DisciplineAcad />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_view_all_programme"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminViewAllProgrammes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_view_all_working_curriculums"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminViewAllWorkingCurriculum />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_course_instructor"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminViewAllCourseInstructors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_upcoming_batches"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminUpcomingBatch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_theses"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminViewAllTheses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_add_thesis"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddThesisForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin_add_seminar"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddSeminarForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin_add_teaching_credit"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddTeachingCreditForm />
          </ProtectedRoute>
        }
      />

      {/* Faculty Routes */}
      <Route
        path="/faculty_courses"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <FacultyViewAllCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty_course_view/:id"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <FacultyViewACourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view_a_course_proposal_form"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <FacultyViewACourseProposalForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty_batches"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <FacultyViewAllBatches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty_view_course_proposal"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <FacultyCourseProposal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/filetracking"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <VCourseProposalForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new_course_proposal_form"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <FacultyAddCourseProposalForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forward_course_forms"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <FacultyCourseForwardForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty_view_all_working_curriculums"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <FacultyViewAllWorkingCurriculums />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view_inward_file"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <ViewInwardFile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty_inward_files"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <InwardFile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty_outward_files"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <OutwardFile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty_view"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <ProgrammeCurriculumFacultyView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty_discipline"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <Discipline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty_view_all_programmes"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <ViewAllProgrammes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course_slot_details"
        element={
          <ProtectedRoute allowedRoles={[...FACULTY_ROLES, ...ADMIN_ROLES]}>
            <NavTab />
            <CourseSlotDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/semester_info"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <SemesterInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty_course_instructor"
        element={
          <ProtectedRoute allowedRoles={[...FACULTY_ROLES, ...ADMIN_ROLES]}>
            <NavTab />
            <AdminViewAllCourseInstructors />
          </ProtectedRoute>
        }
      />

      {/* Student Routes (also accessible to faculty) */}
      <Route
        path="/student_courses"
        element={
          <ProtectedRoute allowedRoles={[...STUDENT_ROLES, ...FACULTY_ROLES]}>
            <NavTab />
            <ViewAllCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student_course/:id"
        element={
          <ProtectedRoute allowedRoles={[...STUDENT_ROLES, ...FACULTY_ROLES]}>
            <NavTab />
            <ViewACourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student_batches"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <ViewAllBatches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view_all_programmes"
        element={
          <ProtectedRoute allowedRoles={[...STUDENT_ROLES, ...FACULTY_ROLES]}>
            <NavTab />
            <ViewAllProgrammes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view_all_working_curriculums"
        element={
          <ProtectedRoute allowedRoles={[...STUDENT_ROLES, ...FACULTY_ROLES]}>
            <NavTab />
            <ViewAllWorkingCurriculums />
          </ProtectedRoute>
        }
      />
      <Route
        path="/curriculums/:id"
        element={
          <ProtectedRoute allowedRoles={[...STUDENT_ROLES, ...FACULTY_ROLES]}>
            <NavTab />
            <ProgrammeCurriculumStudView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stud_discipline_view"
        element={
          <ProtectedRoute allowedRoles={[...STUDENT_ROLES, ...FACULTY_ROLES]}>
            <NavTab />
            <DisciplineStud />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stud_semester_info/:id"
        element={
          <ProtectedRoute allowedRoles={[...STUDENT_ROLES, ...FACULTY_ROLES]}>
            <NavTab />
            <StudSemesterInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stud_course_slot_details/:id"
        element={
          <ProtectedRoute allowedRoles={[...STUDENT_ROLES, ...FACULTY_ROLES]}>
            <NavTab />
            <StudCourseSlotDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stud_curriculum_view/:id"
        element={
          <ProtectedRoute allowedRoles={[...STUDENT_ROLES, ...FACULTY_ROLES]}>
            <NavTab />
            <ViewSemesterOfACurriculum />
          </ProtectedRoute>
        }
      />

      {/* Admin Forms */}
      <Route
        path="/acad_admin_add_batch_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddBatchForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_add_course_proposal_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddCourseProposalForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_add_courseslot_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddCourseSlotForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/thesis_slot_details"
        element={
          <ProtectedRoute allowedRoles={[...FACULTY_ROLES, ...ADMIN_ROLES]}>
            <NavTab />
            <ThesisSlotDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seminar_slot_details"
        element={
          <ProtectedRoute allowedRoles={[...FACULTY_ROLES, ...ADMIN_ROLES]}>
            <NavTab />
            <SeminarSlotDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teaching_credit_slot_details"
        element={
          <ProtectedRoute allowedRoles={[...FACULTY_ROLES, ...ADMIN_ROLES]}>
            <NavTab />
            <TeachingCreditSlotDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_add_thesis_slot_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddThesisSlotForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_add_seminar_slot_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddSeminarSlotForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_add_teaching_credit_slot_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddTeachingCreditSlotForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_add_curriculum_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddCurriculumForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_add_discipline_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddDisciplineForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_add_programme_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddProgrammeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_instigate_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <InstigateForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_programme_form/:id"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditProgrammeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_curriculum_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditCurriculumForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_replicate_curriculum_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminReplicateCurriculumform />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_course_slot_form/:courseslotid"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditCourseSlotForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_thesis_slot_form/:thesisslotid"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditThesisSlotForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_seminar_slot_form/:seminarslotid"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditSeminarSlotForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_teaching_credit_slot_form/:tcslotid"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditTeachingCreditSlotForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_discipline_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddDisciplineForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_edit_discipline_form/:id"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditDisciplineForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_batch_form"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditBatchForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_edit_course_form/:id"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditCourseForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_thesis_form/:id"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditThesisForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_seminar_form/:id"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditSeminarForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_teaching_credit_form/:id"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditTeachingCreditForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acad_admin_add_course_instructor"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminAddCourseInstructor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_edit_course_instructor/:id"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <NavTab />
            <AdminEditCourseInstructor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forward_course_forms_II"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <FacultyCourseProposalFinalForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit_course_proposal_form/:id"
        element={
          <ProtectedRoute allowedRoles={FACULTY_ROLES}>
            <NavTab />
            <FacultyEditCourseProposalForm />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

/**
 * Gymkhana Module - Frontend Entry Point
 */

// ==================== Pages ====================
export { default as GymkhanaPage } from "./pages/GymkhanaPage";

// ==================== Components ====================

// Layout Components
export { default as ClubViewComponent } from "./components/layouts/ClubViewComponent";

// Form Components
export { default as EventForm } from "./components/forms/EventForm";
export { default as BudgetForm } from "./components/forms/BudgetForm";
export { default as FestForm } from "./components/forms/FestForm";
export { default as RegistrationForm } from "./components/forms/RegistrationForm";
export { default as NewsLetterForm } from "./components/forms/NewsLetterForm";
export { default as EventReportForm } from "./components/forms/EventReportForm";
export { default as GalleryForm } from "./components/forms/GalleryForm";
export { default as CounsellorReview } from "./components/forms/CounsellorReview";
export { default as YearlyplanButton } from "./components/forms/YearlyplanButton";

// Table Components
export { default as DataTable } from "./components/tables/DataTable";
export { default as CoordinatorMembersTable } from "./components/tables/CoordinatorMembersTable";
export { default as EventReportTable } from "./components/tables/EventReportTable";
export { default as YearlyplanTable } from "./components/tables/YearlyplanTable";
export { default as GalleryView } from "./components/tables/GalleryView";

// Modal Components
export { default as ConfirmModal } from "./components/modals/ConfirmModal";
export { default as ViewModal } from "./components/modals/ViewModal";
export { default as CommentModal } from "./components/modals/CommentModal";

// Common Components
export { default as AlertMessage } from "./components/common/AlertMessage";
export { default as ClubFilter } from "./components/common/ClubFilter";
export { default as DateSelector } from "./components/common/DateSelector";
export { default as EventCard } from "./components/common/EventCard";
export { default as DownloadNewsletter } from "./components/common/DownloadNewsletter";
export { default as Editor } from "./components/common/Editor";

// ==================== Services ====================
export * as apiClient from "./services/apiClient";
export * as eventService from "./services/eventService";
export * as budgetService from "./services/budgetService";
export * as clubService from "./services/clubService";
export * as memberService from "./services/memberService";
export * as fileTrackingService from "./services/fileTrackingService";
export * as yearlyPlanService from "./services/yearlyPlanService";

export { default as apiClientDefault } from "./services/apiClient";

// ==================== Hooks ====================
export {
  useUpcomingEvents,
  usePastEvents,
  useEventComments,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useApproveFICEvent,
  useApproveCounsellorEvent,
  useApproveDeanEvent,
  useRejectEvent,
  useAddEventComment,
  useCoordinatorEvents,
} from "./hooks/useEvents";

export {
  useUpcomingBudgets,
  useBudgetComments,
  useCreateBudget,
  useUpdateBudget,
  useApproveFICBudget,
  useApproveCounsellorBudget,
  useApproveDeanBudget,
  useReviewDeanBudget,
  useRejectBudget,
  useAddBudgetComment,
} from "./hooks/useBudget";

export {
  useClubData,
  useClubMembers,
  useClubAchievements,
  useClubPositionData,
  useCurrentLoginRoleRelatedClub,
  useAllClubPositions,
  useFests,
  useCreateFest,
} from "./hooks/useClubs";

export {
  useYearlyPlans,
  useClubwiseYearlyPlans,
  useUploadYearlyPlan,
  useApproveFICYearlyPlan,
  useApproveCounsellorYearlyPlan,
  useApproveDeanYearlyPlan,
  useRejectYearlyPlan,
} from "./hooks/useYearlyPlan";

// ==================== Utilities ====================
export * as constants from "./utils/constants";
export * as dateFormatter from "./utils/dateFormatter";
export * as validators from "./utils/validators";
export * as formatters from "./utils/formatters";

// ==================== Styles ====================
export { default as styles } from "./styles/gymkhana.module.css";

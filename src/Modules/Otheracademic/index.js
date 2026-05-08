/**
 * Otheracademic Module Index
 * Central export file for all module components and services.
 */

// API Services
export { leaveService, bonafideService, assistantshipService, ENDPOINTS } from './api';

// Utils
export * from './utils/helpers';

// Reusable Components
export { default as ApprovalTable } from './components/tables/ApprovalTable';
export { default as StatusTable } from './components/tables/StatusTable';

// Leave Components
export { default as LeaveCombined } from './Leave/LeaveCombined';
export { default as LeaveStatus } from './Leave/LeaveStatus';
export { default as ApproveLeave } from './Leave/ApproveLeave';

// Bonafide Components
export { default as BonafideCombined } from './Bonafide/BonafideCombined';
export { default as BonafideFormStatus } from './Bonafide/BonafideFormStatus';

// Main Page
export { default as OtherAcademicProcedures } from './OtherAcademicProcedures';

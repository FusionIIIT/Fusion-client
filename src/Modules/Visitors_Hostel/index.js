/**
 * Visitor Hostel Module Entry Point
 * Exports all public components and utilities
 */

// Pages
export { default as PendingBookingsPage } from './pages/PendingBookingsPage';
export { default as ActiveBookingsPage } from './pages/ActiveBookingsPage';
export { default as InventoryManagementPage } from './pages/InventoryManagementPage';
export { default as CancelledBookingsPage } from './pages/CancelledBookingsPage';
export { default as CompletedBookingsPage } from './pages/CompletedBookingsPage';
export { default as FinancialReportsPage } from './pages/FinancialReportsPage';
export { default as GuidelinesPage } from './pages/GuidelinesPage';

// Form Components
export { default as BookingRequestForm } from './components/forms/BookingRequestForm';
export { default as ConfirmBookingForm } from './components/forms/ConfirmBookingForm';
export { default as ForwardBookingForm } from './components/forms/ForwardBookingForm';
export { default as CheckoutForm } from './components/forms/CheckoutForm';
export { default as InventoryForm } from './components/forms/InventoryForm';
export { default as AddInventoryItemsForm } from './components/forms/AddInventoryItemsForm';
export { default as UpdateBookingForm } from './components/forms/UpdateBookingForm';

// Table Components
export { default as PendingRequestsTable } from './components/tables/PendingRequestsTable';
export { default as ActiveBookingsTable } from './components/tables/ActiveBookingsTable';
export { default as CancelledRequestsTable } from './components/tables/CancelledRequestsTable';
export { default as CompletedBookingsTable } from './components/tables/CompletedBookingsTable';
export { default as InventoryTable } from './components/tables/InventoryTable';

// Common Components
export { default as ViewBookingModal } from './components/common/ViewBookingModal';
export { default as ViewActiveBookingModal } from './components/common/ViewActiveBookingModal';

// Container Components
export { default as RoomAvailabilityContainer } from './components/RoomAvailabilityContainer';
export { default as RoomAvailabilityDetails } from './components/RoomAvailabilityDetails';

// Services
export {
  bookingsAPI,
  roomsAPI,
  inventoryAPI,
  mealsAPI,
  reportsAPI,
  healthCheck,
} from './services/visitorHostelApi';

// Utils
export * from './utils/validators';
export * from './utils/dateHelpers';
export { default as constants } from './utils/constants';

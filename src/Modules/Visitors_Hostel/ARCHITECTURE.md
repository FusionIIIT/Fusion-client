# Visitor Hostel Module - Frontend Architecture

## Folder Structure

```
Visitors_Hostel/
├── pages/
│   ├── PendingBookingsPage.jsx
│   ├── ActiveBookingsPage.jsx
│   ├── InventoryManagementPage.jsx
│   ├── CancelledBookingsPage.jsx
│   └── CompletedBookingsPage.jsx
│
├── components/
│   ├── forms/
│   │   ├── BookingRequestForm.jsx
│   │   ├── ConfirmBookingForm.jsx
│   │   ├── ForwardBookingForm.jsx
│   │   ├── CheckoutForm.jsx
│   │   └── InventoryForm.jsx
│   │
│   ├── tables/
│   │   ├── PendingRequestsTable.jsx
│   │   ├── ActiveBookingsTable.jsx
│   │   ├── CancelledRequestsTable.jsx
│   │   ├── CompletedBookingsTable.jsx
│   │   └── InventoryTable.jsx
│   │
│   └── common/
│       ├── ViewBookingModal.jsx
│       ├── ViewActiveBookingModal.jsx
│       ├── RoleBasedAccess.jsx
│       └── LoadingSpinner.jsx
│
├── services/
│   └── visitorHostelApi.js
│
├── utils/
│   ├── validators.js
│   ├── dateHelpers.js
│   └── constants.js
│
├── styles/
│   └── visitorHostel.module.css
│
└── index.js
```

## Component Responsibilities

### pages/
- **Route-level components** representing screens
- Assemble page-level components
- Don't contain heavy UI logic
- Handle page state and data fetching

### components/forms/
- **Form components** for user input
- Handle form validation
- Submit data to API via services
- Show success/error messages

### components/tables/
- **Table components** for data display
- Handle sorting, filtering, search
- Support pagination
- Include action buttons

### components/common/
- **Shared UI components** used across module
- Modal wrappers
- Reusable UI elements
- Role-based access control

### services/
- **Centralized API communication**
- RESTful endpoint definitions
- Request/response handling
- Token management via interceptors

### utils/
- **Helper functions** used across components
- Date formatting and validation
- Form validation utilities
- Constants and enumerations

### styles/
- **CSS modules** for component styling
- Responsive design utilities
- Print styles

## Migration Status

### ✅ Completed
- `pages/` - All page components created
- `components/tables/` - All table components created
- `components/forms/` - Form component references created
- `components/common/` - Modal component references created
- `services/visitorHostelApi.js` - Service layer completed
- `utils/` - Validators, helpers, and constants created
- `styles/` - CSS modules created

### 🔄 In Progress
- Moving form implementations from root to `components/forms/`
- Moving modal implementations from root to `components/common/`

### ⏳ TODO
- Create `RoleBasedAccess.jsx` component
- Create `LoadingSpinner.jsx` component
- Create page for Account Statements
- Full integration testing

## API Endpoints Mapping

| Feature | Endpoint | Status |
|---------|----------|--------|
| Pending Bookings | GET /api/bookings/pending/ | ✅ |
| Active Bookings | GET /api/bookings/active/ | ✅ |
| Confirm Booking | POST /api/bookings/confirm/ | ✅ |
| Reject Booking | POST /api/bookings/reject/ | ✅ |
| Forward Booking | POST /api/bookings/forward/ | ✅ |
| Cancel Booking | POST /api/bookings/cancel/ | ✅ |
| Checkout | POST /api/bookings/checkout/ | ✅ |
| Room Availability | GET /api/rooms/availability/ | ✅ |
| Add Inventory | POST /api/inventory/add/ | ✅ |
| Get Inventory | GET /api/inventory/ | ⏳ NEEDED |
| Cancelled Bookings | GET /api/bookings/cancelled/ | ⏳ NEEDED |
| Completed Bookings | GET /api/bookings/completed/ | ⏳ NEEDED |
| Get Booking Details | GET /api/bookings/{id}/ | ⏳ NEEDED |

## Usage Examples

### Using Pages
```javascript
// In routes or navigation
import PendingBookingsPage from './pages/PendingBookingsPage';

<Route path="/vh/bookings/pending" component={PendingBookingsPage} />
```

### Using Components
```javascript
// In page components
import PendingRequestsTable from '../components/tables/PendingRequestsTable';
import BookingRequestForm from '../components/forms/BookingRequestForm';

<PendingRequestsTable />
<BookingRequestForm modalOpened={true} onClose={() => {}} />
```

### Using Services
```javascript
// In components
import { bookingsAPI } from '../../services/visitorHostelApi';

const pendingBookings = await bookingsAPI.getPendingBookings();
const result = await bookingsAPI.confirmBooking(bookingId, category, rooms);
```

### Using Utils
```javascript
import { validateEmail, formatDate, getDaysBetween } from '../../utils/';
import { USER_ROLES, BOOKING_STATUS } from '../../utils/constants';

if (validateEmail(email)) {
  const formatted = formatDate(date);
  const days = getDaysBetween(startDate, endDate);
}
```

## Next Steps

1. **Move existing implementations**
   - Move `bookingForm.jsx` → `components/forms/BookingRequestForm.jsx`
   - Move `confirmBooking_Incharge.jsx` → `components/forms/ConfirmBookingForm.jsx`
   - (and other forms)

2. **Create shared components**
   - `components/common/RoleBasedAccess.jsx`
   - `components/common/LoadingSpinner.jsx`

3. **Backend coordination**
   - Create missing endpoints:
     - GET /api/inventory/
     - GET /api/bookings/cancelled/
     - GET /api/bookings/completed/
     - GET /api/bookings/{id}/

4. **Integration testing**
   - End-to-end workflow for all 3 roles
   - Browser console validation
   - API contract validation

5. **Performance optimization**
   - Add pagination to tables
   - Implement lazy loading
   - Optimize re-renders

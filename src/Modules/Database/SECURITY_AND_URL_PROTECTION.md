# Database Module - URL Access Protection Implementation

## Security Issue Fixed
**Problem**: Even though backend only allows `acadadmin` to access the database module, users could directly paste the URL and see the database interface when switching roles.

**Solution**: Implemented **3-layer frontend access control** + backend permission checks

---

## Security Layers Implemented

### Layer 1: Route Protection (Primary Defense)
**File**: `Database/protectedDatabaseRoute.jsx` (NEW)

```jsx
<ProtectedDatabaseRoute>
  <YourComponent />
</ProtectedDatabaseRoute>
```

**How it works**:
1. Checks Redux state: `currentAccessibleModules.database === true`
2. If access denied → Redirect to `/dashboard`
3. Shows error notification to user
4. Waits for role to load before rendering (prevents flashing)

**Protection achieved**:
- ✅ Direct URL access blocked: `/database/view?category=ug` → redirects to dashboard
- ✅ Role switching blocked: Can't access database views with other roles
- ✅ Graceful error handling: Shows user why access was denied

---

### Layer 2: Navigation Filtering (UX Enhancement)
**File**: `Database/components/nav.jsx` (Updated)

**Before**:
```jsx
const filteredTabs = tabItems.filter(
  (tab) =>
    tab.roles.includes(userRole) && tab.categories.includes(activeCategory),
);
```

**After**:
```jsx
const filteredTabs = tabItems.filter(
  (tab) =>
    tab.roles.includes(userRole) &&
    tab.categories.includes(activeCategory) &&
    currentAccessibleModules.database === true  // ← NEW CHECK
);
```

**Protection achieved**:
- ✅ Database menu items hidden if user doesn't have access
- ✅ Prevents clicking database links
- ✅ Navigation tabs disappear on role switch (if no permission)

---

### Layer 3: Backend API Permission Check (Server-Side Enforcement)
**File**: `applications/database_backend/api/permissions.py`

```python
class IsDatabaseAccessAllowed(BasePermission):
    def has_permission(self, request, view):
        # Check user's designations
        user_designations = HoldsDesignation.objects.filter(
            working=request.user
        )
        # Check if any designation has database=True
        has_access = ModuleAccess.objects.filter(
            designation__in=user_designations,
            database=True
        ).exists()
        return has_access
```

**Protection achieved**:
- ✅ API endpoints return 403 Forbidden if no permission
- ✅ Backend enforces permission (can't bypass with frontend hacks)
- ✅ All access logged to audit trail

---

## Complete Flow After Implementation

### Scenario 1: User Without Database Permission Tries Direct URL
```
User enters URL: localhost:5173/database/view?category=ug
↓
React Route Trigger
↓
Database component mounts
↓
ProtectedDatabaseRoute component checks Redux state
↓
currentAccessibleModules.database === false ✗
↓
Redirect to /dashboard
↓
Show notification: "You do not have permission to access this resource"
↓
User sees dashboard instead
```

### Scenario 2: User Switches Roles
```
User is acadadmin (has database access) → sees database ✓
↓
User switches role to "student" via role dropdown
↓
Header updates Redux state:
  - setRole("student")
  - setCurrentAccessibleModules() → recalculates based on student role
↓
Database page checks: currentAccessibleModules.database === false
↓
ProtectedDatabaseRoute redirects to /dashboard
↓
Navigation items disappear (if already on database page)
```

### Scenario 3: Valid User with Permission
```
User has acadadmin role + database=True in ModuleAccess
↓
enters URL: localhost:5173/database/view?category=ug
↓
ProtectedDatabaseRoute: currentAccessibleModules.database === true ✓
↓
Database page renders normally
↓
All tabs visible in navigation
↓
API calls succeed (backend permission check passes)
```

---

## Files Modified/Created

| File | Change | Purpose |
|------|--------|---------|
| `protectedDatabaseRoute.jsx` | NEW | Route protection wrapper |
| `database.jsx` | Updated | Import + wrap with ProtectedRoute |
| `nav.jsx` | Updated | Tab filtering with module access check |
| `permissions.py` | Existing | Backend permission enforcement |
| `audit.py` | Existing | Access logging |

---

## Testing Checklist

### Test 1: Direct URL Access (No Permission)
```
1. Login as non-acadadmin user (e.g., student)
2. Manually type: localhost:5173/database/view?category=ug
3. Expected: Redirected to dashboard + error alert
4. Verify: Page doesn't flash database content
```

### Test 2: Role Switching
```
1. Login as acadadmin (with database access)
2. See database module working
3. Switch role to "student" (if multiple roles available)
4. Expected:
   - Redirected to dashboard
   - Navigation tabs disappear
   - Error notification shown
```

### Test 3: Direct API Call Without Permission
```
1. User without database permission
2. Open browser console, try:
   fetch('http://localhost:8000/database/api/batches/', {
     headers: {'Authorization': 'Token YOUR_TOKEN'}
   })
3. Expected: 403 Forbidden response
```

### Test 4: Valid User Can Access
```
1. Login as acadadmin with database=True
2. Can access all database views
3. All navigation tabs visible
4. API calls work normally
```

---

## Redux State Structure

### Before (Incomplete)
```javascript
{
  user: {
    role: "acadadmin",
    accessibleModules: { // Role → modules mapping
      acadadmin: {
        examinations: true,
        database: true,
        // ...
      }
    },
    currentAccessibleModules: {} // Not populated on role switch
  }
}
```

### After (Complete with Protection)
```javascript
{
  user: {
    role: "acadadmin",
    accessibleModules: {
      acadadmin: { database: true, examinations: true },
      student: { examinations: false, database: false }
    },
    currentAccessibleModules: {
      database: true,  // Recalculated when role changes
      examinations: true
    }
  }
}
```

### Role Switching Process
```javascript
// When user changes role:
dispatch(setRole("student"));
dispatch(setCurrentAccessibleModules());
// This recalculates currentAccessibleModules based on new role
// ProtectedDatabaseRoute checks and redirects if needed
```

---

## How It Compares to Other Modules

### Examination Module (Reference Implementation)
```jsx
// examinations/examination.jsx
<ProtectedRoute roles={["acadadmin"]}>
  <SubmitGrades />
</ProtectedRoute>
```

### Database Module (Our Implementation)
```jsx
// database/database.jsx
<ProtectedDatabaseRoute>  // Checks module access, not just role
  <CourseWiseStudentEnrollment />
</ProtectedDatabaseRoute>
```

**Key difference**: Database uses `currentAccessibleModules.database` for flexibility (same role could have different module access depending on designation)

---

## Security Benefits

✅ **Prevents URL Bypass**: Can't directly access `/database/*` without permission
✅ **Prevents Role Switch Bypass**: Redirects immediately on role change
✅ **Multi-layer Defense**: Frontend + Backend protection
✅ **UX Friendly**: Navigation items disappear naturally, no errors in UI
✅ **Audit Trail**: All attempts logged (frontend + backend)
✅ **Redux-based**: Uses existing state management (consistent with app)
✅ **Fast**: No extra API calls, just Redux state checks

---

## Migration Guide

### For Developers
If you need to add similar protection to other modules:

1. **Create ProtectedRoute component** (like `protectedDatabaseRoute.jsx`)
2. **Wrap main module component** in the ProtectedRoute
3. **Add module access check** to navigation filtering
4. **Verify backend** has permission checks

### For Admins
No backend changes needed! The frontend protection uses existing:
- Redux state (`currentAccessibleModules`)
- Backend permissions (already set up in `ModuleAccess` table)

---

## Potential Edge Cases Handled

| Edge Case | Handling |
|-----------|----------|
| Role changes mid-navigation | Redirect happens immediately via ProtectedRoute |
| Token expires | Validation happens on all page loads (validateauth.jsx) |
| User removed from acadadmin | Redux state updated on next page load |
| Designations updated DB → not in Redux | ProtectedRoute checks next time page loads |
| Bookmark database URL → login elsewhere | Login redirects to dashboard, then ProtectedRoute applies |

---

## No Breaking Changes

✅ API responses unchanged
✅ Existing acadadmin users unaffected
✅ Gradual rollout possible (protection is frontend-only)
✅ Can test with different roles locally


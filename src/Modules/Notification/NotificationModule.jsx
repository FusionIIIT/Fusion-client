/**
 * NotificationModule — Single-page notification centre.
 * All features in one place with a clean, website-quality UI.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Alert, Badge, Button, Card, Code, Divider, Group, Loader,
  NumberInput, Paper, SegmentedControl, Select, Stack, Switch,
  Table, Text, Textarea, TextInput, Title, Tabs, ThemeIcon,
  SimpleGrid, RingProgress, Box, Accordion, Tooltip, ActionIcon,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications as toast } from "@mantine/notifications";
import {
  Bell, Sliders, PaperPlane, Megaphone, Tag,
  BellSlash, Check, Warning, Archive, Info, Lightning, ShieldCheck,
} from "@phosphor-icons/react";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import NotificationList from "./components/NotificationList";
import PreferenceToggle from "./components/PreferenceToggle";
import {
  fetchAllNotifications, fetchUnreadNotifications, fetchNotificationsByModule,
  fetchUnreadCount, markRead, markUnread, markAllRead, deleteOne, deleteAll,
  fetchPreferences, setPreference,
  sendGeneric, notifyLeave, notifyMess, notifyHostel, notifyHealthcare,
  notifyScholarship, notifyDeanPnD, notifyDeanStudents, notifyDeanRSPC,
  notifyGymkhanaVoting, notifyGymkhanaSession, notifyGymkhanaEvent,
  notifyResearch, notifyAssistantshipApproved, notifyAssistantshipFaculty,
  notifyAssistantshipAcad, notifyAssistantshipAccounts,
  notifyComplaint, notifyFileTracking, notifyPlacement, notifyAcademics, notifyDepartment,
  fetchEventTypes, registerEventType, triggerEventNotification,
  fetchActiveAnnouncements, broadcastAnnouncement, previewAudience,
} from "./api";

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_FILTER_OPTIONS = [
  { value: "all",                            label: "All Modules" },
  { value: "Leave Module",                   label: "Leave Module" },
  { value: "Central Mess",                   label: "Central Mess" },
  { value: "Visitor's Hostel",               label: "Visitor's Hostel" },
  { value: "Healthcare Center",              label: "Healthcare Center" },
  { value: "File Tracking",                  label: "File Tracking" },
  { value: "Scholarship Portal",             label: "Scholarship Portal" },
  { value: "Complaint System",               label: "Complaint System" },
  { value: "Placement Cell",                 label: "Placement Cell" },
  { value: "Academic's Module",              label: "Academic's Module" },
  { value: "Office of Dean PnD Module",      label: "Office of Dean PnD" },
  { value: "Office Module",                  label: "Office Module" },
  { value: "Gymkhana Module",                label: "Gymkhana Module" },
  { value: "Assistantship Request",          label: "Assistantship Request" },
  { value: "department",                     label: "Department" },
  { value: "Research Procedures",            label: "Research Procedures" },
];

const MODULE_OPTIONS = [
  { value: "Leave Module",              label: "Leave Module" },
  { value: "Placement Cell",            label: "Placement Cell" },
  { value: "Academic's Module",         label: "Academic's Module" },
  { value: "Central Mess",              label: "Central Mess" },
  { value: "Visitor's Hostel",          label: "Visitor's Hostel" },
  { value: "Healthcare Center",         label: "Healthcare Center" },
  { value: "File Tracking",             label: "File Tracking" },
  { value: "Scholarship Portal",        label: "Scholarship Portal" },
  { value: "Complaint System",          label: "Complaint System" },
  { value: "Office of Dean PnD Module", label: "Office of Dean PnD" },
  { value: "Office Module",             label: "Office Module" },
  { value: "Gymkhana Module",           label: "Gymkhana Module" },
  { value: "Assistantship Request",     label: "Assistantship Request" },
  { value: "department",                label: "Department" },
  { value: "Research Procedures",       label: "Research Procedures" },
];

const SEND_MODULE_TYPES = [
  { value: "leave",                   label: "Leave Module" },
  { value: "mess",                    label: "Central Mess" },
  { value: "hostel",                  label: "Visitor's Hostel" },
  { value: "healthcare",              label: "Healthcare Center" },
  { value: "scholarship",             label: "Scholarship Portal" },
  { value: "dean-pnd",                label: "Office of Dean PnD" },
  { value: "dean-students",           label: "Office of Dean Students" },
  { value: "dean-rspc",               label: "Office of Dean RSPC" },
  { value: "gymkhana-voting",         label: "Gymkhana — Voting" },
  { value: "gymkhana-session",        label: "Gymkhana — Session" },
  { value: "gymkhana-event",          label: "Gymkhana — Event" },
  { value: "research",                label: "Research Procedures" },
  { value: "assistantship-approved",  label: "Assistantship — Claim Approved" },
  { value: "assistantship-faculty",   label: "Assistantship — Notify Faculty" },
  { value: "assistantship-acad",      label: "Assistantship — Notify Acad Section" },
  { value: "assistantship-accounts",  label: "Assistantship — Notify Accounts" },
  { value: "complaint",               label: "Complaint System" },
  { value: "file-tracking",           label: "File Tracking" },
  { value: "placement",               label: "Placement Cell" },
  { value: "academics",               label: "Academic's Module" },
  { value: "department",              label: "Department" },
  { value: "generic",                 label: "Generic (any module)" },
];

const PRIORITY_OPTIONS = [
  { value: "low",      label: "Low" },
  { value: "medium",   label: "Medium" },
  { value: "high",     label: "High" },
  { value: "critical", label: "Critical — bypasses user preferences (BR-NT-05)" },
];

const AUDIENCE_OPTIONS = [
  { value: "all",      label: "All Users (everyone in DB)" },
  { value: "students", label: "All Students (user_type = student)" },
  { value: "staff",    label: "All Staff (user_type = staff)" },
  { value: "group",    label: "Specific Designation (BR-NT-07)" },
];

// Designation values from globals_designation in fusionlab DB (populated via seed)
const DESIGNATIONS = [
  "admin", "staff", "student",
  "director", "dean", "hod", "professor",
];

// ─── Use Cases ────────────────────────────────────────────────────────────────

const USE_CASES = [
  { module: "Leave Module", color: "blue", cases: [
    { actor: "Student / Faculty", trigger: "leave_applied",       description: "A leave application is submitted." },
    { actor: "Approver",          trigger: "request_accepted",    description: "The immediate approver accepts the request." },
    { actor: "Approver",          trigger: "request_declined",    description: "The immediate approver declines the request." },
    { actor: "Final Authority",   trigger: "leave_accepted",      description: "Leave is fully approved by the final authority." },
    { actor: "Approver",          trigger: "leave_forwarded",     description: "Application is forwarded to the next authority." },
    { actor: "Final Authority",   trigger: "leave_rejected",      description: "Leave application is rejected." },
    { actor: "Admin",             trigger: "offline_leave",       description: "An offline leave record is updated." },
    { actor: "Faculty",           trigger: "replacement_request", description: "A replacement request is sent to another faculty." },
    { actor: "Faculty",           trigger: "leave_request",       description: "A leave request is sent to a colleague." },
    { actor: "Student / Faculty", trigger: "leave_withdrawn",     description: "The applicant withdraws a submitted leave." },
    { actor: "Faculty",           trigger: "replacement_cancel",  description: "A replacement arrangement is cancelled." },
  ]},
  { module: "Central Mess", color: "orange", cases: [
    { actor: "Student",        trigger: "feedback_submitted",   description: "Student submits feedback about mess food or service." },
    { actor: "Mess Committee", trigger: "menu_change_accepted", description: "A proposed menu change is approved." },
    { actor: "Student",        trigger: "leave_request",        description: "Student requests a mess leave (rebate)." },
    { actor: "Student",        trigger: "vacation_request",     description: "Student requests mess closure during vacation." },
    { actor: "Committee Head", trigger: "meeting_invitation",   description: "A meeting invitation is sent to committee members." },
    { actor: "Student",        trigger: "special_request",      description: "A special dietary or event request is submitted." },
    { actor: "Admin",          trigger: "added_committee",      description: "A user is added to the mess committee." },
  ]},
  { module: "Visitor's Hostel", color: "teal", cases: [
    { actor: "Warden / Admin", trigger: "booking_confirmation",                  description: "A hostel booking is confirmed." },
    { actor: "Warden / Admin", trigger: "booking_cancellation_request_accepted", description: "A cancellation request is accepted." },
    { actor: "Visitor",        trigger: "booking_request",                       description: "A visitor submits a booking request." },
    { actor: "Visitor",        trigger: "cancellation_request_placed",           description: "A visitor requests cancellation." },
    { actor: "Admin",          trigger: "booking_forwarded",                     description: "A booking request is forwarded." },
    { actor: "Warden / Admin", trigger: "booking_rejected",                      description: "A booking request is rejected." },
  ]},
  { module: "Healthcare Center", color: "red", cases: [
    { actor: "Doctor / Staff", trigger: "appoint",     description: "An appointment is booked for the patient." },
    { actor: "Patient",        trigger: "amb_request", description: "An ambulance request is placed." },
    { actor: "Doctor",         trigger: "Presc",       description: "A prescription is issued to the patient." },
    { actor: "Doctor / Staff", trigger: "appoint_req", description: "A new appointment request is received." },
    { actor: "Doctor / Staff", trigger: "amb_req",     description: "A new ambulance request is received." },
  ]},
  { module: "Scholarship Portal", color: "violet", cases: [
    { actor: "SPACS Convenor", trigger: "Accept_MCM",    description: "MCM scholarship form is accepted." },
    { actor: "SPACS Convenor", trigger: "Reject_MCM",    description: "MCM scholarship form is rejected." },
    { actor: "SPACS Convenor", trigger: "Accept_Gold",   description: "Gold Medal application is accepted." },
    { actor: "SPACS Convenor", trigger: "Reject_Gold",   description: "Gold Medal application is rejected." },
    { actor: "SPACS Convenor", trigger: "Accept_Silver", description: "Silver Medal application is accepted." },
    { actor: "SPACS Convenor", trigger: "Reject_Silver", description: "Silver Medal application is rejected." },
    { actor: "SPACS Convenor", trigger: "Accept_DM",     description: "D&M Medal application is accepted." },
  ]},
  { module: "Office of Dean PnD", color: "cyan", cases: [
    { actor: "Faculty / Staff", trigger: "requisition_filed",   description: "A requisition is filed for approval." },
    { actor: "Dean PnD",        trigger: "request_accepted",    description: "A requisition is accepted." },
    { actor: "Dean PnD",        trigger: "request_rejected",    description: "A requisition is rejected." },
    { actor: "Admin",           trigger: "assignment_created",  description: "A new work assignment is created." },
    { actor: "Assignee",        trigger: "assignment_received", description: "An assignment is received." },
    { actor: "Admin",           trigger: "assignment_reverted", description: "An assignment is reverted." },
    { actor: "Dean PnD",        trigger: "assignment_approved", description: "An assignment is approved." },
    { actor: "Dean PnD",        trigger: "assignment_rejected", description: "An assignment is rejected." },
  ]},
  { module: "Office of Dean Students", color: "indigo", cases: [
    { actor: "Dean Students",    trigger: "hostel_alloted",     description: "A hostel room is allotted to a student." },
    { actor: "System",           trigger: "insufficient_funds", description: "Insufficient funds detected in a club account." },
    { actor: "Club / Committee", trigger: "MOM_submitted",      description: "Minutes of Meeting are submitted." },
    { actor: "Dean Students",    trigger: "budget_approved",    description: "A budget is approved." },
    { actor: "Dean Students",    trigger: "budget_rejected",    description: "A budget is rejected." },
    { actor: "Dean Students",    trigger: "club_approved",      description: "A student club is officially approved." },
    { actor: "Dean Students",    trigger: "club_rejected",      description: "A student club is rejected." },
    { actor: "Student / Club",   trigger: "meeting_booked",     description: "A meeting with Dean Students is scheduled." },
    { actor: "Dean Students",    trigger: "session_approved",   description: "A session or event is approved." },
    { actor: "Dean Students",    trigger: "session_rejected",   description: "A session or event is rejected." },
    { actor: "Dean Students",    trigger: "budget_alloted",     description: "A budget amount is formally allotted." },
  ]},
  { module: "Office of Dean RSPC", color: "grape", cases: [
    { actor: "Dean RSPC", trigger: "Approve",    description: "A research/sponsored project proposal is approved." },
    { actor: "Dean RSPC", trigger: "Disapprove", description: "A research/sponsored project proposal is disapproved." },
    { actor: "System",    trigger: "Pending",    description: "A proposal is marked pending for further review." },
  ]},
  { module: "Gymkhana", color: "lime", cases: [
    { actor: "Election Committee", trigger: "voting",  description: "A new election/voting event is announced." },
    { actor: "Club / Gymkhana",    trigger: "session", description: "A club session is scheduled." },
    { actor: "Club / Gymkhana",    trigger: "event",   description: "An upcoming event is announced." },
  ]},
  { module: "Research Procedures", color: "yellow", cases: [
    { actor: "Dean RSPC",         trigger: "Approved",    description: "A research procedure request is approved." },
    { actor: "Dean RSPC",         trigger: "Disapproved", description: "A research procedure request is disapproved." },
    { actor: "System",            trigger: "Pending",     description: "A request is pending review." },
    { actor: "Faculty / Student", trigger: "submitted",   description: "A research form or report is submitted." },
    { actor: "Admin",             trigger: "created",     description: "A new research project entry is created." },
  ]},
  { module: "Assistantship Request", color: "pink", cases: [
    { actor: "Accounts Section", trigger: "assistantship-approved",  description: "An assistantship claim is approved." },
    { actor: "System",           trigger: "assistantship-faculty",   description: "Faculty is notified about a pending claim." },
    { actor: "System",           trigger: "assistantship-acad",      description: "Academic section is notified." },
    { actor: "System",           trigger: "assistantship-accounts",  description: "Accounts section is notified." },
  ]},
  { module: "Complaint System", color: "red", cases: [
    { actor: "Complaint Handler", trigger: "complaint", description: "A complaint is updated or resolved." },
  ]},
  { module: "File Tracking", color: "gray", cases: [
    { actor: "File Sender", trigger: "file-tracking", description: "A tracked file is forwarded to a new recipient." },
  ]},
  { module: "Placement Cell", color: "dark", cases: [
    { actor: "Placement Officer", trigger: "placement", description: "A placement announcement is broadcast to students." },
  ]},
  { module: "Academic's Module", color: "blue", cases: [
    { actor: "Academic Admin", trigger: "academics", description: "An academic announcement or action update is sent." },
  ]},
  { module: "Department", color: "teal", cases: [
    { actor: "Department Admin", trigger: "department", description: "A department-level notification is sent." },
  ]},
];

// ─── Business Rules ───────────────────────────────────────────────────────────

const BUSINESS_RULES = [
  { id: "BR-NT-03", title: "Only Authorized Senders Can Broadcast", color: "red", icon: <ShieldCheck size={18} weight="bold" />,
    description: "Only users with is_staff or is_superuser can send broadcast announcements. Regular students and faculty are blocked with HTTP 403.",
    enforcement: "services.py → broadcast_announcement()",
    codeSnippet: "if not (sender.is_staff or sender.is_superuser):\n    raise UnauthorizedSender(...)",
    demo: "Login as a student → go to Announcements tab → try to broadcast → see 403 error toast.",
  },
  { id: "BR-NT-04", title: "60-Second Deduplication Per User + Event", color: "orange", icon: <Warning size={18} weight="bold" />,
    description: "Same Event ID + same recipient triggered within 60 seconds is suppressed with HTTP 429. Prevents notification spam.",
    enforcement: "services.py → trigger_notification_by_event_id() → _recent_triggers cache",
    codeSnippet: "if elapsed < 60:\n    raise DuplicateNotification(\n        f'Duplicate suppressed. Sent {elapsed}s ago (BR-NT-04: 60s cooldown).'\n    )",
    demo: "Register an event → trigger it → trigger again within 60s → see 429 with elapsed seconds shown.",
  },
  { id: "BR-NT-05", title: "Critical Priority Bypasses User Preferences", color: "grape", icon: <Lightning size={18} weight="bold" />,
    description: "Notifications with priority='critical' are always delivered, even if the user has opted out of that module. All other priorities respect preferences.",
    enforcement: "services.py → _send() helper",
    codeSnippet: "if priority != 'critical' and not selectors.is_module_enabled_for_user(recipient, module):\n    return  # User opted out — silently skip.",
    demo: "Turn off a module in Preferences → send with normal priority → not delivered. Send same with priority=critical → delivered.",
  },
  { id: "BR-NT-06", title: "Per-Module Notification Opt-Out", color: "blue", icon: <BellSlash size={18} weight="bold" />,
    description: "Each user can independently enable or disable notifications for any of the 15 Fusion modules. Disabled modules are silently skipped.",
    enforcement: "NotificationPreference model + services.py → _send()",
    codeSnippet: "NotificationPreference.objects.update_or_create(\n    user=user,\n    module=module,\n    defaults={'is_enabled': is_enabled},\n)",
    demo: "Go to Preferences tab → toggle off any module → send a notification for that module → does not appear in inbox.",
  },
  { id: "BR-NT-07", title: "RBAC — Designation-Based Broadcast Audience", color: "teal", icon: <Check size={18} weight="bold" />,
    description: "Broadcasts can target specific role groups using real designation data from fusionlab's globals_designation and globals_holdsdesignation tables.",
    enforcement: "services.py → _resolve_audience() → selectors.get_users_by_designation()",
    codeSnippet: "# audience_type='group', audience_value='Director'\nelif audience_type == AudienceType.GROUP:\n    return selectors.get_users_by_designation(audience_value)",
    demo: "Go to Announcements → select 'Specific Designation' → enter 'Director' → only the Director user receives it.",
    extra: {
      label: "Valid designation values (from globals_designation in fusionlab DB)",
      items: DESIGNATIONS,
    },
  },
  { id: "BR-NT-09", title: "Soft Delete — 180-Day Retention", color: "gray", icon: <Archive size={18} weight="bold" />,
    description: "Deleting a notification does NOT remove it from the database. An ArchivedNotification record is created instead. Retained for 180 days for audit.",
    enforcement: "services.py → delete_notification() / delete_all_notifications()",
    codeSnippet: "ArchivedNotification.objects.get_or_create(\n    user=user,\n    notification_id=notification_id\n)\n# Does NOT call notification.delete()",
    demo: "Delete a notification from inbox → disappears from UI. Query notifications_extension_archivednotification in DB → record still exists.",
  },
];

// ─── Send extra fields ────────────────────────────────────────────────────────

function ExtraFields({ moduleType, fields, setFields }) {
  const set  = (k) => (v) => setFields((f) => ({ ...f, [k]: v }));
  const setE = (k) => (e) => setFields((f) => ({ ...f, [k]: e.currentTarget.value }));
  const LEAVE    = [{ value:"leave_applied",label:"Leave Applied"},{ value:"request_accepted",label:"Request Accepted"},{ value:"request_declined",label:"Request Declined"},{ value:"leave_accepted",label:"Leave Accepted"},{ value:"leave_forwarded",label:"Leave Forwarded"},{ value:"leave_rejected",label:"Leave Rejected"},{ value:"offline_leave",label:"Offline Leave Updated"},{ value:"replacement_request",label:"Replacement Request"},{ value:"leave_request",label:"Leave Request"},{ value:"leave_withdrawn",label:"Leave Withdrawn"},{ value:"replacement_cancel",label:"Replacement Cancelled"}];
  const MESS     = [{ value:"feedback_submitted",label:"Feedback Submitted"},{ value:"menu_change_accepted",label:"Menu Change Accepted"},{ value:"leave_request",label:"Leave Request"},{ value:"vacation_request",label:"Vacation Request"},{ value:"meeting_invitation",label:"Meeting Invitation"},{ value:"special_request",label:"Special Request"},{ value:"added_committee",label:"Added to Committee"}];
  const HOSTEL   = [{ value:"booking_confirmation",label:"Booking Confirmed"},{ value:"booking_cancellation_request_accepted",label:"Cancellation Accepted"},{ value:"booking_request",label:"Booking Request"},{ value:"cancellation_request_placed",label:"Cancellation Placed"},{ value:"booking_forwarded",label:"Booking Forwarded"},{ value:"booking_rejected",label:"Booking Rejected"}];
  const HEALTH   = [{ value:"appoint",label:"Appointment Booked"},{ value:"amb_request",label:"Ambulance Request"},{ value:"Presc",label:"Prescription Issued"},{ value:"appoint_req",label:"New Appointment Request"},{ value:"amb_req",label:"New Ambulance Request"}];
  const SCHOLAR  = [{ value:"Accept_MCM",label:"MCM Accepted"},{ value:"Reject_MCM",label:"MCM Rejected"},{ value:"Accept_Gold",label:"Gold Medal Accepted"},{ value:"Reject_Gold",label:"Gold Medal Rejected"},{ value:"Accept_Silver",label:"Silver Medal Accepted"},{ value:"Reject_Silver",label:"Silver Medal Rejected"},{ value:"Accept_DM",label:"D&M Medal Accepted"}];
  const DPND     = [{ value:"requisition_filed",label:"Requisition Filed"},{ value:"request_accepted",label:"Request Accepted"},{ value:"request_rejected",label:"Request Rejected"},{ value:"assignment_created",label:"Assignment Created"},{ value:"assignment_received",label:"Assignment Received"},{ value:"assignment_reverted",label:"Assignment Reverted"},{ value:"assignment_approved",label:"Assignment Approved"},{ value:"assignment_rejected",label:"Assignment Rejected"}];
  const DS       = [{ value:"hostel_alloted",label:"Hostel Alloted"},{ value:"insufficient_funds",label:"Insufficient Funds"},{ value:"MOM_submitted",label:"MOM Submitted"},{ value:"budget_approved",label:"Budget Approved"},{ value:"budget_rejected",label:"Budget Rejected"},{ value:"club_approved",label:"Club Approved"},{ value:"club_rejected",label:"Club Rejected"},{ value:"meeting_booked",label:"Meeting Booked"},{ value:"session_approved",label:"Session Approved"},{ value:"session_rejected",label:"Session Rejected"},{ value:"budget_alloted",label:"Budget Alloted"}];
  const RSPC     = [{ value:"Approve",label:"Approved"},{ value:"Disapprove",label:"Disapproved"},{ value:"Pending",label:"Pending"}];
  const RESEARCH = [{ value:"Approved",label:"Approved"},{ value:"Disapproved",label:"Disapproved"},{ value:"Pending",label:"Pending"},{ value:"submitted",label:"Submitted"},{ value:"created",label:"Created"}];
  switch (moduleType) {
    case "leave":       return (<><Select label="Type" data={LEAVE} value={fields.type} onChange={set("type")} required /><TextInput label="Date (optional)" value={fields.date||""} onChange={setE("date")} /></>);
    case "mess":        return (<><Select label="Type" data={MESS} value={fields.type} onChange={set("type")} required /><TextInput label="Message (optional)" value={fields.message||""} onChange={setE("message")} /></>);
    case "hostel":      return <Select label="Type" data={HOSTEL} value={fields.type} onChange={set("type")} required />;
    case "healthcare":  return <Select label="Type" data={HEALTH} value={fields.type} onChange={set("type")} required />;
    case "scholarship": return <Select label="Type" data={SCHOLAR} value={fields.type} onChange={set("type")} required />;
    case "dean-pnd":    return <Select label="Type" data={DPND} value={fields.type} onChange={set("type")} required />;
    case "dean-students": return <Select label="Type" data={DS} value={fields.type} onChange={set("type")} required />;
    case "dean-rspc":   return <Select label="Type" data={RSPC} value={fields.type} onChange={set("type")} required />;
    case "gymkhana-voting": return (<><TextInput label="Election Title" value={fields.title||""} onChange={setE("title")} required /><TextInput label="Description" value={fields.desc||""} onChange={setE("desc")} required /></>);
    case "gymkhana-session": return (<><TextInput label="Club Name" value={fields.club||""} onChange={setE("club")} required /><TextInput label="Description" value={fields.desc||""} onChange={setE("desc")} required /><TextInput label="Venue" value={fields.venue||""} onChange={setE("venue")} required /></>);
    case "gymkhana-event": return (<><TextInput label="Club Name" value={fields.club||""} onChange={setE("club")} required /><TextInput label="Event Name" value={fields.event_name||""} onChange={setE("event_name")} required /><TextInput label="Description" value={fields.desc||""} onChange={setE("desc")} required /><TextInput label="Venue" value={fields.venue||""} onChange={setE("venue")} required /></>);
    case "research":    return <Select label="Type" data={RESEARCH} value={fields.type} onChange={set("type")} required />;
    case "assistantship-approved": return (<><TextInput label="Month" value={fields.month||""} onChange={setE("month")} required /><TextInput label="Year" value={fields.year||""} onChange={setE("year")} required /></>);
    case "assistantship-faculty": case "assistantship-acad": return <Text size="xs" c="dimmed">No extra fields needed for this use case.</Text>;
    case "assistantship-accounts": return <TextInput label="Student Username" value={fields.student_username||""} onChange={setE("student_username")} required />;
    case "complaint": return (<><NumberInput label="Complaint ID" value={fields.complaint_id||""} onChange={set("complaint_id")} required min={1} /><Switch label="Is Student?" checked={!!fields.is_student} onChange={(e) => setFields((f) => ({ ...f, is_student: e.currentTarget.checked }))} /><TextInput label="Message" value={fields.message||""} onChange={setE("message")} required /></>);
    case "file-tracking": return <TextInput label="File Title" value={fields.title||""} onChange={setE("title")} required />;
    case "placement": case "academics": case "department": return <TextInput label="Message" value={fields.message||""} onChange={setE("message")} required />;
    case "generic": return (<><Select label="Module" data={MODULE_OPTIONS} value={fields.module} onChange={set("module")} required /><TextInput label="Verb (notification message)" value={fields.verb||""} onChange={setE("verb")} required /><TextInput label="Description (optional)" value={fields.description||""} onChange={setE("description")} /><TextInput label="URL (optional)" value={fields.url||""} onChange={setE("url")} /></>);
    default: return null;
  }
}

async function dispatchSend(moduleType, fields) {
  const base = { recipient_username: fields.recipient };
  switch (moduleType) {
    case "leave":                  return notifyLeave({ ...base, type: fields.type, date: fields.date||undefined });
    case "mess":                   return notifyMess({ ...base, type: fields.type, message: fields.message||undefined });
    case "hostel":                 return notifyHostel({ ...base, type: fields.type });
    case "healthcare":             return notifyHealthcare({ ...base, type: fields.type });
    case "scholarship":            return notifyScholarship({ ...base, type: fields.type });
    case "dean-pnd":               return notifyDeanPnD({ ...base, type: fields.type });
    case "dean-students":          return notifyDeanStudents({ ...base, type: fields.type });
    case "dean-rspc":              return notifyDeanRSPC({ ...base, type: fields.type });
    case "gymkhana-voting":        return notifyGymkhanaVoting({ ...base, title: fields.title, desc: fields.desc });
    case "gymkhana-session":       return notifyGymkhanaSession({ ...base, club: fields.club, desc: fields.desc, venue: fields.venue });
    case "gymkhana-event":         return notifyGymkhanaEvent({ ...base, club: fields.club, event_name: fields.event_name, desc: fields.desc, venue: fields.venue });
    case "research":               return notifyResearch({ ...base, type: fields.type });
    case "assistantship-approved": return notifyAssistantshipApproved({ ...base, month: fields.month, year: fields.year });
    case "assistantship-faculty":  return notifyAssistantshipFaculty(base);
    case "assistantship-acad":     return notifyAssistantshipAcad(base);
    case "assistantship-accounts": return notifyAssistantshipAccounts({ ...base, student_username: fields.student_username });
    case "complaint":              return notifyComplaint({ ...base, complaint_id: fields.complaint_id, is_student: fields.is_student, message: fields.message });
    case "file-tracking":          return notifyFileTracking({ ...base, title: fields.title });
    case "placement":              return notifyPlacement({ ...base, message: fields.message });
    case "academics":              return notifyAcademics({ ...base, message: fields.message });
    case "department":             return notifyDepartment({ ...base, message: fields.message });
    case "generic":                return sendGeneric({ ...base, module: fields.module, verb: fields.verb, description: fields.description, url: fields.url });
    default: throw new Error("Unknown module");
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationModule() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    try { setUnreadCount(await fetchUnreadCount()); } catch { /* silent */ }
  }, []);

  useEffect(() => {
    refreshCount();
    const id = setInterval(refreshCount, 30000);
    return () => clearInterval(id);
  }, [refreshCount]);

  const breadcrumbs = [
    { title: "Home", href: "/dashboard" },
    { title: "Notifications" },
  ];

  return (
    <Stack px="md" py="sm" gap="md">
      <CustomBreadcrumbs items={breadcrumbs} />

      {/* ── Page header ── */}
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <ThemeIcon size={42} radius="md" variant="light" color="blue">
            <Bell size={24} weight="duotone" />
          </ThemeIcon>
          <div>
            <Title order={3} mb={2}>Notification Centre</Title>
            <Text size="xs" c="dimmed">Fusion ERP · Notification Module</Text>
          </div>
        </Group>
        {unreadCount > 0 && (
          <Badge size="lg" color="red" radius="xl" leftSection={<Bell size={12} weight="bold" />}>
            {unreadCount} unread
          </Badge>
        )}
      </Group>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false}>
        <Tabs.List>
            <Tabs.Tab value="inbox"         leftSection={<Bell size={14} />}>
            Inbox {unreadCount > 0 && <Badge size="xs" color="red" ml={4} circle>{unreadCount > 99 ? "99+" : unreadCount}</Badge>}
          </Tabs.Tab>
          <Tabs.Tab value="preferences"   leftSection={<Sliders size={14} />}>Preferences</Tabs.Tab>
          <Tabs.Tab value="send"          leftSection={<PaperPlane size={14} />}>Send</Tabs.Tab>
          <Tabs.Tab value="announcements" leftSection={<Megaphone size={14} />}>Announcements</Tabs.Tab>
          <Tabs.Tab value="event-types"   leftSection={<Tag size={14} />}>Event Types</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="inbox"         pt="md"><InboxTab onUnreadChange={setUnreadCount} /></Tabs.Panel>
        <Tabs.Panel value="preferences"   pt="md"><PreferencesTab /></Tabs.Panel>
        <Tabs.Panel value="send"          pt="md"><SendTab /></Tabs.Panel>
        <Tabs.Panel value="announcements" pt="md"><AnnouncementsTab /></Tabs.Panel>
        <Tabs.Panel value="event-types"   pt="md"><EventTypesTab /></Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// ─── Tab: Inbox ───────────────────────────────────────────────────────────────

function InboxTab({ onUnreadChange }) {
  const [view,        setView]        = useState("all");
  const [module,      setModule]      = useState("all");
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const updateCount = (val) => { setUnreadCount(val); onUnreadChange?.(val); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (module !== "all")       data = await fetchNotificationsByModule(module);
      else if (view === "unread") data = (await fetchUnreadNotifications()).notifications;
      else                        data = await fetchAllNotifications();
      setItems(data ?? []);
    } catch { toast.show({ color: "red", message: "Failed to load notifications." }); }
    finally { setLoading(false); }
  }, [view, module]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetchUnreadCount().then((c) => { updateCount(c); }).catch(() => {});
  }, [items]);

  const handleMarkRead    = async (id) => { await markRead(id);   setItems((p) => p.map((n) => n.id===id?{...n,unread:false}:n)); updateCount(Math.max(0, unreadCount-1)); };
  const handleMarkUnread  = async (id) => { await markUnread(id); setItems((p) => p.map((n) => n.id===id?{...n,unread:true}:n));  updateCount(unreadCount+1); };
  const handleDelete      = async (id) => { const was=items.find((n)=>n.id===id)?.unread; await deleteOne(id); setItems((p)=>p.filter((n)=>n.id!==id)); if(was) updateCount(Math.max(0,unreadCount-1)); };
  const handleMarkAllRead = async ()   => { await markAllRead(); setItems((p)=>p.map((n)=>({...n,unread:false}))); updateCount(0); toast.show({color:"green",message:"All marked as read."}); };
  const handleDeleteAll   = async ()   => { await deleteAll(); setItems([]); updateCount(0); toast.show({color:"green",message:"All notifications deleted."}); };

  const totalCount = items.length;

  return (
    <Stack gap="md">
      {/* Stats row */}
      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
        <Paper withBorder radius="md" p="md">
          <Group gap="sm">
            <ThemeIcon size={36} radius="md" variant="light" color="blue"><Bell size={18} weight="duotone" /></ThemeIcon>
            <div><Text size="xl" fw={700}>{totalCount}</Text><Text size="xs" c="dimmed">Total</Text></div>
          </Group>
        </Paper>
        <Paper withBorder radius="md" p="md">
          <Group gap="sm">
            <ThemeIcon size={36} radius="md" variant="light" color="red"><Bell size={18} weight="fill" /></ThemeIcon>
            <div><Text size="xl" fw={700}>{unreadCount}</Text><Text size="xs" c="dimmed">Unread</Text></div>
          </Group>
        </Paper>
        <Paper withBorder radius="md" p="md">
          <Group gap="sm">
            <ThemeIcon size={36} radius="md" variant="light" color="green"><Check size={18} weight="bold" /></ThemeIcon>
            <div><Text size="xl" fw={700}>{totalCount - unreadCount}</Text><Text size="xs" c="dimmed">Read</Text></div>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Filters + actions */}
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="wrap">
          <SegmentedControl value={view} onChange={(v)=>{setView(v);setModule("all");}} disabled={module!=="all"}
            data={[{label:"All",value:"all"},{label:"Unread",value:"unread"}]} size="xs" />
          <Select placeholder="Filter by module" data={MODULE_FILTER_OPTIONS} value={module}
            onChange={(v)=>{setModule(v);if(v!=="all")setView("all");}} w={200} size="xs" />
        </Group>
        <Group gap="xs">
          {unreadCount > 0 && <Button size="xs" variant="light" color="blue" leftSection={<Check size={12} />} onClick={handleMarkAllRead}>Mark all read</Button>}
          <Button size="xs" variant="light" color="red" leftSection={<Archive size={12} />} onClick={handleDeleteAll}>Archive all</Button>
        </Group>
      </Group>

      {loading ? (
        <Group justify="center" py="xl"><Loader size="sm" /><Text c="dimmed" size="sm">Loading notifications…</Text></Group>
      ) : (
        <NotificationList notifications={items} onMarkRead={handleMarkRead} onMarkUnread={handleMarkUnread} onDelete={handleDelete} />
      )}
    </Stack>
  );
}

// ─── Tab: Preferences ─────────────────────────────────────────────────────────

function PreferencesTab() {
  const [prefs, setPrefs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    fetchPreferences()
      .then(setPrefs)
      .catch(()=>toast.show({color:"red",message:"Failed to load preferences."}))
      .finally(()=>setLoading(false));
  }, []);

  const handleChange = async (module, is_enabled) => {
    setSaving(true);
    try {
      const updated = await setPreference(module, is_enabled);
      setPrefs((p)=>p.map((x)=>x.module===module?{...x,is_enabled:updated.is_enabled}:x));
    } catch { toast.show({color:"red",message:"Failed to update preference."}); }
    finally { setSaving(false); }
  };

  const enabledCount  = prefs.filter((p)=>p.is_enabled).length;
  const disabledCount = prefs.filter((p)=>!p.is_enabled).length;

  if (loading) return <Group justify="center" py="xl"><Loader size="sm" /><Text c="dimmed" size="sm">Loading preferences…</Text></Group>;

  return (
    <Stack gap="md">
      <Alert icon={<Info size={16} />} color="blue" variant="light" title="BR-NT-06 — Per-Module Opt-Out">
        Toggle off any module to stop receiving its notifications. Modules toggled off will be silently skipped when a notification is triggered — unless it's critical priority (BR-NT-05).
      </Alert>

      <Group gap="md">
        <Badge size="lg" color="green" variant="light">{enabledCount} enabled</Badge>
        <Badge size="lg" color="red" variant="light">{disabledCount} disabled</Badge>
      </Group>

      <Paper withBorder radius="md" p={0}>
        {prefs.map((pref, i) => (
          <div key={pref.module}>
            <PreferenceToggle module={pref.module} isEnabled={pref.is_enabled} onChange={handleChange} loading={saving} />
            {i < prefs.length-1 && <Divider />}
          </div>
        ))}
        {prefs.length===0 && <Text c="dimmed" size="sm" p="md">No preferences found.</Text>}
      </Paper>
    </Stack>
  );
}

// ─── Tab: Send ────────────────────────────────────────────────────────────────

function SendTab() {
  const [moduleType, setModuleType] = useState(null);
  const [priority,   setPriority]   = useState("medium");
  const [fields,     setFields]     = useState({ recipient: "" });
  const [sending,    setSending]    = useState(false);
  const [cooldown,   setCooldown]   = useState(0);
  const cooldownRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(()=>{
      setCooldown((c)=>{ if(c<=1){clearInterval(cooldownRef.current);return 0;} return c-1; });
    }, 1000);
    return ()=>clearInterval(cooldownRef.current);
  }, [cooldown > 0]);

  const handleSend = async () => {
    if (!moduleType)       return toast.show({color:"red",message:"Select a module first."});
    if (!fields.recipient) return toast.show({color:"red",message:"Recipient username is required."});
    setSending(true);
    try {
      await dispatchSend(moduleType, {...fields, priority});
      toast.show({color:"green",message:"Notification sent successfully."});
      setFields({recipient:fields.recipient});
      setCooldown(60);
    } catch (err) {
      const status = err?.response?.status;
      const msg = status===403
        ? "BR-NT-03: Only staff/admin can send this notification."
        : err?.response?.data?.error ? JSON.stringify(err.response.data.error) : "Failed to send.";
      toast.show({color:"red",message:msg});
    } finally { setSending(false); }
  };

  return (
    <Stack gap="md" maw={620}>
      <Alert icon={<Info size={16} />} color="gray" variant="light">
        Trigger any module-specific notification directly from the UI. Use this to demonstrate all 15 use cases.
      </Alert>

      <Paper withBorder radius="md" p="md">
        <Stack gap="sm">
          <Select label="Module" placeholder="Select a Fusion module" data={SEND_MODULE_TYPES}
            value={moduleType} onChange={(v)=>{setModuleType(v);setFields({recipient:fields.recipient});}} searchable required />
          <TextInput label="Recipient Username" placeholder="e.g. 23BCS016"
            value={fields.recipient} onChange={(e)=>setFields((f)=>({...f,recipient:e.currentTarget.value}))} required />
          <Select label="Priority" data={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />

          {priority==="critical" && (
            <Alert icon={<Lightning size={14} />} color="red" variant="light" title="BR-NT-05 Active">
              This notification will bypass the recipient's module preferences and be delivered immediately.
            </Alert>
          )}

          {moduleType && (
            <>
              <Divider label="Module-specific fields" labelPosition="left" />
              <ExtraFields moduleType={moduleType} fields={fields} setFields={setFields} />
            </>
          )}

          <Group mt="xs">
            <Button onClick={handleSend} loading={sending}
              disabled={!moduleType||!fields.recipient||cooldown>0}
              color={priority==="critical"?"red":undefined}
              leftSection={<PaperPlane size={14} />}>
              {cooldown > 0 ? `Wait ${cooldown}s (BR-NT-04)` : "Send Notification"}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}

// ─── Tab: Announcements ───────────────────────────────────────────────────────

function daysLeft(d) { return Math.max(0, Math.ceil((new Date(d)-new Date())/(86400000))); }

function AnnouncementsTab() {
  const [title,         setTitle]         = useState("");
  const [message,       setMessage]       = useState("");
  const [audienceType,  setAudienceType]  = useState("all");
  const [audienceValue, setAudienceValue] = useState("");
  const [expiryDate,    setExpiryDate]    = useState(null);
  const [sending,       setSending]       = useState(false);
  const [list,          setList]          = useState([]);
  const [loadingList,   setLoadingList]   = useState(true);
  const [preview,       setPreview]       = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const load = useCallback(async ()=>{
    setLoadingList(true);
    try { setList(await fetchActiveAnnouncements()); }
    catch { toast.show({color:"red",message:"Failed to load announcements."}); }
    finally { setLoadingList(false); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  // Fetch recipient preview whenever audience selection changes
  useEffect(()=>{
    if (audienceType === "group" && !audienceValue) { setPreview(null); return; }
    setPreviewLoading(true);
    previewAudience(audienceType, audienceType === "group" ? audienceValue : "")
      .then(setPreview)
      .catch(()=>setPreview(null))
      .finally(()=>setPreviewLoading(false));
  },[audienceType, audienceValue]);

  const handleBroadcast = async () => {
    if (!title.trim()||!message.trim()||!expiryDate) return toast.show({color:"orange",message:"Fill all required fields."});
    if (audienceType==="group"&&!audienceValue.trim()) return toast.show({color:"orange",message:"Enter a designation name."});
    setSending(true);
    try {
      await broadcastAnnouncement({ title:title.trim(), message:message.trim(), audience_type:audienceType,
        audience_value:audienceType==="group"?audienceValue.trim():"", expiry_date:expiryDate.toISOString().split("T")[0] });
      toast.show({color:"green",message:"Announcement broadcasted successfully."});
      setTitle(""); setMessage(""); setAudienceType("all"); setAudienceValue(""); setExpiryDate(null);
      load();
    } catch (err) {
      toast.show({color:"red",message:err?.response?.data?.error||"Failed to broadcast."});
    } finally { setSending(false); }
  };

  return (
    <Stack gap="md">
      <Paper withBorder radius="md" p="md">
        <Group gap="xs" mb="md">
          <ThemeIcon size={28} radius="md" variant="light" color="indigo"><Megaphone size={14} weight="duotone" /></ThemeIcon>
          <Title order={5}>UC-NT-03 — Broadcast New Announcement</Title>
        </Group>
        <Stack gap="sm">
          <TextInput label="Title" placeholder="e.g. Campus network maintenance on Friday" required value={title} onChange={(e)=>setTitle(e.target.value)} />
          <Textarea label="Message" placeholder="Enter the full announcement content…" required minRows={3} value={message} onChange={(e)=>setMessage(e.target.value)} />
          <Group grow wrap="wrap">
            <Select label="Target Audience (BR-NT-07: resolved via RBAC)" data={AUDIENCE_OPTIONS} value={audienceType} onChange={(v)=>{ setAudienceType(v); setAudienceValue(""); setPreview(null); }} required />
            {audienceType==="group" && (
              <Select label="Designation (BR-NT-07)" placeholder="Select from fusionlab DB"
                data={DESIGNATIONS.map((d)=>({value:d,label:d}))}
                value={audienceValue} onChange={setAudienceValue} searchable required />
            )}
          </Group>

          {/* Recipient Preview */}
          {previewLoading && (
            <Group gap="xs"><Loader size="xs" /><Text size="sm" c="dimmed">Resolving recipients from database…</Text></Group>
          )}
          {!previewLoading && preview && (
            <Alert color={preview.count > 0 ? "blue" : "orange"} radius="md"
              title={`Recipients: ${preview.count} user${preview.count !== 1 ? "s" : ""} will receive this broadcast`}>
              {preview.count > 0 ? (
                <Group gap="xs" mt={4} wrap="wrap">
                  {preview.users.map((u) => (
                    <Badge key={u} variant="light" color="blue" size="sm">{u}</Badge>
                  ))}
                </Group>
              ) : (
                <Text size="sm">No users found for this audience in the database.</Text>
              )}
            </Alert>
          )}

          <DateInput label="Expiry Date" placeholder="Pick a date" required value={expiryDate} onChange={setExpiryDate} minDate={new Date()} w={220} />
          <Group>
            <Button onClick={handleBroadcast} loading={sending} disabled={!title||!message||!expiryDate} leftSection={<Megaphone size={14} />}>
              Broadcast
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Divider label="Active Announcements" labelPosition="center" />

      {loadingList ? (
        <Group justify="center" py="xl"><Loader size="sm" /><Text c="dimmed" size="sm">Loading…</Text></Group>
      ) : list.length===0 ? (
        <Paper withBorder radius="md" p="xl">
          <Stack align="center" gap="xs">
            <ThemeIcon size={48} radius="xl" variant="light" color="gray"><Megaphone size={24} weight="duotone" /></ThemeIcon>
            <Text c="dimmed" size="sm">No active announcements</Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="sm">
          {list.map((a)=>(
            <Paper key={a.id} withBorder radius="md" p="md" style={{borderLeft:"4px solid var(--mantine-color-indigo-5)"}}>
              <Group justify="space-between" wrap="wrap" mb={6}>
                <Text fw={600} size="sm">{a.title}</Text>
                <Group gap={6}>
                  <Badge size="sm" variant="light" color="indigo">
                    {AUDIENCE_OPTIONS.find((o)=>o.value===a.audience_type)?.label??a.audience_type}
                    {a.audience_value?` — ${a.audience_value}`:""}
                  </Badge>
                  <Badge size="sm" color={daysLeft(a.expiry_date)<=2?"red":"orange"} variant="outline">
                    {daysLeft(a.expiry_date)===0?"Expires today":`${daysLeft(a.expiry_date)}d left`}
                  </Badge>
                </Group>
              </Group>
              <Text size="sm" c="dimmed">{a.message}</Text>
              <Text size="xs" c="dimmed" mt={6}>
                Sent by <b>{a.sender_username}</b>
                {a.created_at&&<> · {new Date(a.created_at).toLocaleString()}</>}
              </Text>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

// ─── Tab: Event Types ─────────────────────────────────────────────────────────

function EventTypesTab() {
  const [eName,  setEName]  = useState("");
  const [eMod,   setEMod]   = useState(MODULE_OPTIONS[0].value);
  const [ePri,   setEPri]   = useState("medium");
  const [eDesc,  setEDesc]  = useState("");
  const [regBusy,setRegBusy]= useState(false);
  const [tId,    setTId]    = useState("");
  const [tRec,   setTRec]   = useState("");
  const [tMsg,   setTMsg]   = useState("");
  const [tLink,  setTLink]  = useState("#");
  const [trigBusy,setTrigBusy]=useState(false);
  const [list,   setList]   = useState([]);
  const [listBusy,setListBusy]=useState(true);

  const loadList = useCallback(async()=>{
    setListBusy(true);
    try { setList(await fetchEventTypes()); }
    catch { toast.show({color:"red",message:"Failed to load event types."}); }
    finally { setListBusy(false); }
  },[]);

  useEffect(()=>{ loadList(); },[loadList]);

  const handleRegister = async () => {
    if (!eName.trim()) return toast.show({color:"orange",message:"Event name is required."});
    setRegBusy(true);
    try {
      await registerEventType({event_name:eName.trim(),module:eMod,default_priority:ePri,description:eDesc.trim()});
      toast.show({color:"green",message:`Event type "${eName}" registered.`});
      setEName(""); setEDesc(""); loadList();
    } catch (err) { toast.show({color:"red",message:err?.response?.data?.error||"Registration failed."}); }
    finally { setRegBusy(false); }
  };

  const handleTrigger = async () => {
    if (!tId.trim()||!tRec.trim()||!tMsg.trim()) return toast.show({color:"orange",message:"Event ID, recipient, and message are required."});
    setTrigBusy(true);
    try {
      await triggerEventNotification({event_id:tId.trim(),recipient_username:tRec.trim(),message_content:tMsg.trim(),deep_link:tLink.trim()||"#"});
      toast.show({color:"green",message:"Notification triggered successfully."});
      setTMsg("");
    } catch (err) {
      const status=err?.response?.status;
      const detail=err?.response?.data?.error||"Trigger failed.";
      if (status===429) toast.show({color:"orange",title:"Duplicate suppressed (BR-NT-04)",message:detail,autoClose:5000});
      else toast.show({color:"red",message:detail});
    } finally { setTrigBusy(false); }
  };

  const pc=(p)=>({low:"gray",medium:"blue",high:"orange",critical:"red"}[p]??"gray");

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* UC-NT-01 */}
        <Paper withBorder radius="md" p="md">
          <Group gap="xs" mb="md">
            <ThemeIcon size={28} radius="md" variant="light" color="teal"><Tag size={14} weight="duotone" /></ThemeIcon>
            <Title order={5}>UC-NT-01 — Register Event Type</Title>
          </Group>
          <Stack gap="sm">
            <TextInput label="Event Name" placeholder="e.g. Bill_Generated" required value={eName} onChange={(e)=>setEName(e.target.value)} />
            <Select label="Module" data={MODULE_OPTIONS} value={eMod} onChange={setEMod} required />
            <Select label="Default Priority" data={PRIORITY_OPTIONS} value={ePri} onChange={setEPri} />
            <TextInput label="Description (optional)" value={eDesc} onChange={(e)=>setEDesc(e.target.value)} />
            <Button onClick={handleRegister} loading={regBusy} disabled={!eName} leftSection={<Tag size={14} />}>
              Register
            </Button>
          </Stack>
        </Paper>

        {/* UC-NT-02 */}
        <Paper withBorder radius="md" p="md">
          <Group gap="xs" mb="md">
            <ThemeIcon size={28} radius="md" variant="light" color="violet"><Lightning size={14} weight="duotone" /></ThemeIcon>
            <Title order={5}>UC-NT-02 — Trigger by Event ID</Title>
          </Group>
          <Stack gap="sm">
            <TextInput label="Event ID (UUID)" placeholder="Paste from table below" required value={tId} onChange={(e)=>setTId(e.target.value)} />
            <TextInput label="Recipient Username" placeholder="e.g. 23BCS016" required value={tRec} onChange={(e)=>setTRec(e.target.value)} />
            <Textarea label="Message Content" required minRows={2} value={tMsg} onChange={(e)=>setTMsg(e.target.value)} />
            <TextInput label="Deep Link (optional)" placeholder="/mess/bill/42/" value={tLink} onChange={(e)=>setTLink(e.target.value)} />
            <Button onClick={handleTrigger} loading={trigBusy} disabled={!tId||!tRec||!tMsg} color="violet" leftSection={<Lightning size={14} />}>
              Trigger
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>

      <Divider label="Registered Event Types" labelPosition="center" />

      {listBusy ? (
        <Group justify="center" py="xl"><Loader size="sm" /><Text c="dimmed" size="sm">Loading…</Text></Group>
      ) : list.length===0 ? (
        <Text c="dimmed" size="sm" ta="center" py="md">No event types registered yet.</Text>
      ) : (
        <Paper withBorder radius="md" style={{overflow:"hidden"}}>
          <Table striped highlightOnHover>
            <Table.Thead style={{background:"var(--mantine-color-gray-0)"}}>
              <Table.Tr>
                <Table.Th>Event Name</Table.Th><Table.Th>Module</Table.Th>
                <Table.Th>Priority</Table.Th><Table.Th>Status</Table.Th>
                <Table.Th>Event ID</Table.Th><Table.Th>Registered By</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list.map((et)=>(
                <Table.Tr key={et.id}>
                  <Table.Td fw={500}>{et.event_name}</Table.Td>
                  <Table.Td><Badge size="sm" variant="light">{et.module}</Badge></Table.Td>
                  <Table.Td><Badge size="sm" color={pc(et.default_priority)}>{et.default_priority}</Badge></Table.Td>
                  <Table.Td><Badge size="sm" color={et.is_active?"green":"gray"}>{et.is_active?"Active":"Inactive"}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed" style={{fontFamily:"monospace",wordBreak:"break-all"}}>{et.event_id}</Text></Table.Td>
                  <Table.Td>{et.registered_by_username??"—"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}

// ─── Tab: Use Cases ───────────────────────────────────────────────────────────

function UseCasesTab() {
  return (
    <Stack gap="md">
      {/* UC-NT-03 RBAC section */}
      <Paper withBorder radius="md" p="md" style={{borderLeft:"4px solid var(--mantine-color-indigo-5)"}}>
        <Group gap="xs" mb="sm">
          <Badge color="indigo" variant="filled">UC-NT-03</Badge>
          <Text fw={600} size="sm">Broadcast Announcements — RBAC Audience Types</Text>
        </Group>
        <Text size="xs" c="dimmed" mb="sm">
          Audience is resolved using real data from <b>globals_extrainfo</b> and <b>globals_holdsdesignation</b> tables in fusionlab DB.
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
          {[
            { type:"all",      label:"All Users",    desc:"Every auth_user", color:"gray" },
            { type:"students", label:"All Students", desc:"user_type = 'student'", color:"blue" },
            { type:"faculty",  label:"All Faculty",  desc:"user_type = 'faculty'", color:"cyan" },
            { type:"staff",    label:"All Staff",    desc:"user_type = 'staff'", color:"green" },
          ].map((a)=>(
            <Paper key={a.type} withBorder radius="sm" p="sm">
              <Badge size="xs" color={a.color} mb={4}>{a.type}</Badge>
              <Text size="sm" fw={500}>{a.label}</Text>
              <Text size="xs" c="dimmed">{a.desc}</Text>
            </Paper>
          ))}
          <Paper withBorder radius="sm" p="sm" style={{gridColumn:"span 1"}}>
            <Badge size="xs" color="teal" mb={4}>group (BR-NT-07)</Badge>
            <Text size="sm" fw={500}>Specific Designation</Text>
            <Text size="xs" c="dimmed" mb={6}>From globals_designation:</Text>
            <Group gap={4} wrap="wrap">
              {DESIGNATIONS.map((d)=><Badge key={d} size="xs" variant="outline" color="teal">{d}</Badge>)}
            </Group>
          </Paper>
        </SimpleGrid>
      </Paper>

      {/* Module use cases accordion */}
      <Accordion variant="separated" radius="md">
        {USE_CASES.map((section)=>(
          <Accordion.Item key={section.module} value={section.module}>
            <Accordion.Control>
              <Group gap="sm">
                <Badge color={section.color} variant="filled" size="sm">{section.module}</Badge>
                <Text size="xs" c="dimmed">{section.cases.length} trigger{section.cases.length!==1?"s":""}</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap={0}>
                {section.cases.map((uc, i)=>(
                  <Box key={uc.trigger} py="xs" style={{borderBottom: i<section.cases.length-1 ? "1px solid var(--mantine-color-gray-2)" : "none"}}>
                    <Group gap="xs">
                      <Text size="sm" fw={500} style={{fontFamily:"monospace"}}>{uc.trigger}</Text>
                      <Badge size="xs" variant="light" color="gray">{uc.actor}</Badge>
                    </Group>
                    <Text size="xs" c="dimmed" mt={2}>{uc.description}</Text>
                  </Box>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
}

// ─── Tab: Business Rules ──────────────────────────────────────────────────────

function BusinessRulesTab() {
  const colorMap = { red:"#fa5252", orange:"#fd7e14", grape:"#be4bdb", blue:"#228be6", teal:"#12b886", gray:"#868e96" };
  return (
    <Stack gap="sm">
      <Alert icon={<ShieldCheck size={16} />} color="blue" variant="light" title="6 Business Rules Enforced">
        All rules are enforced server-side in <b>services.py</b>. The frontend demonstrates each rule live.
      </Alert>

      {BUSINESS_RULES.map((rule)=>(
        <Paper key={rule.id} withBorder radius="md" p="md"
          style={{borderLeft:`4px solid ${colorMap[rule.color]||"#868e96"}`}}>
          <Group gap="sm" mb="sm">
            <ThemeIcon size={32} radius="md" color={rule.color} variant="light">{rule.icon}</ThemeIcon>
            <div>
              <Group gap="xs">
                <Badge color={rule.color} variant="filled" size="sm">{rule.id}</Badge>
                <Text fw={600} size="sm">{rule.title}</Text>
              </Group>
              <Text size="xs" c="dimmed" mt={2}>{rule.description}</Text>
            </div>
          </Group>

          <Divider my="xs" />

          <Stack gap={8}>
            <Group gap="xs">
              <Text size="xs" fw={600} c="dimmed">Enforced in:</Text>
              <Text size="xs" c="blue" style={{fontFamily:"monospace"}}>{rule.enforcement}</Text>
            </Group>
            <Code block fz="xs" style={{borderRadius:6}}>{rule.codeSnippet}</Code>
            <Group gap="xs" align="flex-start">
              <Text size="xs" fw={600} c="dimmed" style={{whiteSpace:"nowrap"}}>How to demo:</Text>
              <Text size="xs">{rule.demo}</Text>
            </Group>
            {rule.extra && (
              <Box>
                <Text size="xs" fw={600} c="dimmed" mb={4}>{rule.extra.label}:</Text>
                <Group gap={4} wrap="wrap">
                  {rule.extra.items.map((item)=>(
                    <Badge key={item} size="xs" variant="outline" color="teal">{item}</Badge>
                  ))}
                </Group>
              </Box>
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

import React from "react";
import EnhancedSectionNavigation from "./EnhancedSectionNavigation";
import NoticeBoard from "./all-actors/NoticeBoard";
import LeaveForm from "./students/LeaveForm";
import LeaveStatus from "./students/LeaveStatus";
import Fine from "./students/Fine";
import AllotedRooms from "./students/AllotedRooms";
import ViewAttendance from "./students/ViewAttendance";
import Complaints from "./students/Complaints";
import RoomChangeRequest from "./students/RoomChangeRequest";

const sections = [
  "Notice Board",
  "Complaints",
  "My Fine",
  "Leave",
  "Alloted rooms",
  "Room Change",
  "My Attendance",
];

const subSections = {
  Leave: ["Leave Form", "Leave Status"],
  "Guest Room": ["Book Guest Room", "Booking Status"],
};

const components = {
  "Notice Board": NoticeBoard,
  Complaints,
  "Leave_Leave Form": LeaveForm,
  "Leave_Leave Status": LeaveStatus,
  "My Fine": Fine,
  "Alloted rooms": AllotedRooms,
  "Room Change": RoomChangeRequest,
  "My Attendance": ViewAttendance,
};

export default function SectionNavigationStudent() {
  return (
    <EnhancedSectionNavigation
      sections={sections}
      subSections={subSections}
      components={components}
      defaultSection="Notice Board"
      userrole="student"
    />
  );
}

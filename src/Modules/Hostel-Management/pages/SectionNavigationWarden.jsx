import React from "react";
import EnhancedSectionNavigation from "./EnhancedSectionNavigation";
import NoticeBoardWardenCaretaker from "./all-actors/NoticeBoardWardenCaretaker";
import StudentInfo from "./all-actors/StudentInfo";
import ManageLeaveRequest from "./caretaker/ManageLeaverequest";
import ManageRoomChangeRequest from "./caretaker/ManageRoomChangeRequest";
import AssignRooms from "./warden/AssignRoom";
import ComplaintsStaff from "./all-actors/ComplaintsStaff";
import ImposeFine from "./caretaker/ImposeFine";
import ManageFine from "./caretaker/ManageFine";
import HistoryFine from "./caretaker/HistoryFine";

const sections = [
  "Notice Board",
  "Assign Room",
  "Complaints",
  "Manage Leave Request",
  "Room Change Requests",
  "Fine",
];

const subSections = {
  Fine: ["Impose Fines", "Manage Imposed Fines", "History"],
};

const components = {
  "Notice Board": () => <NoticeBoardWardenCaretaker allowEdit />,
  "Students and Rooms Info": StudentInfo,
  "Assign Room": AssignRooms,
  Complaints: ComplaintsStaff,
  "Manage Leave Request": ManageLeaveRequest,
  "Room Change Requests": () => <ManageRoomChangeRequest allowAction />,
  "Fine_Impose Fines": ImposeFine,
  "Fine_Manage Imposed Fines": ManageFine,
  Fine_History: HistoryFine,
};

export default function SectionNavigationWarden() {
  return (
    <EnhancedSectionNavigation
      sections={sections}
      subSections={subSections}
      components={components}
      defaultSection="Notice Board"
      userrole="warden"
    />
  );
}

import React from "react";
import EnhancedSectionNavigation from "./EnhancedSectionNavigation";
import ManageLeaveRequest from "./caretaker/ManageLeaverequest";
import ManageRoomChangeRequest from "./caretaker/ManageRoomChangeRequest";
import NoticeBoardWardenCaretaker from "./all-actors/NoticeBoardWardenCaretaker";
import ImposeFine from "./caretaker/ImposeFine";
import ManageFine from "./caretaker/ManageFine";
import HistoryFine from "./caretaker/HistoryFine";
import StudentInfo from "./caretaker/StudentInfo";
import UploadAttendance from "./caretaker/UploadAttendance";
import ComplaintsStaff from "./all-actors/ComplaintsStaff";

const sections = [
  "Notice Board",
  "Manage Leave Request",
  "Room Change Requests",
  "Fine",
  "Student Allotment",
  "Upload Attendance",
  "Complaints",
];

const subSections = {
  Fine: ["Impose Fines", "Manage Imposed Fines", "History"],
};

const components = {
  "Notice Board": () => <NoticeBoardWardenCaretaker allowEdit={false} />,
  "Manage Leave Request": ManageLeaveRequest,
  "Room Change Requests": () => <ManageRoomChangeRequest allowAction={false} />,
  "Fine_Impose Fines": ImposeFine,
  "Fine_Manage Imposed Fines": ManageFine,
  Fine_History: HistoryFine,
  "Student Allotment": StudentInfo,
  "Upload Attendance": UploadAttendance,
  Complaints: ComplaintsStaff,
};

export default function SectionNavigationCaretaker() {
  return (
    <EnhancedSectionNavigation
      sections={sections}
      subSections={subSections}
      components={components}
      defaultSection="Notice Board"
      userrole="caretaker"
    />
  );
}

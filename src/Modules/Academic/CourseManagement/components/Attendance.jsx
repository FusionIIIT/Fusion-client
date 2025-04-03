import { useState } from "react";
import SubmitAttendance from "./Attendance/SubmitAttendance";
import "./Attendance.css";
import ViewAttendance from "./Attendance/viewAttendance";

function Attendance() {
  const [activeComponent, setActiveComponent] = useState(null);

  return (
    <div className="Main">
      <div className="attendance-buttons">
        <button
          className={activeComponent === "view" ? "active" : ""}
          onClick={() => setActiveComponent("view")}
        >
          View Attendance
        </button>
        <button
          className={activeComponent === "submit" ? "active" : ""}
          onClick={() => setActiveComponent("submit")}
        >
          Submit Attendance
        </button>
      </div>

      <div className="attendance">
        {activeComponent === "view" && (
          <div className="view_attendance">
            <ViewAttendance />
          </div>
        )}
        {activeComponent === "submit" && (
          <div className="submit_attendance">
            <SubmitAttendance />
          </div>
        )}
      </div>
    </div>
  );
}

export default Attendance;

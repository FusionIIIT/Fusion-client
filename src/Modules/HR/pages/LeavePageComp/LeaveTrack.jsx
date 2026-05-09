import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingComponent from "../../components/common/Loading";
import TrackTable from "../../components/tables/TrackTable";
import { getLeaveTrack, leaveWorkflowDisplayLabel } from "../../services/api";

function LeaveTrack() {
  const { id } = useParams();
  const admin = new URLSearchParams(window.location.search).get("admin");
  const [exampleItems, setExampleItems] = useState([]);
  const [trackData, setTrackData] = useState([]);
  const [workflowStatusDisplay, setWorkflowStatusDisplay] = useState("");
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentPath = window.location.pathname;

  useEffect(() => {
    if (admin) {
      setExampleItems([
        { title: "Home", path: "/dashboard" },
        { title: "Human Resources", path: "/hr" },
        { title: "Admin Leave Management", path: "/hr/admin_leave" },
        { title: "Track", path: `${currentPath}?admin=true` },
      ]);
    } else {
      setExampleItems([
        { title: "Home", path: "/dashboard" },
        { title: "Human Resources", path: "/hr" },
        { title: "Leave Management", path: "/hr/leave" },
        { title: "Track", path: currentPath },
      ]);
    }
  }, [admin, currentPath]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getLeaveTrack(id);
        if (cancelled) return;
        setTrackData(data.file_history ?? []);
        const ws = data.workflow_status;
        setWorkflowStatusDisplay(ws ? leaveWorkflowDisplayLabel(ws) : "");
        setWorkflowHistory(data.workflow_history ?? []);
      } catch {
        if (!cancelled) {
          setTrackData([]);
          setWorkflowStatusDisplay("");
          setWorkflowHistory([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <TrackTable
      title="Leave request track"
      exampleItems={exampleItems}
      data={trackData}
      workflowStatusDisplay={workflowStatusDisplay}
      workflowHistory={workflowHistory}
    />
  );
}

export default LeaveTrack;

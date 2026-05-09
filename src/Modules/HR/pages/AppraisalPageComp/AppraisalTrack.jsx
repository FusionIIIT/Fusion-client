import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingComponent from "../../components/common/Loading";
import TrackTable from "../../components/tables/TrackTable";
import { getAppraisalTrack } from "../../services/api";

const STATUS_LABELS = {
  submitted: "Submitted — awaiting HR",
  hr_approved: "Approved by HR",
  hr_rejected: "Rejected by HR",
};

function AppraisalTrack() {
  const { id } = useParams();
  const [trackData, setTrackData] = useState([]);
  const [workflowStatusDisplay, setWorkflowStatusDisplay] = useState("");
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentPath = window.location.pathname;

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "Appraisal Management", path: "/hr/appraisal" },
    { title: "Track", path: `${currentPath}` },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAppraisalTrack(id);
        if (cancelled) return;
        setTrackData(data.file_history ?? []);
        const ws = data.workflow_status;
        setWorkflowStatusDisplay((ws && STATUS_LABELS[ws]) || ws || "");
        setWorkflowHistory(data.workflow_history ?? []);
      } catch (error) {
        console.error("Failed to fetch Appraisal Track:", error);
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
      title="Appraisal Track"
      data={trackData}
      exampleItems={exampleItems}
      workflowStatusDisplay={workflowStatusDisplay}
      workflowHistory={workflowHistory}
    />
  );
}

export default AppraisalTrack;

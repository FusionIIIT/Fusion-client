import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TrackTable from "../../components/tables/TrackTable";
import { getLtcTrack } from "../../services/api";
import LoadingComponent from "../../components/common/Loading";

const STATUS_LABELS = {
  submitted: "Submitted — with approver",
  hr_approved: "Approved by HR",
  hr_rejected: "Rejected by HR",
  with_accountant: "With Accountant",
};

function LtcTrack() {
  const { id } = useParams();

  const currentPath = window.location.pathname;

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "LTC", path: "/hr/ltc" },
    { title: "Track", path: currentPath },
  ];

  const [trackData, setTrackData] = useState([]);
  const [workflowStatusDisplay, setWorkflowStatusDisplay] = useState("");
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getLtcTrack(id);
        if (cancelled) return;
        setTrackData(data.file_history ?? []);
        const ws = data.workflow_status;
        setWorkflowStatusDisplay((ws && STATUS_LABELS[ws]) || ws || "");
        setWorkflowHistory(data.workflow_history ?? []);
      } catch (e) {
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

  if (loading) return <LoadingComponent />;

  return (
    <TrackTable
      title="LTC Track"
      exampleItems={exampleItems}
      data={trackData}
      workflowStatusDisplay={workflowStatusDisplay}
      workflowHistory={workflowHistory}
    />
  );
}

export default LtcTrack;

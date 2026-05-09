import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCpdaAdvTrack } from "../../services/api";
import LoadingComponent from "../../components/common/Loading";
import TrackTable from "../../components/tables/TrackTable";

const STATUS_LABELS = {
  submitted: "Submitted (with HOD)",
  hod_verified: "Verified by HOD",
  hod_not_verified: "Not verified by HOD",
  forwarded_to_director: "With Director",
  director_approved: "Approved — with Accountant",
  director_rejected: "Rejected by Director",
  accountant_processed: "Completed by Accountant",
};

function Cpda_ADVANCETrack() {
  const { id } = useParams();
  const [trackData, setTrackData] = useState([]);
  const [workflowStatusDisplay, setWorkflowStatusDisplay] = useState("");
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentPath = window.location.pathname;
  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "CPDA Adv Management", path: "/hr/cpda_adv" },
    { title: "Track", path: `${currentPath}` },
  ];

  useEffect(() => {
    const fetchCPDATrack = async () => {
      console.log("Fetching CPDA Advance Track...");
      try {
        const data = await getCpdaAdvTrack(id);
        setTrackData(data.file_history ?? []);
        const ws = data.workflow_status;
        setWorkflowStatusDisplay((ws && STATUS_LABELS[ws]) || ws || "");
        setWorkflowHistory(data.workflow_history ?? []);
      } catch (error) {
        console.error("Failed to fetch CPDA Advance Track:", error);
        setTrackData([]);
        setWorkflowStatusDisplay("");
        setWorkflowHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCPDATrack();
  }, [id]);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <TrackTable
      title="CPDA Adv Track"
      data={trackData}
      loading={loading}
      exampleItems={exampleItems}
      workflowStatusDisplay={workflowStatusDisplay}
      workflowHistory={workflowHistory}
    />
  );
}

export default Cpda_ADVANCETrack;

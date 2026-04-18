import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingComponent from "../../components/common/Loading";
import TrackTable from "../../components/tables/TrackTable";
import { getAppraisalTrack } from "../../services/api";

function AppraisalTrack() {
  const { id } = useParams();
  const [trackData, setTrackData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentPath = window.location.pathname;

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "Appraisal Management", path: "/hr/appraisal" },
    { title: "Track", path: `${currentPath}` },
  ];

  useEffect(() => {
    const fetchAppraisalTrack = async () => {
      try {
        const data = await getAppraisalTrack(id);
        setTrackData(data || []);
      } catch (error) {
        console.error("Failed to fetch Appraisal Track:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisalTrack();
  }, [id]);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <TrackTable
      title="Appraisal Track"
      data={trackData}
      exampleItems={exampleItems}
    />
  );
}

export default AppraisalTrack;

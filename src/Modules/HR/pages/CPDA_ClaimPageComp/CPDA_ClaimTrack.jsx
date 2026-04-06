import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingComponent from "../../components/common/Loading";
import TrackTable from "../../components/tables/TrackTable";
import { getCpdaClaimTrack } from "../../services/api";

function CPDA_ClaimTrack() {
  const { id } = useParams();
  const [trackData, setTrackData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentPath = window.location.pathname;

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "CPDA Claim Management", path: "/hr/cpda_claim" },
    { title: "Track", path: `${currentPath}` },
  ];

  useEffect(() => {
    const fetchCPDAClaimTrack = async () => {
      try {
        const data = await getCpdaClaimTrack(id);
        setTrackData(data.file_history || []);
      } catch (error) {
        console.error("Failed to fetch CPDA Claim Track:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCPDAClaimTrack();
  }, [id]);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <TrackTable
      title="CPDA Claim Track"
      data={trackData}
      exampleItems={exampleItems}
    />
  );
}

export default CPDA_ClaimTrack;

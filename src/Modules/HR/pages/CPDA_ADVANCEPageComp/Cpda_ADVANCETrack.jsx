import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFormTrack } from "../../services/api";
import LoadingComponent from "../../components/common/Loading";
import TrackTable from "../../components/tables/TrackTable";

function Cpda_ADVANCETrack() {
  const { id } = useParams();
  const [trackData, setTrackData] = useState([]);
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
        const data = await getFormTrack(id);
        setTrackData(data.file_history ?? []);
      } catch (error) {
        console.error("Failed to fetch CPDA Advance Track:", error);
        setTrackData([]);
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
    />
  );
}

export default Cpda_ADVANCETrack;

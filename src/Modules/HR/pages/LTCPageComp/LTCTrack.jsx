import React from "react";
import { useParams } from "react-router-dom";
import TrackTable from "../../components/tables/TrackTable";
import { getLtcTrack } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFetchData from "../../hooks/useFetchData";

function LtcTrack() {
  const { id } = useParams(); // ✅ FIXED (was missing)

  const currentPath = window.location.pathname;

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "LTC", path: "/hr/ltc" },
    { title: "Track", path: currentPath },
  ];

  const { data, loading, error } = useFetchData(() => getLtcTrack(id), [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <TrackTable title="Track File" exampleItems={exampleItems} data={data} />
  );
}

export default LtcTrack;

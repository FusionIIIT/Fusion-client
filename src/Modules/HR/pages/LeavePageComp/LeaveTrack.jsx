import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TrackTable from "../../components/tables/TrackTable";
import useFetchData from "../../hooks/useFetchData";
import { getLeaveTrack } from "../../services/api";

function LeaveTrack() {
  const { id } = useParams();
  const admin = new URLSearchParams(window.location.search).get("admin");

  const [exampleItems, setExampleItems] = useState([]);

  const currentPath = window.location.pathname;

  // ✅ Breadcrumb logic (UNCHANGED)
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
        { title: "Track", path: `${currentPath}` },
      ]);
    }
  }, [admin]);

  // ✅ API call via service
  const { data, loading } = useFetchData(() => getLeaveTrack(id), [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <TrackTable
      title="Leave Track"
      exampleItems={exampleItems}
      data={data || []}
    />
  );
}

export default LeaveTrack;

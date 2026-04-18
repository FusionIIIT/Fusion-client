import React from "react";
import ArchiveTable from "../../components/tables/ArchiveTable";
import LoadingComponent from "../../components/common/Loading";
import { getLeaveArchive } from "../../services/api";
import useFetchData from "../../hooks/useFetchData";

function LeaveArchive() {
  const { data, loading } = useFetchData(getLeaveArchive);

  if (loading) {
    return <LoadingComponent loadingMsg="Fetching Leave Archive..." />;
  }

  return (
    <ArchiveTable title="Leave Archive" data={data || []} formType="leave" />
  );
}

export default LeaveArchive;

import React from "react";
import ArchiveTable from "../../components/tables/ArchiveTable";
import { getLtcArchive } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFetchData from "../../hooks/useFetchData";

function LtcArchive() {
  const { data, loading, error } = useFetchData(getLtcArchive);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return <ArchiveTable title="LTC Archive" data={data} formType="ltc" />;
}

export default LtcArchive;

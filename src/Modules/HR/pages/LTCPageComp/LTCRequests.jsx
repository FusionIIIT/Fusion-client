import React from "react";
import RequestsTable from "../../components/tables/RequestsTable";
import { getLtcRequests } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFetchData from "../../hooks/useFetchData";

function LtcRequests() {
  const { data: requestData, loading, error } = useFetchData(getLtcRequests);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return <RequestsTable title="LTC Requests" data={requestData} />;
}

export default LtcRequests;

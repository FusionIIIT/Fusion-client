import React from "react";
import RequestsTable from "../../components/tables/RequestsTable";
import LoadingComponent from "../../components/common/Loading";
import useFetchData from "../../hooks/useFetchData";
import { getCpdaClaimRequests } from "../../services/api";

function CPDA_ClaimRequests() {
  const { data, loading } = useFetchData(getCpdaClaimRequests);

  if (loading) {
    return <LoadingComponent />;
  }

  return <RequestsTable title="CPDA Claim Requests" data={data || []} />;
}

export default CPDA_ClaimRequests;

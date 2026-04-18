import React from "react";
import RequestsTable from "../../components/tables/RequestsTable";
import { getCpdaAdvRequests } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFetchData from "../../hooks/useFetchData";

function Cpda_ADVANCERequests() {
  const { data: requestData, loading } = useFetchData(getCpdaAdvRequests);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <RequestsTable title="CPDA Adv Requests" data={requestData} formType="cpda_adv" />;
}

export default Cpda_ADVANCERequests;

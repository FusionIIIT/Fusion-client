import React from "react";
import RequestsTable from "../../components/tables/RequestsTable";
import LoadingComponent from "../../components/common/Loading";
import useFetchData from "../../hooks/useFetchData";
import { getAppraisalRequests } from "../../services/api";

function AppraisalRequests() {
  const { data, loading } = useFetchData(getAppraisalRequests);

  if (loading) {
    return <LoadingComponent />;
  }

  return <RequestsTable title="Appraisal Requests" data={data || []} />;
}

export default AppraisalRequests;

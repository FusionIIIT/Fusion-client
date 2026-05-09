import React from "react";
import InboxTable from "../../components/tables/InboxTable";
import LoadingComponent from "../../components/common/Loading";
import useFetchData from "../../hooks/useFetchData";
import { getAppraisalInbox } from "../../services/api";

function AppraisalInbox() {
  const { data, loading } = useFetchData(getAppraisalInbox);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <InboxTable
      title="Appraisal Inbox"
      data={data || []}
      formType="appraisal"
    />
  );
}

export default AppraisalInbox;

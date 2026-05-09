import React from "react";
import InboxTable from "../../components/tables/InboxTable";
import LoadingComponent from "../../components/common/Loading";
import useFetchData from "../../hooks/useFetchData";
import { getCpdaClaimInbox } from "../../services/api";

function CPDA_ClaimInbox() {
  const { data, loading } = useFetchData(getCpdaClaimInbox);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <InboxTable
      title="CPDA Claim Inbox"
      data={data || []}
      formType="cpda_claim"
    />
  );
}

export default CPDA_ClaimInbox;

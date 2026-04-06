import React from "react";
import InboxTable from "../../components/tables/InboxTable";
import { getLtcInbox } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFetchData from "../../hooks/useFetchData";

function LtcInbox() {
  const { data, loading, error } = useFetchData(getLtcInbox);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return <InboxTable title="LTC Inbox" data={data} formType="ltc" />;
}

export default LtcInbox;

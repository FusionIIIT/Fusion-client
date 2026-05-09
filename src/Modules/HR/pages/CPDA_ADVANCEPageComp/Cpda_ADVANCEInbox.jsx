import React from "react";
import { useNavigate } from "react-router-dom";
import InboxTable from "../../components/tables/InboxTable";
import { getCpdaAdvInbox } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFetchData from "../../hooks/useFetchData";
import { getViewUrl, getTrackUrl } from "../../utils/routeHelpers";

function Cpda_ADVANCEInbox() {
  const { data: inboxData, loading } = useFetchData(getCpdaAdvInbox);
  const navigate = useNavigate();

  const handleView = (row) => {
    navigate(getViewUrl("cpda_adv", row.id));
  };

  const handleTrack = (row) => {
    navigate(getTrackUrl("cpda_adv", row.id));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <InboxTable
      title="CPDA Adv Inbox"
      data={inboxData}
      formType="cpda_adv"
      loading={loading}
      onView={handleView}
      onTrack={handleTrack}
    />
  );
}

export default Cpda_ADVANCEInbox;

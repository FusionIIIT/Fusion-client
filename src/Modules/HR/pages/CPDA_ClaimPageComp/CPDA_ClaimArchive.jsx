import React from "react";
import ArchiveTable from "../../components/tables/ArchiveTable";
import LoadingComponent from "../../components/common/Loading";
import useFetchData from "../../hooks/useFetchData";
import { getCpdaClaimArchive } from "../../services/api";

function CPDA_ClaimArchive() {
  const { data, loading } = useFetchData(getCpdaClaimArchive);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <ArchiveTable
      title="CPDA Claim Archive"
      data={data || []}
      formType="cpda_claim"
    />
  );
}

export default CPDA_ClaimArchive;

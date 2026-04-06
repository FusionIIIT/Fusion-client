import React from "react";
import ArchiveTable from "../../components/tables/ArchiveTable";
import { getCpdaAdvArchive } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFetchData from "../../hooks/useFetchData";

function Cpda_ADVANCEArchive() {
  const { data: archiveData, loading } = useFetchData(getCpdaAdvArchive);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ArchiveTable
      title="CPDA Adv Archive"
      data={archiveData}
      formType="cpda_adv"
    />
  );
}

export default Cpda_ADVANCEArchive;

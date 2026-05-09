import React from "react";
import ArchiveTable from "../../components/tables/ArchiveTable";
import LoadingComponent from "../../components/common/Loading";
import useFetchData from "../../hooks/useFetchData";
import { getAppraisalArchive } from "../../services/api";

function AppraisalArchive() {
  const { data, loading } = useFetchData(getAppraisalArchive);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <ArchiveTable
      title="Appraisal Archive"
      data={data || []}
      formType="appraisal"
    />
  );
}

export default AppraisalArchive;

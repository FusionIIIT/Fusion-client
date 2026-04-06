import React from "react";
import PropTypes from "prop-types";
import HrBreadcrumbs from "../common/HrBreadcrumbs";
import HRDataTable from "./HRDataTable";
import { formatDateTime } from "../../utils/dateFormatter";

function TrackTable({ title, data, exampleItems = [], loading = false }) {
  const columns = [
    { key: "id", label: "Record Id" },
    {
      key: "receive_date",
      label: "Receive Date",
      render: (row) => formatDateTime(row.receive_date),
    },
    {
      key: "forward_date",
      label: "Forward Date",
      render: (row) => formatDateTime(row.forward_date),
    },
    { key: "remarks", label: "Remarks" },
    { key: "current_id", label: "Sender's Username" },
    { key: "receiver_id", label: "Receiver's Name" },
    { key: "receive_design", label: "Receiver's Designation" },
  ];

  return (
    <>
      <HrBreadcrumbs items={exampleItems} />
      <HRDataTable
        title={title}
        columns={columns}
        rows={data}
        rowKey="id"
        loading={loading}
      />
    </>
  );
}

export default TrackTable;

TrackTable.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  exampleItems: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }),
  ),
  loading: PropTypes.bool,
};

TrackTable.defaultProps = {
  exampleItems: [],
  loading: false,
};

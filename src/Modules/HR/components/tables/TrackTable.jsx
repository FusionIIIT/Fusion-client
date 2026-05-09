import React from "react";
import PropTypes from "prop-types";
import HrBreadcrumbs from "../common/HrBreadcrumbs";
import HRDataTable from "./HRDataTable";
import { formatDateTime } from "../../utils/dateFormatter";

function TrackTable({
  title,
  data,
  exampleItems = [],
  loading = false,
  workflowStatusDisplay = "",
  workflowHistory = [],
}) {
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
      {(workflowStatusDisplay ||
        (workflowHistory && workflowHistory.length > 0)) && (
        <div
          style={{
            margin: "16px 15px",
            padding: 16,
            background: "#f5f7fa",
            borderRadius: 8,
            maxWidth: 960,
          }}
        >
          {workflowStatusDisplay ? (
            <p style={{ margin: "0 0 8px" }}>
              <strong>Application status:</strong> {workflowStatusDisplay}
            </p>
          ) : null}
          {workflowHistory.length > 0 ? (
            <>
              <p style={{ margin: "8px 0 4px", fontWeight: 600 }}>
                Workflow steps
              </p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {workflowHistory.map((row, idx) => (
                  <li
                    key={`${row.at || ""}-${idx}`}
                    style={{ marginBottom: 6 }}
                  >
                    <strong>{row.status}</strong>
                    {row.by ? ` — ${row.by}` : ""}
                    {row.at ? ` — ${row.at}` : ""}
                    {row.remarks ? ` — ${row.remarks}` : ""}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      )}
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
  workflowStatusDisplay: PropTypes.string,
  workflowHistory: PropTypes.arrayOf(PropTypes.shape({})),
};

TrackTable.defaultProps = {
  exampleItems: [],
  loading: false,
  workflowStatusDisplay: "",
  workflowHistory: [],
};

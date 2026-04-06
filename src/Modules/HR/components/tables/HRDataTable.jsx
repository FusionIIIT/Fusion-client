import React from "react";
import { Title } from "@mantine/core";
import PropTypes from "prop-types";
import { EmptyTable } from "./EmptyTable";
import "../../styles/Table.css";

function HRDataTable({
  title,
  columns,
  rows,
  rowKey = "id",
  actions,
  loading,
}) {
  if (loading) {
    return <div className="loading-spinner" />;
  }

  if (!rows || rows.length === 0) {
    return (
      <EmptyTable
        title={`No ${title} found!`}
        message={`There is no ${title.toLowerCase()} available. Please check back later.`}
      />
    );
  }

  return (
    <div className="app-container">
      {title && (
        <Title
          order={2}
          style={{ fontWeight: "500", marginTop: "40px", marginLeft: "15px" }}
        >
          {title}
        </Title>
      )}
      <div className="form-table-container">
        <table className="form-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="table-header">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr className="table-row" key={row[rowKey] ?? rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="table-actions">
                    {actions.map((action, aIdx) => (
                      <button
                        type="button"
                        key={aIdx}
                        className="text-link"
                        onClick={() => action.onClick(row)}
                        style={{ marginRight: "10px" }}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HRDataTable;

HRDataTable.propTypes = {
  title: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
    }),
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rowKey: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
    }),
  ),
  loading: PropTypes.bool,
};

HRDataTable.defaultProps = {
  title: "",
  rowKey: "id",
  actions: null,
  loading: false,
};

import React from "react";
import { Title } from "@mantine/core";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom"; // Use for navigation
import { Eye, MapPin } from "@phosphor-icons/react";

import "../../styles/Table.css"; // Ensure this path is correct
import { EmptyTable } from "./EmptyTable";

function RequestsTable({ title, data, formType }) {
  const navigate = useNavigate();
  // header contains the column names id name designation submissionDate view track
  const headers = ["ID", "Name", "Designation", "Submission Date", "View", "Track"];

  const handleViewClick = (id) => {
    const viewUrlMap = {
      leave: `/hr/leave/view/${id}`,
      cpda_adv: `/hr/cpda_adv/view/${id}`,
      ltc: `/hr/ltc/view/${id}`,
      cpda_claim: `/hr/cpda_claim/view/${id}`,
      appraisal: `/hr/appraisal/view/${id}`,
    };
    navigate(viewUrlMap[formType] || `./view/${id}`);
  };

  const handleTrackClick = (id) => {
    const trackUrlMap = {
      leave: `/hr/FormView/leaveform_track/${id}`,
      cpda_adv: `/hr/FormView/cpda_adv_track/${id}`,
      ltc: `/hr/FormView/ltc_track/${id}`,
      cpda_claim: `/hr/FormView/cpda_claim_track/${id}`,
      appraisal: `/hr/FormView/appraisal_track/${id}`,
    };
    navigate(trackUrlMap[formType] || `/hr/FormView/leaveform_track/${id}`); // Fallback
  };

  return (
    <div className="app-container">
      <Title
        order={2}
        style={{ fontWeight: "500", marginTop: "40px", marginLeft: "15px" }}
      >
        {title}
      </Title>
      {data.length === 0 && (
        <EmptyTable
          title="No new requests found!"
          message="There is no new request available. Please check back later."
        />
      )}
      {headers.length > 0 && data.length > 0 ? (
        <div className="form-table-container">
          <table className="form-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="table-header">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr className="table-row" key={index}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.designation}</td>
                  <td>{item.submissionDate}</td>
                  <td>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => handleViewClick(item.id)}
                    >
                      <Eye size={20} />
                      View
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => handleTrackClick(item.id)}
                    >
                      <MapPin size={20} />
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="loading-spinner" />
      )}
    </div>
  );
}

export default RequestsTable;

RequestsTable.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  formType: PropTypes.string,
};


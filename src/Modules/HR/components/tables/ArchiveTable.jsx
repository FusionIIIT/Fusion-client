import React from "react";
import { Title } from "@mantine/core";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Eye, MapPin } from "@phosphor-icons/react";
import "../../styles/Table.css"; // Ensure this path is correct
import { EmptyTable } from "./EmptyTable";

function ArchiveTable({ title, data, formType = undefined }) {
  const navigate = useNavigate();

  const headers = ["FileID", "User", "Designation", "Date", "View", "Track"];

  const handleViewClick = (id) => {
    const viewUrlMap = {
      leave: `/hr/leave/file_handler/${id}?archive=true`, // Leave has a file handler
      cpda_adv: `/hr/cpda_adv/view/${id}`,
      ltc: `/hr/ltc/view/${id}`,
      cpda_claim: `/hr/cpda_claim/view/${id}`,
      appraisal: `/hr/appraisal/view/${id}`,
    };

    console.log(viewUrlMap[formType]);
    navigate(viewUrlMap[formType] || `/hr/FormView/${formType}_track/${id}`); // Fallback
  };
  const handleTrackClick = (id) => {
    console.log(formType);

    const trackUrlMap = {
      leave: `/hr/FormView/leaveform_track/${id}`,
      cpda_adv: `/hr/FormView/cpda_adv_track/${id}`,
      ltc: `/hr/FormView/ltc_track/${id}`,
      cpda_claim: `/hr/FormView/cpda_claim_track/${id}`,
      appraisal: `/hr/FormView/appraisal_track/${id}`,
    };

    console.log(trackUrlMap[formType]);
    navigate(trackUrlMap[formType]); // Default to leaveform_track if formType is not matched
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
          title="No new Archive requests found!"
          message="There is no new Archive request available. Please check back later."
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
      ) : null}
    </div>
  );
}

export default ArchiveTable;

ArchiveTable.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  formType: PropTypes.string,
};

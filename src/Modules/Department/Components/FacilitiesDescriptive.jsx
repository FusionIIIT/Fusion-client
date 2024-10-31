// FacilitiesDescriptive.jsx

import React from "react";
import PropTypes from "prop-types";

export default function FacilitiesDescriptive({
  phoneNumber,
  email,
  facilities,
}) {
  return (
    <div
      style={{
        backgroundColor: "white",
        width: "800px", // Adjust width as needed
        padding: "20px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "14px", color: "#000" }}>Phone Number:</p>
        <p>{phoneNumber || "N/A"}</p>
        <div
          style={{
            height: "1px",
            backgroundColor: "#000",
            width: "100%",
          }}
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "14px", color: "#000" }}>Email:</p>
        <p>{email || "N/A"}</p>
        <div
          style={{
            height: "1px",
            backgroundColor: "#000",
            width: "100%",
          }}
        />
      </div>
      <div>
        <p style={{ fontSize: "14px", color: "#000" }}>
          Facilities Description:
        </p>
        <p>{facilities || "N/A"}</p>
        <div
          style={{
            height: "1px",
            backgroundColor: "#000",
            width: "100%",
          }}
        />
      </div>
    </div>
  );
}

FacilitiesDescriptive.propTypes = {
  phoneNumber: PropTypes.string,
  email: PropTypes.string,
  facilities: PropTypes.string,
};

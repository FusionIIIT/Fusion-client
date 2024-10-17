import React from "react";

export default function FacilitiesDescriptive() {
  return (
    <div
      style={{
        backgroundColor: "white",
        width: "800px", // Adjust the width as per your needs
        padding: "20px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "14px", color: "#000" }}>Phone Number.</p>
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
          Facilities Description :
        </p>
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

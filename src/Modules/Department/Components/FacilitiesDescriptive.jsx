import React, { useEffect, useState } from "react";

export default function FacilitiesDescriptive({ branch }) {
  const [data, setData] = useState({
    phone_number: "",
    email: "",
    facilites: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/dep/api/information/",
        );
        const result = await response.json();

        // Filter the data based on the branch
        const branchData = result.find((item) => {
          // Match branch name to ID: CSE: 1, ECE: 2, ME: 3, SM: 4
          switch (branch) {
            case "CSE":
              return item.id === 1;
            case "ECE":
              return item.id === 2;
            case "ME":
              return item.id === 3;
            case "SM":
              return item.id === 4;
            default:
              return null; // No matching branch found
          }
        });

        // Set the data to state, fallback to "NA" if not found
        setData({
          phone_number: branchData?.phone_number || "NA",
          email: branchData?.email || "NA",
          facilites: branchData?.facilites || "NA",
        });
      } catch (error) {
        console.error("Error fetching information data:", error);
      }
    };

    fetchData();
  }, [branch]); // Adding branch as a dependency

  return (
    <div
      style={{
        backgroundColor: "white",
        width: "800px",
        padding: "20px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "14px", color: "#000" }}>
          Phone Number: {data.phone_number}
        </p>
        <div
          style={{
            height: "1px",
            backgroundColor: "#000",
            width: "100%",
          }}
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "14px", color: "#000" }}>Email: {data.email}</p>
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
          Facilities Description: {data.facilites}
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

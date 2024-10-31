import React, { useEffect, useState } from "react";

export default function FacilitiesDescriptive() {
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

        // Assuming result is structured as an object with phone_number, email, and facilites fields
        setData({
          phone_number: result.phone_number || "NA",
          email: result.email || "NA",
          facilites: result.facilites || "NA",
        });
      } catch (error) {
        console.error("Error fetching information data:", error);
      }
    };

    fetchData();
  }, []);

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

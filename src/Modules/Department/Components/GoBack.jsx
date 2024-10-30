import React from "react";
import { useNavigate } from "react-router-dom";

const GoBackButton = ({ route }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(route)} // Navigate to the provided route
      style={{
        padding: "10px 15px",
        backgroundColor: "indigo",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginBottom: "20px",
      }}
    >
      Go Back
    </button>
  );
};

export default GoBackButton;

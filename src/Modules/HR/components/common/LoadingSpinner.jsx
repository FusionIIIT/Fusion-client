import React from "react";
import PropTypes from "prop-types";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;

LoadingSpinner.propTypes = {
  message: PropTypes.string,
};

import React from "react";
import PropTypes from "prop-types";

function LoadingSpinner({ message = "Loading..." }) {
  return <div>{message}</div>;
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
};

export default LoadingSpinner;

import { Alert } from "@mantine/core";
import PropTypes from "prop-types";

function AlertMessage({ title, message, color = "blue", onClose }) {
  return (
    <Alert
      title={title}
      color={color}
      withCloseButton
      onClose={onClose}
      mt="md"
    >
      {message}
    </Alert>
  );
}

AlertMessage.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  color: PropTypes.string,
  onClose: PropTypes.func,
};

export default AlertMessage;

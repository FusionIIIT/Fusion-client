import PropTypes from "prop-types";

function TextAreaField({ label, name, value, onChange, required = false }) {
  const inputId = name ? `field-${name}` : undefined;
  return (
    <div className="fusion-field">
      <label htmlFor={inputId} className="fusion-label">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      <textarea
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows="3"
        className="fusion-textarea"
      />
    </div>
  );
}

TextAreaField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
};

export default TextAreaField;

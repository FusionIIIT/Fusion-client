import PropTypes from "prop-types";

function TextAreaField({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
}) {
  const inputId = name ? `field-${name}` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
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
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`fusion-textarea${error ? " border-red-300" : ""}`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

TextAreaField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
};

export default TextAreaField;

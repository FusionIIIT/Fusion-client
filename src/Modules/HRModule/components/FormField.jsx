import PropTypes from "prop-types";

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  readOnly = false,
  step,
  placeholder,
  min,
  max,
  disabled = false,
  autoComplete,
  pattern,
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
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        step={step}
        placeholder={placeholder}
        min={min}
        max={max}
        disabled={disabled}
        autoComplete={autoComplete}
        pattern={pattern}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`fusion-input${error ? " border-red-300" : ""}`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string,
  pattern: PropTypes.string,
  error: PropTypes.string,
};

export default FormField;

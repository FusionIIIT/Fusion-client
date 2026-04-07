import { useState } from "react";
import PropTypes from "prop-types";

const PrescriptionForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    user_id: "",
    doctor_id: "",
    details: "",
    suggestions: "",
    test: "",
    is_dependent: false,
    dependent_name: "SELF",
    dependent_relation: "SELF",
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "is_dependent" && !checked
        ? { dependent_name: "SELF", dependent_relation: "SELF" }
        : {}),
    }));
  };

  const validate = () => {
    const errors = {};

    if (!formData.user_id) {
      errors.user_id = "Patient is required.";
    }

    if (formData.is_dependent) {
      if (!formData.dependent_name || formData.dependent_name === "SELF") {
        errors.dependent_name = "Dependent name is required.";
      }
      if (!formData.dependent_relation || formData.dependent_relation === "SELF") {
        errors.dependent_relation = "Dependent relation is required.";
      }
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="hc-error">{typeof error === "string" ? error : error.message}</div>}

      <div>
        <label htmlFor="patient-id">Patient ID *</label>
        <input id="patient-id" name="user_id" value={formData.user_id} onChange={handleChange} required />
        {validationErrors.user_id && <span className="hc-field-error">{validationErrors.user_id}</span>}
      </div>

      <div>
        <label htmlFor="doctor-id">Doctor ID</label>
        <input id="doctor-id" name="doctor_id" value={formData.doctor_id} onChange={handleChange} />
      </div>

      <div>
        <label htmlFor="prescription-details">Details</label>
        <textarea id="prescription-details" name="details" value={formData.details} onChange={handleChange} rows={3} />
      </div>

      <div>
        <label htmlFor="prescription-suggestions">Suggestions</label>
        <textarea id="prescription-suggestions" name="suggestions" value={formData.suggestions} onChange={handleChange} rows={2} />
      </div>

      <div>
        <label htmlFor="tests-recommended">Tests Recommended</label>
        <input id="tests-recommended" name="test" value={formData.test} onChange={handleChange} />
      </div>

      <div>
        <label htmlFor="prescription-dependent">
          <input
            id="prescription-dependent"
            type="checkbox"
            name="is_dependent"
            checked={formData.is_dependent}
            onChange={handleChange}
          />
          {" "}Prescription for Dependent
        </label>
      </div>

      {formData.is_dependent && (
        <>
          <div>
            <label htmlFor="dependent-name">Dependent Name *</label>
            <input
              id="dependent-name"
              name="dependent_name"
              value={formData.dependent_name === "SELF" ? "" : formData.dependent_name}
              onChange={handleChange}
              required
            />
            {validationErrors.dependent_name && (
              <span className="hc-field-error">{validationErrors.dependent_name}</span>
            )}
          </div>

          <div>
            <label htmlFor="dependent-relation">Dependent Relation *</label>
            <input
              id="dependent-relation"
              name="dependent_relation"
              value={
                formData.dependent_relation === "SELF" ? "" : formData.dependent_relation
              }
              onChange={handleChange}
              required
            />
            {validationErrors.dependent_relation && (
              <span className="hc-field-error">{validationErrors.dependent_relation}</span>
            )}
          </div>
        </>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Prescription"}
      </button>
    </form>
  );
};

PrescriptionForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
    }),
  ]),
};

PrescriptionForm.defaultProps = {
  loading: false,
  error: null,
};

export default PrescriptionForm;

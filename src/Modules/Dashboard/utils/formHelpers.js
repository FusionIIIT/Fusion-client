import { useState } from "react";

export const useFormState = (initialState) => {
  const [formData, setFormData] = useState(initialState);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    handleFieldChange(name, value);
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  return { formData, setFormData, handleFieldChange, handleInputChange, resetForm };
};

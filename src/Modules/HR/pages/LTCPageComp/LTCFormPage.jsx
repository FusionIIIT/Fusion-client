import React from "react";
import LTCForm from "../../components/forms/LTCForm";
import { createLtcForm } from "../../services/api";

function LtcFormPage() {
  const handleSubmit = async (formData) => {
    try {
      await createLtcForm(formData);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Submission failed");
    }
  };

  return <LTCForm onSubmit={handleSubmit} />;
}

export default LtcFormPage;

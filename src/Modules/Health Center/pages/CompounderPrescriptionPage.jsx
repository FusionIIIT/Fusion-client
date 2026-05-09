import { useEffect, useState } from "react";

import PrescriptionForm from "../components/forms/PrescriptionForm";
import PrescriptionTable from "../components/tables/PrescriptionTable";
import { handleApiCall } from "../utils/apiErrorHandler";
import { createPrescriptionApi, getPrescriptionsApi } from "../services/api";

const CompounderPrescriptionPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadPrescriptions = async () => {
    setFetchLoading(true);
    const result = await handleApiCall(getPrescriptionsApi(), "Failed to fetch prescriptions");
    if (result.success) {
      setPrescriptions(result.data || []);
    }
    setFetchLoading(false);
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const handleCreate = async (formData) => {
    setSubmitLoading(true);
    setSubmitError(null);

    const result = await handleApiCall(
      createPrescriptionApi(formData),
      "Failed to create prescription",
    );

    if (result.success) {
      await loadPrescriptions();
    } else {
      setSubmitError(result.error);
    }

    setSubmitLoading(false);
  };

  return (
    <div>
      <h2>Create Prescription</h2>
      <PrescriptionForm
        onSubmit={handleCreate}
        loading={submitLoading}
        error={submitError}
      />

      <h2>Prescription History</h2>
      {fetchLoading ? <p>Loading...</p> : <PrescriptionTable prescriptions={prescriptions} />}
    </div>
  );
};

export default CompounderPrescriptionPage;

import { useState } from "react";

import { createFollowupPrescriptionApi } from "../../services/api";

const FollowUpPrescriptionForm = ({ prescriptionId, previousMedicines = [], onCreated }) => {
  const [formData, setFormData] = useState({
    details: "",
    suggestions: "",
    test: "",
    doctor_id: "",
  });
  const [revokeIds, setRevokeIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const toggleRevoke = (medicineId) => {
    setRevokeIds((prev) =>
      prev.includes(medicineId)
        ? prev.filter((id) => id !== medicineId)
        : [...prev, medicineId],
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createFollowupPrescriptionApi(prescriptionId, {
        ...formData,
        revoke_medicine_ids: revokeIds,
      });
      if (onCreated) {
        onCreated();
      }
    } catch (err) {
      setError(err?.response?.data || "Failed to create follow-up");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h3>Create Follow-up Prescription</h3>
      {error ? <p>{JSON.stringify(error)}</p> : null}

      <input
        name="doctor_id"
        value={formData.doctor_id}
        onChange={(e) => setFormData((prev) => ({ ...prev, doctor_id: e.target.value }))}
        placeholder="Doctor ID"
      />
      <textarea
        name="details"
        value={formData.details}
        onChange={(e) => setFormData((prev) => ({ ...prev, details: e.target.value }))}
        placeholder="Details"
      />
      <textarea
        name="suggestions"
        value={formData.suggestions}
        onChange={(e) => setFormData((prev) => ({ ...prev, suggestions: e.target.value }))}
        placeholder="Suggestions"
      />
      <input
        name="test"
        value={formData.test}
        onChange={(e) => setFormData((prev) => ({ ...prev, test: e.target.value }))}
        placeholder="Tests"
      />

      <h4>Revoke Previous Medicines</h4>
      {previousMedicines.length === 0 ? <p>No previous medicines.</p> : null}
      {previousMedicines.map((med) => (
        <label key={med.medicine_id} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={revokeIds.includes(med.medicine_id)}
            onChange={() => toggleRevoke(med.medicine_id)}
          />
          {` ${med.medicine_name || med.medicine_id}`}
        </label>
      ))}

      <button type="submit" disabled={saving || !prescriptionId}>
        {saving ? "Creating..." : "Create Follow-up"}
      </button>
    </form>
  );
};

export default FollowUpPrescriptionForm;

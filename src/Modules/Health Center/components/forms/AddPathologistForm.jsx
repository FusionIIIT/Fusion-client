import { useState } from "react";

import { addPathologistApi } from "../../services/api";

const AddPathologistForm = ({ onSaved }) => {
  const [formData, setFormData] = useState({
    pathologist_name: "",
    pathologist_phone: "",
    specialization: "",
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await addPathologistApi(formData);
      setFormData({ pathologist_name: "", pathologist_phone: "", specialization: "" });
      if (onSaved) {
        onSaved();
      }
    } catch (err) {
      setError(err?.response?.data || "Failed to add pathologist");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h3>Add Pathologist</h3>
      {error ? <p>{JSON.stringify(error)}</p> : null}
      <input name="pathologist_name" value={formData.pathologist_name} onChange={onChange} placeholder="Name" required />
      <input name="pathologist_phone" value={formData.pathologist_phone} onChange={onChange} placeholder="Phone" required />
      <input name="specialization" value={formData.specialization} onChange={onChange} placeholder="Specialization" required />
      <button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Pathologist"}</button>
    </form>
  );
};

export default AddPathologistForm;

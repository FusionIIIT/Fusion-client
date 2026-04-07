import { useState } from "react";

import { addPathologistScheduleApi } from "../../services/api";

const PathologistScheduleForm = ({ onSaved }) => {
  const [formData, setFormData] = useState({
    pathologist_id: "",
    day: 0,
    from_time: "09:00",
    to_time: "12:00",
    room: 101,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await addPathologistScheduleApi({
        ...formData,
        day: Number(formData.day),
        room: Number(formData.room),
      });
      if (onSaved) {
        onSaved();
      }
    } catch (err) {
      setError(err?.response?.data || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h3>Create Pathologist Schedule</h3>
      {error ? <p>{JSON.stringify(error)}</p> : null}
      <input name="pathologist_id" value={formData.pathologist_id} onChange={onChange} placeholder="Pathologist ID" required />
      <input name="day" type="number" min="0" max="6" value={formData.day} onChange={onChange} required />
      <input name="from_time" type="time" value={formData.from_time} onChange={onChange} required />
      <input name="to_time" type="time" value={formData.to_time} onChange={onChange} required />
      <input name="room" type="number" value={formData.room} onChange={onChange} required />
      <button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Schedule"}</button>
    </form>
  );
};

export default PathologistScheduleForm;

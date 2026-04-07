import { useState } from "react";

import { createAnnouncementApi } from "../../services/api";

const AnnouncementForm = ({ onPublished }) => {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createAnnouncementApi({ message });
      setMessage("");
      if (onPublished) {
        onPublished();
      }
    } catch (err) {
      setError(err?.response?.data || "Failed to publish announcement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h3>Publish Announcement</h3>
      {error ? <p>{JSON.stringify(error)}</p> : null}
      <textarea value={message} maxLength={200} onChange={(e) => setMessage(e.target.value)} placeholder="Announcement" required />
      <button type="submit" disabled={saving}>{saving ? "Publishing..." : "Publish"}</button>
    </form>
  );
};

export default AnnouncementForm;

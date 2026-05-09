import { useEffect, useState } from "react";

import AnnouncementForm from "../components/forms/AnnouncementForm";
import AnnouncementList from "../components/tables/AnnouncementList";
import { getAnnouncementsApi } from "../services/api";

const AnnouncementsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await getAnnouncementsApi();
      setItems(response.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  return (
    <div>
      <AnnouncementForm onPublished={loadAnnouncements} />
      {loading ? <p>Loading...</p> : <AnnouncementList announcements={items} />}
    </div>
  );
};

export default AnnouncementsPage;

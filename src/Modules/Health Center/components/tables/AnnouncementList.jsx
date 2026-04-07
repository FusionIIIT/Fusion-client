const AnnouncementList = ({ announcements }) => {
  if (!announcements || announcements.length === 0) {
    return <p>No announcements found.</p>;
  }

  return (
    <table className="hc-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Message</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {announcements.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.message}</td>
            <td>{item.ann_date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AnnouncementList;

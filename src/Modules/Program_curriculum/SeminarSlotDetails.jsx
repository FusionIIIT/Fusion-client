import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import styles from "./CourseSlotDetails.module.css";
import axios from "axios";
import { fetchSeminarSlotData } from "./api/api";
import { host } from "../../routes/globalRoutes";
import ConfirmDialog from "../../components/ConfirmDialog";

function SeminarSlotDetails() {
  const [seminarSlot, setSeminarSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const seminarSlotId = searchParams.get("seminar_slot");
  const curriculumId = searchParams.get("curriculum");
  const semesterId = searchParams.get("semester");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSeminarSlotData(seminarSlotId);
        setSeminarSlot(data);
      } catch (err) {
        console.error("Error loading seminar slot data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [seminarSlotId]);

  const handleDeleteSeminarSlot = async () => {
    try {
      const cacheChangeKey = `CurriculumCacheChange_${curriculumId}`;
      localStorage.setItem(cacheChangeKey, "true");
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(
        `${host}/programme_curriculum/api/admin_delete_seminar_slot/${seminarSlotId}/`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (response.status === 200) {
        alert("Seminar slot deleted successfully!");
        navigate(
          `/programme_curriculum/view_curriculum?curriculum=${curriculumId}`,
        );
      }
    } catch (error) {
      console.error("Error deleting seminar slot:", error);
      alert("Failed to delete seminar slot.");
    } finally {
      setShowModal(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!seminarSlot) return <div className="loading">Loading...</div>;

  const slot = seminarSlot.seminar_slot;

  return (
    <div className="flex-container">
      <div style={{ display: "flex" }}>
        <div className={styles["course-slot-container"]}>
          <div className={styles["course-slot-content"]}>
            <div className={styles["slot-description"]}>
              <table className={styles["course-info-table"]}>
                <tbody>
                  <tr>
                    <td colSpan="4">
                      <h2>Seminar Slot: {slot.name}</h2>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="4">
                      <h3>
                        Semester: {slot.curriculum.name} v
                        {slot.curriculum.version}, sem-
                        {slot.curriculum.semester_no}
                      </h3>
                    </td>
                  </tr>
                  <tr className={styles["course-slot-row"]}>
                    <td>Info</td>
                    <td colSpan="3">
                      {slot.seminar_slot_info || "-"}
                    </td>
                  </tr>
                  <tr className={styles["course-slot-row"]}>
                    <td>Duration</td>
                    <td colSpan="3">{slot.duration} Semesters</td>
                  </tr>
                  <tr className={styles["course-slot-row"]}>
                    <td>Min Registration Limit</td>
                    <td>{slot.min_registration_limit}</td>
                    <td>Max Registration Limit</td>
                    <td>{slot.max_registration_limit}</td>
                  </tr>
                </tbody>
              </table>

              {slot.seminars.length > 0 ? (
                <table className={styles["course-list-table"]}>
                  <thead>
                    <tr className={styles["table-header"]}>
                      <td>Seminar Code</td>
                      <td>Seminar Name</td>
                      <td>Credits</td>
                    </tr>
                  </thead>
                  <tbody>
                    {slot.seminars.map((seminar) => (
                      <tr key={seminar.id} style={{ textAlign: "center" }}>
                        <td>
                          <Link
                            to={`/programme_curriculum/admin_course/${seminar.id}`}
                            style={{ textDecoration: "none" }}
                          >
                            {seminar.code}
                          </Link>
                        </td>
                        <td>{seminar.name}</td>
                        <td>{seminar.credit}</td>
                        <td>
                          <Link
                            to={`/programme_curriculum/admin_edit_seminar_form/${seminar.id}`}
                            className={styles["edit-btn"]}
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles["no-courses"]}>
                  No Seminars Available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="button-container">
          <Link
            to={`/programme_curriculum/admin_edit_seminar_slot_form/${seminarSlotId}`}
            className={styles["edit-course-slot-btn"]}
          >
            Edit Seminar Slot
          </Link>
          <button
            className={styles["remove-course-slot-btn"]}
            onClick={() => setShowModal(true)}
          >
            Remove Seminar Slot
          </button>
          <Link
            to={`/programme_curriculum/acad_admin_add_seminar_slot_form?semester=${semesterId}&curriculum=${curriculumId}`}
            className={styles["add-course-slot-btn"]}
          >
            Add Seminar Slot
          </Link>
        </div>
      </div>

      <ConfirmDialog
        opened={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={handleDeleteSeminarSlot}
        message="Are you sure you want to remove this seminar slot?"
      />
    </div>
  );
}

export default SeminarSlotDetails;

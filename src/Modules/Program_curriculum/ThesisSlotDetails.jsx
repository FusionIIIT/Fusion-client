import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import styles from "./CourseSlotDetails.module.css";
import axios from "axios";
import { fetchThesisSlotData } from "./api/api";
import { host } from "../../routes/globalRoutes";
import ConfirmDialog from "../../components/ConfirmDialog";

function ThesisSlotDetails() {
  const [thesisSlot, setThesisSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const thesisSlotId = searchParams.get("thesis_slot");
  const curriculumId = searchParams.get("curriculum");
  const semesterId = searchParams.get("semester");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchThesisSlotData(thesisSlotId);
        setThesisSlot(data);
      } catch (err) {
        console.error("Error loading thesis slot data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [thesisSlotId]);

  const handleDeleteThesisSlot = async () => {
    try {
      const cacheChangeKey = `CurriculumCacheChange_${curriculumId}`;
      localStorage.setItem(cacheChangeKey, "true");
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(
        `${host}/programme_curriculum/api/admin_delete_thesis_slot/${thesisSlotId}/`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (response.status === 200) {
        alert("Thesis slot deleted successfully!");
        navigate(
          `/programme_curriculum/view_curriculum?curriculum=${curriculumId}`,
        );
      }
    } catch (error) {
      console.error("Error deleting thesis slot:", error);
      alert("Failed to delete thesis slot.");
    } finally {
      setShowModal(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!thesisSlot) return <div className="loading">Loading...</div>;

  const slot = thesisSlot.thesis_slot;

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
                      <h2>Thesis Slot: {slot.name}</h2>
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
                      {slot.thesis_slot_info || "-"}
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

              {slot.theses.length > 0 ? (
                <table className={styles["course-list-table"]}>
                  <thead>
                    <tr className={styles["table-header"]}>
                      <td>Thesis Code</td>
                      <td>Thesis Name</td>
                      <td>Credits</td>
                    </tr>
                  </thead>
                  <tbody>
                    {slot.theses.map((thesis) => (
                      <tr key={thesis.id} style={{ textAlign: "center" }}>
                        <td>
                          <Link
                            to={`/programme_curriculum/admin_course/${thesis.id}`}
                            style={{ textDecoration: "none" }}
                          >
                            {thesis.code}
                          </Link>
                        </td>
                        <td>{thesis.name}</td>
                        <td>{thesis.credit}</td>
                        <td>
                          <Link
                            to={`/programme_curriculum/admin_edit_thesis_form/${thesis.id}`}
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
                <div className={styles["no-courses"]}>No Theses Available</div>
              )}
            </div>
          </div>
        </div>

        <div className="button-container">
          <Link
            to={`/programme_curriculum/admin_edit_thesis_slot_form/${thesisSlotId}`}
            className={styles["edit-course-slot-btn"]}
          >
            Edit Thesis Slot
          </Link>
          <button
            className={styles["remove-course-slot-btn"]}
            onClick={() => setShowModal(true)}
          >
            Remove Thesis Slot
          </button>
          <Link
            to={`/programme_curriculum/acad_admin_add_thesis_slot_form?semester=${semesterId}&curriculum=${curriculumId}`}
            className={styles["add-course-slot-btn"]}
          >
            Add Thesis Slot
          </Link>
        </div>
      </div>

      <ConfirmDialog
        opened={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={handleDeleteThesisSlot}
        message="Are you sure you want to remove this thesis slot?"
      />
    </div>
  );
}

export default ThesisSlotDetails;

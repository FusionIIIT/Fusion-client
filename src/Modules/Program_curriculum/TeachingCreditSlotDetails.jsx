import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import styles from "./CourseSlotDetails.module.css";
import axios from "axios";
import { fetchTeachingCreditSlotData } from "./api/api";
import { host } from "../../routes/globalRoutes";
import ConfirmDialog from "../../components/ConfirmDialog";

function TeachingCreditSlotDetails() {
  const [tcSlot, setTcSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const tcSlotId = searchParams.get("tc_slot");
  const curriculumId = searchParams.get("curriculum");
  const semesterId = searchParams.get("semester");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTeachingCreditSlotData(tcSlotId);
        setTcSlot(data);
      } catch (err) {
        console.error("Error loading teaching credit slot data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tcSlotId]);

  const handleDeleteTCSlot = async () => {
    try {
      const cacheChangeKey = `CurriculumCacheChange_${curriculumId}`;
      localStorage.setItem(cacheChangeKey, "true");
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(
        `${host}/programme_curriculum/api/admin_delete_teaching_credit_slot/${tcSlotId}/`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (response.status === 200) {
        alert("Teaching credit slot deleted successfully!");
        navigate(
          `/programme_curriculum/view_curriculum?curriculum=${curriculumId}`,
        );
      }
    } catch (error) {
      console.error("Error deleting teaching credit slot:", error);
      alert("Failed to delete teaching credit slot.");
    } finally {
      setShowModal(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!tcSlot) return <div className="loading">Loading...</div>;

  const slot = tcSlot.teaching_credit_slot;

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
                      <h2>Teaching Credit Slot: {slot.name}</h2>
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
                      {slot.teaching_credit_slot_info || "-"}
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

              {slot.teaching_credits.length > 0 ? (
                <table className={styles["course-list-table"]}>
                  <thead>
                    <tr className={styles["table-header"]}>
                      <td>Teaching Credit Code</td>
                      <td>Teaching Credit Name</td>
                      <td>Credits</td>
                    </tr>
                  </thead>
                  <tbody>
                    {slot.teaching_credits.map((tc) => (
                      <tr key={tc.id} style={{ textAlign: "center" }}>
                        <td>
                          <Link
                            to={`/programme_curriculum/admin_course/${tc.id}`}
                            style={{ textDecoration: "none" }}
                          >
                            {tc.code}
                          </Link>
                        </td>
                        <td>{tc.name}</td>
                        <td>{tc.credit}</td>
                        <td>
                          <Link
                            to={`/programme_curriculum/admin_edit_teaching_credit_form/${tc.id}`}
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
                  No Teaching Credits Available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="button-container">
          <Link
            to={`/programme_curriculum/admin_edit_teaching_credit_slot_form/${tcSlotId}`}
            className={styles["edit-course-slot-btn"]}
          >
            Edit Teaching Credit Slot
          </Link>
          <button
            className={styles["remove-course-slot-btn"]}
            onClick={() => setShowModal(true)}
          >
            Remove Teaching Credit Slot
          </button>
          <Link
            to={`/programme_curriculum/acad_admin_add_teaching_credit_slot_form?semester=${semesterId}&curriculum=${curriculumId}`}
            className={styles["add-course-slot-btn"]}
          >
            Add Teaching Credit Slot
          </Link>
        </div>
      </div>

      <ConfirmDialog
        opened={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={handleDeleteTCSlot}
        message="Are you sure you want to remove this teaching credit slot?"
      />
    </div>
  );
}

export default TeachingCreditSlotDetails;

/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState } from "react";
import styles from "./ScholarshipStatusPage.module.css"; // Import CSS module
import ScholarshipStatus from "../components/ScholarshipStatus";
import UserBreadcumbs from "../components/UserBreadcumbs";

function ScholarStatusPage() {
  const [desc, setDesc] = useState(1);

  const changeDesc = (event) => {
    setDesc(parseInt(event.target.value, 10)); // Ensure the value is an integer
  };

  return (
    <>
      {/* <UserBreadcumbs /> */}
      <div className={styles.pageContainer}>
        <div className={styles.gridContainer}>
          <button onClick={changeDesc} value={1}>
            View Application Status
          </button>
        </div>
        <div className={styles.progressBarContainer}>
          <button
            onClick={changeDesc}
            value={1}
            className={`${styles.progressButton} ${desc == 1 ? styles.active : styles.inactive}`}
          />
        </div>
        {/* Removed the horizontal line here */}
        {desc == 1 && <ScholarshipStatus />}
      </div>
    </>
  );
}

export default ScholarStatusPage;

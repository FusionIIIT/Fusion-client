import ConvocationMedal from "../../Convocation/ConvocationMedal";
import ScholarshipForm from "../../MCM_Application/ScholarshipForm";
import styles from "./BrowseApplication.module.css";
import React, { useState } from "react";


const BrowseApplicationPage = () => {
    const [desc, setDesc] = useState(1);

    const changeDesc = (event) => {
      setDesc(parseInt(event.target.value, 10));
    };
  
    return (
      <>
        <div className={styles.wrapper}>
          <div className={styles.buttonContainer}>
            <button onClick={changeDesc} value={1} className={styles.button}>
            Merit-cum-Means Scholarship
            </button>
            <button onClick={changeDesc} value={2} className={styles.button}>
            Convocation Medals
            </button>
          </div>
  
          <div className={styles.progressBar}>
            <button
              onClick={changeDesc}
              value={1}
              className={`${styles.progressButton} ${desc === 1 ? styles.activeProgress : styles.inactiveProgress}`}
            />
            <button
              onClick={changeDesc}
              value={2}
              className={`${styles.progressButton} ${desc === 2 ? styles.activeProgress : styles.inactiveProgress}`}
            />
          </div>
  
          <hr className={styles.hr} />
  
          {desc === 1 && <ScholarshipForm></ScholarshipForm>}
          {desc === 2 && <ConvocationMedal></ConvocationMedal>}
        </div>
      </>
    );
}

export default BrowseApplicationPage;
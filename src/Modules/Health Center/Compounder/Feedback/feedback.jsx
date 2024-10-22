import React, { useEffect, useState } from "react";
import NavCom from "../NavCom";

function FeedbackTable() {
  const [feedbackData, setFeedbackData] = useState([]);

  const dummyData = [
    { rollNo: "22BCS219", feedback: "NA" },
    { rollNo: "22BCS220", feedback: "Good job!" },
    { rollNo: "22BCS221", feedback: "Needs improvement." },
  ];

  const fetchFeedback = () => {
    setFeedbackData(dummyData);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  };

  const thStyle = {
    backgroundColor: "#6D28D9",
    color: "white",
    padding: "10px",
    textAlign: "left",
  };

  const tdStyle = {
    border: "1px solid #6A5ACD",
    padding: "10px",
  };

  return (
    <div>
      <NavCom />

      <div style={{ padding: "20px" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Feedback By</th>
              <th style={thStyle}>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {feedbackData.map((item, index) => (
              <tr
                key={item.rollNo} // Use rollNo as a unique key
                style={{
                  backgroundColor: index % 2 === 0 ? "#ede9fe" : "#faf5ff",
                }}
              >
                <td style={tdStyle}>{item.rollNo}</td>
                <td style={tdStyle}>{item.feedback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FeedbackTable;

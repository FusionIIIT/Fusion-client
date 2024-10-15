import NavCom from "../NavCom";

function Application() {
  const dummyTitle = "Atul's Medical Relief Application";
  const dummyDescription = "Atul's medical relief application for fever.";
  const dummyComments = "Please review the attached document for details.";

  return (
    <>
      <NavCom />

      <div style={{ margin: "2rem" }}>
        <h2>{dummyTitle}</h2>

        <div style={{ marginBottom: "1rem" }}>
          <p style={{ marginBottom: "2px" }}>Description</p>
          <textarea
            style={{
              width: "100%",
              height: "100px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              resize: "none",
            }}
            readOnly
            value={dummyDescription}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <p style={{ marginBottom: "2px" }}>File</p>
          <button
            style={{
              padding: "10px 40px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            View File
          </button>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <p style={{ marginBottom: "2px" }}>Comment</p>
          <textarea
            style={{
              width: "100%",
              height: "80px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              resize: "none",
            }}
            readOnly
            value={dummyComments}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            style={{
              padding: "10px 40px",
              backgroundColor: "#10B981",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Forward
          </button>

          <button
            style={{
              padding: "10px 40px",
              backgroundColor: "#EF4444",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </>
  );
}

export default Application;

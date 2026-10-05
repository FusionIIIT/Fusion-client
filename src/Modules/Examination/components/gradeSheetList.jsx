import { useState } from "react";
import { Table, Button, Group, Modal, Alert } from "@mantine/core";
import { IconEye, IconDownload, IconAlertTriangle } from "@tabler/icons-react";
import axios from "axios";
import { generate_full_gradesheet_data } from "../routes/examinationRoutes";
import { buildFullGradeSheetHTML } from "./gradeSheetTemplate";
import { saveGradeSheetPDF } from "./gradeSheetPdf";
import styles from "../styles/transcript.module.css";

export default function GradeSheetList({ students }) {
  const [busy, setBusy] = useState({});
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState({ open: false, html: "", title: "" });

  const setRowBusy = (roll, v) => setBusy((p) => ({ ...p, [roll]: v }));

  const fetchFullGradeSheetHtml = async (rollNo) => {
    const token = localStorage.getItem("authToken");
    const { data } = await axios.post(
      generate_full_gradesheet_data,
      { student: rollNo },
      { headers: { Authorization: `Token ${token}` } },
    );
    if (!data.semesters || data.semesters.length === 0) {
      throw new Error("No graded semesters found for this student.");
    }
    return buildFullGradeSheetHTML(data.student_info, data.semesters);
  };

  const handlePreview = async (student) => {
    setRowBusy(student.id_id, "preview");
    setError(null);
    try {
      const html = await fetchFullGradeSheetHtml(student.id_id);
      setPreview({ open: true, html, title: `Grade Sheet — ${student.id_id}` });
    } catch (err) {
      setError(err.message || "Failed to load grade sheet.");
    } finally {
      setRowBusy(student.id_id, null);
    }
  };

  const handleDownload = async (student) => {
    setRowBusy(student.id_id, "download");
    setError(null);
    try {
      const html = await fetchFullGradeSheetHtml(student.id_id);
      await saveGradeSheetPDF(html, `GradeSheet_${student.id_id}.pdf`);
    } catch (err) {
      setError(err.message || "Failed to download grade sheet.");
    } finally {
      setRowBusy(student.id_id, null);
    }
  };

  return (
    <div className={styles["transcript-container"]}>
      {error && (
        <Alert
          color="red"
          icon={<IconAlertTriangle size={16} />}
          mb="md"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      {students.length > 0 ? (
        <Table
          striped
          highlightOnHover
          captionSide="top"
          mt="md"
          className={styles["transcript-table"]}
        >
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Programme</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id_id} className={styles["table-row"]}>
                <td className={styles["table-cell"]}>{student.id_id}</td>
                <td className={styles["table-cell"]}>{student.programme}</td>
                <td style={{ textAlign: "center" }}>
                  <Group gap="xs" justify="center">
                    <Button
                      size="xs"
                      color="blue"
                      leftSection={<IconEye size={14} />}
                      onClick={() => handlePreview(student)}
                      loading={busy[student.id_id] === "preview"}
                    >
                      Preview
                    </Button>
                    <Button
                      size="xs"
                      color="teal"
                      variant="outline"
                      leftSection={<IconDownload size={14} />}
                      onClick={() => handleDownload(student)}
                      loading={busy[student.id_id] === "download"}
                    >
                      Download
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="no-data">No students found for this batch.</div>
      )}

      <Modal
        opened={preview.open}
        onClose={() => setPreview((p) => ({ ...p, open: false }))}
        title={preview.title}
        size="90%"
      >
        <iframe
          title="Grade sheet preview"
          srcDoc={preview.html}
          style={{ width: "100%", height: "80vh", border: "1px solid #ddd" }}
        />
      </Modal>
    </div>
  );
}

import React, { useState } from "react";
import { Button, Checkbox, Group, Text, Title } from "@mantine/core";
import jsPDF from "jspdf";

function DownloadCV() {
  const [fields, setFields] = useState({
    achievements: true,
    education: true,
    skills: true,
    references: true,
    conferences: true,
    patents: true,
  });

  const handleDownload = () => {
    /* eslint-disable new-cap */
    const doc = new jsPDF();
    /* eslint-enable new-cap */

    // Add the CV content dynamically based on selected fields
    doc.setFontSize(16);
    doc.text("Student CV", 10, 10);

    if (fields.education) {
      doc.setFontSize(12);
      doc.text("Education", 10, 30);
      doc.text(
        "IIIT Jabalpur, B. Tech, Computer Science and Engineering",
        10,
        40,
      );
    }

    if (fields.achievements) {
      doc.text("Achievements", 10, 60);
      doc.text("- Won XYZ Hackathon 2023", 10, 70);
    }

    if (fields.skills) {
      doc.text("Skills", 10, 90);
      doc.text("- JavaScript, React, Node.js", 10, 100);
    }

    // Add other sections similarly based on the fields selected
    // You can customize this with actual student data

    doc.save("student_cv.pdf");
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title order={2}>Download your CV</Title>

      <Text>Select the fields to be added</Text>
      <Group mt="md">
        <Checkbox
          label="Achievements"
          checked={fields.achievements}
          onChange={(event) =>
            setFields({ ...fields, achievements: event.currentTarget.checked })
          }
        />
        <Checkbox
          label="Education"
          checked={fields.education}
          onChange={(event) =>
            setFields({ ...fields, education: event.currentTarget.checked })
          }
        />
        <Checkbox
          label="Skills"
          checked={fields.skills}
          onChange={(event) =>
            setFields({ ...fields, skills: event.currentTarget.checked })
          }
        />
        <Checkbox
          label="References"
          checked={fields.references}
          onChange={(event) =>
            setFields({ ...fields, references: event.currentTarget.checked })
          }
        />
        <Checkbox
          label="Conferences"
          checked={fields.conferences}
          onChange={(event) =>
            setFields({ ...fields, conferences: event.currentTarget.checked })
          }
        />
        <Checkbox
          label="Patents"
          checked={fields.patents}
          onChange={(event) =>
            setFields({ ...fields, patents: event.currentTarget.checked })
          }
        />
      </Group>

      {/* CV Preview Section */}
      <div style={{ marginTop: "30px" }}>
        <Title order={4}>Preview</Title>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            marginTop: "10px",
          }}
        >
          <Text>Email: student@example.com</Text>
          <Text>I am [Student Name]</Text>

          {fields.education && (
            <>
              <Title order={5}>Education</Title>
              <Text>IIIT Jabalpur, B. Tech, Computer Science Engineering</Text>
            </>
          )}

          {fields.achievements && (
            <>
              <Title order={5}>Achievements</Title>
              <Text>• Won XYZ Hackathon 2023</Text>
            </>
          )}

          {fields.skills && (
            <>
              <Title order={5}>Skills</Title>
              <Text>• JavaScript, React, Node.js</Text>
            </>
          )}

          {/* Other fields... */}
        </div>
      </div>

      {/* Download Button */}
      <Button mt="md" onClick={handleDownload}>
        Download
      </Button>
    </div>
  );
}

export default DownloadCV;

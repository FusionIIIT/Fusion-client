import React, { useState } from "react";
import { Card, Text, Image, Textarea, Button, FileButton } from "@mantine/core";
import "./Announcement.css";
import AvatarImage from "../../../../assets/avatar.png";

function Announcement() {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (files) => {
    if (files.length > 0) {
      setFileName(files[0].name);
    } else {
      setFileName("");
    }
  };

  return (
    <div className="announcementWrapper">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        className="cardContainer"
      >
        <Card.Section>
          <div className="announcementHeader">
            <Image
              src={AvatarImage}
              alt="Instructor"
              width={80}
              height={80}
              radius="50%"
              className="profileImage"
            />
            <div className="announcementInfo">
              <Text className="fusionText">Prof. Atul Gupta</Text>
              <Text style={{ color: "grey", opacity: 0.6 }} size="sm">
                1 Month, 1 Week ago
              </Text>
              <Text style={{ cursor: "pointer" }}>Welcome to the course!</Text>
            </div>
          </div>
        </Card.Section>

        <Card.Section style={{ padding: "1rem" }}>
          <Textarea
            placeholder="Text"
            label="Enter your Announcement:"
            autosize
            minRows={8}
            styles={{
              label: {
                fontSize: "1.15rem",
                fontWeight: 500,
              },
            }}
          />
          <FileButton onChange={handleFileChange} accept="*">
            {({ onClick, disabled }) => (
              <button
                type="button"
                onClick={onClick}
                className={`fileButton ${disabled ? "disabled" : ""}`}
                disabled={disabled}
                aria-label={
                  fileName ? `File attached: ${fileName}` : "Attach files"
                }
              >
                <span className="fileIcon">📎</span>
                <span>{fileName || "Attach Files"}</span>
              </button>
            )}
          </FileButton>
          <Button
            className="customButton"
            style={{ marginTop: "1rem", backgroundColor: "#15abff" }}
          >
            Submit
          </Button>
        </Card.Section>
      </Card>
    </div>
  );
}

export default Announcement;

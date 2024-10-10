import React, { useState } from "react";
import { Group, Text, Box, Container } from "@mantine/core";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import NoticeBoard from "./all-actors/NoticeBoard";
import Complaints from "./students/Complaints";

const sections = [
  "Notice Board",
  "My Fine",
  "Leave",
  "Guest Room",
  "Complaint",
  "Students Alloted rooms",
];
const subSections = {
  Leave: ["Leave Form", "Leave Status"],
};

// Create a map of components for each section
const sectionComponents = {
  "Notice Board": NoticeBoard,
  Complaint: Complaints,
  // Add other components here for different sections if needed
  // 'My Fine': MyFineComponent,
  // 'Leave': LeaveComponent,
  // etc.
};

export default function SectionNavigation() {
  const [activeSection, setActiveSection] = useState("Notice Board");

  // Get the component for the active section
  const ActiveComponent = sectionComponents[activeSection];

  return (
    <Container size="xl" p="xs">
      <Group
        spacing="xs"
        style={{ overflowX: "auto", padding: "8px 0" }}
      >
        <CaretLeft size={20} weight="bold" color="#718096" />
        {sections.map((section, index) => (
          <React.Fragment key={section}>
            <Text
              size="sm"
              color={activeSection === section ? "#4299E1" : "#718096"}
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </Text>
            {index < sections.length - 1 && (
              <Text color="#CBD5E0" size="sm">
                |
              </Text>
            )}
          </React.Fragment>
        ))}
        <CaretRight size={20} weight="bold" color="#718096" />
      </Group>

      {subSections[activeSection] && (
        <Group spacing="xs" mt="xs">
          {subSections[activeSection].map((subSection, index) => (
            <React.Fragment key={subSection}>
              <Text
                size="sm"
                color="#4299E1"
                style={{ cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {subSection}
              </Text>
              {index < subSections[activeSection].length - 1 && (
                <Text color="#CBD5E0" size="sm">
                  |
                </Text>
              )}
            </React.Fragment>
          ))}
        </Group>
      )}

        <br />
        {ActiveComponent ? (
          <Box style={{ width: "100%", height: "calc(85vh - 56px)", overflowY: "auto" }}>
            <ActiveComponent />
          </Box>
        ) : (
          <Text>Content for {activeSection}</Text>
        )}

    </Container>
  );
}

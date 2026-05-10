import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Card, Button, Text, Box, Center, ThemeIcon } from "@mantine/core";
import { ArrowRight, FileText } from "@phosphor-icons/react";
import "../../../style/Applicant/ApplicationDraft.css";

// Empty state component
function EmptyDraftsState({ onStartNew }) {
  return (
    <Card id="patent-system-saved-draft-card">
      <Center style={{ flexDirection: "column", padding: "14px 12px" }}>
        <ThemeIcon
          size="lg"
          radius="xl"
          variant="light"
          color="blue"
          style={{ marginBottom: 10 }}
        >
          <FileText size={20} />
        </ThemeIcon>
        <Text size="lg" weight={600} align="center" style={{ marginBottom: 6 }}>
          No Drafts Available
        </Text>
        <Text size="xs" align="center" style={{ marginBottom: 6 }}>
          You haven't saved any patent application drafts yet.
        </Text>
        <Button
          variant="outline"
          leftIcon={<ArrowRight size={14} />}
          onClick={onStartNew}
          size="sm"
          style={{ width: "100%" }}
        >
          Start New Application
        </Button>
      </Center>
    </Card>
  );
}

EmptyDraftsState.propTypes = {
  onStartNew: PropTypes.func.isRequired,
};

// Main component
function SavedDraftsPage({ setActiveTab }) {
  const [drafts, setDrafts] = useState([]);

  const loadDrafts = () => {
    const parsedDrafts = JSON.parse(
      localStorage.getItem("savedDrafts") || "[]",
    );
    if (!Array.isArray(parsedDrafts)) {
      setDrafts([]);
      return;
    }

    const normalizedDrafts = parsedDrafts.map((draft, index) => ({
      ...draft,
      id: draft.id || Date.now() + index,
      createdAt: draft.createdAt || new Date().toISOString(),
    }));

    setDrafts(normalizedDrafts);
    localStorage.setItem("savedDrafts", JSON.stringify(normalizedDrafts));
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleDeleteDraft = (draftId) => {
    const updatedDrafts = drafts.filter((draft) => draft.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts));
  };

  const handleContinueEditing = (draft) => {
    localStorage.removeItem("patentEditContext");
    localStorage.removeItem("patentEditOriginApplicationId");
    localStorage.setItem("patentDraftContext", JSON.stringify(draft));
    setActiveTab("1.1");
  };

  return (
    <Box style={{ width: "100%" }}>
      <Text id="patent-system-draft-header-text" size="xl" weight={700}>
        Saved Drafts
      </Text>

      <Box id="patent-system-draft-app-container">
        {drafts.length === 0 ? (
          <EmptyDraftsState onStartNew={() => setActiveTab("1.1")} />
        ) : (
          drafts
            .slice()
            .reverse()
            .map((draft) => (
              <Card key={draft.id} id="patent-system-saved-draft-card" mb="md">
                <Text size="lg" weight={600}>
                  {draft.applicationTitle || "Untitled Draft"}
                </Text>
                <Text size="sm" color="dimmed" mt={6}>
                  Saved on:{" "}
                  {draft.createdAt
                    ? new Date(draft.createdAt).toLocaleString()
                    : "Unknown"}
                </Text>
                <Text size="sm" mt={6}>
                  Inventors:{" "}
                  {Array.isArray(draft.inventors) ? draft.inventors.length : 0}
                </Text>
                <Center mt="md" style={{ gap: 10 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContinueEditing(draft)}
                  >
                    Continue Editing
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => handleDeleteDraft(draft.id)}
                  >
                    Delete
                  </Button>
                </Center>
              </Card>
            ))
        )}
      </Box>
    </Box>
  );
}

SavedDraftsPage.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

export default SavedDraftsPage;

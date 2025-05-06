import React, { useState } from "react";
import { Container, Select, Title } from "@mantine/core";
import DirectorSilverForm from "./DirectorSilverForm";
import DirectorGoldForm from "./DirectorGoldForm";
import DMProficiencyForm from "./DMProficiencyForm";
import { checkApplicationWindow } from "../../../routes/SPACSRoutes";
import { useEffect } from "react";

export default function AwardRegistration() {
  const [selectedAward, setSelectedAward] = useState("Director's Silver Medal");
  const [showForm, setShowForm] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(checkApplicationWindow, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ award: "Convocation Medals" }),
        });

        const data = await response.json();
        setShowForm(data);
        if (response.ok) {
          console.log("from window check result", data.result);
        } else {
          console.error("Failed to get form data", data.message);
          alert("failed to get form data");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        alert("failed to get form data");
      }
    };

    fetchData();
  }, []);
  return (
    <Container size="lg">
      <Title order={2} mb="md">
        Award Registration Form
      </Title>

      {/* Dropdown for Award Selection */}
      {showForm.result === "Success" ? (
        <>
          <Select
            label="Select Award"
            value={selectedAward}
            onChange={(value) => setSelectedAward(value)}
            data={[
              {
                value: "Director's Silver Medal",
                label: "Director's Silver Medal",
              },
              {
                value: "Director's Gold Medal",
                label: "Director's Gold Medal",
              },
              {
                value: "D&M Proficiency Gold Medal",
                label: "D&M Proficiency Gold Medal",
              },
            ]}
          />

          {/* Conditional Rendering of Forms Based on Selected Award */}
          {selectedAward === "Director's Silver Medal" && (
            <DirectorSilverForm />
          )}
          {selectedAward === "Director's Gold Medal" && <DirectorGoldForm />}
          {selectedAward === "D&M Proficiency Gold Medal" && (
            <DMProficiencyForm />
          )}
        </>
      ) : (
        <h1>{showForm.message}</h1>
      )}
    </Container>
  );
}

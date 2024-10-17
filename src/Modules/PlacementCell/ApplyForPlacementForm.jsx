import React, { useState } from "react";
import {
  TextInput,
  Button,
  FileInput,
  Container,
  Group,
  Box,
  Grid,
  Title,
  Text,
  ActionIcon,
  Notification,
} from "@mantine/core";
import { ArrowLeft, Check } from "@phosphor-icons/react";
import ApplicationStatusTimeline from "./components/Timeline";
import { useNavigate } from "react-router-dom";

function JobApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [hasApplied, setHasApplied] = useState(false); // Assume this is fetched from backend

  // let hasApplied = true; // Remove this line after integrating with backend


  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setHasApplied(true);
  };

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/placement-cell");
  }

  return (
    <Container size="sm" padding="md" style={{ marginLeft: "0", marginRight: "auto" }}>

      {/*  back button */}
      <Group position="left" mb="xl" >
        <ActionIcon variant="outline" style={{ border: "none" }} onClick={() => { handleBack() }}>
          <ArrowLeft size={18} />
        </ActionIcon>
      </Group>


      <Box mb="xl">
        <Title order={1} style={{ color: "#000000" }}>
          Amazon
        </Title>
        <Text>Job description goes here...</Text>
      </Box>

      {!hasApplied ? (
        <>

          <Title order={3} style={{ color: "#000000" }}>
            Apply
          </Title>


          <Box
            sx={(theme) => ({
              backgroundColor: "#ffffff",
              padding: theme.spacing.xl,
              borderRadius: theme.radius.md,
              boxShadow: theme.shadows.sm,
            })}
            style={{
              marginTop: "20px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "20px",
              paddingTop: "25px",
              paddingBottom: "35px",
              marginBottom: "20px",
            }}
          >
            <form onSubmit={handleSubmit}>
              <Grid gutter="sm">
                <Grid.Col span={4}>
                  <TextInput label="Name" placeholder="Enter your name" required />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput label="Roll Number" placeholder="Enter your roll number" required />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput label="Email ID" placeholder="Enter your email" required />
                </Grid.Col>
              </Grid>

              <Grid gutter="sm" mt="sm">
                <Grid.Col span={6}>
                  <TextInput label="CPI" placeholder="Enter your CPI" required />
                </Grid.Col>
                <Grid.Col span={6}>
                  <FileInput label="Upload Resume" placeholder="Upload your resume" required />
                </Grid.Col>
              </Grid>

              <Box style={{ textAlign: "right", marginTop: "20px" }}>
                <Button type="submit">Apply</Button>
              </Box>
            </form>
          </Box>

          {submitted && (
            <Notification color="teal" title="Success" icon={<IconCheck size={16} />}>
              Application submitted successfully.
            </Notification>
          )}
        </>
      ) : (
        <Box>
          <Title order={3}>Next Round Status</Title>
          <ApplicationStatusTimeline />
        </Box>
      )}
    </Container>
  );
}

export default JobApplicationForm;

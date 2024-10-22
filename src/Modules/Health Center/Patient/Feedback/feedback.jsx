import React from "react";
import { Button, Textarea, Title, Center, Box } from "@mantine/core";
import Navigation from "../Navigation";

function Feedback() {
  return (
    <div>
      <Navigation />
      <Center>
        <Box
          style={{ width: "75%", height: "100vh", marginTop: "20px" }}
          alignItems="center"
        >
          <Title
            order={2}
            style={{ alignSelf: "flex-start", marginBottom: "16px" }}
          >
            The Feedback Form
          </Title>
          <br />
          <Title
            order={4}
            style={{ alignSelf: "flex-start", marginBottom: "8px" }}
          >
            Feedback:
          </Title>
          <Textarea
            variant="filled"
            placeholder="Enter your feedback"
            autosize
            minRows={6}
            style={{
              width: "100%",
              marginBottom: "16px",
              border: "2px solid black",
            }}
          />

          <Button
            color="violet"
            radius="md"
            size="md"
            style={{ alignSelf: "flex-end" }}
          >
            Submit
          </Button>
        </Box>
      </Center>
    </div>
  );
}

export default Feedback;

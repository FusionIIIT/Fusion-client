import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Radio,
  Group,
  Divider,
  Container,
  Button,
  Textarea,
  Title,
} from "@mantine/core";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";

function Approval() {
  const [value, setValue] = useState("approval");
  const navigate = useNavigate();

  const handleRadioChange = (newValue) => {
    setValue(newValue);

    if (newValue === "apply") {
      navigate("/medical-relief/apply");
    } else if (newValue === "approval") {
      navigate("/medical-relief/approval");
    }
  };

  return (
    <>
      <Container>
        <Group position="center" spacing="xl" p="md">
          <ArrowCircleLeftOutlinedIcon fontSize="large" />

          <NavLink
            to="/history"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "black" : "black",
            })}
          >
            History
          </NavLink>

          <Divider orientation="vertical" />

          <NavLink
            to="/feedback"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "black" : "black",
            })}
          >
            Feedback
          </NavLink>

          <Divider orientation="vertical" />

          <NavLink
            to="/schedule"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "black" : "black",
            })}
          >
            Schedule
          </NavLink>

          <Divider orientation="vertical" />

          <NavLink
            to="/announcements"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "black" : "black",
            })}
          >
            Announcements
          </NavLink>

          <Divider orientation="vertical" />

          <NavLink
            to="/medical-relief/prescription"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "black" : "black",
            })}
          >
            Medical Relief
          </NavLink>

          <ArrowCircleRightOutlinedIcon fontSize="large" />
        </Group>
      </Container>

      <Group>
        <Radio
          value="apply"
          checked={value === "apply"}
          onChange={() => handleRadioChange("apply")}
          label="Apply for Medical Relief"
          color="violet"
        />

        <Radio
          value="approval"
          checked={value === "approval"}
          onChange={() => handleRadioChange("approval")}
          label="Approval Status"
          color="violet"
        />
      </Group>

      <br />
      <Title order={1} size="h1" style={{ fontSize: "1.5rem" }}>
        The Feedback Form
      </Title>

      <br />

      <Group direction="column" spacing="sm">
        <Textarea
          label="Feedback: "
          id="description"
          autosize
          minRows={5}
          withAsterisk
          sx={{
            padding: "1rem",
          }}
          style={{ width: "100%" }}
        />
      </Group>

      <br />

      <div>
        <Button color="violet" size="md" radius="md">
          Submit
        </Button>
      </div>
    </>
  );
}

export default Approval;

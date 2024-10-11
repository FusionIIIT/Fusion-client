import React from "react";
import { NavLink } from "react-router-dom";
import { Group, Divider, Container } from "@mantine/core";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";

function Health() {
  return (
    <>
      {/* Navigation Section */}
      <Container>
        <Group position="center" spacing="xl" p="md">
          <ArrowCircleLeftOutlinedIcon fontSize="large" />

          <NavLink
            to="/history"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "#1c7ed6" : "black",
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
              color: isActive ? "#1c7ed6" : "black",
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
              color: isActive ? "#1c7ed6" : "black",
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
              color: isActive ? "#1c7ed6" : "black",
            })}
          >
            Announcements
          </NavLink>

          <Divider orientation="vertical" />

          <NavLink
            to="/medical-relief"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "#1c7ed6" : "black",
            })}
          >
            Medical Relief
          </NavLink>

          <ArrowCircleRightOutlinedIcon fontSize="large" />
        </Group>
      </Container>
    </>
  );
}

export default Health;

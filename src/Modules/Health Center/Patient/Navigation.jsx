import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Container, Group, Divider } from "@mantine/core";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";

function Navigation() {
  const [isApplying, setIsApplying] = useState(true);

  const handleToggle = () => {
    setIsApplying((prev) => !prev);
  };

  return (
    <Container>
      <Group position="center" spacing="xl" p="md">
        <ArrowCircleLeftOutlinedIcon fontSize="large" />

        <NavLink
          to="/history"
          style={({ isActive }) => ({
            textDecoration: "none",
            fontSize: "1.25rem",
            fontWeight: isActive ? "bold" : "normal",
            color: isActive ? "##6D28D9" : "black",
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
            color: isActive ? "##6D28D9" : "black",
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
            color: isActive ? "##6D28D9" : "black",
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
            color: isActive ? "##6D28D9" : "black",
          })}
        >
          Announcements
        </NavLink>

        <Divider orientation="vertical" />

        <NavLink
          to={
            isApplying
              ? "/patient/medical-relief/apply"
              : "/patient/medical-relief/approval"
          }
          style={({ isActive }) => ({
            textDecoration: "none",
            fontSize: "1.25rem",
            fontWeight: isActive ? "bold" : "normal",
            color: isActive ? "##6D28D9" : "black",
          })}
          onClick={handleToggle}
        >
          Medical Relief
        </NavLink>

        <ArrowCircleRightOutlinedIcon fontSize="large" />
      </Group>
    </Container>
  );
}

export default Navigation;

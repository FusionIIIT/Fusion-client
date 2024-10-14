import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Container, Group, Divider } from "@mantine/core";

function Navigation() {
  const [isApplying, setIsApplying] = useState(true);

  const handleToggle = () => {
    setIsApplying((prev) => !prev);
  };

  return (
    <Container>
      <Group position="center" spacing="xl" p="md">
        <NavLink
          to="/patient/history"
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
          to="/patent/announcements"
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
      </Group>
    </Container>
  );
}

export default Navigation;

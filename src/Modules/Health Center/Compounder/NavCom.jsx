import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Container, Group, Divider } from "@mantine/core";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";

function NavCom() {
  const [showFirstGroup, setShowFirstGroup] = useState(true);

  const toggleGroup = () => {
    setShowFirstGroup((prev) => !prev);
  };

  return (
    <Container>
      <Group position="center" spacing="xl" p="md">
        <ArrowCircleLeftOutlinedIcon
          fontSize="large"
          onClick={showFirstGroup ? null : toggleGroup}
          style={{
            cursor: showFirstGroup ? "not-allowed" : "pointer",
            opacity: showFirstGroup ? 0.5 : 1,
          }}
        />

        {showFirstGroup ? (
          <>
            <NavLink
              to="/compounder/patient-log/history"
              style={({ isActive }) => ({
                textDecoration: "none",
                fontSize: "1.25rem",
                fontWeight: isActive ? "bold" : "normal",
                color: isActive ? "#6D28D9" : "black",
              })}
            >
              Patient Log
            </NavLink>

            <Divider orientation="vertical" />

            <NavLink
              to="/feedback"
              style={({ isActive }) => ({
                textDecoration: "none",
                fontSize: "1.25rem",
                fontWeight: isActive ? "bold" : "normal",
                color: isActive ? "#6D28D9" : "black",
              })}
            >
              Manage Stock
            </NavLink>

            <Divider orientation="vertical" />

            <NavLink
              to="/schedule"
              style={({ isActive }) => ({
                textDecoration: "none",
                fontSize: "1.25rem",
                fontWeight: isActive ? "bold" : "normal",
                color: isActive ? "#6D28D9" : "black",
              })}
            >
              Schedule
            </NavLink>

            <Divider orientation="vertical" />

            <NavLink
              to="/doctor"
              style={({ isActive }) => ({
                textDecoration: "none",
                fontSize: "1.25rem",
                fontWeight: isActive ? "bold" : "normal",
                color: isActive ? "#6D28D9" : "black",
              })}
            >
              Doctor/Pathologists
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/feedback"
              style={({ isActive }) => ({
                textDecoration: "none",
                fontSize: "1.25rem",
                fontWeight: isActive ? "bold" : "normal",
                color: isActive ? "#6D28D9" : "black",
              })}
            >
              Feedback/Response
            </NavLink>

            <Divider orientation="vertical" />

            <NavLink
              to="/announcements"
              style={({ isActive }) => ({
                textDecoration: "none",
                fontSize: "1.25rem",
                fontWeight: isActive ? "bold" : "normal",
                color: isActive ? "#6D28D9" : "black",
              })}
            >
              Make Announcements
            </NavLink>

            <Divider orientation="vertical" />

            <NavLink
              to="/compounder/medical-relief/inbox"
              style={({ isActive }) => ({
                textDecoration: "none",
                fontSize: "1.25rem",
                fontWeight: isActive ? "bold" : "normal",
                color: isActive ? "#6D28D9" : "black",
              })}
            >
              Medical Relief
            </NavLink>
          </>
        )}

        <ArrowCircleRightOutlinedIcon
          fontSize="large"
          onClick={showFirstGroup ? toggleGroup : null}
          style={{
            cursor: showFirstGroup ? "pointer" : "not-allowed",
            opacity: showFirstGroup ? 1 : 0.5,
          }}
        />
      </Group>
    </Container>
  );
}

export default NavCom;

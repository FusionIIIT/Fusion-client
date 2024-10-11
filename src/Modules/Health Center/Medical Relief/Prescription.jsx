import React from "react";
import { NavLink } from "react-router-dom";
import {
  Radio,
  Group,
  Text,
  Divider,
  Container,
  Box,
  Table,
} from "@mantine/core";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";
import { SystemUpdateAlt } from "@mui/icons-material";
import FaceIcon from "@mui/icons-material/Face";

function Prescription() {
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
              color: isActive ? "#2C2E33" : "#2C2E33",
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
              color: isActive ? "#2C2E33" : "#2C2E33",
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
              color: isActive ? "#2C2E33" : "#2C2E33",
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
              color: isActive ? "#2C2E33" : "#2C2E33",
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
              color: isActive ? "#2C2E33" : "#2C2E33",
            })}
          >
            Medical Relief
          </NavLink>

          <ArrowCircleRightOutlinedIcon fontSize="large" />
        </Group>
      </Container>

      {/* Radio Button */}
      <Box
        mx="auto"
        p="md"
        sx={{
          maxWidth: 200,
          backgroundColor: "#f0f0f0",
          borderRadius: "12px",
          border: "1px solid #ddd",
        }}
      >
        <Group position="left" spacing="sm">
          <Radio color="violet" checked />
          <Text>Prescription</Text>
        </Group>
      </Box>

      {/* Table Section */}
      <Box mt="md" mx="auto" sx={{ maxWidth: "75%" }}>
        <Table highlightOnHover withBorder>
          <thead
            style={{
              backgroundColor: "#6b46c1",
              color: "white",
              textAlign: "center",
            }}
          >
            <tr>
              <th style={{ padding: "10px" }}>Treated By</th>
              <th style={{ padding: "10px" }}>Date</th>
              <th style={{ padding: "10px" }}>Details</th>
              <th style={{ padding: "10px" }}>Report</th>
              <th style={{ padding: "10px" }}>View Prescription</th>
            </tr>
          </thead>
          <tbody>
            <tr
              style={{
                backgroundColor: "#f3e8ff",
                color: "#6b46c1",
                textAlign: "center",
              }}
            >
              <td
                style={{
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaceIcon className="mr-1" /> GS Sandhu
              </td>
              <td style={{ padding: "10px" }}>11/09/24</td>
              <td style={{ padding: "10px" }}>Fever</td>
              <td style={{ padding: "10px" }}>
                <SystemUpdateAlt />
              </td>
              <td style={{ padding: "10px" }}>
                <NavLink
                  to="/medical-relief/history"
                  style={{ textDecoration: "none", color: "#6b46c1" }}
                >
                  View
                </NavLink>
              </td>
            </tr>
            <tr
              style={{
                backgroundColor: "#f3e8ff",
                color: "#6b46c1",
                textAlign: "center",
              }}
            >
              <td
                style={{
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaceIcon className="mr-1" /> A Shivi
              </td>
              <td style={{ padding: "10px" }}>12/09/24</td>
              <td style={{ padding: "10px" }}>Tooth Pain</td>
              <td style={{ padding: "10px" }}>
                <SystemUpdateAlt />
              </td>
              <td style={{ padding: "10px" }}>
                <NavLink
                  to="/medical-relief/history"
                  style={{ textDecoration: "none", color: "#6b46c1" }}
                >
                  View
                </NavLink>
              </td>
            </tr>
          </tbody>
        </Table>
      </Box>
    </>
  );
}

export default Prescription;

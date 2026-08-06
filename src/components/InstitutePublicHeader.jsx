import { Box, Container, Group, Text } from "@mantine/core";
import PropTypes from "prop-types";
import iiitdmjLogo from "../assets/iiitdmj_logo.png";

// Shared header for public, unauthenticated pages reached via emailed links
// (external thesis examiners have no Fusion account, so these pages render
// outside the normal authenticated app shell). Mirrors the branding used on
// the login page.
export default function InstitutePublicHeader({ subtitle = "Thesis Examination Portal" }) {
  return (
    <Box
      p="md"
      style={{
        borderBottom: "2px solid #111",
        backgroundColor: "#fff",
        boxShadow: "0 4px 30px rgba(0,0,0,0.05)",
      }}
    >
      <Container size="md">
        <Group gap="md">
          <img src={iiitdmjLogo} alt="IIITDMJ Logo" style={{ height: 40 }} />
          <Box
            style={{
              borderLeft: "3px solid #15ABFF",
              paddingLeft: 15,
            }}
          >
            <Text fw={900} size="sm" lts={1} c="#111">
              PDPM IIITDM <span style={{ color: "#15ABFF" }}>JABALPUR</span>
            </Text>
            <Text size="xs" c="dimmed" fw={700} style={{ fontFamily: "monospace", letterSpacing: 1 }}>
              {subtitle}
            </Text>
          </Box>
        </Group>
      </Container>
    </Box>
  );
}

InstitutePublicHeader.propTypes = {
  subtitle: PropTypes.string,
};

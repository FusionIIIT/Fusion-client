import { useSelector } from "react-redux";
import { Container, Title, Text, Button, Center } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import App from "./App";

function FacultyProfessionalProfile() {
  const role = useSelector((state) => state.user.role || "");
  const normalizedRole = String(role).toLowerCase();
  const navigate = useNavigate();

  if (normalizedRole === "student") {
    return (
      <Container style={{ marginTop: "100px", textAlign: "center" }}>
        <Title order={1} style={{ color: "#e03131", marginBottom: "20px" }}>
          403 - Unauthorized Access
        </Title>
        <Text size="lg" style={{ marginBottom: "30px" }}>
          You do not have permission to access the Faculty Professional Profile
          module. This area is strictly restricted to faculty members and
          authorized personnel.
        </Text>
        <Center>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            color="blue"
          >
            Return to Dashboard
          </Button>
        </Center>
      </Container>
    );
  }

  return <App />;
}

export default FacultyProfessionalProfile;

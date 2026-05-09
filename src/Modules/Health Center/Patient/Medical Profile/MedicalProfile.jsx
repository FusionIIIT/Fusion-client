import { Container, Stack } from "@mantine/core";
import Navigation from "../Navigation";
import CustomBreadcrumbs from "../../components/common/Breadcrumbs";
import MedicalProfileForm from "../../components/forms/MedicalProfileForm";

const MedicalProfile = () => {
  return (
    <>
      <CustomBreadcrumbs />
      <Navigation />
      <Container size="lg" py="xl">
        <Stack gap="lg">
          <MedicalProfileForm />
        </Stack>
      </Container>
    </>
  );
};

export default MedicalProfile;

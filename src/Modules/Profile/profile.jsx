import { Stack, Text } from "@mantine/core";
import CustomBreadcrumbs from "../../components/Breadcrumbs";

function Profile() {
  return (
    <Stack>
      <CustomBreadcrumbs />
      <Text>Profile Page</Text>
    </Stack>
  );
}

export default Profile;

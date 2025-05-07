import {
  Button,
  Center,
  Container,
  Divider,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

function ForgotPassword() {
  return (
    <Center w="100%">
      <Container w={450} my={100}>
        <Title ta="center" fw={700} fz={28} mb={15} c="#333">
          Reset Password
        </Title>

        <Paper
          withBorder
          shadow="lg"
          p={30}
          mt={40}
          radius="md"
          style={{ border: "2px solid #15ABFF" }}
        >
          <Text fw={500} fz="md" lh={1.6} mb={10}>
            Forgotten your password? Enter your e-mail address below, and we
            will send you an e-mail allowing you to reset it.
          </Text>

          <Divider my="md" variant="dashed" color="#15ABFF" opacity={0.5} />

          <TextInput
            label={
              <Text fw={600} fz="sm">
                Email
              </Text>
            }
            type="email"
            placeholder="username or email"
            required
            styles={{
              label: { marginBottom: 6 },
              input: {
                fontSize: "1rem",
                padding: "10px 14px",
                "&:focus": {
                  borderColor: "#15ABFF",
                },
              },
            }}
          />

          <Button
            fullWidth
            mt="xl"
            bg="#15ABFF"
            fz="md"
            fw={600}
            style={{ height: 44 }}
          >
            Send Reset Link
          </Button>

          <Divider my="md" variant="dashed" color="#15ABFF" opacity={0.5} />

          <Text fz="sm" c="dimmed" ta="center" lh={1.6}>
            Please contact CC admin if you have any trouble resetting your
            password.
          </Text>
        </Paper>
      </Container>
    </Center>
  );
}

export default ForgotPassword;

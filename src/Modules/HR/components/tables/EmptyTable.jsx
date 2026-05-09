import { Container, Text } from "@mantine/core";
import PropTypes from "prop-types";
import notfound from "../../../../assets/notfound.svg";

export function EmptyTable({ title, message }) {
  return (
    <Container style={{ textAlign: "center", padding: "40px 20px" }}>
      <img src={notfound} height={200} alt="404" />
      <Text size="xl" weight={500} mt="lg" mb="sm">
        {title}
      </Text>
      <Text size="md" c="dimmed" mb="lg">
        {message}
      </Text>
      {/* <a href="/">
        <Button variant="filled">
          Go to home
        </Button>
      </a> */}
    </Container>
  );
}

EmptyTable.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

import { Box, Group } from "@mantine/core";
import PropTypes from "prop-types";

export default function Toolbar({ children = null, search = null }) {
  return (
    <Group gap="sm" mb="md" align="center" wrap="wrap">
      {children}
      {search ? (
        <Box ml={{ base: 0, sm: "auto" }} w={{ base: "100%", sm: "auto" }}>
          {search}
        </Box>
      ) : null}
    </Group>
  );
}

Toolbar.propTypes = {
  children: PropTypes.node,
  search: PropTypes.node,
};

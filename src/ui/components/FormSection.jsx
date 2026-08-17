import { Box, Divider, Grid, Stack, Text } from "@mantine/core";
import PropTypes from "prop-types";

export function FormSection({
  title,
  hint = undefined,
  children,
  first = false,
}) {
  return (
    <Box>
      {!first && <Divider mt="xl" mb="lg" />}
      <Stack gap={2} mb="sm">
        <Text fw={600} size="sm">
          {title}
        </Text>
        {hint && (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        )}
      </Stack>
      {children}
    </Box>
  );
}

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  hint: PropTypes.string,
  children: PropTypes.node.isRequired,
  first: PropTypes.bool,
};

export function FormRow({ children }) {
  return <Grid gutter="md">{children}</Grid>;
}

FormRow.propTypes = { children: PropTypes.node.isRequired };

export function Field({ span = 6, children }) {
  return <Grid.Col span={{ base: 12, sm: span }}>{children}</Grid.Col>;
}

Field.propTypes = {
  span: PropTypes.number,
  children: PropTypes.node.isRequired,
};

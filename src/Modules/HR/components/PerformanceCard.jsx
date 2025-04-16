import React from "react";
import PropTypes from "prop-types";
import { Card, Text, Group } from "@mantine/core";
import { useHover } from "@mantine/hooks";

const PerformanceCard = ({ IconComponent, title, description, link }) => {
  const { hovered, ref } = useHover();

  return (
    <Card
      ref={ref}
      shadow="sm"
      p="lg"
      radius="md"
      style={{
        cursor: "pointer",
        transition: "transform 0.2s",
        transform: hovered ? "scale(1.05)" : "scale(1)",
      }}
      component="a"
      href={link}
    >
      <Group position="center" direction="column" spacing="sm">
        <IconComponent size={48} color="#228BE6" />
        <Text size="xl" weight={700} align="center">
          {title}
        </Text>
        <Text size="md" color="dimmed" align="center">
          {description}
        </Text>
      </Group>
    </Card>
  );
};

// ✅ Add PropTypes validation
PerformanceCard.propTypes = {
  IconComponent: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default PerformanceCard;

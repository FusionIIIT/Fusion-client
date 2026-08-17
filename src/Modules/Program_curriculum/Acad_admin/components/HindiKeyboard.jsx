import { useState } from "react";
import PropTypes from "prop-types";
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Popover,
  SimpleGrid,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Backspace, Keyboard, X } from "@phosphor-icons/react";

// Compact on-screen Devanagari keyboard for entering a Hindi name without a
// system Hindi layout. Clicking a key appends it to the bound value.
const KEYS = [
  "अ",
  "आ",
  "इ",
  "ई",
  "उ",
  "ऊ",
  "ऋ",
  "ए",
  "ऐ",
  "ओ",
  "औ",
  "अं",
  "अः",
  "क",
  "ख",
  "ग",
  "घ",
  "ङ",
  "च",
  "छ",
  "ज",
  "झ",
  "ञ",
  "ट",
  "ठ",
  "ड",
  "ढ",
  "ण",
  "त",
  "थ",
  "द",
  "ध",
  "न",
  "प",
  "फ",
  "ब",
  "भ",
  "म",
  "य",
  "र",
  "ल",
  "व",
  "श",
  "ष",
  "स",
  "ह",
  "क्ष",
  "त्र",
  "ज्ञ",
  "श्र",
  "ड़",
  "ढ़",
  "ा",
  "ि",
  "ी",
  "ु",
  "ू",
  "े",
  "ै",
  "ो",
  "ौ",
  "ं",
  "ः",
  "ँ",
  "्",
  "ऽ",
];

function HindiKeyboard({ value, onChange }) {
  const [opened, setOpened] = useState(false);
  const isMobile = useMediaQuery("(max-width: 480px)");

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      withArrow
      shadow="md"
      withinPortal
      middlewares={{ flip: true, shift: true }}
      width={isMobile ? "100%" : 340}
    >
      <Popover.Target>
        <ActionIcon
          variant="light"
          color="blue"
          onClick={() => setOpened((o) => !o)}
          aria-label="Open Hindi keyboard"
        >
          <Keyboard size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p="xs">
        <Group justify="space-between" mb={8}>
          <Text size="xs" fw={600} c="dimmed">
            हिन्दी कीबोर्ड
          </Text>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={() => setOpened(false)}
            aria-label="Close keyboard"
          >
            <X size={14} />
          </ActionIcon>
        </Group>

        <SimpleGrid cols={8} spacing={4} verticalSpacing={4}>
          {KEYS.map((ch) => (
            <Button
              key={ch}
              variant="default"
              fullWidth
              h={34}
              px={0}
              onClick={() => onChange(`${value || ""}${ch}`)}
              styles={{ label: { fontSize: 15 } }}
            >
              {ch}
            </Button>
          ))}
        </SimpleGrid>

        <Divider my={8} />

        <Group gap={6} grow>
          <Button
            variant="light"
            size="xs"
            onClick={() => onChange(`${value || ""} `)}
          >
            Space
          </Button>
          <Button
            variant="light"
            size="xs"
            leftSection={<Backspace size={14} />}
            onClick={() => onChange((value || "").slice(0, -1))}
          >
            Back
          </Button>
          <Button
            variant="subtle"
            color="red"
            size="xs"
            onClick={() => onChange("")}
          >
            Clear
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}

HindiKeyboard.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default HindiKeyboard;

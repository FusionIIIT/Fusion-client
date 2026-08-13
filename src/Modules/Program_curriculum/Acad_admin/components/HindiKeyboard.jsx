import { useState } from "react";
import PropTypes from "prop-types";
import { ActionIcon, Button, Group, Popover, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Backspace, Keyboard } from "@phosphor-icons/react";

// Compact on-screen Devanagari keyboard for entering a Hindi name without a
// system Hindi layout. Clicking a key appends it to the bound value.
const KEY_ROWS = [
  ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "अं", "अः"],
  ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ"],
  ["ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न"],
  ["प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह"],
  ["क्ष", "त्र", "ज्ञ", "श्र", "ड़", "ढ़"],
  ["ा", "ि", "ी", "ु", "ू", "े", "ै", "ो", "ौ", "ं", "ः", "ँ", "्", "ऽ"],
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
      width={isMobile ? "calc(100vw - 32px)" : 360}
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
      <Popover.Dropdown p="xs" style={{ maxHeight: "45vh", overflowY: "auto" }}>
        <Stack gap={6}>
          {KEY_ROWS.map((row) => (
            <Group key={row.join("")} gap={4} wrap="wrap" justify="center">
              {row.map((ch) => (
                <Button
                  key={ch}
                  size="compact-sm"
                  variant="default"
                  px={8}
                  onClick={() => onChange(`${value || ""}${ch}`)}
                >
                  {ch}
                </Button>
              ))}
            </Group>
          ))}
          <Group gap={6} justify="center">
            <Button
              size="compact-sm"
              variant="default"
              onClick={() => onChange(`${value || ""} `)}
            >
              Space
            </Button>
            <Button
              size="compact-sm"
              variant="default"
              leftSection={<Backspace size={14} />}
              onClick={() => onChange((value || "").slice(0, -1))}
            >
              Back
            </Button>
            <Button
              size="compact-sm"
              variant="subtle"
              color="red"
              onClick={() => onChange("")}
            >
              Clear
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

HindiKeyboard.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default HindiKeyboard;

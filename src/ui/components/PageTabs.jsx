import { Badge, Group, Tabs, Text } from "@mantine/core";
import PropTypes from "prop-types";

import classes from "./PageTabs.module.css";
import tabClasses from "../styles/tabs.module.css";

// Splitting the row evenly only reads well for a handful of tabs; past that
// the labels collide, so a long row sizes to its content and scrolls instead.
const EVEN_WIDTH_LIMIT = 6;

export function PageTabs({ value, onChange, tabs, mb = "md" }) {
  if (tabs.length < 2) return null;

  const evenWidth = tabs.length <= EVEN_WIDTH_LIMIT;

  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="pills"
      color="blue"
      className={classes.root}
      mb={mb}
    >
      <Tabs.List className={evenWidth ? tabClasses.list : undefined}>
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            className={evenWidth ? tabClasses.tab : undefined}
          >
            <Group gap={6} wrap="nowrap">
              <Text size="sm">{tab.label}</Text>
              {tab.badge > 0 && (
                <Badge color="blue" size="sm" circle>
                  {tab.badge}
                </Badge>
              )}
            </Group>
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}

PageTabs.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      badge: PropTypes.number,
    }),
  ).isRequired,
  mb: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PageTabs;

import { Text, UnstyledButton } from "@mantine/core";
import PropTypes from "prop-types";
import { DotsThree } from "@phosphor-icons/react";

import { resolveIcon } from "../icons";
import classes from "./BottomNav.module.css";

function Item({ label, icon: Icon, active, onClick }) {
  return (
    <UnstyledButton
      className={classes.item}
      data-active={active || undefined}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      <span className={classes.rule} />
      <Icon size={20} />
      <Text className={classes.label}>{label}</Text>
    </UnstyledButton>
  );
}

Item.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export function BottomNav({ items, activeTo, onNavigate, onMore, moreActive }) {
  return (
    <nav className={classes.bar} aria-label="Primary">
      {items.map((item) => (
        <Item
          key={item.code}
          label={item.label}
          icon={resolveIcon(item.icon)}
          active={activeTo === item.to}
          onClick={() => onNavigate(item.to)}
        />
      ))}
      <Item
        label="More"
        icon={DotsThree}
        active={moreActive}
        onClick={onMore}
      />
    </nav>
  );
}

BottomNav.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string,
      to: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activeTo: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  onMore: PropTypes.func.isRequired,
  moreActive: PropTypes.bool,
};

export default BottomNav;

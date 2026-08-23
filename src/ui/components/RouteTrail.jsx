import { Anchor, Breadcrumbs, Text } from "@mantine/core";
import { CaretRight } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import classes from "./RouteTrail.module.css";

export function RouteTrail({ items }) {
  if (!items.length) return null;

  return (
    <Breadcrumbs
      className={classes.trail}
      separator={<CaretRight size={11} weight="bold" />}
      aria-label="Breadcrumb"
    >
      {items.map((item) =>
        item.to ? (
          <Anchor
            key={item.label}
            component={Link}
            to={item.to}
            className={classes.link}
          >
            {item.label}
          </Anchor>
        ) : (
          <Text key={item.label} span className={classes.current}>
            {item.label}
          </Text>
        ),
      )}
    </Breadcrumbs>
  );
}

RouteTrail.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string,
    }),
  ).isRequired,
};

export default RouteTrail;

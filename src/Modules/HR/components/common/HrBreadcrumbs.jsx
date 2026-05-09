import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs as MantineBreadcrumbs, Anchor } from "@mantine/core";
import { CaretRight } from "@phosphor-icons/react";
import classes from "../../styles/HrBreadcrumbs.module.css";

function HrBreadcrumbs({ items }) {
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path);
  };

  return (
    <MantineBreadcrumbs
      className={classes.MantineBreadcrumbs}
      separator={<CaretRight size={16} />}
    >
      {items.map((item, index) => (
        <Anchor
          key={index}
          onClick={() => handleClick(item.path)}
          className={classes.breadcrumbItem}
        >
          {item.title}
        </Anchor>
      ))}
    </MantineBreadcrumbs>
  );
}

export default HrBreadcrumbs;

HrBreadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

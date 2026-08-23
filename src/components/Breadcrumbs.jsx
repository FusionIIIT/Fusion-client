import { Breadcrumbs } from "@mantine/core";
import { CaretRight } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import classes from "./Breadcrumbs.module.css";

function CustomBreadcrumbs({ breadCrumbs }) {
  return (
    <Breadcrumbs
      separator={
        <CaretRight className={classes.fusionCaretIcon} weight="bold" />
      }
      mt="xs"
      ml={{ md: "lg" }}
    >
      {breadCrumbs}
    </Breadcrumbs>
  );
}

CustomBreadcrumbs.propTypes = {
  breadCrumbs: PropTypes.node.isRequired,
};

export default CustomBreadcrumbs;

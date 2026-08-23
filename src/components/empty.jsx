import { Text } from "@mantine/core";
import PropTypes from "prop-types";

import notfound from "../assets/notfound.svg";
import classes from "./empty.module.css";

export function Empty({
  title = "No new notifications found!",
  description = "There is no new notification available. Please check back later.",
}) {
  return (
    <div className={classes.root}>
      <img src={notfound} className={classes.art} alt="" />
      <Text fz="lg" fw={600} mt="md" mb={4}>
        {title}
      </Text>
      <Text size="sm" c="dimmed">
        {description}
      </Text>
    </div>
  );
}

Empty.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

export default Empty;

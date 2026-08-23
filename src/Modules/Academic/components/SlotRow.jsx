import PropTypes from "prop-types";

import classes from "./styles/slot.module.css";

export default function SlotRow({ primary, secondary = null, control = null }) {
  return (
    <div className={classes.row}>
      <div className={classes.info}>
        <div className={classes.primary}>{primary}</div>
        {secondary ? (
          <div className={classes.secondary}>{secondary}</div>
        ) : null}
      </div>
      {control ? <div className={classes.control}>{control}</div> : null}
    </div>
  );
}

SlotRow.propTypes = {
  primary: PropTypes.node.isRequired,
  secondary: PropTypes.node,
  control: PropTypes.node,
};

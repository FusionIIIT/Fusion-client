import PropTypes from "prop-types";

import classes from "./DetailList.module.css";

export default function DetailList({ items, ariaLabel }) {
  if (!items.length) return null;

  return (
    <dl className={classes.grid} aria-label={ariaLabel}>
      {items.map(({ label, value }) => (
        <div className={classes.item} key={label}>
          <dt className={classes.label}>{label}</dt>
          <dd className={classes.value}>
            {value === null || value === undefined || value === ""
              ? "—"
              : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

DetailList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.node,
    }),
  ).isRequired,
  ariaLabel: PropTypes.string,
};

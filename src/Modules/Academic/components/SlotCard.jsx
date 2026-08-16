import PropTypes from "prop-types";

import classes from "./styles/slot.module.css";

export default function SlotCard({ name, meta = null, children = null }) {
  return (
    <section className={classes.card}>
      <header className={classes.header}>
        <span className={classes.name}>{name}</span>
        {meta ? <span className={classes.meta}>{meta}</span> : null}
      </header>
      {children}
    </section>
  );
}

SlotCard.propTypes = {
  name: PropTypes.node.isRequired,
  meta: PropTypes.node,
  children: PropTypes.node,
};

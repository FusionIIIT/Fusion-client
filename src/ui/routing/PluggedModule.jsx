import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import classes from "./PluggedModule.module.css";

/** A module another service serves, rendered inside this shell. */
const BASE = import.meta.env.VITE_INTEGRATED_BASE || "";

export function PluggedModule({ title }) {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  params.set("embed", "1");
  const src = `${BASE}${pathname}?${params}`;

  if (!BASE) {
    return (
      <p className={classes.unavailable}>
        {title} is not configured for this environment.
      </p>
    );
  }

  return (
    <iframe
      key={pathname}
      className={classes.frame}
      src={src}
      title={title}
      // Same institute, same session; it needs its cookie and nothing beyond.
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
    />
  );
}

PluggedModule.propTypes = {
  title: PropTypes.string.isRequired,
};

export default PluggedModule;

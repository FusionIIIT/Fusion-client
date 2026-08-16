import PropTypes from "prop-types";

import { courseLabel } from "../../../lib/course";
import classes from "./CourseList.module.css";

export default function CourseList({ courses = [] }) {
  if (!courses.length) return "—";

  return (
    <ol className={classes.list}>
      {courses.map((course) => (
        <li
          key={course.id ?? course.code ?? course.name}
          className={classes.item}
        >
          {courseLabel(course)}
        </li>
      ))}
    </ol>
  );
}

CourseList.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      code: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
};

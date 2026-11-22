import { Button } from "@mantine/core";
import { Book, Scroll } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import crest from "../../assets/Insti_logo.svg";
import classes from "./GraduateWelcome.module.css";

const INSTITUTE =
  "PDPM Indian Institute of Information Technology, Design and Manufacturing, Jabalpur";

// "MARY-ANN D'SOUZA" -> "Mary-Ann D'Souza". Names are stored in capitals;
// a congratulation reads better in the way the name is written.
export function titleCase(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(
      /(^|[\s\-'])(\p{L})/gu,
      (_, before, letter) => before + letter.toUpperCase(),
    );
}

// The landing page of a graduate: a congratulation in the manner of a
// degree certificate, the facts of the degree, and the two pages they keep.
export default function GraduateWelcome() {
  const name = useSelector((state) => state.user.username);
  const rollNo = useSelector((state) => state.user.roll_no);
  const info = useSelector((state) => state.user.studentInfo);

  const facts = [
    ["Programme", info?.discipline],
    ["Batch", info?.batch],
    ["Roll number", rollNo],
  ].filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );

  return (
    <section className={classes.paper} aria-labelledby="graduate-headline">
      <div className={classes.frame}>
        <img
          className={classes.crest}
          src={crest}
          alt="PDPM IIITDM Jabalpur crest"
        />
        <h1 id="graduate-headline" className={classes.headline}>
          {`Congratulations, ${titleCase(name)}`}
        </h1>
        <p className={classes.citation}>{`on graduating from ${INSTITUTE}`}</p>

        <hr className={classes.rule} />

        <dl className={classes.facts}>
          {facts.map(([label, value]) => (
            <div key={label} className={classes.fact}>
              <dt>{label}</dt>
              <dd>{String(value)}</dd>
            </div>
          ))}
        </dl>

        <p className={classes.wish}>
          We wish you every success in what comes next. Your Fusion account
          stays open so you can view your courses and results.
        </p>
        <div className={classes.actions}>
          <Button
            component={Link}
            to="/academics/registered-courses"
            leftSection={<Book size={16} />}
          >
            Registered Courses
          </Button>
          <Button
            component={Link}
            to="/examination/result"
            variant="light"
            leftSection={<Scroll size={16} />}
          >
            Results
          </Button>
        </div>
      </div>
    </section>
  );
}

import { GraduationCap } from "@phosphor-icons/react";
import { useSelector } from "react-redux";

import campus from "../../assets/LHTC.jpg";
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

// Each block rises in reading order.
const step = (n) => ({ "--step": n });

// The landing page of a graduate. It is a farewell, not a menu: the pages
// an alumnus keeps are in the side navigation.
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
    <section className={classes.hero} aria-labelledby="graduate-headline">
      <img className={classes.photo} src={campus} alt="" />
      <div className={classes.veil} />

      <div className={classes.content}>
        <div className={`${classes.medallion} ${classes.rise}`} style={step(0)}>
          <img src={crest} alt="PDPM IIITDM Jabalpur crest" />
        </div>

        <h1
          id="graduate-headline"
          className={`${classes.headline} ${classes.rise}`}
          style={step(1)}
        >
          <span className={classes.greeting}>Congratulations,</span>{" "}
          <span className={classes.name}>{titleCase(name)}</span>
        </h1>

        <p className={`${classes.citation} ${classes.rise}`} style={step(2)}>
          {`on graduating from ${INSTITUTE}`}
        </p>

        <div
          className={`${classes.rule} ${classes.rise}`}
          style={step(3)}
          aria-hidden="true"
        >
          <GraduationCap size={26} weight="light" />
        </div>

        <p className={`${classes.message} ${classes.rise}`} style={step(3)}>
          You first walked this path as a student. Today you leave it as a
          graduate. The classrooms, the late nights and the friends you made
          here are part of your story now, and you will always be part of ours.
        </p>

        <dl className={`${classes.facts} ${classes.rise}`} style={step(4)}>
          {facts.map(([label, value]) => (
            <div key={label} className={classes.fact}>
              <dt>{label}</dt>
              <dd>{String(value)}</dd>
            </div>
          ))}
        </dl>

        <p className={`${classes.signoff} ${classes.rise}`} style={step(5)}>
          With pride and every good wish,
          <strong>PDPM IIITDM Jabalpur</strong>
        </p>
      </div>
    </section>
  );
}

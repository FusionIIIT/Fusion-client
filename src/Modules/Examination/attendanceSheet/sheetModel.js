const pad = (n) => String(n).padStart(2, "0");

export function to12h(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return {
    hour: pad(h % 12 === 0 ? 12 : h % 12),
    minute: pad(m),
    period: h >= 12 ? "PM" : "AM",
  };
}

export function to24h({ hour, minute, period }) {
  const h = (Number(hour) % 12) + (period === "PM" ? 12 : 0);
  return `${pad(h)}:${pad(Number(minute))}`;
}

export function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function formatTime(hhmm) {
  const { hour, minute, period } = to12h(hhmm);
  return `${hour}:${minute} ${period}`;
}

export function examLine(exam, semesterType, academicYear) {
  const sem = /even/i.test(semesterType) ? "Even" : "Odd";
  return `${exam} SEM EXAM (${sem} Sem), ${academicYear}`;
}

export function fileName(code, exam, academicYear) {
  const label = exam === "END" ? "EndSem" : "MidSem";
  return `${code}_${label}_${academicYear}.pdf`;
}

export function defaultInstructorText(
  students,
  fromSno,
  toSno,
  instructors,
  sectioned,
) {
  if (!sectioned) return (instructors.all || []).join(", ");
  const sections = [];
  students.forEach((s) => {
    if (s.sno >= fromSno && s.sno <= toSno && !sections.includes(s.section)) {
      sections.push(s.section);
    }
  });
  const bySection = instructors.by_section || {};
  const named = sections.filter((sec) => bySection[sec]);
  if (named.length === 0) return "";
  if (named.length === 1) return bySection[named[0]];
  return named.map((sec) => `${sec}: ${bySection[sec]}`).join(", ");
}

export function checkRooms(rooms, total) {
  const errors = [];
  if (rooms.length === 0) errors.push("Add at least one room.");

  rooms.forEach((r, i) => {
    const n = i + 1;
    const from = Number(r.from_sno);
    const to = Number(r.to_sno);
    if (from > to) {
      errors.push(`Room ${n}: from S.No must not be after to S.No.`);
    } else if (!(from >= 1 && to <= total)) {
      errors.push(`Room ${n}: S.No must be between 1 and ${total}.`);
    }
    if (!r.room || !r.date || !r.start_time || !r.end_time) {
      errors.push(`Room ${n}: room, date, start and end time are required.`);
    } else if (r.end_time <= r.start_time) {
      errors.push(`Room ${n}: the exam must end after it starts.`);
    }
  });

  for (let i = 0; i < rooms.length; i += 1) {
    for (let j = i + 1; j < rooms.length; j += 1) {
      if (
        Number(rooms[i].from_sno) <= Number(rooms[j].to_sno) &&
        Number(rooms[j].from_sno) <= Number(rooms[i].to_sno)
      ) {
        errors.push(`Rooms ${i + 1} and ${j + 1} overlap.`);
      }
    }
  }

  const covered = new Set();
  rooms.forEach((r) => {
    for (
      let s = Number(r.from_sno);
      s <= Math.min(Number(r.to_sno), total);
      s += 1
    ) {
      covered.add(s);
    }
  });
  const uncovered = [];
  for (let s = 1; s <= total; s += 1) if (!covered.has(s)) uncovered.push(s);

  const beyond = [];
  rooms.forEach((r, i) => {
    if (Number(r.to_sno) > total) beyond.push(i + 1);
  });

  return { errors, uncovered, beyond };
}

export function nextRoom(previous, total) {
  return {
    from_sno: previous ? Number(previous.to_sno) + 1 : 1,
    to_sno: total,
    room: "",
    date: previous ? previous.date : "",
    start_time: previous ? previous.start_time : "",
    end_time: previous ? previous.end_time : "",
    instructor_text: "",
  };
}

export function buildSheets({
  course,
  exam,
  semesterType,
  academicYear,
  students,
  rooms,
}) {
  const sheets = [];
  rooms.forEach((r) => {
    const inRoom = students.filter(
      (s) => s.sno >= Number(r.from_sno) && s.sno <= Number(r.to_sno),
    );
    const runs = [];
    inRoom.forEach((s) => {
      const last = runs[runs.length - 1];
      if (last && last[0].programme === s.programme) last.push(s);
      else runs.push([s]);
    });
    runs.forEach((run) => {
      sheets.push({
        room: r.room,
        dateText: `DATE: ${formatDate(r.date)}`,
        timeText: `Time : ${formatTime(r.start_time)} To ${formatTime(r.end_time)}`,
        examLine: examLine(exam, semesterType, academicYear),
        code: course.code,
        title: course.name,
        instructorText: r.instructor_text || "",
        total: run.length,
        rows: run.map((s, i) => ({
          slNo: i + 1,
          roll_no: s.roll_no,
          name: s.name,
          discipline: s.discipline,
          section: s.section,
        })),
      });
    });
  });
  return sheets;
}

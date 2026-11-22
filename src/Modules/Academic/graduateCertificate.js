// The graduation keepsake, drawn on a canvas so the page and the
// downloads (PNG, JPG, PDF) are the same picture. Sizes are in a logical
// A4-landscape space at 150 dpi; the canvas is drawn at EXPORT_SCALE so a
// download is A4 at 300 dpi.

export const CERT_W = 1754;
export const CERT_H = 1240;
export const EXPORT_SCALE = 2;

export const INSTITUTE =
  "PDPM Indian Institute of Information Technology, Design and Manufacturing, Jabalpur";

export const MESSAGE =
  "You first walked this path as a student. Today you leave it as a graduate. The classrooms, the late nights and the friends you made here are part of your story now, and you will always be part of ours.";

export const FONTS = {
  display: '"Cinzel", "Trajan Pro", Georgia, serif',
  script: '"Pinyon Script", "Snell Roundhand", "Apple Chancery", cursive',
  serif: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
};

// Fonts the canvas waits for before it draws. If they cannot load (no
// network), the fallbacks above are used.
export const FONT_LOADS = [
  `700 70px ${FONTS.display}`,
  `600 28px ${FONTS.display}`,
  `400 100px ${FONTS.script}`,
  `600 27px ${FONTS.serif}`,
  `italic 500 27px ${FONTS.serif}`,
];

const NAVY = "#0e2350";
const GOLD = "#c9a55a";
const GOLD_DEEP = "#8a6a26";
const INK = "#1d2740";
const MUTED = "#5b6480";
const PAPER = "#fffdf8";

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

const present = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

// Everything the certificate says, from what Fusion knows of the graduate.
export function certificateText({ name, programme, batch, rollNo }) {
  const details = [
    present(programme) ? String(programme) : null,
    present(batch) ? `batch of ${batch}` : null,
    present(rollNo) ? `roll number ${rollNo}` : null,
  ].filter(Boolean);
  return {
    name: titleCase(name),
    details: details.join(", "),
    citation: `on graduating from ${INSTITUTE}`,
    message: MESSAGE,
  };
}

// The largest size, at most `start`, at which `text` fits in `maxWidth`.
export function fitFontSize(measure, text, maxWidth, start, min = 24) {
  let size = start;
  while (size > min && measure(text, size) > maxWidth) size -= 2;
  return size;
}

// Greedy word wrap with a measuring function.
export function wrapText(measure, text, maxWidth) {
  const lines = [];
  let line = "";
  String(text)
    .split(/\s+/)
    .filter(Boolean)
    .forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (line && measure(next) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
  if (line) lines.push(line);
  return lines;
}

export function certificateFileName(rollNo, extension) {
  const id = String(rollNo ?? "").trim() || "graduate";
  return `Graduation-certificate-${id}.${extension}`;
}

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

function goldFoil(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#7d5e1f");
  g.addColorStop(0.2, "#d8b968");
  g.addColorStop(0.42, "#f6e6ae");
  g.addColorStop(0.6, "#b8903d");
  g.addColorStop(0.8, "#ecd28c");
  g.addColorStop(1, "#7d5e1f");
  return g;
}

function setSpacing(ctx, px) {
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${px}px`;
}

function drawText(ctx, value, x, y, font, fill, align = "center", spacing = 0) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  setSpacing(ctx, spacing);
  ctx.fillText(value, x, y);
  ctx.restore();
}

function measureWith(ctx, font, spacing = 0) {
  return (value, size) => {
    ctx.save();
    ctx.font = size ? font.replace("{size}", size) : font;
    setSpacing(ctx, spacing);
    const { width } = ctx.measureText(value);
    ctx.restore();
    return width;
  };
}

// Two families of interlaced sine waves along each side of the band: the
// engraved "guilloche" of banknotes and degree certificates.
function guilloche(ctx, x0, y0, length, horizontal, band) {
  const families = [
    { wave: 30, amp: band * 0.3, lines: 6, width: 0.7, alpha: 0.9 },
    { wave: 74, amp: band * 0.18, lines: 4, width: 0.5, alpha: 0.6 },
  ];
  families.forEach(({ wave, amp, lines, width, alpha }) => {
    ctx.save();
    ctx.strokeStyle = GOLD;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    for (let k = 0; k < lines; k += 1) {
      const phase = (k * Math.PI) / lines;
      ctx.beginPath();
      for (let s = 0; s <= length; s += 2) {
        const swell = 0.62 + 0.38 * Math.sin((s / (wave * 9)) * 2 * Math.PI);
        const d = amp * swell * Math.sin((s / wave) * 2 * Math.PI + phase);
        const x = horizontal ? x0 + s : x0 + d;
        const y = horizontal ? y0 + d : y0 + s;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  });
}

function rosette(ctx, cx, cy, size) {
  const r = size * 0.42;
  ctx.save();
  ctx.fillStyle = NAVY;
  ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(cx - size / 2 + 4, cy - size / 2 + 4, size - 8, size - 8);
  ctx.lineWidth = 0.9;
  [4, 6].forEach((petals, i) => {
    ctx.beginPath();
    for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.02) {
      const rr = r * (i ? 0.75 : 1) * Math.abs(Math.cos(petals * t * 0.5));
      const x = cx + rr * Math.cos(t);
      const y = cy + rr * Math.sin(t);
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
  ctx.fillStyle = goldFoil(ctx, cx - 6, cy - 6, cx + 6, cy + 6);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBorder(ctx) {
  const o = 30;
  const band = 58;
  const W = CERT_W;
  const H = CERT_H;

  // The navy band.
  ctx.save();
  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.rect(o, o, W - 2 * o, H - 2 * o);
  ctx.rect(o + band, o + band, W - 2 * (o + band), H - 2 * (o + band));
  ctx.fill("evenodd");

  // Guilloche, clipped to the band.
  ctx.beginPath();
  ctx.rect(o, o, W - 2 * o, H - 2 * o);
  ctx.rect(o + band, o + band, W - 2 * (o + band), H - 2 * (o + band));
  ctx.clip("evenodd");
  const mid = o + band / 2;
  guilloche(ctx, o, mid, W - 2 * o, true, band);
  guilloche(ctx, o, H - mid, W - 2 * o, true, band);
  guilloche(ctx, mid, o, H - 2 * o, false, band);
  guilloche(ctx, W - mid, o, H - 2 * o, false, band);
  ctx.restore();

  // Gold edges of the band.
  ctx.save();
  ctx.strokeStyle = goldFoil(ctx, 0, 0, W, H);
  ctx.lineWidth = 3;
  ctx.strokeRect(o + 1.5, o + 1.5, W - 2 * o - 3, H - 2 * o - 3);
  ctx.lineWidth = 2;
  ctx.strokeRect(
    o + band - 1,
    o + band - 1,
    W - 2 * (o + band) + 2,
    H - 2 * (o + band) + 2,
  );
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 0.8;
  ctx.strokeRect(o - 8, o - 8, W - 2 * o + 16, H - 2 * o + 16);
  ctx.restore();

  // Rosettes at the corners of the band.
  [
    [o + band / 2, o + band / 2],
    [W - o - band / 2, o + band / 2],
    [o + band / 2, H - o - band / 2],
    [W - o - band / 2, H - o - band / 2],
  ].forEach(([x, y]) => rosette(ctx, x, y, band + 14));

  // A fine double rule inside, with small diamonds at its corners.
  const i1 = o + band + 20;
  const i2 = i1 + 8;
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.6;
  ctx.strokeRect(i1, i1, W - 2 * i1, H - 2 * i1);
  ctx.lineWidth = 0.6;
  ctx.strokeRect(i2, i2, W - 2 * i2, H - 2 * i2);
  ctx.fillStyle = goldFoil(ctx, 0, 0, W, H);
  [
    [i1, i1],
    [W - i1, i1],
    [i1, H - i1],
    [W - i1, H - i1],
  ].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x + 9, y);
    ctx.lineTo(x, y + 9);
    ctx.lineTo(x - 9, y);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
  return i2;
}

function drawPaper(ctx) {
  ctx.save();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, CERT_W, CERT_H);
  const g = ctx.createRadialGradient(
    CERT_W / 2,
    CERT_H / 2,
    CERT_H * 0.2,
    CERT_W / 2,
    CERT_H / 2,
    CERT_W * 0.62,
  );
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(214,196,150,0.28)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CERT_W, CERT_H);
  ctx.restore();
}

// The campus path, faded into the lower part of the page like an
// engraving under the words.
function drawCampus(ctx, photo, inner) {
  if (!photo || typeof document === "undefined") return;
  const w = CERT_W - 2 * inner;
  const h = 420;
  const layer = document.createElement("canvas");
  layer.width = w;
  layer.height = h;
  const lc = layer.getContext("2d");
  if (!lc) return;
  const scale = Math.max(w / photo.width, h / photo.height);
  const dw = photo.width * scale;
  const dh = photo.height * scale;
  if ("filter" in lc) lc.filter = "grayscale(1) sepia(0.55) contrast(1.05)";
  lc.drawImage(photo, (w - dw) / 2, h - dh, dw, dh);
  lc.filter = "none";
  lc.globalCompositeOperation = "destination-in";
  const fade = lc.createLinearGradient(0, 0, 0, h);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(0.45, "rgba(0,0,0,0.7)");
  fade.addColorStop(1, "rgba(0,0,0,1)");
  lc.fillStyle = fade;
  lc.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.drawImage(layer, inner, CERT_H - inner - h);
  ctx.restore();
}

function ornamentRule(ctx, cx, y, half) {
  ctx.save();
  const g = ctx.createLinearGradient(cx - half, y, cx + half, y);
  g.addColorStop(0, "rgba(201,165,90,0)");
  g.addColorStop(0.5, GOLD);
  g.addColorStop(1, "rgba(201,165,90,0)");
  ctx.strokeStyle = g;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - half, y);
  ctx.lineTo(cx - 14, y);
  ctx.moveTo(cx + 14, y);
  ctx.lineTo(cx + half, y);
  ctx.stroke();
  ctx.fillStyle = goldFoil(ctx, cx - 8, y - 8, cx + 8, y + 8);
  ctx.beginPath();
  ctx.moveTo(cx, y - 7);
  ctx.lineTo(cx + 7, y);
  ctx.lineTo(cx, y + 7);
  ctx.lineTo(cx - 7, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function circularText(ctx, value, cx, cy, radius, font) {
  ctx.save();
  ctx.font = font;
  setSpacing(ctx, 0);
  const widths = [...value].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0);
  let angle = -Math.PI / 2 - total / radius / 2;
  ctx.fillStyle = NAVY;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  [...value].forEach((ch, i) => {
    const a = angle + widths[i] / radius / 2;
    ctx.save();
    ctx.translate(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    angle += widths[i] / radius;
  });
  ctx.restore();
}

function drawSeal(ctx, cx, cy, r, crest) {
  ctx.save();
  // Ribbons.
  ctx.fillStyle = NAVY;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(cx + side * r * 0.18, cy + r * 0.5);
    ctx.lineTo(cx + side * r * 0.62, cy + r * 0.42);
    ctx.lineTo(cx + side * r * 0.78, cy + r * 1.38);
    ctx.lineTo(cx + side * r * 0.52, cy + r * 1.2);
    ctx.lineTo(cx + side * r * 0.36, cy + r * 1.45);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // The serrated gold disc.
  const points = 64;
  ctx.beginPath();
  for (let i = 0; i <= points * 2; i += 1) {
    const rr = i % 2 ? r * 0.93 : r;
    const a = (i / (points * 2)) * Math.PI * 2;
    const x = cx + rr * Math.cos(a);
    const y = cy + rr * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.shadowColor = "rgba(60,40,0,0.35)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = goldFoil(ctx, cx - r, cy - r, cx + r, cy + r);
  ctx.fill();
  ctx.shadowColor = "transparent";

  ctx.strokeStyle = GOLD_DEEP;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.84, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.56, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  circularText(
    ctx,
    "PDPM IIITDM JABALPUR ✦ GRADUATE ✦",
    cx,
    cy,
    r * 0.7,
    `700 ${Math.round(r * 0.15)}px ${FONTS.display}`,
  );

  ctx.save();
  ctx.fillStyle = "#fffaf0";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.54, 0, Math.PI * 2);
  ctx.fill();
  if (crest) {
    const s = r * 0.72;
    ctx.drawImage(crest, cx - s / 2, cy - s / 2, s, s);
  }
  ctx.restore();
}

// Draws the whole certificate. `ctx` must already be scaled to the
// logical CERT_W x CERT_H space.
export function drawCertificate(ctx, words, { crest, photo } = {}) {
  const cx = CERT_W / 2;
  drawPaper(ctx);
  const inner = drawBorder(ctx);
  drawCampus(ctx, photo, inner);

  if (crest) ctx.drawImage(crest, cx - 56, 148, 112, 112);

  drawText(
    ctx,
    "PDPM INDIAN INSTITUTE OF INFORMATION TECHNOLOGY,",
    cx,
    302,
    `600 28px ${FONTS.display}`,
    NAVY,
    "center",
    3,
  );
  drawText(
    ctx,
    "DESIGN AND MANUFACTURING, JABALPUR",
    cx,
    340,
    `600 28px ${FONTS.display}`,
    NAVY,
    "center",
    3,
  );
  drawText(
    ctx,
    "An Institute of National Importance under the Ministry of Education, Government of India",
    cx,
    378,
    `italic 500 20px ${FONTS.serif}`,
    MUTED,
  );
  ornamentRule(ctx, cx, 410, 260);

  // The one gold-foil word.
  ctx.save();
  ctx.font = `700 72px ${FONTS.display}`;
  setSpacing(ctx, 10);
  ctx.textAlign = "center";
  const titleWidth = ctx.measureText("CONGRATULATIONS").width;
  ctx.fillStyle = goldFoil(
    ctx,
    cx - titleWidth / 2,
    440,
    cx + titleWidth / 2,
    500,
  );
  ctx.shadowColor = "rgba(90,60,0,0.18)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1.5;
  ctx.fillText("CONGRATULATIONS", cx, 500);
  ctx.restore();

  drawText(
    ctx,
    "This keepsake is presented with pride to",
    cx,
    558,
    `italic 500 27px ${FONTS.serif}`,
    MUTED,
  );

  const nameFont = `400 {size}px ${FONTS.script}`;
  const nameSize = fitFontSize(
    measureWith(ctx, nameFont),
    words.name,
    1150,
    108,
    48,
  );
  drawText(
    ctx,
    words.name,
    cx,
    676,
    nameFont.replace("{size}", nameSize),
    NAVY,
  );
  ornamentRule(ctx, cx, 712, 380);

  const citationFont = `600 27px ${FONTS.serif}`;
  wrapText(measureWith(ctx, citationFont), words.citation, 1300).forEach(
    (line, i) => drawText(ctx, line, cx, 764 + i * 34, citationFont, INK),
  );
  if (words.details) {
    drawText(
      ctx,
      words.details,
      cx,
      806,
      `italic 500 24px ${FONTS.serif}`,
      MUTED,
    );
  }

  const messageFont = `italic 500 23px ${FONTS.serif}`;
  wrapText(measureWith(ctx, messageFont), words.message, 1060).forEach(
    (line, i) => drawText(ctx, line, cx, 870 + i * 32, messageFont, INK),
  );

  drawSeal(ctx, 318, 1000, 84, crest);

  const signX = CERT_W - 330;
  drawText(
    ctx,
    "With pride and every good wish,",
    signX,
    990,
    `italic 500 24px ${FONTS.serif}`,
    INK,
  );
  ornamentRule(ctx, signX, 1014, 170);
  drawText(
    ctx,
    "PDPM IIITDM JABALPUR",
    signX,
    1050,
    `600 20px ${FONTS.display}`,
    NAVY,
    "center",
    2.5,
  );

  drawText(
    ctx,
    "A keepsake from Fusion, the institute ERP. It is not a degree certificate.",
    cx,
    CERT_H - inner - 18,
    `italic 500 15px ${FONTS.serif}`,
    MUTED,
  );
}

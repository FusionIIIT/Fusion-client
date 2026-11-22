import { Button, Group, Text } from "@mantine/core";
import { DownloadSimple, FilePdf, FileImage } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import campus from "../../assets/LHTC.jpg";
import crest from "../../assets/Insti_logo.svg";
import classes from "./GraduateWelcome.module.css";
import {
  CERT_H,
  CERT_W,
  EXPORT_SCALE,
  FONT_LOADS,
  certificateFileName,
  certificateText,
  drawCertificate,
} from "./graduateCertificate";

export { titleCase } from "./graduateCertificate";

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadFonts() {
  if (typeof document === "undefined" || !document.fonts?.load) return;
  await Promise.all(
    FONT_LOADS.map((spec) => document.fonts.load(spec).catch(() => null)),
  );
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// The landing page of a graduate: a congratulation, and a certificate to
// keep in PDF, PNG or JPG. It is a farewell, not a menu: the pages an
// alumnus keeps are in the side navigation.
export default function GraduateWelcome() {
  const name = useSelector((state) => state.user.username);
  const rollNo = useSelector((state) => state.user.roll_no);
  const info = useSelector((state) => state.user.studentInfo);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(null);

  const words = useMemo(
    () =>
      certificateText({
        name,
        programme: info?.discipline,
        batch: info?.batch,
        rollNo,
      }),
    [name, info, rollNo],
  );

  useEffect(() => {
    let cancelled = false;
    async function paint() {
      const [crestImg, photo] = await Promise.all([
        loadImage(crest),
        loadImage(campus),
        loadFonts(),
      ]);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext?.("2d");
      if (cancelled || !ctx) return;
      ctx.setTransform(EXPORT_SCALE, 0, 0, EXPORT_SCALE, 0, 0);
      drawCertificate(ctx, words, { crest: crestImg, photo });
      setReady(true);
    }
    paint();
    return () => {
      cancelled = true;
    };
  }, [words]);

  const download = async (kind) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(kind);
    try {
      if (kind === "pdf") {
        const { jsPDF: JsPdf } = await import("jspdf");
        const doc = new JsPdf({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });
        doc.addImage(
          canvas.toDataURL("image/jpeg", 0.95),
          "JPEG",
          0,
          0,
          297,
          210,
        );
        doc.save(certificateFileName(rollNo, "pdf"));
      } else {
        const type = kind === "png" ? "image/png" : "image/jpeg";
        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, type, 0.95);
        });
        if (blob) saveBlob(blob, certificateFileName(rollNo, kind));
      }
    } finally {
      setSaving(null);
    }
  };

  const description = [
    "Certificate of congratulations from PDPM IIITDM Jabalpur.",
    `Presented to ${words.name}`,
    words.citation,
    words.details,
    words.message,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <section className={classes.stage} aria-labelledby="graduate-headline">
      <img className={classes.photo} src={campus} alt="" />
      <div className={classes.veil} />

      <div className={classes.content}>
        <h1
          id="graduate-headline"
          className={`${classes.headline} ${classes.rise}`}
          style={{ "--step": 0 }}
        >
          <span className={classes.greeting}>Congratulations,</span>{" "}
          <span className={classes.name}>{words.name}</span>
        </h1>

        <figure
          className={`${classes.certificate} ${classes.rise}`}
          style={{ "--step": 1 }}
        >
          <div role="img" aria-label={description}>
            <canvas
              ref={canvasRef}
              width={CERT_W * EXPORT_SCALE}
              height={CERT_H * EXPORT_SCALE}
              aria-hidden="true"
              className={ready ? classes.drawn : undefined}
            />
          </div>
        </figure>

        <div
          className={`${classes.downloads} ${classes.rise}`}
          style={{ "--step": 2 }}
        >
          <Text className={classes.downloadLabel}>
            <DownloadSimple size={18} weight="light" /> Keep your certificate
          </Text>
          <Group gap="sm" justify="center">
            <Button
              className={classes.goldButton}
              leftSection={<FilePdf size={18} />}
              loading={saving === "pdf"}
              disabled={!ready}
              onClick={() => download("pdf")}
            >
              Download PDF
            </Button>
            <Button
              className={classes.outlineButton}
              variant="outline"
              leftSection={<FileImage size={18} />}
              loading={saving === "png"}
              disabled={!ready}
              onClick={() => download("png")}
            >
              Download PNG
            </Button>
            <Button
              className={classes.outlineButton}
              variant="outline"
              leftSection={<FileImage size={18} />}
              loading={saving === "jpg"}
              disabled={!ready}
              onClick={() => download("jpg")}
            >
              Download JPG
            </Button>
          </Group>
        </div>
      </div>
    </section>
  );
}

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PDF_MARGIN = { top: 75, left: 23, right: 23, bottom: 25 };
const PAGE_W_MM = 210;
const PAGE_H_MM = 297;
const CONTENT_W_MM = PAGE_W_MM - PDF_MARGIN.left - PDF_MARGIN.right;
const CONTENT_H_MM = PAGE_H_MM - PDF_MARGIN.top - PDF_MARGIN.bottom;
const CONTENT_W_PX = Math.round(CONTENT_W_MM * (96 / 25.4));
const CONTENT_H_PX = Math.round(CONTENT_H_MM * (96 / 25.4));

export async function saveGradeSheetPDF(html, filename) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let firstPage = true;

  const cleanHTML = html
    .replace(/@page\b[^{]*\{[^}]*\}/g, "")
    .replace(/@media\s+print\s*\{[\s\S]*?\}/g, "")
    .replace(/(:\s*)hidden\b/g, "$1none")
    .replace(
      /border-collapse\s*:\s*collapse/g,
      "border-collapse:separate;border-spacing:0",
    )
    .replace(
      /<\/style>/i,
      `
  body { background: #fff !important; }
</style>`,
    );

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    `position:fixed;top:-99999px;left:-99999px;` +
    `width:${CONTENT_W_PX}px;height:10px;border:none;visibility:hidden;`;
  document.body.appendChild(iframe);

  try {
    const iDoc = iframe.contentDocument;
    iDoc.open();
    iDoc.write(cleanHTML);
    iDoc.close();

    await new Promise((r) => setTimeout(r, 250));
    iDoc.body.style.cssText = `margin:0;padding:0;width:${CONTENT_W_PX}px;background:#fff;`;
    iframe.style.height = `${iDoc.body.scrollHeight}px`;
    await new Promise((r) => setTimeout(r, 100));

    const shedOverflowingPages = (pageDivs) => {
      for (let i = 0; i < pageDivs.length; i += 1) {
        const pageDiv = pageDivs[i];
        let nextPage = null;

        while (pageDiv.scrollHeight > CONTENT_H_PX) {
          const semBlocks = Array.from(
            pageDiv.querySelectorAll(":scope > .sem-block"),
          );
          if (semBlocks.length < 2) break;

          if (!nextPage) {
            const legendBlock = pageDiv.querySelector(":scope > .legend-block");
            const footerBlock = pageDiv.querySelector(":scope > .footer-block");
            nextPage = iDoc.createElement("div");
            nextPage.className = "gs-page";
            pageDiv.parentNode.insertBefore(nextPage, pageDiv.nextSibling);
            pageDivs.splice(i + 1, 0, nextPage);
            if (legendBlock) nextPage.appendChild(legendBlock);
            if (footerBlock) nextPage.appendChild(footerBlock.cloneNode(true));
          }

          const lastBlock = semBlocks[semBlocks.length - 1];
          const gapBox = lastBlock.previousElementSibling;
          const isGap = gapBox && gapBox.classList.contains("sem-gap");
          const hadSemBlock = !!nextPage.querySelector(":scope > .sem-block");

          nextPage.insertBefore(lastBlock, nextPage.firstChild);
          if (isGap) {
            if (hadSemBlock)
              nextPage.insertBefore(gapBox, lastBlock.nextSibling);
            else gapBox.remove();
          }
        }
      }
      return pageDivs;
    };

    const hideHeaderRows = (block) => {
      const ir1 = block.querySelector(".ir1");
      const ir2 = block.querySelector(".ir2");
      if (ir1) ir1.style.display = "none";
      if (ir2) ir2.style.display = "none";
    };
    const showHeaderRows = (block) => {
      const ir1 = block.querySelector(".ir1");
      const ir2 = block.querySelector(".ir2");
      if (ir1) ir1.style.display = "";
      if (ir2) ir2.style.display = "";
    };

    const allSemBlocks = Array.from(iDoc.querySelectorAll(".sem-block"));
    allSemBlocks.slice(1).forEach(hideHeaderRows);

    let pageDivs = Array.from(iDoc.querySelectorAll(".gs-page"));
    pageDivs = shedOverflowingPages(pageDivs);

    pageDivs.slice(1).forEach((pageDiv) => {
      const firstBlock = pageDiv.querySelector(":scope > .sem-block");
      if (firstBlock) showHeaderRows(firstBlock);
    });
    pageDivs = shedOverflowingPages(pageDivs);

    const completionRows = Array.from(iDoc.querySelectorAll(".completion-row"));
    const completionText =
      completionRows[0]?.querySelector("td")?.textContent || "";
    completionRows.forEach((row) => row.remove());

    pageDivs = Array.from(iDoc.querySelectorAll(".gs-page"));
    const lastPageDiv = pageDivs[pageDivs.length - 1];
    const lastLegendTable = lastPageDiv?.querySelector("#legend-table");
    if (completionText && lastLegendTable) {
      const tr = iDoc.createElement("tr");
      const td = iDoc.createElement("td");
      td.colSpan = 2;
      td.style.cssText =
        "font-size:9pt;text-align:center;font-weight:bold;padding:4pt 5pt";
      td.textContent = completionText;
      tr.appendChild(td);
      lastLegendTable.appendChild(tr);
    }

    pageDivs.forEach((p, idx) => {
      const pnDiv = p.querySelector(".page-number");
      if (pnDiv) pnDiv.textContent = `Page ${idx + 1} of ${pageDivs.length}`;
    });

    pageDivs.forEach((p) => {
      const footerBlock = p.querySelector(":scope > .footer-block");
      const signatureTable = footerBlock?.querySelector("table");
      if (!signatureTable) return;
      const remaining = CONTENT_H_PX - p.scrollHeight;
      if (remaining > 0) {
        const spacer = iDoc.createElement("div");
        spacer.style.height = `${remaining}px`;
        signatureTable.parentNode.insertBefore(spacer, signatureTable);
      }
    });

    iframe.style.height = `${iDoc.body.scrollHeight}px`;
    await new Promise((r) => setTimeout(r, 100));

    const BORDER = "1px solid #000";
    const NONE = "none";
    const tables = [
      { sel: "#info-table", type: "box" },
      { sel: "#course-table", type: "box+header" },
      { sel: "#spi-table", type: "grid" },
      { sel: "#gp-table", type: "box+col" },
      { sel: "#abbr-table", type: "box+col" },
      { sel: "#ss-table", type: "box+col" },
      { sel: "#legend-table", type: "box+rows" },
    ];

    tables.forEach(({ sel, type }) => {
      const tbls = Array.from(iDoc.querySelectorAll(sel));
      tbls.forEach((tbl) => {
        const rows = Array.from(tbl.rows);
        const lastRowIdx = rows.length - 1;

        rows.forEach((row, rIdx) => {
          const isFirstRow = rIdx === 0;
          const isLastRow = rIdx === lastRowIdx;
          const cells = Array.from(row.cells);
          const lastColIdx = cells.length - 1;

          cells.forEach((cell, cIdx) => {
            const normStyle = (cell.getAttribute("style") || "").replace(
              /\s/g,
              "",
            );
            if (normStyle.includes("border:none")) {
              cell.style.border = "none";
              return;
            }
            const origHideLeft = normStyle.includes("border-left:none");
            const isFirstCol = cIdx === 0;
            const isLastCol = cIdx === lastColIdx;

            let bottomDivider = NONE;
            let leftDivider = NONE;
            if (type === "grid") {
              bottomDivider = isLastRow ? NONE : BORDER;
              leftDivider = isFirstCol || origHideLeft ? NONE : BORDER;
            } else if (type === "box+header") {
              bottomDivider = isFirstRow && !isLastRow ? BORDER : NONE;
            } else if (type === "box+rows") {
              bottomDivider = isLastRow ? NONE : BORDER;
            } else if (type === "box+col") {
              leftDivider = isFirstCol ? NONE : BORDER;
            }

            cell.style.borderTop = isFirstRow ? BORDER : NONE;
            cell.style.borderBottom = isLastRow ? BORDER : bottomDivider;
            cell.style.borderLeft = isFirstCol ? BORDER : leftDivider;
            cell.style.borderRight = isLastCol ? BORDER : NONE;
          });
        });
      });
    });

    const pageNodes = Array.from(iDoc.querySelectorAll(".gs-page"));
    const nodesToRender = pageNodes.length > 0 ? pageNodes : [iDoc.body];

    for (const node of nodesToRender) {
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: CONTENT_W_PX,
        windowWidth: CONTENT_W_PX,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgH = (canvas.height / canvas.width) * CONTENT_W_MM;
      if (!firstPage) pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        PDF_MARGIN.left,
        PDF_MARGIN.top,
        CONTENT_W_MM,
        imgH,
      );
      firstPage = false;
    }
  } finally {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
  }

  pdf.save(filename);
}

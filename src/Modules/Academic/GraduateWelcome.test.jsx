import { MantineProvider } from "@mantine/core";
import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GraduateWelcome from "./GraduateWelcome";
import userReducer, {
  setRollNo,
  setStudentInfo,
  setStudentStatus,
  setUserName,
} from "../../redux/userslice";
import { theme } from "../../ui/theme/theme";

// jsdom cannot draw; the drawing is not what these tests are about.
vi.mock("./graduateCertificate", async (importActual) => ({
  ...(await importActual()),
  drawCertificate: vi.fn(),
}));

const pdf = { addImage: vi.fn(), save: vi.fn(), options: null };
vi.mock("jspdf", () => ({
  jsPDF: vi.fn((options) => {
    pdf.options = options;
    return pdf;
  }),
}));

function show({
  name = "ASHA RAO",
  info = { discipline: "B.Tech CSE", batch: 2021 },
} = {}) {
  const store = configureStore({ reducer: { user: userReducer } });
  store.dispatch(setUserName(name));
  store.dispatch(setRollNo("21BCS001"));
  store.dispatch(setStudentStatus("ALUMNI"));
  store.dispatch(setStudentInfo(info));
  render(
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <MemoryRouter>
          <GraduateWelcome />
        </MemoryRouter>
      </MantineProvider>
    </Provider>,
  );
}

const certificate = () =>
  screen.getByRole("img", { name: /Certificate of congratulations/ });

async function whenDrawn() {
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled(),
  );
}

describe("GraduateWelcome", () => {
  let clicked;
  let spies;

  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      setTransform: vi.fn(),
    }));
    HTMLCanvasElement.prototype.toBlob = vi.fn((done, type) =>
      done(new Blob(["x"], { type })),
    );
    HTMLCanvasElement.prototype.toDataURL = vi.fn(
      () => "data:image/jpeg;base64,eA==",
    );
    window.URL.createObjectURL = vi.fn(() => "blob:certificate");
    window.URL.revokeObjectURL = vi.fn();
    clicked = [];
    spies = [];
    spies.push(
      vi
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(function remember() {
          clicked.push(this.download);
        }),
    );
    // Images never load in jsdom; let them "load" at once.
    spies.push(
      vi.spyOn(window, "Image").mockImplementation(function FakeImage() {
        const img = {};
        Object.defineProperty(img, "src", {
          set() {
            setTimeout(() => img.onload?.(), 0);
          },
        });
        return img;
      }),
    );
  });

  afterEach(() => {
    spies.forEach((spy) => spy.mockRestore());
    pdf.addImage.mockClear();
    pdf.save.mockClear();
  });

  it("congratulates the graduate by name, in title case", () => {
    show();
    expect(
      screen.getByRole("heading", { name: "Congratulations, Asha Rao" }),
    ).toBeInTheDocument();
  });

  it("describes the certificate for screen readers, message included", () => {
    show();
    const label = certificate().getAttribute("aria-label");
    expect(label).toContain("Presented to Asha Rao");
    expect(label).toContain(
      "on graduating from PDPM Indian Institute of Information Technology, Design and Manufacturing, Jabalpur",
    );
    expect(label).toContain("B.Tech CSE, batch of 2021, roll number 21BCS001");
    expect(label).toContain("you will always be part of ours");
  });

  it("has no links away: only the certificate downloads", () => {
    show();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Download PDF",
      "Download PNG",
      "Download JPG",
    ]);
  });

  it("downloads a PNG and a JPG named after the roll number", async () => {
    show();
    await whenDrawn();
    fireEvent.click(screen.getByRole("button", { name: "Download PNG" }));
    await waitFor(() =>
      expect(clicked).toContain("Graduation-certificate-21BCS001.png"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Download JPG" }));
    await waitFor(() =>
      expect(clicked).toContain("Graduation-certificate-21BCS001.jpg"),
    );
    const types = HTMLCanvasElement.prototype.toBlob.mock.calls.map(
      (call) => call[1],
    );
    expect(types).toEqual(["image/png", "image/jpeg"]);
  });

  it("downloads a landscape A4 PDF filled by the certificate", async () => {
    show();
    await whenDrawn();
    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
    await waitFor(() =>
      expect(pdf.save).toHaveBeenCalledWith(
        "Graduation-certificate-21BCS001.pdf",
      ),
    );
    expect(pdf.options).toEqual({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    expect(pdf.addImage).toHaveBeenCalledWith(
      "data:image/jpeg;base64,eA==",
      "JPEG",
      0,
      0,
      297,
      210,
    );
  });

  it("keeps hyphenated and apostrophe names readable", () => {
    show({ name: "MARY-ANN D'SOUZA" });
    expect(
      screen.getByRole("heading", {
        name: "Congratulations, Mary-Ann D'Souza",
      }),
    ).toBeInTheDocument();
  });
});

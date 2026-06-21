import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// eslint-disable-next-line import/first
import axios from "axios";
// eslint-disable-next-line import/first
import { placementApi } from "./api";

describe("placementApi endpoint + auth contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: {} });
    axios.post.mockResolvedValue({ data: {} });
    axios.put.mockResolvedValue({ data: {} });
    axios.delete.mockResolvedValue({ data: {} });
    localStorage.setItem("authToken", "T");
  });

  it("every method targets the backend /placement/api/* surface", async () => {
    await placementApi.getMyApplications();
    await placementApi.getMyOffers();
    await placementApi.getCalendarEvents();
    await placementApi.getPlacementStatistics();
    await placementApi.getRegistrationList();

    const calledUrls = axios.get.mock.calls.map(([url]) => url);
    expect(calledUrls).toHaveLength(5);
    calledUrls.forEach((url) => {
      expect(url).toMatch(/\/placement\/api\//);
    });
  });

  it("getOfferDetail GETs the offer endpoint with the auth token header", async () => {
    await placementApi.getOfferDetail(7);
    expect(axios.get).toHaveBeenCalledTimes(1);
    const [url, config] = axios.get.mock.calls[0];
    expect(url).toMatch(/\/placement\/api\/offer\/7\/$/);
    expect(config.headers.Authorization).toBe("Token T");
  });

  it("respondToOffer POSTs the action to the respond endpoint", async () => {
    await placementApi.respondToOffer(7, "ACCEPTED");
    const [url, body, config] = axios.post.mock.calls[0];
    expect(url).toMatch(/\/placement\/api\/offer\/7\/respond\/$/);
    expect(body).toEqual({ action: "ACCEPTED" });
    expect(config.headers.Authorization).toBe("Token T");
  });

  it("getPlacementSchedule forwards query params", async () => {
    await placementApi.getPlacementSchedule({ company: "Acme" });
    const [url, config] = axios.get.mock.calls[0];
    expect(url).toMatch(/\/placement\/api\/placement\/$/);
    expect(config.params).toEqual({ company: "Acme" });
  });

  it("getApplications builds the per-schedule URL", async () => {
    await placementApi.getApplications(12);
    expect(axios.get.mock.calls[0][0]).toMatch(
      /\/placement\/api\/student-applications\/12\/$/,
    );
  });

  it("announcement methods target the announcements endpoint", async () => {
    await placementApi.getAnnouncements();
    expect(axios.get.mock.calls[0][0]).toMatch(
      /\/placement\/api\/announcements\/$/,
    );

    await placementApi.createAnnouncement({ title: "T", body: "B" });
    const [postUrl, body] = axios.post.mock.calls[0];
    expect(postUrl).toMatch(/\/placement\/api\/announcements\/$/);
    expect(body).toEqual({ title: "T", body: "B" });

    await placementApi.deleteAnnouncement(5);
    expect(axios.delete.mock.calls[0][0]).toMatch(
      /\/placement\/api\/announcements\/5\/$/,
    );
  });

  it("off-campus methods target the offcampus endpoint", async () => {
    await placementApi.getOffCampusPlacements();
    expect(axios.get.mock.calls[0][0]).toMatch(
      /\/placement\/api\/offcampus\/$/,
    );

    await placementApi.createOffCampusPlacement({ roll_no: "2023001" });
    const [postUrl, body] = axios.post.mock.calls[0];
    expect(postUrl).toMatch(/\/placement\/api\/offcampus\/$/);
    expect(body).toEqual({ roll_no: "2023001" });

    await placementApi.deleteOffCampusPlacement(9);
    expect(axios.delete.mock.calls[0][0]).toMatch(
      /\/placement\/api\/offcampus\/9\/$/,
    );
  });
});

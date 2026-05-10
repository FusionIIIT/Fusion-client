import React from "react";
import InsightsPage from "../../PCCAdmin/Dashboard/InsightsPage";
import {
  fetchDirectorInsightsReport,
  downloadDirectorInsightsCsv,
} from "../../../services/directorService";

function DirectorInsights() {
  return (
    <InsightsPage
      fetchInsightsReport={fetchDirectorInsightsReport}
      downloadInsightsCsv={downloadDirectorInsightsCsv}
    />
  );
}

export default DirectorInsights;

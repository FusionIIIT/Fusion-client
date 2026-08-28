import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { host } from "../../../../routes/globalRoutes";
import { categorizeBatchesByProgramme } from "../AdminUpcomingBatchesUtils";

// Owns the batch lists (UG/PG/PhD) plus batch fetch/sync. activeSection and
// viewAcademicYear come from the filters slice and scope getCurrentBatches.
export function useBatchData(activeSection, viewAcademicYear) {
  const [ugBatches, setUgBatches] = useState([]);
  const [pgBatches, setPgBatches] = useState([]);
  const [phdBatches, setPhdBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backgroundSync, setBackgroundSync] = useState(false);

  const getCurrentBatches = () => {
    let allBatches;

    if (activeSection === "ug") allBatches = ugBatches || [];
    else if (activeSection === "pg") allBatches = pgBatches || [];
    else allBatches = phdBatches || [];

    const processedBatches = allBatches.map((batch) => {
      const totalSeats = batch.totalSeats || batch.total_seats || 80;
      const filledSeats =
        batch.filledSeats || batch.filled_seats || batch.student_count || 0;
      const availableSeats = Math.max(0, totalSeats - filledSeats);

      return {
        ...batch,
        totalSeats,
        filledSeats,
        availableSeats,
        name: batch.name || batch.programme || "Unknown",
        curriculum: batch.curriculum || batch.curriculum_name || "N/A",
        curriculum_display: batch.curriculum_display,
        curriculumVersion:
          batch.curriculumVersion || batch.curriculum_version || null,
      };
    });

    // Filter out incomplete batches (those with missing essential data)
    const validBatches = processedBatches.filter((batch) => {
      const hasYear = batch.year;
      const hasNameOrProgramme =
        (batch.name && batch.name.trim() !== "") ||
        (batch.programme && batch.programme.trim() !== "");
      const hasDisciplineOrSeats =
        (batch.discipline && batch.discipline.trim() !== "") ||
        batch.totalSeats > 0 ||
        batch.filledSeats > 0;

      const isValid = hasYear && (hasNameOrProgramme || hasDisciplineOrSeats);

      return isValid;
    });
    return validBatches.filter((batch) => batch.year === viewAcademicYear);
  };
  const fetchBatchData = useCallback(async (showBackgroundSync = true) => {
    if (showBackgroundSync) {
      setBackgroundSync(true);
    } else {
      setLoading(true);
    }
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authorization token not found");
      const response = await axios.get(
        `${host}/programme_curriculum/api/batches/sync/`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      if (response.data && response.data.success) {
        const allBatches = response.data.batches || [];

        const mappedBatches = allBatches.map((batch) => ({
          id: batch.batch_id,
          name: batch.name,
          programme: batch.name,
          discipline: batch.discipline,
          disciplineName: batch.discipline_name,
          fullDisciplineName: batch.discipline_name,
          disciplineId: batch.discipline_id,
          displayBranch: batch.discipline,
          year: batch.year,
          totalSeats: batch.total_seats,
          total_seats: batch.total_seats,
          filledSeats: batch.filled_seats,
          filled_seats: batch.filled_seats,
          student_count: batch.filled_seats,
          availableSeats: batch.available_seats,
          available_seats: batch.available_seats,
          curriculum: batch.curriculum,
          curriculum_display: batch.curriculum_display,
          curriculum_name: batch.curriculum,
          curriculumId: batch.curriculum_id,
          curriculum_id: batch.curriculum_id,
          status: batch.status,
        }));

        const categorizedBatches = categorizeBatchesByProgramme(mappedBatches);

        setUgBatches(categorizedBatches.ug);
        setPgBatches(categorizedBatches.pg);
        setPhdBatches(categorizedBatches.phd);
      } else {
        throw new Error(response.message || "Failed to fetch batch data");
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load batch data. Please try again.",
        color: "red",
      });

      setUgBatches([]);
      setPgBatches([]);
      setPhdBatches([]);
    } finally {
      setBackgroundSync(false);
      setLoading(false);
    }
  }, []);

  const forceRefreshData = useCallback(async () => {
    setBackgroundSync(true);
    try {
      setUgBatches([]);
      setPgBatches([]);
      setPhdBatches([]);
      await fetchBatchData(true);
    } catch (error) {
      // Silently handle error
    } finally {
      setBackgroundSync(false);
    }
  }, [fetchBatchData]);

  useEffect(() => {
    fetchBatchData(false);
  }, [fetchBatchData]);

  return {
    ugBatches,
    pgBatches,
    phdBatches,
    backgroundSync,
    loading,
    setUgBatches,
    setPgBatches,
    setPhdBatches,
    setLoading,
    getCurrentBatches,
    fetchBatchData,
    forceRefreshData,
  };
}

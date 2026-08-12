import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { host } from "../../../../routes/globalRoutes";
import {
  categorizeBatchesByProgramme,
  normalizeBatchData,
} from "../AdminUpcomingBatchesUtils";

// Owns the batch lists (UG/PG/PhD) plus batch fetch/sync. activeSection and
// viewAcademicYear come from the filters slice and scope getCurrentBatches.
export function useBatchData(activeSection, viewAcademicYear) {
  const [ugBatches, setUgBatches] = useState([]);
  const [pgBatches, setPgBatches] = useState([]);
  const [phdBatches, setPhdBatches] = useState([]);
  const [batchData, setBatchData] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [backgroundSync, setBackgroundSync] = useState(false);

  const getCurrentBatches = () => {
    let allBatches;
    
    if (activeSection === "ug") allBatches = ugBatches || [];
    else if (activeSection === "pg") allBatches = pgBatches || [];
    else allBatches = phdBatches || [];

    if (allBatches.length > 0) {
    }

    const processedBatches = allBatches.map(batch => {
      const totalSeats = batch.totalSeats || batch.total_seats || 80;
      const filledSeats = batch.filledSeats || batch.filled_seats || batch.student_count || 0;
      const availableSeats = Math.max(0, totalSeats - filledSeats);
      
      return {
        ...batch,
        totalSeats,
        filledSeats,
        availableSeats,
        name: batch.name || batch.programme || "Unknown",
        curriculum: batch.curriculum || batch.curriculum_name || "N/A",
        curriculum_display: batch.curriculum_display,
        curriculumVersion: batch.curriculumVersion || batch.curriculum_version || null,
      };
    });
    
    // Filter out incomplete batches (those with missing essential data)
    const validBatches = processedBatches.filter(batch => {
      const hasYear = batch.year;
      const hasNameOrProgramme = (batch.name && batch.name.trim() !== "") || (batch.programme && batch.programme.trim() !== "");
      const hasDisciplineOrSeats = (batch.discipline && batch.discipline.trim() !== "") || batch.totalSeats > 0 || batch.filledSeats > 0;
      
      const isValid = hasYear && (hasNameOrProgramme || hasDisciplineOrSeats);

      return isValid;
    });
    return validBatches.filter(batch => batch.year === viewAcademicYear);
  };

  const syncBatchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`${host}/programme_curriculum/api/batches/sync/`, {
        method: 'GET',
        headers: headers
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        // Map the sync API response to the expected format
        const mappedBatches = data.batches.map(batch => ({
          id: batch.batch_id,
          name: batch.name,
          programme: batch.name,
          discipline: batch.discipline,
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
          status: batch.status
        }));
        
        setBatchData({
          upcoming_batches: mappedBatches,
          current_batches: mappedBatches,
          ug: mappedBatches.filter(b => b.name.includes('B.')),
          pg: mappedBatches.filter(b => b.name.includes('M.')),
          phd: mappedBatches.filter(b => b.name.toLowerCase().includes('phd'))
        });
        
      }
    } catch (error) {
    }
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

        const mappedBatches = allBatches.map(batch => ({
          id: batch.batch_id,
          name: batch.name,
          programme: batch.name,
          discipline: batch.discipline,
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
          status: batch.status
        }));

        const categorizedBatches = categorizeBatchesByProgramme(mappedBatches);

        setUgBatches(categorizedBatches.ug);
        setPgBatches(categorizedBatches.pg);
        setPhdBatches(categorizedBatches.phd);

        const allBatchesUnified = [
          ...normalizeBatchData(categorizedBatches.ug),
          ...normalizeBatchData(categorizedBatches.pg),
          ...normalizeBatchData(categorizedBatches.phd)
        ];
        
        setBatchData({
          upcoming_batches: allBatchesUnified,
          current_batches: allBatchesUnified,
          ug: normalizeBatchData(categorizedBatches.ug),
          pg: normalizeBatchData(categorizedBatches.pg),
          phd: normalizeBatchData(categorizedBatches.phd)
        });

        await syncBatchData();
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
      setBatchData(null);
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
    syncBatchData,
  };
}

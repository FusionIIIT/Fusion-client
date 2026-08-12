import { useState, useEffect } from "react";
import { PROGRAMME_TYPES } from "../AdminUpcomingBatchesConstants";
import { getCurrentBatchYear } from "../AdminUpcomingBatchesUtils";

// Owns section-tab + search/programme/year filter state and the reset-on-tab-switch
// effect. filteredBatches stays in the component (it composes useBatchData).
export function useBatchFilters() {
  const [activeSection, setActiveSection] = useState(PROGRAMME_TYPES.UG);
  const [selectedBatchYear, setSelectedBatchYear] = useState(() => getCurrentBatchYear());
  const [viewAcademicYear, setViewAcademicYear] = useState(() => getCurrentBatchYear()); 

  const [searchQuery, setSearchQuery] = useState("");
  // filterYear is kept as "" (no-op) — year filtering is handled by viewAcademicYear / matchesViewYear
  const [filterYear, setFilterYear] = useState("");
  const [filterProgramme, setFilterProgramme] = useState("");
  const [phdSemesterFilter, setPhdSemesterFilter] = useState("");
  const [selectedPhdSemester, setSelectedPhdSemester] = useState(""); // For student data entry

  useEffect(() => {
    const currentYear = getCurrentBatchYear();
    setSelectedBatchYear(currentYear);
    // All PhD batches (Odd and Even) use batch_year = academic year start.
    // e.g. PhD Even January 2026 intake → batch_year=2025 (academic year 2025-26).
    // So the default view year is always currentBatchYear, same as UG/PG.
    setViewAcademicYear(currentYear);
    setPhdSemesterFilter(""); // Reset PhD filter when switching sections
    setSelectedPhdSemester(""); // Reset PhD semester selection for data entry
  }, [activeSection]);

  return {
    activeSection,
    setActiveSection,
    selectedBatchYear,
    setSelectedBatchYear,
    viewAcademicYear,
    setViewAcademicYear,
    searchQuery,
    setSearchQuery,
    filterYear,
    setFilterYear,
    filterProgramme,
    setFilterProgramme,
    phdSemesterFilter,
    setPhdSemesterFilter,
    selectedPhdSemester,
    setSelectedPhdSemester,
  };
}

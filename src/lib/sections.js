import { useEffect, useState } from "react";
import axios from "axios";

import { sectionsInUseRoute } from "../routes/academicRoutes";

// Every section the institute uses, so one list feeds each dropdown. Sections
// are created by assigning one, so the list grows on its own; the letters are a
// fallback for a database that has none yet.
export const FALLBACK_SECTIONS = ["A", "B", "C", "D", "E", "F"];

export function useSectionsInUse() {
  const [sections, setSections] = useState(FALLBACK_SECTIONS);

  useEffect(() => {
    let live = true;
    const token = localStorage.getItem("authToken");
    axios
      .get(sectionsInUseRoute, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      })
      .then(({ data }) => {
        if (live && Array.isArray(data?.sections) && data.sections.length)
          setSections(data.sections);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return sections;
}

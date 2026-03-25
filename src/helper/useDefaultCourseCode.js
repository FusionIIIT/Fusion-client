import { useEffect, useState } from "react";
import api from "./api";

export default function useDefaultCourseCode() {
  const [courseCode, setCourseCode] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get("/ocms/api/courses/");
        const first = Array.isArray(res.data) ? res.data[0] : null;
        const code = first?.courseCode ?? "";
        if (!cancelled) setCourseCode(code);
      } catch {
        if (!cancelled) setCourseCode("");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return courseCode;
}

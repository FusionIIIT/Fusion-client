import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { queuesFor, requestsFor } from "./pendingQueues";

export function usePendingCounts(reachablePaths) {
  const queues = useMemo(() => queuesFor(reachablePaths), [reachablePaths]);
  const [counts, setCounts] = useState({});
  const [settled, setSettled] = useState([]);

  useEffect(() => {
    setCounts({});
    setSettled([]);
    if (!queues.length) return undefined;
    let live = true;
    const token = localStorage.getItem("authToken");
    const headers = { Authorization: `Token ${token}` };

    requestsFor(queues).forEach(({ url, queues: group }) => {
      axios
        .get(url, { headers })
        .then(({ data }) => {
          if (!live) return;
          setCounts((prev) => ({
            ...prev,
            ...Object.fromEntries(group.map((q) => [q.key, q.count(data)])),
          }));
        })
        // A failed request is left out rather than shown as a wrong number.
        .catch(() => {})
        .then(() => {
          if (live) setSettled((prev) => [...prev, ...group.map((q) => q.key)]);
        });
    });

    return () => {
      live = false;
    };
  }, [queues]);

  return { queues, counts, settled };
}

export default usePendingCounts;

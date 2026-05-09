import { useState, useEffect } from "react";

const useFetchData = (fetchFn, deps = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn();
        setData(result ?? []);
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, deps);

  return { data, loading, error };
};

export default useFetchData;

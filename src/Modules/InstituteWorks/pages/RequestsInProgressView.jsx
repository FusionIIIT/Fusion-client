import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import RequestsInProgressTable from "../components/tables/RequestsInProgressTable";
import { getProposals } from "../services/api";

function RequestsInProgressView() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getProposals();
      setRows(data);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch proposals status.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <RequestsInProgressTable
      rows={rows}
      isLoading={isLoading}
      onRefresh={load}
    />
  );
}

export default RequestsInProgressView;

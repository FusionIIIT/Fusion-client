import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import BillGenerationTable from "../components/tables/BillGenerationTable";
import {
  getApiErrorMessage,
  getIssuedWork,
  markBillGenerated,
} from "../services/api";

function BillGenerationView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getIssuedWork(role);
      setRows(data);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch issued work list."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const handleGenerate = async (id) => {
    setWorkingId(id);
    try {
      await markBillGenerated(id);
      notifications.show({
        color: "green",
        message: `Bill marked generated for request #${id}.`,
      });
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to mark bill generated."),
      });
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <BillGenerationTable
      rows={rows}
      isLoading={isLoading}
      workingId={workingId}
      onRefresh={load}
      onGenerate={handleGenerate}
    />
  );
}

export default BillGenerationView;

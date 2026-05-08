import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import InfoNotice from "../components/common/InfoNotice";
import RequestForm from "../components/forms/RequestForm";
import {
  createRequest,
  getApiErrorMessage,
  getDesignations,
} from "../services/api";

function CreateRequestView() {
  const role = useSelector((state) => state.user.role);

  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Only engineers allowed in "Forward To"
  const ENGINEER_ROLES = [
    "junior engineer",
    "executive engineer (civil)",
    "electrical_ae",
    "electrical_je",
    "ee",
    "civil_ae",
    "civil_je",
  ];

  useEffect(() => {
    const loadDesignations = async () => {
      setIsLoadingDesignations(true);
      try {
        const response = await getDesignations();
        const designationData = response?.holdsDesignations || [];

        // ✅ Filter ONLY engineers for dropdown
        const options = designationData
          .filter((item) =>
            ENGINEER_ROLES.includes(
              (item.designation?.name || "").toLowerCase(),
            ),
          )
          .map((item) => ({
            value: `${item.designation?.name || ""}|${item.username || ""}`,
            label: `${item.designation?.name || "Unknown"} (${item.username || "-"})`,
          }));

        setDesignationOptions(options);
      } catch (error) {
        notifications.show({
          color: "red",
          message: getApiErrorMessage(
            error,
            "Unable to fetch designation options.",
          ),
        });
      } finally {
        setIsLoadingDesignations(false);
      }
    };

    loadDesignations();
  }, []);

  const emptyNotice = useMemo(
    () =>
      isLoadingDesignations
        ? "Loading designations..."
        : "No engineer options available.",
    [isLoadingDesignations],
  );

  const handleCreateRequest = async (payload) => {
    setIsSubmitting(true);
    try {
      await createRequest({ ...payload, role });

      notifications.show({
        color: "green",
        message: "IWD request created successfully.",
      });
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Failed to create request."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (designationOptions.length === 0) {
    return <InfoNotice message={emptyNotice} />;
  }

  return (
    <RequestForm
      designationOptions={designationOptions}
      isSubmitting={isSubmitting}
      onSubmit={handleCreateRequest}
    />
  );
}

export default CreateRequestView;

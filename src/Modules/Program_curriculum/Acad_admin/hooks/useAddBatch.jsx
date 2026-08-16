import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";
import { createBatch, deleteBatch } from "../../api/api";

// Owns Add-Batch and Delete-Batch modal state + optimistic create/delete. Batch
// setters + getCurrentBatches + forceRefreshData are injected from useBatchData.
export function useAddBatch({
  activeSection,
  selectedBatchYear,
  batchSetters,
  getCurrentBatches,
  forceRefreshData,
}) {
  const { setUgBatches, setPgBatches, setPhdBatches } = batchSetters;
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatchData, setNewBatchData] = useState({
    programme: "",
    discipline: "",
    year: selectedBatchYear,
    totalSeats: 60,
  });
  const [deletingBatchId, setDeletingBatchId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setNewBatchData((prev) => ({
      ...prev,
      year: selectedBatchYear,
    }));
  }, [selectedBatchYear]);

  const handleAddBatch = async () => {
    try {
      if (
        !newBatchData.programme ||
        !newBatchData.discipline ||
        !newBatchData.totalSeats
      ) {
        notifications.show({
          title: "Validation Error",
          message: "Please fill all required fields",
          color: "red",
        });
        return;
      }

      const batchToAdd = {
        ...newBatchData,
        id: Date.now(),
        year: parseInt(newBatchData.year, 10),
        totalSeats: parseInt(newBatchData.totalSeats, 10),
        filledSeats: 0,
        availableSeats: parseInt(newBatchData.totalSeats, 10),
        programme_type: activeSection,
      };

      const updateBatches = (batches) => [...batches, batchToAdd];
      if (activeSection === "ug") setUgBatches(updateBatches);
      else if (activeSection === "pg") setPgBatches(updateBatches);
      else setPhdBatches(updateBatches);

      setShowAddBatchModal(false);
      setNewBatchData({
        programme: "",
        discipline: "",
        year: selectedBatchYear,
        totalSeats: 60,
      });

      try {
        const result = await createBatch(batchToAdd);

        if (result.success) {
          notifications.show({
            title: "Success",
            message: "New batch created successfully",
            color: "green",
          });

          forceRefreshData();
        } else {
          throw new Error(result.message || "Failed to create batch");
        }
      } catch (error) {
        const rollbackBatches = (batches) =>
          batches.filter((b) => b.id !== batchToAdd.id);
        if (activeSection === "ug") setUgBatches(rollbackBatches);
        else if (activeSection === "pg") setPgBatches(rollbackBatches);
        else setPhdBatches(rollbackBatches);

        notifications.show({
          title: "Error",
          message: error.message || "Failed to create batch",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create batch",
        color: "red",
      });
    }
  };

  const handleDeleteBatch = async () => {
    const batchToDelete = getCurrentBatches().find(
      (b) => b.id === deletingBatchId,
    );

    try {
      const updateBatches = (batches) =>
        batches.filter((b) => b.id !== deletingBatchId);
      if (activeSection === "ug") setUgBatches(updateBatches);
      else if (activeSection === "pg") setPgBatches(updateBatches);
      else setPhdBatches(updateBatches);
      setShowDeleteConfirm(false);
      setDeletingBatchId(null);

      const result = await deleteBatch(deletingBatchId);

      if (result.success) {
        notifications.show({
          title: "✅ Batch Deleted Successfully",
          message: (
            <div>
              <Text size="sm" mb={8}>
                <strong>
                  {result.message || "Batch deleted successfully"}
                </strong>
              </Text>
              {result.deleted_batch && (
                <Text size="xs" c="gray.7">
                  Deleted: {result.deleted_batch.name} (
                  {result.deleted_batch.discipline_acronym ||
                    result.deleted_batch.discipline}
                  ) - {result.deleted_batch.year}
                </Text>
              )}
            </div>
          ),
          color: "green",
          autoClose: 6000,
          style: {
            backgroundColor: "#d4edda",
            borderColor: "#c3e6cb",
            color: "#155724",
          },
        });
        forceRefreshData();
      } else {
        throw new Error(result.message || "Failed to delete batch");
      }
    } catch (error) {
      if (batchToDelete) {
        const rollbackBatches = (batches) => [...batches, batchToDelete];
        if (activeSection === "ug") setUgBatches(rollbackBatches);
        else if (activeSection === "pg") setPgBatches(rollbackBatches);
        else setPhdBatches(rollbackBatches);
      }

      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete batch",
        color: "red",
      });
      setShowDeleteConfirm(false);
      setDeletingBatchId(null);
    }
  };

  return {
    showAddBatchModal,
    setShowAddBatchModal,
    newBatchData,
    setNewBatchData,
    deletingBatchId,
    setDeletingBatchId,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleAddBatch,
    handleDeleteBatch,
  };
}

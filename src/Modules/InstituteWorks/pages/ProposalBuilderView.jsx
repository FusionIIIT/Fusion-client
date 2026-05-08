import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import ProposalRequestsTable from "../components/tables/ProposalRequestsTable";
import ProposalItemsModal from "../components/forms/ProposalItemsModal";
import {
  createProposal,
  getApiErrorMessage,
  getRequestsStatus,
} from "../services/api";

function newItemRow() {
  return {
    name: "",
    description: "",
    unit: "",
    quantity: 1,
    price_per_unit: 0,
    docs: null,
  };
}

function ProposalBuilderView() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [items, setItems] = useState([newItemRow()]);

  const load = async () => {
    setIsLoading(true);
    try {
      const [statusRows] = await Promise.all([getRequestsStatus("")]);

      const pendingForProposal = statusRows.filter(
        (row) => !row.activeProposal,
      );
      setRows(pendingForProposal);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(
          error,
          "Unable to load proposal builder data.",
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalBudget = useMemo(
    () =>
      items.reduce(
        (acc, item) =>
          acc + Number(item.quantity || 0) * Number(item.price_per_unit || 0),
        0,
      ),
    [items],
  );

  const ready = useMemo(
    () =>
      Boolean(
        selectedRequestId &&
        items.length > 0 &&
        items.every((item) => item.name && item.unit),
      ),
    [selectedRequestId, items],
  );

  const openModal = (requestId) => {
    setSelectedRequestId(requestId);
    setSupportingDocument(null);
    setItems([newItemRow()]);
    setOpened(true);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, newItemRow()]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;

    setIsSaving(true);
    try {
      await createProposal({
        id: selectedRequestId,
        designation: "",
        supporting_documents: supportingDocument,
        items,
      });
      notifications.show({
        color: "green",
        message: "Proposal created successfully.",
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to create proposal."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ProposalRequestsTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onCreate={openModal}
      />
      <ProposalItemsModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submit}
        title="Create Proposal"
        submitLabel="Submit Proposal"
        supportingDocument={supportingDocument}
        setSupportingDocument={setSupportingDocument}
        items={items}
        updateItem={updateItem}
        addItem={addItem}
        removeItem={removeItem}
        totalBudget={totalBudget}
        isSaving={isSaving}
        isReady={ready}
      />
    </>
  );
}

export default ProposalBuilderView;

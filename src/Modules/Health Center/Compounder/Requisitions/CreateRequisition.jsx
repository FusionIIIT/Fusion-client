import React, { useState, useEffect } from "react";
import { Paper, Title, Button, Table, ActionIcon, NumberInput, TextInput, Select, Text, Group } from "@mantine/core";
import { Trash } from "@phosphor-icons/react";
import { fetchAllMedicines, createRequisitionApi } from "../../services/api";
import NavCom from "../NavCom";
import RequisitionsNav from "./RequisitionsNav";
import CustomBreadcrumbs from "../../components/common/Breadcrumbs";

function CreateRequisition() {
  const [medicines, setMedicines] = useState([]);
  const [items, setItems] = useState([{ medicine_id: "", quantity: 1, notes: "" }]);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await fetchAllMedicines();
      const meds = Array.isArray(res.data?.medicines) ? res.data.medicines : [];
      setMedicines(meds.map(m => ({ 
        value: String(m.id), 
        label: m.medicine_name || m.brand_name || `Medicine #${m.id}` 
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { medicine_id: "", quantity: 1, notes: "" }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    // Validate
    const validItems = items.filter(i => i.medicine_id && i.quantity > 0);
    if (validItems.length === 0) {
      alert("Please add at least one valid item");
      return;
    }
    
    setLoading(true);
    try {
      await createRequisitionApi({ items: validItems, remarks });
      alert("Requisition created successfully");
      setItems([{ medicine_id: "", quantity: 1, notes: "" }]);
      setRemarks("");
    } catch (err) {
      alert("Error creating requisition");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <RequisitionsNav />
      <br />
      <Paper shadow="sm" p="xl" withBorder>
        <Title order={3} style={{ color: "#15abff", marginBottom: 20 }}>Create Inventory Requisition</Title>
        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Medicine</Table.Th>
              <Table.Th>Quantity</Table.Th>
              <Table.Th>Notes</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item, index) => (
              <Table.Tr key={index}>
                <Table.Td>
                  <Select
                    data={medicines}
                    value={item.medicine_id}
                    onChange={(val) => handleChange(index, "medicine_id", val)}
                    searchable
                    placeholder="Select Medicine"
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={item.quantity}
                    onChange={(val) => handleChange(index, "quantity", val)}
                    min={1}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={item.notes}
                    onChange={(e) => handleChange(index, "notes", e.target.value)}
                    placeholder="Optional notes"
                  />
                </Table.Td>
                <Table.Td>
                  <ActionIcon color="red" onClick={() => handleRemoveItem(index)}>
                    <Trash size={18} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        
        <Group mt="md">
          <Button variant="outline" onClick={handleAddItem}>Add Item</Button>
        </Group>

        <TextInput
          mt="md"
          label="Remarks (Optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <Group justify="flex-end" mt="xl">
          <Button loading={loading} onClick={handleSubmit} style={{ backgroundColor: "#15abff" }}>
            Submit Requisition
          </Button>
        </Group>
      </Paper>
    </>
  );
}

export default CreateRequisition;

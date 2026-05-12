import React, { useState } from "react";
import {
  Select,
  TextInput,
  Button,
  Switch,
  Group,
  Modal,
  Box,
  Alert,
  NumberInput,
  Textarea,
  FileInput,
  Text,
  Image,
  Stack,
} from "@mantine/core";
import { IconUpload, IconPhoto } from "@tabler/icons-react";
import { inventoryAPI } from "../../services/visitorHostelApi";
import { 
  validateRequiredFields,
  validateInventoryItem,
  validateBillNumber,
  validateCost,
  validatePositiveNumber,
} from "../../utils/validators";

function AddInventoryItemsForm({ onInventoryAdded }) {
  const [billId, setBillId] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  const [consumable, setConsumable] = useState(false);
  
  // UC-VH-011: New inventory architecture fields
  const [thresholdQuantity, setThresholdQuantity] = useState(5);
  const [unit, setUnit] = useState("pieces");
  const [category, setCategory] = useState("");
  const [remark, setRemark] = useState("");
  
  // Bill photo upload (VhIncharge requirement)
  const [billPhoto, setBillPhoto] = useState(null);
  const [billPhotoPreview, setBillPhotoPreview] = useState(null);
  
  const [modalOpened, setModalOpened] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    // Check required fields including bill photo
    const requiredFields = ["item_name", "bill_number", "quantity", "cost", "threshold_quantity", "unit"];
    const formData = {
      item_name: itemName,
      bill_number: billId,
      quantity: quantity,
      cost: cost,
      threshold_quantity: thresholdQuantity,
      unit: unit,
    };
    
    // VhIncharge must upload bill photo for inventory replenishment
    if (!billPhoto) {
      setError("Bill photo is required for inventory replenishment");
      return false;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(billPhoto.type)) {
      setError("Please upload a valid image file (JPEG, PNG, or GIF)");
      return false;
    }
    
    // Validate file size (max 5MB)
    if (billPhoto.size > 5 * 1024 * 1024) {
      setError("Bill photo must be less than 5MB");
      return false;
    }

    if (!validateRequiredFields(formData, requiredFields)) {
      setError("Please fill in all required fields");
      return false;
    }

    // Validate item name
    if (!validateInventoryItem(itemName)) {
      setError("Item name must be 3-100 characters and contain only letters, numbers, spaces, and common punctuation");
      return false;
    }

    // Validate bill number
    if (!validateBillNumber(billId)) {
      setError("Bill number must be 3-50 characters and contain only letters, numbers, hyphens, underscores, and forward slashes");
      return false;
    }

    // Validate quantity
    if (!validatePositiveNumber(quantity)) {
      setError("Quantity must be a positive number");
      return false;
    }

    // Validate cost
    if (!validateCost(cost)) {
      setError("Cost must be a valid amount between 0 and 10,00,000");
      return false;
    }

    // Validate threshold quantity
    if (!validatePositiveNumber(thresholdQuantity)) {
      setError("Threshold quantity must be a positive number");
      return false;
    }

    // Business rule: threshold should be reasonable
    if (thresholdQuantity > quantity) {
      setError("Threshold quantity cannot be greater than initial quantity");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append('item_name', itemName.trim());
    formData.append('bill_number', billId.trim());
    formData.append('quantity', parseInt(quantity, 10));
    formData.append('cost', parseInt(cost, 10));
    formData.append('consumable', consumable);
    formData.append('threshold_quantity', thresholdQuantity);
    formData.append('unit', unit);
    formData.append('category', category);
    formData.append('remark', remark.trim());
    formData.append('bill_photo', billPhoto);

    try {
      const result = await inventoryAPI.addInventory(formData);
      if (result.success) {
        setModalOpened(false);
        setBillId("");
        setItemName("");
        setQuantity("");
        setCost("");
        setConsumable(false);
        // Reset UC-VH-011 fields
        setThresholdQuantity(5);
        setUnit("pieces");
        setCategory("");
        setRemark("");
        setBillPhoto(null);
        setBillPhotoPreview(null);
        
        // Call parent callback to refresh inventory list
        if (onInventoryAdded) {
          onInventoryAdded();
        }
      } else {
        setError(result.message || "Failed to add item");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const handleBillPhotoChange = (file) => {
    setBillPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setBillPhotoPreview(null);
    }
    setError(null);
  };

  return (
    <Box p="md">
      <Button
        onClick={() => setModalOpened(true)}
        size="md"
        variant="filled"
        color="blue"
      >
        Add Item
      </Button>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Add Inventory Item"
        size="lg"
        centered
      >
        {error && (
          <Alert type="error" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Item Name"
            placeholder="Enter item name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
            mb="md"
          />

          <TextInput
            label="Bill ID"
            placeholder="Enter bill number"
            value={billId}
            onChange={(e) => setBillId(e.target.value)}
            required
            mb="md"
          />

          <Group grow mb="md">
            <NumberInput
              label="Quantity"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(value) => setQuantity(value)}
              required
              min={0}
            />
            <NumberInput
              label="Cost"
              placeholder="Enter cost"
              value={cost}
              onChange={(value) => setCost(value)}
              required
              min={0}
            />
          </Group>

          {/* UC-VH-011: Threshold Management Fields (BR-VH-007) */}
          <Group grow mb="md">
            <NumberInput
              label="Threshold Quantity"
              description="Minimum quantity before alert (BR-VH-007)"
              value={thresholdQuantity}
              onChange={(value) => setThresholdQuantity(value)}
              required
              min={1}
            />
            <Select
              label="Unit"
              placeholder="Select unit"
              value={unit}
              onChange={(value) => setUnit(value)}
              data={[
                { value: "pieces", label: "Pieces" },
                { value: "kg", label: "Kilograms" },
                { value: "liters", label: "Liters" },
                { value: "boxes", label: "Boxes" },
                { value: "packets", label: "Packets" },
                { value: "bottles", label: "Bottles" },
                { value: "meters", label: "Meters" },
                { value: "sets", label: "Sets" },
              ]}
              required
            />
          </Group>

          <Select
            label="Category"
            placeholder="Select category"
            value={category}
            onChange={(value) => setCategory(value)}
            data={[
              { value: "cleaning", label: "Cleaning Supplies" },
              { value: "maintenance", label: "Maintenance" },
              { value: "bedding", label: "Bedding & Linens" },
              { value: "kitchen", label: "Kitchen Supplies" },
              { value: "toiletries", label: "Toiletries" },
              { value: "furniture", label: "Furniture" },
              { value: "electronics", label: "Electronics" },
              { value: "stationery", label: "Stationery" },
              { value: "safety", label: "Safety Equipment" },
              { value: "other", label: "Other" },
            ]}
            mb="md"
          />

          <Switch
            label="Consumable Item"
            description="Items that are used up and need regular replenishment"
            checked={consumable}
            onChange={(e) => setConsumable(e.currentTarget.checked)}
            mb="md"
          />

          <Textarea
            label="Remarks"
            placeholder="Additional notes or specifications"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            mb="md"
          />
          
          {/* Bill Photo Upload - Required for VhIncharge */}
          <Stack spacing="sm" mb="lg">
            <Text fw={500} size="sm">
              Bill Photo* 
              <Text span c="dimmed" size="xs" ml="xs">
                (Required for inventory replenishment)
              </Text>
            </Text>
            <FileInput
              placeholder="Upload bill photo"
              accept="image/*"
              value={billPhoto}
              onChange={handleBillPhotoChange}
              icon={<IconUpload size={14} />}
              required
            />
            {billPhotoPreview && (
              <Box>
                <Text size="sm" c="dimmed" mb="xs">
                  Bill Photo Preview:
                </Text>
                <Image
                  src={billPhotoPreview}
                  alt="Bill preview"
                  width={200}
                  height={150}
                  fit="contain"
                  withPlaceholder
                  placeholder={<IconPhoto size={40} />}
                />
              </Box>
            )}
            <Text size="xs" c="dimmed">
              Supported formats: JPEG, PNG, GIF (Max size: 5MB)
            </Text>
          </Stack>

          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setModalOpened(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add Item
            </Button>
          </Group>
        </form>
      </Modal>
    </Box>
  );
}

export default AddInventoryItemsForm;

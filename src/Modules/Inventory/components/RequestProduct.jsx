import React, { useState } from "react";

import { useSelector } from "react-redux";

function SubmitInventoryRequest() {
  const role = useSelector((state) => state.user.role);
  console.log(role);
  const [formData, setFormData] = useState({
    item_name: "",
    quantity: "",
    department_name: "",
    purpose: "",
    specifications: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const token = localStorage.getItem("authToken"); // Replace with actual authentication token

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitRequest = async () => {
    setLoading(true);
    setErrorMessage(null);

    const requestData = {
      ...formData,
      approval_status: "PENDING",
      date: new Date().toISOString().split("T")[0], // Today's date
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/inventory/api/requests/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(requestData),
        },
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      console.log("✅ Request submitted successfully");
      alert("✅ Inventory Request Submitted!");
      setFormData({
        item_name: "",
        quantity: "",
        department_name: "",
        purpose: "",
        specifications: "",
      });
    } catch (error) {
      console.error("❌ Failed to submit request:", error);
      setErrorMessage("❌ Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Inventory Request Form</h3>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="item_name"
          placeholder="Product Name"
          value={formData.item_name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="department_name"
          placeholder="Department"
          value={formData.department_name}
          onChange={handleChange}
          required
        />
        <textarea
          name="purpose"
          placeholder="Purpose"
          value={formData.purpose}
          onChange={handleChange}
          required
        />
        <textarea
          name="specifications"
          placeholder="Specifications"
          value={formData.specifications}
          onChange={handleChange}
        />

        <button onClick={submitRequest} disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}

export default SubmitInventoryRequest;

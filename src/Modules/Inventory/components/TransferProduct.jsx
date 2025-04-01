<<<<<<< HEAD
import React from "react";
import { useForm } from "react-hook-form";
import "../styles/transferProduct.css";
import { InventoryTransfer } from "../../../routes/inventoryRoutes";
=======
/* eslint-disable no-restricted-globals */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../styles/transferProduct.css";
>>>>>>> 08ed62789486fbb022e960c1403ad90633889470

function TransferProduct() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
<<<<<<< HEAD
  // Removed unused inventoryData state

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(InventoryTransfer, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          productName: data.productName,
          quantity: parseInt(data.quantity, 10),
          fromDepartment: data.fromDepartment,
          toDepartment: data.toDepartment,
        }),
      });
=======
  const [inventoryData, setInventoryData] = useState([]); // State to manage inventory data
  console.log(inventoryData);
  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://127.0.0.1:8000/inventory/api/transfer_product/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            productName: data.productName,
            quantity: parseInt(data.quantity, 10),
            fromDepartment: data.fromDepartment,
            toDepartment: data.toDepartment,
          }),
        },
      );
>>>>>>> 08ed62789486fbb022e960c1403ad90633889470

      if (response.ok) {
        const result = await response.json();
        console.log("Product transferred successfully:", result);
        alert("Product transferred successfully.");

<<<<<<< HEAD
        // Update inventory data logic can be implemented here if needed
        console.log("Inventory data update logic is not defined.");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || error.detail}`);
=======
        setInventoryData((prevData) => {
          const updatedData = [...prevData];
          const existingIndex = updatedData.findIndex(
            (item) =>
              item.name === result.name &&
              item.department === result.department.name,
          );
          if (existingIndex !== -1) {
            updatedData[existingIndex] = result;
          } else {
            updatedData.push(result);
          }
          return updatedData;
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}` || error.detail);
>>>>>>> 08ed62789486fbb022e960c1403ad90633889470
      }
    } catch (error) {
      console.error("Error transferring product:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="add-product-container">
      <h2>Transfer Product</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          Product Name
          <span className="required">*</span>
        </label>
        <input
          type="text"
<<<<<<< HEAD
          name="productName"
          ref={(e) => register(e, { required: "Product Name is required" })}
=======
          {...register("productName", { required: "Product Name is required" })}
>>>>>>> 08ed62789486fbb022e960c1403ad90633889470
          placeholder="Enter Product Name"
        />
        {errors.productName && (
          <p className="error-message">{errors.productName.message}</p>
        )}

        <label>
          Quantity
          <span className="required">*</span>
        </label>
        <input
          type="number"
<<<<<<< HEAD
          name="quantity"
          ref={register({
=======
          {...register("quantity", {
>>>>>>> 08ed62789486fbb022e960c1403ad90633889470
            required: "Quantity is required",
            min: { value: 1, message: "Quantity must be at least 1" },
          })}
          placeholder="Enter Quantity"
        />
        {errors.quantity && (
          <p className="error-message">{errors.quantity.message}</p>
        )}

        <label>
          From Department
          <span className="required">*</span>
        </label>
        <input
          type="text"
<<<<<<< HEAD
          name="fromDepartment"
          ref={register({
=======
          {...register("fromDepartment", {
>>>>>>> 08ed62789486fbb022e960c1403ad90633889470
            required: "From Department is required",
          })}
          placeholder="Enter From Department"
        />
        {errors.fromDepartment && (
          <p className="error-message">{errors.fromDepartment.message}</p>
        )}

        <label>
          To Department
          <span className="required">*</span>
        </label>
        <select
<<<<<<< HEAD
          ref={(e) => {
            register(e, { required: "To Department is required" });
          }}
=======
          {...register("toDepartment", {
            required: "To Department is required",
          })}
>>>>>>> 08ed62789486fbb022e960c1403ad90633889470
        >
          <option value="">Select Department</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="ME">ME</option>
          <option value="SM">SM</option>
          <option value="DS">DS</option>
        </select>
        {errors.toDepartment && (
          <p className="error-message">{errors.toDepartment.message}</p>
        )}

        <center>
          <button type="submit">Transfer Product</button>
        </center>
      </form>
    </div>
  );
}

export default TransferProduct;

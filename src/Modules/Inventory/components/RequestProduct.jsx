import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import '../styles/transferProduct.css';

function RequestProduct() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [inventoryData, setInventoryData] = useState([]); // State to manage inventory data

    const onSubmit = async (data) => {
        console.log('Product Requested successfully');
        alert('Product Requsted successfully.');
    };

    return (
        <div className="add-product-container">
            <h2>Request Product</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>
                    Product Name
                    <span className="required">*</span>
                </label>
                <input
                    type="text"
                    {...register('productName', { required: 'Product Name is required' })}
                    placeholder="Enter Product Name"
                />
                {errors.productName && <p className="error-message">{errors.productName.message}</p>}

                <label>
                    Quantity
                    <span className="required">*</span>
                </label>
                <input
                    type="number"
                    {...register('quantity', {
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Quantity must be at least 1' },
                    })}
                    placeholder="Enter Quantity"
                />
                {errors.quantity && <p className="error-message">{errors.quantity.message}</p>}

                <center>
                    <button type="submit">Request Product</button>
                </center>
            </form>
        </div>
    );
}

export default RequestProduct;

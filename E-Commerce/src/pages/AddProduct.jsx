import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

const AddProduct = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [productName, setProductName] = useState("");
  const [productDescription, setDescription] = useState("");
  const [productPrice, setPrice] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // ✅ Add key for file reset

  // Fetch categories
  const getCategory = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      setCategoryList(res.data.categories);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  // Clear form fields including file input
  const clearForm = () => {
    setProductName("");
    setDescription("");
    setPrice("");
    setProductImage(null);
    setCategoryId("");
    setFileInputKey(Date.now()); // ✅ force re-render file input
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !categoryId ||
      !productImage
    ) {
      alert("Please fill in all required fields and select an image.");
      return;
    }

    if (isNaN(productPrice) || Number(productPrice) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("product_name", productName);
      formData.append("description", productDescription);
      formData.append("price", productPrice);
      formData.append("category_id", categoryId);
      formData.append("product_image", productImage);

      const response = await axiosInstance.post("/products", formData);

      console.log("✅ Product added:", response.data);

      Swal.fire({
        title: "Good wrok!",
        text: "✅ Product added successfully!",
        icon: "success",
      });
      clearForm(); // ✅ clears inputs including file
    } catch (error) {
      console.error("❌ Error adding product:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert(
        `❌ Error: ${
          error.response?.data?.message ||
          error.message ||
          "Failed to add product"
        }`
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <form onSubmit={handleAddProduct} className="space-y-4">
        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category:
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>
              SELECT CATEGORY
            </option>
            {categoryList?.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name:
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price:
          </label>
          <input
            type="number"
            value={productPrice}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0.01"
            step="0.01"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description:
          </label>
          <textarea
            value={productDescription}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>

        {/* Product Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image:
          </label>
          <input
            key={fileInputKey} // ✅ key to reset input
            type="file"
            accept="image/*"
            onChange={(e) => setProductImage(e.target.files[0])}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;

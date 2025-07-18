import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

const Category = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setDescription] = useState("");

  // Fetch categories from backend
  const getCategory = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      console.log("Fetched categories:", res.data); // ✅ Debug line
      setCategoryList(res.data.categories || []); // ✅ fallback to []
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoryList([]); // ❗ Prevent undefined crash
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  // Submit new category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/category", {
        category_name: categoryName,
        description: categoryDescription,
      });
      setCategoryName("");
      setDescription("");
      setShowForm(false);
      getCategory(); // Refresh table
      Swal.fire({
        title: "Good wrok!",
        text: "✅ Category added successfully!",
        icon: "success",
      });
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <div className="overflow-x-auto p-4">
      {/* Add Category Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow transition duration-300"
        >
          {showForm ? "Close Form" : "Add Category"}
        </button>
      </div>

      {/* Add Category Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 mb-4 rounded shadow-md space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name:
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description:
            </label>
            <textarea
              value={categoryDescription}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
          >
            Submit
          </button>
        </form>
      )}

      {/* Category Table */}
      <table className="min-w-full border border-gray-200 shadow-sm rounded-md">
        <thead>
          <tr className="bg-gray-100 text-left text-gray-700 text-sm uppercase tracking-wider">
            <th className="px-4 py-2 border-b">Category Id</th>
            <th className="px-4 py-2 border-b">Category Name</th>
            <th className="px-4 py-2 border-b">Description</th>
          </tr>
        </thead>
        <tbody>
          {categoryList.map((eachcategory, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{eachcategory.category_id}</td>
              <td className="px-4 py-2 border-b">
                {eachcategory.category_name}
              </td>
              <td className="px-4 py-2 border-b">{eachcategory.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Category;

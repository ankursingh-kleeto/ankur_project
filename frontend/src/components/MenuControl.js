import React, { useState } from "react";
import axios from "axios";

function MenuControl() {
  const [category, setCategory] = useState("");
  const [item, setItem] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [variant, setVariant] = useState("");
  const [price, setPrice] = useState("");

  // ADD CATEGORY
  const addCategory = async () => {
    await axios.post("http://localhost:5000/category", { name: category });
    alert("Category Added ✅");
  };

  // ADD ITEM
  const addItem = async () => {
    await axios.post("http://localhost:5000/item", {
      name: item,
      category_id: categoryId,
      image: ""
    });
    alert("Item Added ✅");
  };

  // ADD VARIANT
  const addVariant = async () => {
    await axios.post("http://localhost:5000/variant", {
      item_id: categoryId,
      name: variant,
      price: price
    });
    alert("Variant Added ✅");
  };

  return (
    <div className="container mt-4">

      <h3>⚙️ Menu Control Panel</h3>

      {/* CATEGORY */}
      <div className="card p-3 mt-3">
        <h5>Add Category</h5>
        <input
          className="form-control"
          placeholder="Category Name"
          onChange={(e) => setCategory(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={addCategory}>
          Add Category
        </button>
      </div>

      {/* ITEM */}
      <div className="card p-3 mt-3">
        <h5>Add Item</h5>
        <input
          className="form-control mb-2"
          placeholder="Item Name"
          onChange={(e) => setItem(e.target.value)}
        />
        <input
          className="form-control"
          placeholder="Category ID"
          onChange={(e) => setCategoryId(e.target.value)}
        />
        <button className="btn btn-success mt-2" onClick={addItem}>
          Add Item
        </button>
      </div>

      {/* VARIANT */}
      <div className="card p-3 mt-3">
        <h5>Add Variant</h5>
        <input
          className="form-control mb-2"
          placeholder="Item ID"
          onChange={(e) => setCategoryId(e.target.value)}
        />
        <input
          className="form-control mb-2"
          placeholder="Variant Name"
          onChange={(e) => setVariant(e.target.value)}
        />
        <input
          className="form-control"
          placeholder="Price"
          onChange={(e) => setPrice(e.target.value)}
        />
        <button className="btn btn-warning mt-2" onClick={addVariant}>
          Add Variant
        </button>
      </div>

    </div>
  );
}

export default MenuControl;